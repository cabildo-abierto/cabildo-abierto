"use client"

import {type FormEvent, useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useRouter} from "next/navigation";
import type {CreateTopicInput, CreateTopicOutput} from "@cabildo-abierto/api";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {post} from "@/utils/react/fetch";
import {canonicalizeTopicId} from "@cabildo-abierto/utils";
import {useAuth} from "@/components/auth-provider";
import Link from "next/link";
import {Spinner} from "@/components/ui/spinner";

export default function NewTopicPage() {
    const {user, loading} = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [title, setTitle] = useState("");
    const [error, setError] = useState<string | null>(null);
    const createTopicMutation = useMutation({
        mutationFn: async (input: CreateTopicInput) => {
            const result = await post<CreateTopicInput, CreateTopicOutput>("/topics", input);
            if ("error" in result) throw new Error(result.error);
            return result.value.topic;
        },
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["topics", "search"]}),
    });
    const topicId = canonicalizeTopicId(title);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        try {
            const topic = await createTopicMutation.mutateAsync({title});
            router.push(`/tema/${encodeURIComponent(topic.slug)}`);
        } catch (mutationError) {
            setError(mutationError instanceof Error ? mutationError.message : "No pudimos crear el tema.");
            return;
        }
    };

    if (loading) return <p className="p-6 text-sm text-muted-foreground">Comprobando sesión…</p>;
    if (!user) return <p className="p-6 text-sm">Para crear un tema, <Link href="/iniciar-sesion" className="underline">iniciá sesión</Link>.</p>;

    return <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center p-4">
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Nuevo tema</CardTitle>
                <CardDescription>Elegí un título para empezar una discusión.</CardDescription>
            </CardHeader>
            <form onSubmit={submit}>
                <CardContent>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="title">Título</FieldLabel>
                            <Input id="title" name="title" value={title} onChange={event => setTitle(event.target.value)} minLength={3} maxLength={120} required autoFocus/>
                            {topicId && <FieldDescription>
                                La URL del tema va a ser <code className="text-foreground">/tema/{topicId}</code>.
                            </FieldDescription>}
                        </Field>
                        {error && <FieldError>{error}</FieldError>}
                    </FieldGroup>
                </CardContent>
                <CardFooter className="mt-4">
                    <Button type="submit" disabled={createTopicMutation.isPending || !topicId}>
                        {createTopicMutation.isPending ? <><Spinner/>Creando…</> : "Crear tema"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    </div>;
}
