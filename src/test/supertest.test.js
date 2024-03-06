import { expect } from "chai";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { MONGODB_URL, MONGODB_NAME } from "../config/config.js";

mongoose.connect(MONGODB_URL, { dbName: `${MONGODB_NAME}` });

const requester = supertest("http://127.0.0.1:8080");

describe("Testing session routes", async function () {
  this.timeout(10000);

  describe("Testing register, login and current", () => {
    let cookie;
    let mockUser = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      password: "password",
      confirmPassword: "password",
    };

    it("Should create a user", async () => {
      const result = await requester
        .post("/api/sessions/register")
        .send(mockUser);

      expect(result.body).to.be.ok;
    });

    it("Should login and return a cookie", async () => {
      const result = await requester.post("/api/sessions/login").send(mockUser);

      expect(result.body).to.be.ok;

      const cookieResult = result.headers["set-cookie"][0];
      cookie = {
        name: cookieResult.split("=")[0],
        value: cookieResult.split("=")[1].split(";")[0],
      };

      expect(cookie.name).to.be.ok.and.eql("jwt");
      expect(cookie.value).to.be.ok;
    });

    it("Should retrieve user data", async () => {});
  });
});
