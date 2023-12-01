import mongoose from "mongoose";

const cartsCollection = "carts";

const CartsSchema = new mongoose.Schema({
  products: {
    type: [
      {
        _id: false,
        product: { type: mongoose.ObjectId, ref: "products" },
        quantity: Number,
      },
    ],
    default: [],
  },
});

CartsSchema.pre("findOne", function () {
  this.populate("products.product");
});

const CartsModel = mongoose.model(cartsCollection, CartsSchema);
export default CartsModel;
