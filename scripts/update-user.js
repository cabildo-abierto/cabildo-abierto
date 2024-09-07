require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUsername(currentId, newId) {
  await prisma.user.update({
    where: {id: currentId},
    data: {
      id: newId
    }
  })
}

async function main() {

  await updateUsername("tdelgado", "tomas")
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });