import CartsModel from "./models/carts.model.js";

export const getCarts = async () => await CartsModel.find().lean().exec();

export const getCart = async (cid) => await CartsModel.findById(cid).exec();

export const createCart = async (data) => {
  return await CartsModel.create(data);
};

export const addProduct = async (cid, pid) => {
  const cart = await CartsModel.findById(cid);

  if (!cart) return null;

  let productInCart;

  if (cart.products.length > 0) {
    productInCart = cart.products.find((p) => p.product._id.toString() === pid);
  }

  if (productInCart) {
    productInCart.quantity++;
  } else {
    cart.products.push({ product: pid, quantity: 1 });
  }

  await cart.save();
  return cart;
};

export const putProductQuantity = async (cid, pid, quantity) => {
  try {
    const cart = await CartsModel.findById(cid);
    if (!cart) {
      console.log("cart not found");
      return null;
    }

    const productToUpdate = cart.products.find(
      (product) => product.product._id.toString() === pid
    );
    if (!productToUpdate) {
      console.log("product not found");
      return null;
    }

    productToUpdate.quantity = quantity;

    const updatedCart = await cart.save();
    return updatedCart;
  } catch (error) {
    throw new Error("Failed to update product quantity");
  }
};

export const deleteProduct = async (cid, pid) =>
  await CartsModel.findByIdAndUpdate(
    cid,
    { $pull: { products: { product: pid } } },
    { new: true }
  );

export const deleteCartProducts = async (cid) => {
  return await CartsModel.findOneAndUpdate(
    { _id: cid },
    { $set: { products: [] } },
    { new: true }
  );
};

export const deleteCart = async (cid) => {
  return await CartsModel.findByIdAndDelete(cid);
};
