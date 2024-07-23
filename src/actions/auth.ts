'use server';

import { db } from '@/db';
import bcryptjs from 'bcryptjs'
import { redirect } from 'next/navigation';
import {
  LoginFormSchema,
  SignupFormSchema
} from "@/app/lib/definitions";
import {createSession, decrypt, SessionPayload} from "@/app/lib/session";
import bcrypt from "bcryptjs";
import {cookies} from "next/headers";
import { getUserById } from './get-user';


export const verifySession = async () => {
  const cookie = cookies().get('session')?.value
  return await decrypt(cookie)
}

type LoginFormState = {
    error?: string
    user?: any
}

export async function authenticate(state: any, formData: any): Promise<LoginFormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return { error: "invalid auth" }
  }

  const { email, password } = validatedFields.data

  const user = await db.user.findUnique({ where: { email: email } })
  if(!user) {
    return { error: "invalid auth" }
  }

  const comp = await bcrypt.compare(password, user.password)

  if(!comp){
    return { error: "invalid auth" }
  }

  await createSession(user.id)
  return { user: await getUserById(user.id)}
}

type SignUpFormState = {
    errors?: any,
}

export async function validatedSignUp(name: string, email: string, username: string, password: string): Promise<SignUpFormState>{
  const hashedPassword = await generatePasswordHash(password)

  const usernameExists = await db.user.findFirst({where: {id: "@"+username}})
  if(usernameExists){
    return {errors: {username: ["el nombre de usuario ya existe"]}}
  }

  const emailExists = await db.user.findFirst({where: {email: email}})
  if(emailExists){
    return {errors: {email: ["el mail que ingresaste ya fue usado"]}}
  }

  await db.user.create({
    data: {
      id: "@"+username,
      name: name,
      email: email,
      password: hashedPassword,
    }
  })
  return {}
}


export async function signup(state: any, formData: any) {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    username: formData.get('username'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, username, password} = validatedFields.data

  return await validatedSignUp(name, email, username, password)
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
