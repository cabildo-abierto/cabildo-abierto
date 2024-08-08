'use server';

import { db } from '@/db';
import { ProtectionLevel } from '@prisma/client';
import { revalidateTag } from 'next/cache';


export async function setProtection(entityId: string, level: ProtectionLevel) {
    const result = await db.entity.update({
      where: { id: entityId },
      data: { protection: level },
    });
    revalidateTag("entity")
    revalidateTag("entities")
    return result
}
