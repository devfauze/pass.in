import { prisma } from '../src/lib/prisma'

async function seed() {
    await prisma.event.create({
        data: {
            id: 'e212e128-a556-4772-9e56-e464b638623c',
            title: 'Code Summit',
            slug: 'code-summit',
            details: 'Evento para desenvolvedores!',
            maximumAttendees: 120,
        }
    })
}

seed().then(() => {
    console.log('Database seeded!')
    prisma.$disconnect()
})