'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '../utils/supabase/server'
import { LoginFormSchema, RecoverPwFormSchema, SignupFormSchema, UpdatePwFormSchema, UserProps } from '../app/lib/definitions'
import { db } from '../db'
import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js'
import { getUser, getUserAuthId } from './users'
import { redirect } from 'next/navigation'


export type LoginFormState = {
  errors?: string[]
  data?: any
  user?: UserProps | string
  error?: string
}

export async function login(email: string, password: string): Promise<LoginFormState> {
  const supabase = createClient()

  const validatedFields = LoginFormSchema.safeParse({
    email: email,
    password: password,
  })

  if(!validatedFields.data) {
    return { errors: ["invalid fields"]}
  }

  const { error } = await supabase.auth.signInWithPassword(validatedFields.data as {email: string, password: string})

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
        name: formData.get('name')
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
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

    const { error, data } = await supabase.auth.signUp(
      {
        email: validatedFields.data.email,
        password: validatedFields.data.password,
        options: {
          data: {
            name: validatedFields.data.name
          }
        }
      }
    )

    if (error || !data || !data.user) {
        console.log("signup error", error)
        return {
            authError: error?.code
        }
    }

    revalidatePath('/', 'layout')
    revalidateTag("users")
    revalidateTag("fundingPercentage")
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


export async function selectUsername(username: string){
    const {userAuthId, name} = await getUserAuthId()
    if(!userAuthId){
        return {error: "Ocurrió un error, volvé a iniciar sesión."}
    }

    const user = await db.user.findFirst({
      where: {
        id: username
      }
    })

    if(user){
        return {
            error: "El nombre de usuario ya está en uso."
        }
    }

    try {
        await db.user.create({
            data: {
                id: username,
                authUserId: userAuthId,
                name: name
            }
        })
    } catch {
        return {error: "Ocurrió un error al crear el usuario."}
    }

    revalidatePath('/', 'layout')
    revalidateTag("users")
    revalidateTag("fundingPercentage")
    return {}
}