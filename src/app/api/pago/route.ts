import { NextRequest, NextResponse } from 'next/server';
import { buyAndUseSubscription, donateSubscriptions, getUserById } from '../../../actions/users';
import { accessToken, validSubscription } from '../../../components/utils';


const getPaymentDetails = async (paymentId) => {
    const url = `https://api.mercadopago.com/v1/payments/${paymentId}`;
  
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  
    const data = await response.json();
    return data;
};


export async function POST(req) {
    const json = await req.json()

    const paymentId = json.data.id
    
    const paymentDetails = await getPaymentDetails(paymentId)

    if(paymentDetails.status != "approved"){
      return Response.json({status: 200})
    }

    const amount = paymentDetails.metadata.amount

    const userId = paymentDetails.metadata.user_id
    const user = await getUserById(userId)
    const valid = validSubscription(user)
    const price = paymentDetails.transaction_amount / amount


    if(amount > 1){
      await donateSubscriptions(valid ? amount : amount-1, userId, paymentId, price)
    }
    if(!valid){
      await buyAndUseSubscription(userId, price, paymentId)
    }

    return NextResponse.json({ status: 200 });
}