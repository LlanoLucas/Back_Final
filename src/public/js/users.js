const deleteUser = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    console.log("User deleted successfully");
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

const deleteButtons = document.querySelectorAll(".delete-button");
deleteButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const userId = button.dataset.userId;
    await deleteUser(userId);
  });
});
