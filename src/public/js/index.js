import { logger } from "../../utils/logger.js";

const socket = io();
const form = document.getElementById("form");
const productsTable = document.querySelector("#productsTable");
const tbody = document.getElementById("tbody");

const getFormInputValues = () => {
  return {
    title: document.querySelector("#title").value,
    description: document.querySelector("#description").value,
    price: document.querySelector("#price").value,
    code: document.querySelector("#code").value,
    category: document.querySelector("#category").value,
    stock: document.querySelector("#stock").value,
  };
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const product = getFormInputValues();

  try {
    const res = await fetch("/api/products", {
      method: "POST",
      body: JSON.stringify(product),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (result.status === "error") {
      throw new Error(result.error);
    }

    await fetch("/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((jsonResponse) => {
        const productsEmit = jsonResponse.payload;
        socket.emit("productList", productsEmit);
      })
      .catch((error) => {
        logger.error("Fetch error:", error);
      });

    document.querySelector("#title").value = "";
    document.querySelector("#description").value = "";
    document.querySelector("#price").value = "";
    document.querySelector("#code").value = "";
    document.querySelector("#category").value = "";
    document.querySelector("#stock").value = "";
  } catch (error) {
    logger.error(error);
  }
});

const createDeleteButton = (productId) => {
  const button = document.createElement("button");
  button.textContent = "Delete";
  button.className = "text-red-500 font-semibold active:text-red-700";
  button.addEventListener("click", () => deleteProduct(productId));
  return button;
};

socket.on("updatedProducts", (products) => {
  tbody.innerHTML = "";
  products.docs.forEach((item) => {
    const tr = document.createElement("tr");
    tr.className = "text-center border-2 border-black";
    tr.innerHTML = `
      <td class="border-2 border-black px-2">${item.code}</td>
      <td class="border-2 border-black px-2">${item.title}</td>
      <td class="border-2 border-black px-2">${item.category}</td>
      <td class="border-2 border-black text-start px-2">${item.description}</td>
      <td class="border-2 border-black px-2">${item.stock}</td>
      <td class="border-2 border-black">$${item.price}</td>
      <td><span class="delete-button-container"></span></td>
    `;
    tr.querySelector(".delete-button-container").appendChild(
      createDeleteButton(item._id)
    );
    tbody.appendChild(tr);
  });
});

const deleteProduct = async (_id) => {
  try {
    const id = _id.toString();
    const deleteResponse = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (!deleteResponse.ok) {
      throw new Error(
        `Delete request failed. Status: ${deleteResponse.status}`
      );
    }

    const deleteResult = await deleteResponse.json();

    if (deleteResult.status === "error") {
      throw new Error(deleteResult.error);
    }

    const fetchResponse = await fetch("/api/products");

    if (!fetchResponse.ok) {
      throw new Error(`Fetch error! Status: ${fetchResponse.status}`);
    }

    const jsonResponse = await fetchResponse.json();
    const productsEmit = jsonResponse.payload;

    socket.emit("productList", productsEmit);
  } catch (error) {
    logger.error("Error in deleteProduct:", error);
  }
};
