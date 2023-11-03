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

    const productsEmit = await fetch("/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });

    socket.emit("productList", productsEmit);

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

const deleteProduct = async (id) => {
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();

    if (result.status === "error") throw new Error(result.error);
    const productsEmit = await fetch("/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });

    socket.emit("productList", productsEmit);
  } catch (error) {
    console.log(error);
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
    <td class="border-2 border-black">${item.price}</td>
    <td><button
        onclick="deleteProduct(${item.id})"
        class="text-red-500 font-semibold active:text-red-700"
      >Delete</button></td>
    `;

    tbody.appendChild(tr);
  });
});
