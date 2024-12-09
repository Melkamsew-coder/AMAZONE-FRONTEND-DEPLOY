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
  const [{ user, basket }, dispatch] = useContext(DataContext);
  const [cardError, setCardError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const totalItem = basket?.reduce((amount, item) => item.amount + amount, 0);
  const totalPrice = basket?.reduce(
    (amount, item) => item.price * item.amount + amount,
    0
  );

  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const handleChange = (e) => {
    e?.error?.message ? setCardError(e?.error?.message) : setCardError("");
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    // console.log("Payment form submitted!");
    try {
      setProcessing(true);

      // Create PaymentIntent
      const response = await axiosInstance({
        method: "POST",
        url: `/payment/create?total=${totalPrice * 100}`,
      });

      const clientSecret = response.data?.clientSecret;
      console.log("Received clientSecret:", clientSecret);

      if (!clientSecret) {
        throw new Error("Client secret not received from backend.");
      }

      // Confirm payment
      const { paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      console.log("Payment Intent Response:", paymentIntent);

      const orderId = paymentIntent?.id || `${user?.uid}-${Date.now()}`;
      console.log("User UID:", user?.uid);
      console.log("Order ID:", orderId);

      // Save order to Firestore
      try {
        await db
          .collection("users")
          .doc(user?.uid)
          .collection("orders")
          .doc(orderId)
          .set({
            basket: basket,
            amount: paymentIntent?.amount || 0,
            created: paymentIntent?.created || Date.now(),
          });
        console.log("Order successfully saved to Firestore!");
      } catch (error) {
        console.error("Error saving order to Firestore:", error.message);
      }

      dispatch({
        type: Type.EMPTY_BASKET,
      });

      setProcessing(false);
      navigate("/orders", { state: { msg: "You have placed a new order!" } });
    } catch (error) {
      console.error("Payment Error:", error.message);
      setProcessing(false);
    }
  };

  return (
    <LayOut>
      <div className={classes.payment__header}>Checkout ({totalItem})</div>
      <section className={classes.payment}>
        <div className={classes.flex}>
          <h3>Delivery Address</h3>
          <div>
            <div>{user?.email}</div>
            <div>123 Woodmere Dr</div>
            <div>Reston, VA</div>
          </div>
        </div>
        <hr />
        <div className={classes.flex}>
          <h3>Review Items and Delivery</h3>
          <div>
            {basket?.map((item) => (
              <ProductCard product={item} flex={true} renderAdd={false} />
            ))}
          </div>
        </div>
        <hr />
        <div className={classes.flex}>
          <h3>Payment Methods</h3>
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
                        gap: "10px",
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
                        <p>Please wait...</p>
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
