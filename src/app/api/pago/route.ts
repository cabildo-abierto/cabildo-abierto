import { NextResponse } from 'next/server';
import { buySubscriptions } from '../../../actions/users';
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
    // https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/notifications/webhooks
    // TO DO: Verificar la x-signature
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

    const {error} = await buySubscriptions(userId, amount, donationsAmount, paymentId, price)
    if(error) {
      console.log("error", error)
      console.log("details", paymentDetails)
      console.log(userId, amount, donationsAmount, paymentId, price)
      return NextResponse.json({status: 500})
    }

    return NextResponse.json({ status: 200 });
}