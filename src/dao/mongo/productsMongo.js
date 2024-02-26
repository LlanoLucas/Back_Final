import ProductsModel from "./models/products.model.js";

export const getProduct = async (pid) => await ProductsModel.findById(pid);

export const addProduct = async (product) => {
  await ProductsModel.create(product);
};

export const updateProduct = async (pid, updated) =>
  await ProductsModel.findByIdAndUpdate(pid, { ...updated }, { new: true });

export const deleteProduct = async (pid) =>
  await ProductsModel.findByIdAndDelete(pid);
