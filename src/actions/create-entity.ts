'use server';

import { db } from '@/db';
import { redirect } from 'next/navigation';
import {
  CreateEntityFormState,
  CreateEntityFormSchema,
} from "@/app/lib/definitions";


const emptyInitialValue = [
  {
      type: 'paragraph',
      children: [
        {
          text: ''
        },
      ],
  },
]


export async function createEntity(state: CreateEntityFormState, formData) {
  const validatedFields = CreateEntityFormSchema.safeParse({
    name: formData.get('name'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name } = validatedFields.data

  const entity = await db.entity.create({
    data: {
      name: name,
      text: "",
      id: encodeURI(name)
    }
  })

  redirect("/entidad/"+entity.id)
}

export async function updateEntityContent(content, id){
    return await db.entity.update({
        where: {
            id: id,
        },
        data: {
            text: content,
        },
    })
}