'use server';

import { db } from '@/db';
import { redirect } from 'next/navigation';
import {
  CreateEntityFormState,
  CreateEntityFormSchema,
} from "@/app/lib/definitions";
import { getUser } from './get-user';


export async function createEntityFromForm(state: CreateEntityFormState, formData) {

  const validatedFields = CreateEntityFormSchema.safeParse({
    name: formData.get('name'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name } = validatedFields.data

  createEntity(name)
}


export async function createEntity(name){
  const author = await getUser()
  if(!author) return false

  const content = await db.content.create({
    data: {
      text: "",
      authorId: author.id,
      type: "EntityContent"
    }
  })

  const entity = await db.entity.create({
    data: {
      name: name,
      id: encodeURIComponent(name.replaceAll(" ", "_")),
      contentId: content.id
    }
  })

  redirect("/wiki/"+entity.id)
}


export async function updateEntityContent(content, id) {
    const entity = await db.entity.findUnique({
      where: { id: id },
      include: { content: true },
    })

    const updatedContent = await db.content.update({
      where: { id: entity.contentId },
      data: { text: content },
    });
}
