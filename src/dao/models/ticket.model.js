import mongoose, { Types } from "mongoose";

const ticketCollection = "Ticket";

const ticketSchema = new mongoose.Schema({
  products: {
    type: [
      {
        product: {
          type: Types.ObjectId,
          ref: "products"
        },
        quantity: Number
      }
    ],
    default: []
  },
  code: {
    type: String,
    required: true,
    unique: true,
    default: () => Math.random().toString(36).substring(2, 20).toUpperCase(),
  },
  amount: {
    type: Number,
    default: 0,
  },
  purchaser: {
    type: String,
    required: true,
  }
}, {
  timestamps: { createdAt: "purchase_datetime" }
})

export const ticketModel = mongoose.model(ticketCollection, ticketSchema);