import ProductsModel from "./models/products.model.js";

export const getMongoProducts = async (req, res, renderView = false) => {
  try {
    const { limit = 3, page = 1, sort, query, places } = req.query;

    const sortOptions = sort ? { price: sort } : {};

    const options = {
      page,
      limit,
      lean: true,
      sort: sortOptions,
    };

    const queryConditions = {};
    if (query) {
      queryConditions.category = query.charAt(0).toUpperCase() + query.slice(1);
    }

    if (places && places === "true") queryConditions.stock = { $gt: 0 };

    const products = await ProductsModel.paginate(queryConditions, options);

    if (renderView) {
      res.render("home", {
        products,
        sortQuery: sort ? `&sort=${sort}` : "",
        queryQuery: query ? `&query=${query}` : "",
        queryPlaces: places === "true" ? `&places=true` : "",
        user: req.user.user,
      });
    } else {
      res.json({ status: "success", payload: products });
    }

    return products; // Return the products for the promise chain
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
    throw error; // Re-throw the error to propagate it to the caller
  }
};

export const getProduct = async (pid) => await ProductsModel.findById(pid);

export const addProduct = async (product) =>
  await ProductsModel.create(...product);

export const updateProduct = async (pid, updated) =>
  await ProductsModel.findByIdAndUpdate(pid, { ...updated }, { new: true });

export const deleteProduct = async (pid) =>
  await ProductsModel.findByIdAndDelete(pid);
