import axios from 'axios';
const stripe = Stripe(
  'pk_test_51QpCtrK94WdxSBgzMOtBtq4nWNxEbruFa9dyRm7xIwfl6oxWvUVRvek13AL34tMJKu2R8fKNExVJCUe0EnvBwxWF00Q58hfHu2',
);
import { showAlert } from './alert';
export const chargeCreditCard = async function (tourID) {
  try {
    // make request tpo that session
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourID}`,
    );
    console.log(session);
    // charge credit card and send form
    await stripe.redirectToCheckout({
      sessionId: session.data.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err.message);
  }
};
