import { CartsRepository, ProductsRepository } from "../repositories/index.js";
import { TicketsRepository } from "../repositories/index.js";
import { logger } from "../utils/logger.js";
import { sendMail } from "../utils/transport.js";

export const getCarts = async (req, res) => {
  try {
    const carts = await CartsRepository.getCarts();
    res.status(200).json({ message: "Success", payload: carts });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await CartsRepository.getCart(cid);

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    res.status(200).json({ message: "Success", payload: { cart: cart } });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createCart = async (req, res) => {
  try {
    const cartData = req.body;
    const newCart = await CartsRepository.createCart(cartData);
    res.json({
      status: "success",
      payload: newCart,
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await ProductsRepository.getProduct(pid);

    if (!product) {
      return res
        .status(404)
        .json({ status: "error", error: "Invalid product" });
    }

    const owner = product.owner;
    const user = req.user.user;

    if (owner !== "admin" && owner === user.email) {
      logger.warning("You cannot add a product you own to your cart");
      return res.status(400).json({
        status: "error",
        error: "You cannot add a product you own to your cart",
      });
    }

    const cid = req.params.cid;
    const cartExists = await CartsRepository.getCart(cid);

    if (!cartExists) {
      return res.status(404).json({ status: "error", error: "Invalid cart" });
    }

    if (user.cart !== cartExists._id.toString())
      return res
        .status(400)
        .json({ status: "error", msg: "You cannot edit someone else's cart" });

    const cart = await CartsRepository.addProduct(cid, pid);

    res.status(200).json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error addProduct", error: err.message });
  }
};

export const modifyCart = async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await CartsRepository.getCart(cid);

    if (!cart) {
      return res.status(404).json({ status: "error", error: "Cart not found" });
    }

    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res
        .status(400)
        .json({ status: "error", error: "Invalid products data" });
    }

    const updatedProducts = products.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
    }));

    const productIds = updatedProducts.map((item) => item.product);
    const allProducts = await ProductsRepository.getProducts();

    const invalidProductIds = productIds.filter(
      (pid) => !allProducts.find((p) => p._id.toString() === pid)
    );

    if (invalidProductIds.length > 0) {
      return res.status(404).json({
        status: "error",
        msg: `Product ID(s) not found: ${invalidProductIds.join(", ")}`,
      });
    }

    cart.products = updatedProducts;

    await cart.save();

    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};

export const putProductQuantity = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!quantity || !Number.isInteger(quantity)) {
      return res.status(400).json({
        error: "Quantity is obligatory and must be an integer",
      });
    }

    const cart = await CartsRepository.getCart(cid);

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const updatedCart = await CartsRepository.putProductQuantity(
      cid,
      pid,
      quantity
    );

    if (!updatedCart) {
      return res
        .status(500)
        .json({ error: "Failed to update product quantity in the cart" });
    }

    return res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    logger.error("Error in putProductQuantity:", error);
    res.status(500).json({ status: "error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cartExists = await CartsRepository.getCart(cid);

    if (!cartExists) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const cart = await CartsRepository.deleteProduct(cid, pid);

    if (!cart)
      return res.status(404).json({ msg: "Error to complete the action" });

    res.status(200).json({ status: "success", payload: cart.products });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};

export const deleteCartProducts = async (req, res) => {
  try {
    const cid = req.params.cid;
    const cartExists = await CartsRepository.getCart(cid);

    if (!cartExists) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const cart = await CartsRepository.deleteCartProducts(cid);

    if (!cart)
      return res.status(404).json({ msg: "Error to complete the action" });

    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};

export const purchaseCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await CartsRepository.getCart(cid);

    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    const user = req.user.user;
    const purchaser = user.email;

    if (cid !== user.cart)
      return res.status(400).json({
        status: "error",
        message: "You cannot purchase someone else's cart",
      });

    if (cart.products.length === 0) {
      return res.status(404).json({ msg: "There are no products in the cart" });
    }

    const cartProducts = [];
    for (let i = 0; i < cart.products.length; i++) {
      let productId = cart.products[i].product._id.toString();
      let quantity = cart.products[i].quantity;
      cartProducts.push([productId, quantity]);
    }

    const stockProducts = await Promise.all(
      cartProducts.map(async (array) => {
        let product = await ProductsRepository.getProduct(array[0]);
        let productId = product._id.toString();
        let stock = product.stock;
        return [productId, stock];
      })
    );

    const unBought = [];
    const boughtProducts = [];

    for (let i = 0; i < cartProducts.length; i++) {
      let enoughStock = stockProducts[i][1] - cartProducts[i][1];
      if (enoughStock < 0) {
        unBought.push([cartProducts[i][0], cartProducts[i][1]]);
        continue;
      }

      boughtProducts.push([cartProducts[i][0], cartProducts[i][1]]);
      await ProductsRepository.updateProduct(stockProducts[i][0], {
        stock: enoughStock,
      });
    }

    let total = 0;
    let unTotal = 0;

    for (const product of boughtProducts) {
      let productData = await ProductsRepository.getProduct(product[0]);
      total += productData.price * product[1];
    }

    for (const product of unBought) {
      let productData = await ProductsRepository.getProduct(product[0]);
      unTotal += productData.price * product[1];
    }

    let boughtDetail = [];

    for (const product of boughtProducts) {
      const productData = await ProductsRepository.getProduct(product[0]);
      const productTitle = productData.title;
      const quantity = product[1];
      const price = productData.price;
      const totalProduct = price * quantity;
      boughtDetail.push({
        productTitle: productTitle,
        quantity: quantity,
        price: price,
        totalProduct: totalProduct,
      });
    }

    if (unBought.length > 0) {
      let unBoughtDetail = [];

      for (const product of unBought) {
        const productData = await ProductsRepository.getProduct(product[0]);
        const productTitle = productData.title;
        const quantity = product[1];
        const price = productData.price;
        const totalProduct = price * quantity;
        unBoughtDetail.push({
          productTitle: productTitle,
          quantity: quantity,
          price: price,
          totalProduct: totalProduct,
        });
      }

      if (total === 0)
        return res.render("purchase", {
          ticket: false,
          unBoughtDetail,
          unTotal,
        });

      for (const product of boughtProducts) {
        const productId = product[0];
        await CartsRepository.deleteProduct(cid, productId);
      }

      const ticket = await TicketsRepository.createTicket({
        amount: total,
        purchaser: purchaser,
      });

      const ticketPurchaser = purchaser;
      const ticketAmount = total;
      const ticketDate = `${ticket.purchase_datetime.getDate()}/${
        ticket.purchase_datetime.getMonth() + 1
      }/${ticket.purchase_datetime.getFullYear()}`;
      const ticketCode = ticket.code;

      sendMail(
        ticketPurchaser,
        "PURCHASE TICKET",
        `
      <h1 style="background:#93c5fd;text-align:center">CODEDOM</h1>
      
      <h2 style="text-align:center">Thank you for your purchase!</h2> <br>
      
      <main
      style="margin-top:2rem;margin-left:auto;margin-right:auto;display:flex;flex-direction:column;gap:0.5rem;width:max-content;padding:1.25rem;margin-bottom:1.25em;border-radius:0.375rem"
      >
      <h3 style="text-align:center">YOUR TICKET:</h3>
  <p style="display:block;text-align:center"><span style="font-weight:700">PURCHASER:</span><br
    />${ticketPurchaser}</p>
  <p style="display:block;text-align:center"><span style="font-weight:700">TOTAL:</span><br
    />$${ticketAmount}</p>
  <p style="display:block;text-align:center"><span style="font-weight:700">DATE:</span><br
    />${ticketDate}</p>
  <p style="display:block;text-align:center"><span style="font-weight:700">CODE:</span><br
    />${ticketCode}</p>
</main>
`
      );

      return res.render("purchase", {
        ticket,
        total,
        unTotal,
        boughtDetail,
        unBoughtDetail,
        ticketPurchaser,
        ticketAmount,
        ticketDate,
        ticketCode,
      });
    }

    const ticket = await TicketsRepository.createTicket({
      amount: total,
      purchaser: purchaser,
    });

    await CartsRepository.deleteCartProducts(cid);

    const ticketPurchaser = purchaser;
    const ticketAmount = total;
    const ticketDate = `${ticket.purchase_datetime.getDate()}/${
      ticket.purchase_datetime.getMonth() + 1
    }/${ticket.purchase_datetime.getFullYear()}`;
    const ticketCode = ticket.code;

    sendMail(
      ticketPurchaser,
      "PURCHASE TICKET",
      `
    <h1 style="background:#93c5fd;text-align:center">CODEDOM</h1>
      
      <h2 style="text-align:center">Thank you for your purchase!</h2> <br>
      
      <main
      style="margin-top:2rem;margin-left:auto;margin-right:auto;display:flex;flex-direction:column;gap:0.5rem;width:max-content;padding:1.25rem;margin-bottom:1.25em;border-radius:0.375rem"
      >
      <h3 style="text-align:center">YOUR TICKET:</h3>
  <p style="display:block;text-align:center"><span style="font-weight:700">PURCHASER:</span><br
    />${ticketPurchaser}</p>
  <p style="display:block;text-align:center"><span style="font-weight:700">TOTAL:</span><br
    />$${ticketAmount}</p>
  <p style="display:block;text-align:center"><span style="font-weight:700">DATE:</span><br
    />${ticketDate}</p>
  <p style="display:block;text-align:center"><span style="font-weight:700">CODE:</span><br
    />${ticketCode}</p>
</main>`
    );

    return res.render("purchase", {
      ticket,
      total,
      unTotal,
      boughtDetail,
      ticketPurchaser,
      ticketAmount,
      ticketDate,
      ticketCode,
      unBoughtDetail: false,
    });
  } catch (error) {
    res.status(500).json({ status: "error purchase", error: error.message });
  }
};
