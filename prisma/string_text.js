const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {

    const entities = await prisma.entity.findMany({
        select: {
            id: true,
            name: true,
            text: true,
        },
    });

    for (const entity of entities) {
        await prisma.entity.update({
            where: { id: entity.id },
            data: { contents: [entity.text] }
        });
    }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });