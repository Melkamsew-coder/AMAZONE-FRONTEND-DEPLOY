import React, { useContext, useState } from "react";
import LayOut from "../../Components/LayOut/LayOut"; // Layout component for consistent page structure
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
  // Access user and basket data from context
  const [{ user, basket }, dispatch] = useContext(DataContext);

  // States for handling card errors and processing state
  const [cardError, setCardError] = useState(null); // Error messages related to card input
  const [processing, setProcessing] = useState(false); // Indicates if payment is being processed

  // Calculate total items and price from the basket
  const totalItem = basket?.reduce((amount, item) => item.amount + amount, 0); // Total number of items
  const totalPrice = basket?.reduce(
    (amount, item) => item.price * item.amount + amount,
    0
  ); // Total price of all items

  // Initialize Stripe hooks
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate(); // Hook for navigating programmatically

  // Handle changes in the card input field
  const handleChange = (e) => {
    e?.error?.message ? setCardError(e?.error?.message) : setCardError(""); // Set error message if any
  };

  // Handle payment submission
  const handlePayment = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      setProcessing(true); // Set processing state

      // Create PaymentIntent by making an API request to the backend
      const response = await axiosInstance({
        method: "POST",
        url: `/payment/create?total=${totalPrice * 100}`, // Pass total price in cents
      });

      const clientSecret = await response.data?.clientSecret; // Retrieve client secret from backend
      if (!clientSecret) {
        throw new Error("Client secret not received from backend."); // Handle error if client secret is missing
      }

      // Confirm payment with Stripe
      const { paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement), // Use card element for payment method
        },
      });

      //generates a fallback value using the user's unique ID (user?.uid) and the current timestamp
      const orderId = paymentIntent?.id || `${user?.uid}-${Date.now()}`; // Generate order ID
      // Save order details to Firestore
      try {
        await db
          .collection("users")
          .doc(user?.uid)
          .collection("orders")
          .doc(orderId)
          .set({
            basket: basket, // Save basket details
            amount: paymentIntent?.amount || 0, // Save payment amount
            created: paymentIntent?.created || Date.now(), // Save timestamp
          });
      } catch (error) {
        console.error("Error saving order to Firestore:", error.message); // Log Firestore error
      }

      // Clear the basket after successful payment
      dispatch({
        type: Type.EMPTY_BASKET, // Dispatch action to empty basket
      });

      setProcessing(false); // Reset processing state
      navigate("/orders", { state: { msg: "You have placed a new order!" } }); // Navigate to orders page
    } catch (error) {
      console.error("Payment Error:", error.message); // Log payment error
      setProcessing(false); // Reset processing state
    }
  };

  return (
    <LayOut>
      <div className={classes.payment__header}>Checkout ({totalItem})</div>
      <section className={classes.payment}>
        {/* Delivery Address Section */}
        <div className={classes.flex}>
          <h3>Delivery Address</h3>
          <div>
            <div>{user?.email}</div> {/* User's email */}
            <div>123 Woodmere Dr</div> {/* Placeholder address */}
            <div>Reston, VA</div> {/* Placeholder city/state */}
          </div>
        </div>
        <hr />

        {/* Review Items Section */}
        <div className={classes.flex}>
          <h3>Review Items and Delivery</h3>
          <div>
            {basket?.map((item) => (
              <ProductCard product={item} flex={true} renderAdd={false} /> // Display each item in the basket
            ))}
          </div>
        </div>
        <hr />

        {/* Payment Methods Section */}
        <div className={classes.flex}>
          <h3>Payment Methods</h3>
          <div className={classes.payment__card__container}>
            <div className={classes.payment__details}>
              <form onSubmit={handlePayment}>
                {cardError && (
                  <small style={{ color: "red" }}>{cardError}</small> // Display card error message
                )}
                <CardElement onChange={handleChange} />{" "}
                {/* Stripe Card Element for payment details */}
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
                      <CurrencyFormat amount={totalPrice} />{" "}
                      {/* Display total price */}
                    </span>
                  </div>
                  <button type="submit">
                    {processing ? (
                      <div className={classes.loading}>
                        <ClipLoader color="gray" size={15} />{" "}
                        {/* Loading spinner */}
                        <p>Please wait...</p>
                      </div>
                    ) : (
                      "Pay Now" // Button text
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

export default Payment; // Export component for use in other parts of the app
