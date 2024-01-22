import { CartsDao } from "../dao/index.js";

export const getCarts = async () => await CartsDao.getCarts();
export const getCart = async (cid) => await CartsDao.getCart(cid);
export const createCart = async (data) => await CartsDao.createCart(data);
export const addProduct = async (cid, pid) =>
  await CartsDao.addProduct(cid, pid);
export const putProductQuantity = async (cid, pid, quantity) =>
  await CartsDao.putProductQuantity(cid, pid, quantity);
export const deleteProduct = async (cid, pid) =>
  await CartsDao.deleteProduct(cid, pid);
export const deleteCartProducts = async (cid) =>
  await CartsDao.deleteCartProducts(cid);
