'use server';

import { db } from '@/db';
import {
  CreateEntityFormSchema,
} from "@/app/lib/definitions";
import { getUserId } from './get-user';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export type CreateEntityFormState = {
  error?: any,
  id?: string
} | null

export async function createEntityFromForm(state: CreateEntityFormState, formData: any): Promise<CreateEntityFormState> {
  const userId = await getUserId()
  if(!userId) return {error: "Necesitás una cuenta para crear un artículo"}

  const validatedFields = CreateEntityFormSchema.safeParse({
    name: formData.get('name'),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name } = validatedFields.data

  return await createEntity(name, userId)
}


export async function createEntity(name: string, userId: string){
  const entityId = encodeURIComponent(name.replaceAll(" ", "_"))
  const exists = await db.entity.findFirst({
    where: {id: entityId}
  })
  if(exists) return {error: "Ya existe un artículo con ese nombre"}

  const content = await db.content.create({
    data: {
      text: "",
      authorId: userId,
      type: "EntityContent"
    }
  })

  await db.entity.create({
    data: {
      name: name,
      id: entityId,
      contentId: content.id
    }
  })
  revalidateTag("contents")
  revalidateTag("content")
  revalidateTag("entities")
  revalidateTag("entity")
  return {id: entityId}
}


export async function updateEntityContent(entityId: string, text: string, contentId: string) {
    const currentContent = await db.content.findUnique({
        where: { id: contentId },
        select: { text: true, history: true }
    });
    if(!currentContent){
        return null
    }

    const result = await db.content.update({
      where: { id: contentId },
      data: { 
        text: text,
        history: [...currentContent?.history, currentContent.text]
      },
    });

    revalidateTag("contents")
    revalidateTag("content")
    redirect("/articulo/"+encodeURIComponent(entityId))
    return result
}
