import {
  BadRequest
} from "./chunk-JRO4E4TH.mjs";
import {
  prisma
} from "./chunk-JV6GRE7Y.mjs";

// src/routes/register-for-event.ts
import { z } from "zod";
async function registerForEvent(app) {
  app.withTypeProvider().post("/events/:eventId/attendees", {
    schema: {
      summary: "Registrar participante ao evento",
      tags: ["attendees"],
      body: z.object({
        name: z.string().min(4),
        email: z.string().email()
      }),
      params: z.object({
        eventId: z.string().uuid()
      }),
      response: {
        201: z.object({
          attendeedId: z.number()
        })
      }
    }
  }, async (req, res) => {
    const { eventId } = req.params;
    const { name, email } = req.body;
    const attendeeFormEmail = await prisma.attendee.findUnique({
      where: {
        eventId_email: {
          email,
          eventId
        }
      }
    });
    if (attendeeFormEmail !== null) {
      throw new BadRequest("Email j\xE1 registrado neste evento!");
    }
    const [eventAttendees, amountOfAttendeesForEvent] = await Promise.all([
      prisma.event.findUnique({
        where: {
          id: eventId
        }
      }),
      prisma.attendee.count({
        where: {
          eventId
        }
      })
    ]);
    if (eventAttendees?.maximumAttendees && amountOfAttendeesForEvent >= eventAttendees?.maximumAttendees) {
      throw new BadRequest("Este evento atingiu o m\xE1ximo de participantes!");
    }
    const attendee = await prisma.attendee.create({
      data: {
        name,
        email,
        eventId
      }
    });
    return res.status(201).send({ attendeedId: attendee.id });
  });
}

export {
  registerForEvent
};
