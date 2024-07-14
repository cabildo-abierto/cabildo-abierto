'use server';

import { db } from '@/db';
import { redirect } from 'next/navigation';
import {
  CreateEntityFormState,
  CreateEntityFormSchema,
} from "@/app/lib/definitions";
import { getUser, getUserId } from './get-user';


export async function getSubscriptionStatus() {
    const userId = await getUserId()

    const user = await db.user.findUnique({
        select: {
          paymentHistory: true
        },
        where: {id:userId}
    })

    if(!user){ // no debería pasar nunca
      return "user not found"
    }

    if(user?.paymentHistory.length == 0){
      return "invalid"
    }

    const lastPaymentDate = user?.paymentHistory[user?.paymentHistory.length-1].createdAt

    const nextSubscriptionEnd = new Date(lastPaymentDate)
    
    nextSubscriptionEnd?.setMonth(lastPaymentDate.getMonth()+1)

    return nextSubscriptionEnd > new Date() ? "valid" : "invalid"
}


export async function addPayment(amount) {
  const userId = await getUserId()  

  await db.payment.create({
    data: {
      amount: amount,
      userId: userId,
    }
  })
}