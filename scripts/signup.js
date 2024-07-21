const { PrismaClient } = require('@prisma/client');
import bcryptjs from 'bcryptjs'
const db = new PrismaClient();

const generatePasswordHash = async (password) => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

(async () => {
  const name = "Usuario sin suscripción";
  const email = "prueba2@gmail.com";
  const username = "prueba2";
  const password = "pruebaprueba";

  const hashedPassword = await generatePasswordHash(password)

  return await db.user.create({
    data: {
      id: "@"+username,
      name: name,
      email: email,
      password: hashedPassword,
    }
  })
})();
