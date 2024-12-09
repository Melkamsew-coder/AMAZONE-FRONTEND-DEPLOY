const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { setGlobalOptions } = require("firebase-functions");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_KEY);

const app = express();

// Set global options for Firebase Functions
setGlobalOptions({ maxInstances: 10 });

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  logger.info("GET request received at /");
  res.status(200).json({
    message: "success!",
  });
});

// Payment creation route
app.post("/payment/create", async (req, res) => {
  const total = parseInt(req.query.total); // Amount passed in cents
  logger.info(`POST request received at /payment/create with total: ${total}`);

  if (total > 0) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total, // Total amount in cents
        currency: "usd", // Currency
      });

      // Log PaymentIntent details for debugging
      logger.info("PaymentIntent successfully created", {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      });

      // Respond with the clientSecret
      res.status(201).json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      logger.error("Error creating PaymentIntent", { message: error.message });
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    logger.warn("Invalid total amount received", { total });
    res.status(400).json({
      error: "Invalid total amount. It must be greater than zero.",
    });
  }
});

// Export the Firebase Function
exports.api = onRequest(app);
