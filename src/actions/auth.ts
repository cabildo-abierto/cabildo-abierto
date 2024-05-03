'use server';

import { db } from '@/db';
import bcryptjs from 'bcryptjs'
import { randomBytes } from 'crypto';
import { redirect } from 'next/navigation';
import {
  LoginFormState,
  LoginFormSchema,
  SignupFormState,
  SignupFormSchema,
  SessionPayload
} from "@/app/lib/definitions";
import {createSession, decrypt} from "@/app/lib/session";
import bcrypt from "bcryptjs";
import {cookies} from "next/headers";


export const verifySession = async () : Promise<SessionPayload|undefined> => {
  const cookie = cookies().get('session')?.value
  return await decrypt(cookie)
}


export async function authenticate(state: LoginFormState, formData){
  console.log("Authenticating")

  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data
  console.log("User data", email, password)

  console.log("State", state)

  const user = await db.user.findUnique({ where: { email: email } })

  bcrypt.compare(password, user.password, function(err, res) {
    if (err){
      // handle error
      console.log("Some error")
    }
    if (res) {
      console.log("Password ok")
    } else {
      console.log("Incorrect password")
      return {
        errors: "Incorrect password."
      }
    }
  });

  console.log("Creating session")
  await createSession(user.id)
  console.log("Redirecting")
  redirect('/feed')
}

export async function signup(state: SignupFormState, formData) {
  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, password } = validatedFields.data
  console.log("Creating accout with data", name, email, password)

  const hashedPassword = await generatePasswordHash(password)
  console.log("Hashed password")
  console.log(hashedPassword)

  const verificationToken = generateEmailVerificationToken();

  await db.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
      emailVerifToken: verificationToken,
    }
  })
  redirect(`/login`)
}

export async function logout() {
    cookies().delete("session")
    redirect("/")
}

export const findUserByEmail = async (email: string) => {
  return await db.user.findFirst({
    where: {
      email,
    }
  })
}

const generatePasswordHash = async (password: string) => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

const generateEmailVerificationToken = () => {
  return randomBytes(32).toString('hex')
}