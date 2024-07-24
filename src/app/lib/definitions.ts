import { z } from 'zod'

export const SignupFormSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'Tiene que tener al menos 2 caracteres' })
        .trim(),
    email: z.string().email({ message: 'Ingresá un email válido' }).trim(),
    username: z
        .string()
        .min(2, { message: 'Tiene que tener al menos 2 caracteres' })
        .trim(),
    password: z
        .string()
        .min(8, { message: 'Tiene que tener al menos 8 caracteres' })
        .regex(/[a-zA-Z]/, { message: 'Tiene que tener al menos una letra' })
        .regex(/[0-9]/, { message: 'Tiene que tener al menos un número' })
        .regex(/[^a-zA-Z0-9]/, {
            message: 'Tiene que tener al menos un caracter especial',
        })
        .trim(),
})


export const CreateEntityFormSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'El nombre tiene que tener al menos 2 caracteres.' })
        .trim()
        .max(100, { message: 'El nombre no puede tener más de 100 caracteres.'})
})


export const LoginFormSchema = z.object({
    email: z.string().email({ message: 'Ingresá un email válido.' }).trim(),
    password: z
        .string()
        .min(1, { message: 'Ingresá tu contraseña' })
})