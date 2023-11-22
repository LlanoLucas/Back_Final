import mongoose from "mongoose";

const cartsCollection = "carts";

const CartsSchema = new mongoose.Schema({
  products: {
    type: [
      {
        products: {
          type: mongoose.Schema.ObjectId,
          quantity: Number,
        },
      },
    ],
    default: [],
  },
});

const CartsModel = mongoose.model(cartsCollection, CartsSchema);
export default CartsModel;
