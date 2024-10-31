'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '../utils/supabase/server'
import { LoginFormSchema, RecoverPwFormSchema, SignupFormSchema, UpdatePwFormSchema, UserProps } from '../app/lib/definitions'
import { db } from '../db'
import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js'
import { getUser } from './users'


export type LoginFormState = {
  errors?: string[]
  data?: any
  user?: UserProps
}

export async function login(state: any, formData: FormData): Promise<LoginFormState> {
  const supabase = createClient()

  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if(!validatedFields.data) {
    return { errors: ["invalid fields"]}
  }

  const { error } = await supabase.auth.signInWithPassword(validatedFields.data as {email: string, password: string})

  console.log("error", error)

  if (error) {
    console.log("error", error)
    if(error instanceof AuthRetryableFetchError){
      return { errors: ["no connection"] }
    } else if(error.message == "Invalid login credentials"){
      return {errors: ["invalid credentials"]}
    } else if(error.message == "Email not confirmed"){
      return { errors: ["not confirmed"], data: validatedFields.data}
    } else if(error instanceof AuthApiError){
      return { errors: ["api error"]}
    } else {
      return { errors: ["invalid auth"] }
    }
  }

  return await getUser()
}

export type SignUpFormState = {
  errors?: any,
  authError?: any,
  data?: {email: string}
}

export async function signup(state: any, formData: FormData): Promise<SignUpFormState> {
    const supabase = createClient()

    const validatedFields = SignupFormSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        username: formData.get('username'),
        name: formData.get('name')
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const user = await db.user.findFirst({
      where: {
        id: validatedFields.data.username
      }
    })

    if(user){
        return {
            errors: {username: ["El nombre de usuario ya está en uso."]}
        }
    }

    const supaUser = await db.users.findFirst({
      where: {
        email: validatedFields.data.email
      }
    })

    if(supaUser){
        return {
            errors: {email: ["Ya existe una cuenta con ese email."]}
        }
    }

    const { error, data } = await supabase.auth.signUp(validatedFields.data as {email: string, password: string, username: string, name: string, betakey: string})

    if (error || !data || !data.user) {
        console.log("signup error", error)
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
    return {data: {email: validatedFields.data.email}}
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


export async function recoverPw(state: any, formData: FormData) {
    const validatedFields = RecoverPwFormSchema.safeParse({
      email: formData.get('email')
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      validatedFields.data.email, {redirectTo: "https://www.cabildoabierto.com.ar/recuperar/nueva"}
    )
    
    return {errors: error}
}


export async function updatePw(state: any, formData: FormData) {
    const validatedFields = UpdatePwFormSchema.safeParse({
      password: formData.get('password')
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.updateUser({password: validatedFields.data.password})
    
    if(error){
      return {errors: error.code}
    }
    
    return {}
}


export async function resendConfirmationEmail(email: string){
    try {
      const supabase = createClient()
      console.log("client created, resending")
      const response = await supabase.auth.resend({
        type: "signup",
        email: email
      })
      if(response.error){
        return {error: "Error al enviar el mail."}
      } else {
        return {}
      }
    } catch {
      console.log("error al enviar")
      return {error: "Error al enviar el mail."}
    }
}