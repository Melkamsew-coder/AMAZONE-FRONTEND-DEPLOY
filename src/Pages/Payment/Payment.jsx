////WORKed

import React, { useContext, useState } from "react";
import LayOut from "../../Components/LayOut/LayOut";
import classes from "./Payment.module.css";
import { DataContext } from "../../Components/DataProvider/DataProvider";
import ProductCard from "../../Components/Product/ProductCard";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import CurrencyFormat from "../../Components/CurrencyFormat/CurrencyFormat";
import { axiosInstance } from "../../Api/axios";
import { ClipLoader } from "react-spinners";
import { db } from "../../Utility/firebase";
import { useNavigate } from "react-router-dom";
import { Type } from "../../Utility/action.type";

function Payment() {
  // console.log("Payment component is rendered!"); // Check if this appears
  // alert("Payment component rendered!"); // Fallback if console is not working

  const [{ user, basket }, dispatch] = useContext(DataContext);
  const [cardError, setCardError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const totalItem = basket?.reduce((amount, item) => {
    return item.amount + amount;
  }, 0);

  const totalPrice = basket?.reduce((amount, item) => {
    return item.price * item.amount + amount;
  }, 0);

  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const handleChange = (e) => {
    // console.log(e)
    e?.error?.message ? setCardError(e?.error?.message) : setCardError("");
  };
  const handlePayment = async (e) => {
    e.preventDefault();
    alert("Payment form submitted!");
    try {
      setProcessing(true);
      const response = await axiosInstance({
        method: "POST",
        url: `/payment/create?total=${totalPrice * 100}`,
      });
      //The clientSecret which passed to stripe.confirmCardPayment()
      // "clientSecret": "pi_3QROe5CFkRAVyMq312klNpbo_secret_S8r7L4h2SQClx25FF0ghplZoq"
      console.log("payment page", response.data);
      const clientSecret = response.data?.clientSecret;
      console.log("Client Secret:", clientSecret); // Log the client secret
      //The API call to stripe.confirmCardPayment()
      const { paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });
      console.log("Payment Intent Response:", paymentIntent); // Log payment intent
      console.log("Payment successful:", paymentIntent);
      try {
        await db
          .collection("users")
          .doc(user?.uid)
          .collection("orders")
          .doc(paymentIntent.id)
          .set({
            basket: basket,
            amount: paymentIntent.amount,
            created: paymentIntent.created,
          });
        alert("Order successfully saved in Firestore!");
      } catch (error) {
        // alert("Error saving order in Firestore: " + error.message);
      }

      //empty the basket
      dispatch({
        type: Type.EMPTY_BASKET,
      });
      // console.log(confirmation)
      setProcessing(false);
      navigate("/orders", { state: { msg: "You have placed A new order" } });
    } catch (error) {
      console.log("error ####", error);
      setProcessing(false);
    }
  };

  return (
    <LayOut>
      {/* payment page */}
      <div className={classes.payment__header}>checkout ({totalItem})</div>

      <section className={classes.payment}>
        {/* address */}
        <div className={classes.flex}>
          <h3>Delivery Address</h3>
          <div>
            <div>{user?.email}</div>
            <div>123 woodmere dr</div>
            <div>Reston, VA</div>
          </div>
        </div>
        <hr />
        {/* product */}
        <div className={classes.flex}>
          <h3>Review items and delivery </h3>
          <div>
            {basket?.map((item) => (
              <ProductCard product={item} flex={true} renderAdd={false} />
            ))}
          </div>
        </div>
        <hr />
        {/* card form */}
        <div className={classes.flex}>
          <h3>Payment methods </h3>
          <div className={classes.payment__card__container}>
            <div className={classes.payment__details}>
              <form onSubmit={handlePayment}>
                {cardError && (
                  <small style={{ color: "red" }}>{cardError}</small>
                )}
                <CardElement onChange={handleChange} />
                <div className={classes.payment__price}>
                  <div>
                    <span
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "10Px",
                        fontWeight: "bold",
                      }}
                    >
                      <p>Total Order</p> |{" "}
                      <CurrencyFormat amount={totalPrice} />
                    </span>
                  </div>
                  <button type="submit">
                    {processing ? (
                      <div className={classes.loading}>
                        <ClipLoader color="gray" size={15} />
                        <p>Please wait ...</p>
                      </div>
                    ) : (
                      "Pay Now"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </LayOut>
  );
}

export default Payment;

