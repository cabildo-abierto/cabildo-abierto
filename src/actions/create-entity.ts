'use server';

import { db } from '@/db';
import {
  CreateEntityFormState,
  CreateEntityFormSchema,
} from "@/app/lib/definitions";
import { getUserId } from './get-user';


export async function createEntityFromForm(state: CreateEntityFormState, formData) {
  const userId = await getUserId()
  if(!userId) return {error: "Necesitás una cuenta para crear entidades"} // no debería pasar

  const validatedFields = CreateEntityFormSchema.safeParse({
    name: formData.get('name'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name } = validatedFields.data

  return await createEntity(name, userId)
}


export async function createEntity(name, userId){
  const entityId = encodeURIComponent(name.replaceAll(" ", "_"))
  const exists = await db.entity.findFirst({
    where: {id: entityId}
  })
  if(exists) return {error: "Ya existe una entidad con ese nombre"}

  const content = await db.content.create({
    data: {
      text: "",
      authorId: userId,
      type: "EntityContent"
    }
  })

  return await db.entity.create({
    data: {
      name: name,
      id: entityId,
      contentId: content.id
    }
  })
}


export async function updateEntityContent(text, contentId) {
    const currentContent = await db.content.findUnique({
      where: { id: contentId },
      select: { text: true, history: true }
    });
    if(!currentContent){
      return null
    }

    return await db.content.update({
      where: { id: contentId },
      data: { 
        text: text,
        history: [...currentContent?.history, currentContent.text]
      },
    });
}
