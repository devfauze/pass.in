import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";


export async function getEvent(app: FastifyInstance) {
    app
    .withTypeProvider<ZodTypeProvider>()
    .get('/events/:eventId', {
        schema: {
            summary: 'Buscar um evento',
            tags: ['events'],
            params: z.object({
                eventId: z.string().uuid()
            }),
            response: {
                200: z.object({             
                        event: z.object({
                            id: z.string().uuid(),
                            title: z.string(),
                            slug: z.string(),
                            details: z.string().nullable(),
                            maximumAttendee: z.number().int().nullable(),
                            attendeesAmount: z.number().int(),
                        })                  
                })
            }
        }
    }, async (req, res) => {
        const { eventId } = req.params

        const event = await prisma.event.findUnique({
            select:{
                id: true,
                title: true,
                slug: true,
                details: true,
                maximumAttendees: true,
                _count: {
                    select:{
                        attendee: true,
                    }
                }
            },
            where:{
                id: eventId,
            }
        })

        if(event === null) {
            throw new BadRequest('Evento não encontrado!')
        }

        return res.send({ 
            event: {
                id: event.id,
                title: event.title,
                slug: event.slug,
                details: event.details,
                maximumAttendee: event.maximumAttendees,
                attendeesAmount: event._count.attendee,
            }
         })
    })
}