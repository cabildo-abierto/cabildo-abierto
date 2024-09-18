import { NextRequest, NextResponse } from 'next/server';
import { buyAndUseSubscription } from '../../../actions/users';
import { accessToken } from '../../../components/utils';


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

    await buyAndUseSubscription(paymentDetails.metadata.user_id, paymentId, paymentDetails.transaction_amount)

    return NextResponse.json({ status: 200 });
}