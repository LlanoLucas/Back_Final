import CartsModel from "./models/carts.model.js";

export const getCarts = async () => await CartsModel.find().lean().exec();

export const getCart = async (cid) => await CartsModel.findById(cid).exec();

export const createCart = async (data) => await CartsModel.create(data);

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
      return null;
    }

    // Find the product with the specified ID in the cart
    const productToUpdate = cart.products.find(
      (product) => product.product._id.toString() === pid
    );
    console.log(productToUpdate);
    if (!productToUpdate) {
      return null; // Product not found in the cart
    }

    // Update the quantity of the product
    productToUpdate.quantity = quantity;

    // Save the updated cart
    const updatedCart = await cart.save();
    console.log(updatedCart);
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

export const deleteCartProducts = async (cid) =>
  await CartsModel.findOneAndUpdate(
    { _id: cid },
    { $set: { products: [] } },
    { new: true }
  );

export const deleteCart = async (cid) =>
  await CartsModel.findByIdAndDelete(cid);
