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
  const originalProduct = await ProductsModel.findById(pid);

  const productUpdates = {};
  for (const key in updated) {
    if (updated.hasOwnProperty(key) && updated[key] !== originalProduct[key]) {
      productUpdates[key] = updated[key];
    }
  }

  if (Object.keys(productUpdates).length === 0) {
    return "Product update skipped: No changes detected.";
  }

  const updatedProduct = await ProductsModel.findByIdAndUpdate(
    pid,
    productUpdates,
    { new: true }
  );

  return updatedProduct;
};

export const deleteProduct = async (pid) => {
  return await ProductsModel.findByIdAndDelete(pid);
};
