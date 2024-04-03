import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function registerForEvent(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .post('/events/:eventId/attendees', {
            schema:{
                summary: 'Registrar participante ao evento',
                tags: ['attendees'],
                body: z.object({
                    name: z.string().min(4),
                    email: z.string().email(),
                }),
                params: z.object({
                    eventId: z.string().uuid(),
                }),
                response: {
                    201: z.object({
                        attendeedId: z.number(),
                    })
                }
            }
        }, async (req, res) => {
            const { eventId } = req.params
            const { name, email } = req.body

            const attendeeFormEmail = await prisma.attendee.findUnique({
                where: {
                    eventId_email:{
                        email,
                        eventId
                    }
                }
            })

            if(attendeeFormEmail !== null) {
                throw new BadRequest('Email já registrado neste evento!')
            }
            
            const [eventAttendees, amountOfAttendeesForEvent] = await Promise.all([
                prisma.event.findUnique({
                    where: {
                        id: eventId,
                    }
                }),

                prisma.attendee.count({
                    where: {
                        eventId,
                    }
                })
            ])

            if(eventAttendees?.maximumAttendees && amountOfAttendeesForEvent >= eventAttendees?.maximumAttendees) {
                throw new BadRequest('Este evento atingiu o máximo de participantes!')
            }

            const attendee = await prisma.attendee.create({
                data: {
                    name, 
                    email,
                    eventId
                }
            })

            return res.status(201).send({ attendeedId: attendee.id})
        })
}