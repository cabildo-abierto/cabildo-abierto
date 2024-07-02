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
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return false
  }

  const { email, password } = validatedFields.data

  const user = await db.user.findUnique({ where: { email: email } })
  if(!user) {
    return false
  }

  const comp = await bcrypt.compare(password, user.password)

  if(!comp){
    return false
  }

  await createSession(user.id)
  redirect('/feed')
  return true
}

export async function signup(state: SignupFormState, formData) {
  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    username: formData.get('username'),
    password: formData.get('password'),
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, username, password} = validatedFields.data

  const hashedPassword = await generatePasswordHash(password)

  await db.user.create({
    data: {
      name: name,
      username: username,
      email: email,
      password: hashedPassword,
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