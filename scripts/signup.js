const { PrismaClient } = require('@prisma/client');
import bcryptjs from 'bcryptjs'
const db = new PrismaClient();

const generatePasswordHash = async (password) => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

(async () => {
  const name = "Usuario de prueba";
  const email = "prueba@gmail.com";
  const username = "prueba";
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
  console.log("User created successfully:", result);
})();
