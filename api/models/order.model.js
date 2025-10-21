import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order must be belong to user"],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        priceAtPurchase: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    taxPrice: {
      type: Number,
      default: 0,
    },

    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },

    shippingPrice: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    stripeSessionId: {
      type: String,
      unique: true,
    },
    paymentMethodType: {
      type: String,
      enum: ["card", "cash"],
      default: "card",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    paidAt: {
      type: Date,
      required: true,
    },
    isDelivired: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
