'use server';

import { db } from '@/db';
import {
  CreateEntityFormSchema,
} from "@/app/lib/definitions";
import { getUserId, UserProps } from './get-user';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { getContentById } from './get-content';

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


  await db.entity.create({
    data: {
      name: name,
      id: entityId,
    }
  })

  const content = await db.content.create({
    data: {
      text: "Este artículo está vacío!",
      authorId: userId,
      type: "EntityContent",
      parentEntityId: entityId
    }
  })

  revalidateTag("contents")
  revalidateTag("content")
  revalidateTag("entities")
  revalidateTag("entity")
  return {id: entityId}
}


export const updateCategories = async (entityId: string, lastVersionId: string, categories: string, user: UserProps) => {
  const lastVersion = await getContentById(lastVersionId)
  if(!lastVersion){
      console.log("Error: Last version not found.")
      return null
  }

  await db.content.create({
      data: {
          text: lastVersion.text,
          authorId: user.id,
          type: lastVersion.type,
          parentEntityId: entityId,
          categories: categories
      }
  })

  revalidateTag("entities")
  revalidateTag("entity")
  revalidateTag("contents")
  revalidateTag("content")
}


export const updateEntityContent = async (text: string, entityId: string, lastVersionId: string, user: UserProps) => {
  const lastVersion = await getContentById(lastVersionId)
  if(!lastVersion){
      return null
  }

  await db.content.create({
      data: {
          text: text,
          authorId: user.id,
          type: lastVersion.type,
          parentEntityId: entityId,
          categories: lastVersion.categories
      }
  })
  revalidateTag("entities")
  revalidateTag("entity")
  revalidateTag("contents")
  revalidateTag("content")
}
