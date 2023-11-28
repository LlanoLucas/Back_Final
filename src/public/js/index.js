const socket = io();

const form = document.getElementById("form");
const productsTable = document.querySelector("#productsTable");
const tbody = document.getElementById("tbody");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let product = {
    title: document.querySelector("#title").value,
    description: document.querySelector("#description").value,
    price: document.querySelector("#price").value,
    code: document.querySelector("#code").value,
    category: document.querySelector("#category").value,
    stock: document.querySelector("#stock").value,
  };

  try {
    const res = await fetch("/dao/products", {
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

    await fetch("/dao/products")
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
        console.error("Fetch error:", error);
      });

    document.querySelector("#title").value = "";
    document.querySelector("#description").value = "";
    document.querySelector("#price").value = "";
    document.querySelector("#code").value = "";
    document.querySelector("#category").value = "";
    document.querySelector("#stock").value = "";
  } catch (error) {
    console.log(error);
  }
});

const deleteProduct = async (_id) => {
  try {
    const id = _id.toString();
    // Send DELETE request to delete the product
    const deleteResponse = await fetch(`/dao/products/${id}`, {
      method: "DELETE",
    });

    // Check if the delete request was successful
    if (!deleteResponse.ok) {
      throw new Error(
        `Delete request failed. Status: ${deleteResponse.status}`
      );
    }

    const deleteResult = await deleteResponse.json();

    // Check if the delete operation on the server was successful
    if (deleteResult.status === "error") {
      throw new Error(deleteResult.error);
    }

    // Fetch the updated product list
    const fetchResponse = await fetch("/dao/products");

    // Check if the fetch request was successful
    if (!fetchResponse.ok) {
      throw new Error(`Fetch error! Status: ${fetchResponse.status}`);
    }

    const jsonResponse = await fetchResponse.json();
    const productsEmit = jsonResponse.payload;

    // Emit the updated product list to the socket
    socket.emit("productList", productsEmit);
  } catch (error) {
    console.error("Error in deleteProduct:", error);
  }
};

socket.on("updatedProducts", (products) => {
  console.log(products);
  tbody.innerHTML = "";

  products.forEach((item) => {
    const tr = document.createElement("tr");
    tr.className = "text-center border-2 border-black";
    tr.innerHTML = `
    <td class="border-2 border-black px-2">${item.code}</td>
    <td class="border-2 border-black px-2">${item.title}</td>
    <td class="border-2 border-black px-2">${item.category}</td>
    <td
      class="border-2 border-black text-start px-2"
    >${item.description}</td>
    <td class="border-2 border-black px-2">${item.stock}</td>
    <td class="border-2 border-black">$${item.price}</td>
    <td><button
        onclick="deleteProduct('${item._id}')"
        class="text-red-500 font-semibold active:text-red-700"
      >Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
});
