import { ProductsDao } from "../dao/index.js";

export const getProducts = async (filters) =>
  await ProductsDao.getProducts(filters);
export const getProduct = async (pid) => await ProductsDao.getProduct(pid);
export const addProduct = async (product) =>
  await ProductsDao.addProduct(product);
export const updateProduct = async (pid, updated) =>
  await ProductsDao.updateProduct(pid, updated);
export const deleteProduct = async (pid) =>
  await ProductsDao.deleteProduct(pid);
