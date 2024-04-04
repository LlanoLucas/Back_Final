const mp = new MercadoPago("TEST-7cf89420-e96e-401f-a760-38bb91d4c307", {
  locale: "es-AR",
});

const checkoutBtn = document.getElementById("checkoutBtn");
const cartId = document.getElementById("cartId").innerHTML;

checkoutBtn.addEventListener("click", async () => {
  try {
    const orderData = {
      title: "CODEDOM COURSE(S)",
      quantity: 1,
      price: document.getElementById("grandTotal").innerHTML,
      link: `https://backfinal-production-4974.up.railway.app/${cartId}/purchase`,
    };

    const response = await fetch("/create_preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const preference = await response.json();
    createCheckoutButton(preference.id);
  } catch (error) {
    alert("Error: " + error);
  }
});

const createCheckoutButton = (preferenceId) => {
  const bricksBuilder = mp.bricks();

  const renderComponent = async () => {
    if (document.getElementById("wallet_container").innerHTML.length > 0)
      window.CheckoutButton.unmount();

    await bricksBuilder.create("wallet", "wallet_container", {
      initialization: {
        preferenceId: preferenceId,
      },
      customization: {
        texts: {
          valueProp: "smart_option",
        },
      },
    });
  };

  renderComponent();
};
