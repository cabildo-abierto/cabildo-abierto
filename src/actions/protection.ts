'use server';

import { db } from '@/db';


export async function setProtection(entityId, level) {
    return await db.entity.update({
      where: { id: entityId },
      data: { protection: level },
    });
}
