'use server';

import { db } from '@/db';
import { ProtectionLevel } from '@prisma/client';


export async function setProtection(entityId: string, level: ProtectionLevel) {
    return await db.entity.update({
      where: { id: entityId },
      data: { protection: level },
    });
}
