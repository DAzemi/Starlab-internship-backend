const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {
  insertOrder,
  insertOrderDetails,
  updateProductStock,
} = require("../controllers/orderController");
const { meta } = require("../utils/emailService");

router.post("/create-payment-intent", async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "eur",
      amount: 50,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

router.post("/create-checkout-session", async (req, res) => {
  const line_items = req.body.cartItems.map((item) => ({
    price_data: {
      currency: "eur",
      product_data: {
        name: item.name,
        images: [item.image_url],
        metadata: {
          id: item.product_id,
        },
      },
      unit_amount: !isNaN(item.price) ? item.price * 100 : 0,
    },
    quantity: item.quantity || 1,
  }));

  const orderDetails = req.body.cartItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));

  const cartString = JSON.stringify(orderDetails);

  const customer = await stripe.customers.create({
    metadata: {
      userId: req.body.userId,
      cart: req.body.cartItems.toString(),
      cartString: cartString,
    },
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    shipping_address_collection: {
      allowed_countries: ["XK", "AL", "MK", "ME", "RS"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 0,
            currency: "eur",
          },
          display_name: "Free shipping",
          // Delivers between 5-7 business days
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 5,
            },
            maximum: {
              unit: "business_day",
              value: 7,
            },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 1500,
            currency: "eur",
          },
          display_name: "Next day air",
          // Delivers in exactly 1 business day
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 1,
            },
            maximum: {
              unit: "business_day",
              value: 1,
            },
          },
        },
      },
    ],
    phone_number_collection: {
      enabled: true,
    },
    line_items,
    customer: customer.id,
    mode: "payment",
    success_url: "http://localhost:3000/",
    cancel_url: "http://localhost:3000/cart",
  });

  res.send({ url: session.url, customerId: customer.id });
});

// Stripe Webhook

// This is your Stripe CLI webhook secret for testing your endpoint locally.
let endpointSecret;
// endpointSecret =
//   "whsec_7d50e36762426d57c85c55bc91b65e501d40fd649f74d0192b41b0fe63adcce1";

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let data;
    let eventType;

    if (endpointSecret) {
      let event;

      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          sig,
          endpointSecret
        );
        console.log("Webhook verified");
      } catch (err) {
        console.log("Webhook failed");
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      data = event.data.object;
      eventType = event.type;
    } else {
      data = request.body.data.object;
      eventType = request.body.type;
    }

    // Handle the event
    if (eventType === "checkout.session.completed") {
      try {
        const customer = await stripe.customers.retrieve(data.customer);
        const user_id = customer.metadata.userId;
        console.log("User ID from stripe webhook:", user_id);

        function formatTotalValue(amount) {
          const formatter = new Intl.NumberFormat("en-DE", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
          });

          const amountInEuros = amount / 100;

          return formatter.format(amountInEuros);
        }

        function formatShippingMethod(shippingMethod) {
          if (data.shipping_cost?.amount_total === 1500) {
            return "DHL Express";
          }

          if (data.shipping_cost?.amount_total === 0) {
            return "Free shipping";
          }
          return shippingMethod;
        }

        const orderId = data.id;
        const customerDetails = data?.customer_details;
        const amount_total = formatTotalValue(data.amount_total);
        const userName = data.customer_details?.name;
        const street_address = data.shipping_details?.address.line1;
        const city = data.shipping_details?.address.city;
        const country = data.shipping_details?.address.country;
        const postal_code = data.shipping_details?.address.postal_code;
        const shipping_method = formatShippingMethod(
          data.shipping_cost.shipping_rate
        );
        const shipping_rate_data = formatTotalValue(
          data.shipping_cost?.amount_total || null
        );
        const phone_number = customerDetails?.phone;

        await insertOrder({
          orderId,
          user_id,
          amount_total,
          userName,
          street_address,
          city,
          country,
          postal_code,
          shipping_method,
          shipping_rate_data,
          phone_number,
        });

        // console.log(customer.metadata);
        // console.log("Webhook data::", data);

        const metadata = customer.metadata;
        const cartString = metadata.cartString;
        // console.log("CartString after declaring metadata!!! :", cartString);
        console.log(
          "*************************************************************************************************"
        );

        const orderDetails = JSON.parse(cartString);

        // Process order details first
        const orderDetailsPromises = orderDetails.map(async (product) => {
          const orderDetailData = {
            order_id: orderId,
            user_id,
            product_id: product.productId,
            quantity: product.quantity,
          };

          try {
            await insertOrderDetails(orderDetailData);
            console.log(
              "Order details inserted for product_id",
              product.productId
            );
          } catch (error) {
            console.log(
              "Error inserting order details for product_id",
              product.productId,
              error.message
            );
          }

          return orderDetailData;
        });

        await Promise.all(orderDetailsPromises);

        const updateStockPromises = orderDetails.map(async (product) => {
          try {
            await updateProductStock(product.productId, product.quantity);
            console.log("Stock updated for product_id", product.productId);
          } catch (error) {
            console.log(
              "Error updating stock for product_id",
              product.productId,
              error.message
            );
          }
        });

        await Promise.all(updateStockPromises);

        console.log(
          "Order and order details successfully inserted into the database"
        );
      } catch (error) {
        console.error(
          "Error from stripe event handler of inserting order",
          error.message
        );
        response.status(500).send("Error in stripe webhook/eventType");
        return;
      }
    }

    response.send().end();
  }
);

module.exports = router;
