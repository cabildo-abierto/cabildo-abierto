"use client"

import Link from "next/link";
import {type FormEvent, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import type {AuthOutput, LoginInput} from "@cabildo-abierto/api";
import {useAuth} from "@/components/auth-provider";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {post} from "@/utils/react/fetch";

export default function LoginPage() {
    const router = useRouter();
    const {user, loading, setUser} = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && user) router.replace("/");
    }, [loading, router, user]);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        const form = new FormData(event.currentTarget);
        const input: LoginInput = {
            identifier: String(form.get("identifier") ?? ""),
            password: String(form.get("password") ?? ""),
        };
        const result = await post<LoginInput, AuthOutput>("/auth/login", input);
        setSubmitting(false);

        if ("error" in result) {
            setError(result.error);
            return;
        }
        setUser(result.value.user);
        router.replace("/");
    };

    return <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center p-4">
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Iniciar sesión</CardTitle>
                <CardDescription>Ingresá con tu usuario o correo electrónico.</CardDescription>
            </CardHeader>
            <form onSubmit={submit}>
                <CardContent>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="identifier">Usuario o correo</FieldLabel>
                            <Input id="identifier" name="identifier" autoComplete="username" required autoFocus/>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                            <Input id="password" name="password" type="password" autoComplete="current-password" required/>
                        </Field>
                        {error && <FieldError>{error}</FieldError>}
                    </FieldGroup>
                </CardContent>
                <CardFooter className="mt-4 flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? "Ingresando…" : "Ingresar"}
                    </Button>
                    <p className="text-muted-foreground">
                        ¿No tenés una cuenta? <Link href="/registro" className="text-foreground underline underline-offset-4">Registrate</Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    </div>;
}
