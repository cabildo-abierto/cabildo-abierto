"use client"

import Link from "next/link";
import {type FormEvent, useEffect, useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {useRouter} from "next/navigation";
import type {AuthOutput, RegisterInput} from "@cabildo-abierto/api";
import {useAuth} from "@/components/auth-provider";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {post} from "@/utils/react/fetch";
import {Spinner} from "@/components/ui/spinner";

export default function RegisterPage() {
    const router = useRouter();
    const {user, loading, setUser} = useAuth();
    const [error, setError] = useState<string | null>(null);
    const registerMutation = useMutation({
        mutationFn: async (input: RegisterInput) => {
            const result = await post<RegisterInput, AuthOutput>("/auth/register", input);
            if ("error" in result) throw new Error(result.error);
            return result.value.user;
        },
    });

    useEffect(() => {
        if (!loading && user) router.replace("/");
    }, [loading, router, user]);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        const form = new FormData(event.currentTarget);
        const password = String(form.get("password") ?? "");
        if (password !== String(form.get("passwordConfirmation") ?? "")) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        const input: RegisterInput = {
            username: String(form.get("username") ?? ""),
            email: String(form.get("email") ?? ""),
            password,
            registrationPassword: String(form.get("registrationPassword") ?? ""),
        };
        try { setUser(await registerMutation.mutateAsync(input)); }
        catch (mutationError) {
            setError(mutationError instanceof Error ? mutationError.message : "No pudimos crear la cuenta.");
            return;
        }
        router.replace("/");
    };

    return <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Crear una cuenta</CardTitle>
                <CardDescription>Registrate para participar en Cabildo Abierto.</CardDescription>
            </CardHeader>
            <form onSubmit={submit}>
                <CardContent>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="username">Usuario</FieldLabel>
                            <Input id="username" name="username" minLength={3} maxLength={30} pattern="[a-z0-9_-]+" autoComplete="username" required autoFocus/>
                            <FieldDescription>Entre 3 y 30 letras minúsculas, números, guiones o guiones bajos.</FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                            <Input id="email" name="email" type="email" maxLength={254} autoComplete="email" required/>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                            <Input id="password" name="password" type="password" minLength={8} maxLength={128} autoComplete="new-password" required/>
                            <FieldDescription>Al menos 8 caracteres.</FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="passwordConfirmation">Repetir contraseña</FieldLabel>
                            <Input id="passwordConfirmation" name="passwordConfirmation" type="password" minLength={8} maxLength={128} autoComplete="new-password" required/>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="registrationPassword">Contraseña de registro</FieldLabel>
                            <Input id="registrationPassword" name="registrationPassword" type="password" autoComplete="off" required/>
                            <FieldDescription>Necesitás esta contraseña para poder crear una cuenta.</FieldDescription>
                        </Field>
                        {error && <FieldError>{error}</FieldError>}
                    </FieldGroup>
                </CardContent>
                <CardFooter className="mt-4 flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? <><Spinner/>Creando cuenta…</> : "Registrarme"}
                    </Button>
                    <p className="text-muted-foreground">
                        ¿Ya tenés una cuenta? <Link href="/iniciar-sesion" className="text-foreground underline underline-offset-4">Iniciá sesión</Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    </div>;
}
