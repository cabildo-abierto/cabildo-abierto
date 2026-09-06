"use client"

import {type FormEvent, useState} from "react";
import {useRouter} from "next/navigation";
import type {CreateTopicInput, CreateTopicOutput} from "@cabildo-abierto/api";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {post} from "@/utils/react/fetch";

function canonicalizeTopicId(title: string): string {
    return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function NewTopicPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const topicId = canonicalizeTopicId(title);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        const result = await post<CreateTopicInput, CreateTopicOutput>("/topics", {title});
        setSubmitting(false);
        if ("error" in result) {
            setError(result.error);
            return;
        }
        router.push(`/tema/${encodeURIComponent(result.value.topic.id)}`);
    };

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
                                El identificador del tema va a ser <code className="text-foreground">{topicId}</code>.
                            </FieldDescription>}
                        </Field>
                        {error && <FieldError>{error}</FieldError>}
                    </FieldGroup>
                </CardContent>
                <CardFooter className="mt-4">
                    <Button type="submit" disabled={submitting || !topicId}>
                        {submitting ? "Creando…" : "Crear tema"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    </div>;
}
