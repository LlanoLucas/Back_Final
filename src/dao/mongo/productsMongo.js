import ProductsModel from "./models/products.model.js";

export const getProducts = async () => {
  return await ProductsModel.find();
};
export const getProduct = async (pid) => {
  return await ProductsModel.findById(pid);
};

export const addProduct = async (product) => {
  return await ProductsModel.create(product);
};

export const updateProduct = async (pid, updated) => {
  return await ProductsModel.findByIdAndUpdate(
    pid,
    { ...updated },
    { new: true }
  );
};

export const deleteProduct = async (pid) => {
  return await ProductsModel.findByIdAndDelete(pid);
};
