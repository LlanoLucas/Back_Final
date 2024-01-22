import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productsCollection = "products";

const positiveNumberValidator = (value) => {
  return value >= 0;
};

const productsSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    validate: {
      validator: positiveNumberValidator,
      message: "Price must be a positive number",
    },
  },
  thumbnails: Array,
  category: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    validate: {
      validator: positiveNumberValidator,
      message: "Price must be a positive number",
    },
  },
  code: {
    type: String,
    unique: true,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

productsSchema.plugin(mongoosePaginate);

const ProductsModel = mongoose.model(productsCollection, productsSchema);

export default ProductsModel;
