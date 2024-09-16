'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '../utils/supabase/server'
import { LoginFormSchema, SignupFormSchema, UserProps } from '../app/lib/definitions'
import { db } from '../db'
import { AuthRetryableFetchError } from '@supabase/supabase-js'
import { getUser } from './users'


type LoginFormState = {
  error?: string
  user?: UserProps
}

export async function login(state: any, formData: FormData): Promise<LoginFormState> {
  const supabase = createClient()

  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if(!validatedFields.data) {
    return { error: "invalid fields"}
  }

  const { error } = await supabase.auth.signInWithPassword(validatedFields.data as {email: string, password: string})

  if (error) {
    if(error instanceof AuthRetryableFetchError){
      return { error: "no connection" }
    } else if(error.message == "Email not confirmed"){
      return { error: "not confirmed"}
    } else {
      return { error: "invalid auth" }
    }
  }

  return {user: await getUser()}
}

export type SignUpFormState = {
  errors?: any,
  authError?: any
}

export async function signup(state: any, formData: FormData): Promise<SignUpFormState> {
    const supabase = createClient()

    const validatedFields = SignupFormSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        username: formData.get('username'),
        name: formData.get('name'),
        betakey: formData.get('betakey')
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const user = await db.user.findFirst({where: {id: validatedFields.data.username}})

    if(user){
        return {
            errors: {username: ["El nombre de usuario ya existe."]}
        }
    }

    const { error, data } = await supabase.auth.signUp(validatedFields.data as {email: string, password: string, username: string, name: string, betakey: string})
    
    if (error || !data || !data.user) {
        return {
            authError: error?.code
        }
    }

    await db.user.create({
        data: {
            authUserId: data.user.id,
            name: validatedFields.data.name,
            id: validatedFields.data.username,
        }
    })

    revalidatePath('/', 'layout')
    revalidateTag("users")
}

export async function signOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if(error){
      return {error: error}
  } else {
      return {}
  }
}