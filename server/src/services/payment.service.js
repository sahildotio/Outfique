import Razorpay from 'razorpay';
import configure from '../config/config.js';

const razorpay = new Razorpay({
    key_id: configure.RAZORPAY_KEY_ID,
    key_secret: configure.RAZORPAY_KEY_SECRET
})

export const createOrder = async ({amount, currency="INR"}) => {
    const options = {
        amount: Math.round(amount * 100), //amount in the smallest currency unit
        currency,
    }
    const order = await razorpay.orders.create(options)

    return order
}