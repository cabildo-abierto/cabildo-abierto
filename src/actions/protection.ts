'use server';

import { ProtectionLevel } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { db } from '../db';


export async function setProtection(entityId: string, level: ProtectionLevel) {
    const result = await db.entity.update({
      where: { id: entityId },
      data: { protection: level },
    });
    revalidateTag("entities")
    revalidateTag("entity")
    return result
}
