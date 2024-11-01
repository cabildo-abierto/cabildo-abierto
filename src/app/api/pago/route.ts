import { NextRequest, NextResponse } from 'next/server';
import { buyAndUseSubscriptions, donateSubscriptions, getUserById } from '../../../actions/users';
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
    const donationsAmount = paymentDetails.metadata.donationsAmount

    const userId = paymentDetails.metadata.user_id

    const total = amount + donationsAmount
    const price = paymentDetails.transaction_amount / total

    if(donationsAmount > 0){
        const {error} = await donateSubscriptions(donationsAmount, userId, paymentId, price)
        if(error) return NextResponse.json({status: 500})
    }
    if(amount > 0){
        const {error} = await buyAndUseSubscriptions(userId, price, paymentId)
        if(error) return NextResponse.json({status: 500})
    }

    return NextResponse.json({ status: 200 });
}