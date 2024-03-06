import mongoose from "mongoose";
import { expect } from "chai";
import { MONGODB_URL, MONGODB_NAME } from "../config/config.js";
import { ProductsDao } from "../dao/index.js";
import { CartsDao } from "../dao/index.js";
import { UsersDao } from "../dao/index.js";

mongoose.connect(MONGODB_URL, { dbName: `${MONGODB_NAME}_test` });

describe("Testing products DAO", () => {
  after(function (done) {
    mongoose.connection.collections.products.drop();
    console.log("\n----- Done!! -----");
    done();
  });

  describe("Products", function () {
    this.timeout(10000);

    it("Dao should create products", async () => {
      let product = {
        title: "Dao Test Product",
        description: "Product created in the Dao Test",
        price: 1,
        category: "Test",
        stock: 3,
        code: "test01",
      };

      const createdProduct = await ProductsDao.addProduct(product);
      const result = await ProductsDao.getProducts();
      expect(result).to.be.an("array");
    });

    it("Dao should get the products", async () => {
      const result = await ProductsDao.getProducts();
      expect(result).to.be.an("array");
    });

    it("Dao should get product by ID", async () => {
      let product = {
        title: "Dao Test Product 2",
        description: "Product created in the Dao Test 2",
        price: 1,
        category: "Test",
        stock: 3,
        code: "test02",
      };

      const createdProduct = await ProductsDao.addProduct(product);
      const productId = createdProduct._id;
      const result = await ProductsDao.getProduct(productId);
      expect(result).to.be.an("object");
    });

    it("Dao should update a product", async () => {
      let product = {
        title: "Dao Test Product 3",
        description: "Product created in the Dao Test 3",
        price: 1,
        category: "Test",
        stock: 3,
        code: "test03",
      };

      const updatedProduct = {
        title: "Dao Test Product updated",
        description: "Product created in the Dao Test updated",
        price: 2,
        category: "Test",
        stock: 2,
        code: "test03",
      };

      const createdProduct = await ProductsDao.addProduct(product);
      const productId = createdProduct._id;
      const result = await ProductsDao.updateProduct(productId, updatedProduct);
      expect(result).to.be.an("object");
    });

    it("Dao should delete a product", async () => {
      let product = {
        title: "Dao Test Product 4",
        description: "Product created in the Dao Test 4",
        price: 1,
        category: "Test",
        stock: 3,
        code: "test04",
      };

      const createdProduct = await ProductsDao.addProduct(product);
      const productId = createdProduct._id;
      const result = await ProductsDao.deleteProduct(productId);
      expect(result).to.be.an("object");
    });
  });
});

describe("Testing carts DAO", () => {
  after(function (done) {
    mongoose.connection.collections.carts.drop();
    mongoose.connection.collections.products.drop();
    console.log("\n----- Done!! -----");
    done();
  });

  describe("Carts", function () {
    this.timeout(10000);

    it("Dao should create a cart", async () => {
      const cart = await CartsDao.createCart();
      const result = await CartsDao.getCarts();
      expect(result).to.be.an("array");
    });

    it("Dao should get carts", async () => {
      const result = await CartsDao.getCarts();
      expect(result).to.be.an("array");
    });

    it("Dao should get a cart by ID", async () => {
      const cart = await CartsDao.createCart();
      const cartId = cart.id;
      const result = await CartsDao.getCart(cartId);
      expect(result).to.be.an("object");
    });

    it("Dao should add a product to cart", async () => {
      const cart = await CartsDao.createCart();
      const cartId = cart.id;
      let product = {
        title: "Dao Test Product",
        description: "Product created in the Dao Test",
        price: 1,
        category: "Test",
        stock: 3,
        code: "test01",
      };

      const createdProduct = await ProductsDao.addProduct(product);
      const productId = createdProduct._id;
      const result = await CartsDao.addProduct(cartId, productId);
      expect(result).to.be.an("object");
    });

    it("Dao should update a product quantity in cart", async () => {
      const cart = await CartsDao.createCart();
      const cartId = cart.id;

      let product = {
        title: "Dao Test Product",
        description: "Product created in the Dao Test",
        price: 1,
        category: "Test",
        stock: 3,
        code: "test01",
      };

      const createdProduct = await ProductsDao.addProduct(product);
      const productId = createdProduct._id.toString();
      const productAdded = await CartsDao.addProduct(cartId, productId);
      const result = await CartsDao.putProductQuantity(cartId, productId, 2);
      expect(result).to.be.an("object");
    });

    it("Dao should delete cart products", async () => {
      const cart = await CartsDao.createCart();
      const cartId = cart.id;

      let product = {
        title: "Dao Test Product",
        description: "Product created in the Dao Test",
        price: 1,
        category: "Test",
        stock: 3,
        code: "test01",
      };

      const createdProduct = await ProductsDao.addProduct(product);
      const result = await CartsDao.deleteCartProducts(cartId);
      expect(result).to.be.an("object");
    });

    it("Dao should delete cart", async () => {
      const cart = await CartsDao.createCart();
      const cartId = cart.id;
      const result = await CartsDao.deleteCart(cartId);
      expect(result).to.be.an("object");
    });
  });
});

describe("Testing sessions DAO", () => {
  after(function (done) {
    mongoose.connection.collections.users.drop();
    console.log("\n----- Done!! -----");
    done();
  });

  describe("Sessions", function () {
    this.timeout(10000);

    it("Dao should register user", async () => {
      const user = {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: 12345,
      };

      const result = await UsersDao.registerUser(user);
      expect(result).to.be.an("object");
    });

    it("Dao should get user by ID", async () => {
      const user = {
        first_name: "Johnny",
        last_name: "Does",
        email: "johnny@example.com",
        password: 12345,
      };

      const createdUser = await UsersDao.registerUser(user);
      const userId = createdUser._id;
      const result = await UsersDao.getUserById(userId);
      expect(result).to.be.an("object");
    });

    it("Dao should get user by ID", async () => {
      const user = {
        first_name: "Jo",
        last_name: "Do",
        email: "jo@example.com",
        password: 12345,
      };

      const createdUser = await UsersDao.registerUser(user);
      const userEmail = createdUser.email;
      const result = await UsersDao.getUserByEmail(userEmail);
      expect(result).to.be.an("object");
    });
  });
});
