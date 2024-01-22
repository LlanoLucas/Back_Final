import CartsModel from "./models/carts.model.js";

export const getCarts = async () => await CartsModel.find().lean().exec();

export const getCart = async (cid) =>
  await CartsModel.findById(cid).lean().exec();

export const createCart = async (data) => await CartsModel.create(data);

export const addProduct = async (cid, pid) => {
  const cart = await CartsModel.findById(cid);

  if (!cart) return null;

  const productInCart = carrito.products.find((p) => p.id.toString() === pid);

  if (productInCart) productInCart.quantity++;
  else cart.products.push({ id: pid, quantity: 1 });

  carrito.save();

  return carrito;
};

export const putProductQuantity = async (cid, pid, quantity) =>
  await CartsModel.findOneAndUpdate(
    { _id: cid, "products.id": pid },
    { $set: { "products.$.quantity": quantity } },
    { new: true }
  );

export const deleteProduct = async (cid, pid) =>
  await CartsModel.findByIdAndUpdate(
    cid,
    { $pull: { products: { id: pid } } },
    { new: true }
  );

export const deleteCartProducts = async (cid) =>
  await CartsModel.findOneAndUpdate(
    { _id: cid },
    { $set: { products: [] } },
    { new: true }
  );
