'use server';

import { ContentProps, UserProps } from '@/app/lib/definitions';
import { db } from '@/db';
import { revalidateTag } from 'next/cache';
import { getEntityById } from './get-entity';


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

  revalidateTag("entities")
  revalidateTag("contents")
  return {id: entityId}
}


export const updateEntity = async (text: string, categories: string, entityId: string, user: UserProps) => {
  await db.content.create({
      data: {
          text: text,
          authorId: user.id,
          type: "EntityContent",
          parentEntityId: entityId,
          categories: categories
      }
  })

  revalidateTag("entities")
  revalidateTag("contents")
}


export const undoChange = async (entityId: string, contentId: string, versionNumber: number, message: string) => {
  const entity = await getEntityById(entityId)
  if(entity && entity.versions.length-1 == versionNumber){
    await db.content.update({
        data: {
            isUndo: true,
            undoMessage: message
        },
        where: {
          id: contentId
        }
    })
  }

  revalidateTag("entities")
}
