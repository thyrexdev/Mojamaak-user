export async function logout() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

  try {
    // Call backend logout API
    await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
  } catch (error) {
    console.error("Logout API error (ignored):", error)
    // We’ll still clear localStorage either way
  }

  // Clear local session
  localStorage.removeItem("token")
  localStorage.removeItem("admin")

  // Full redirect
  window.location.href = "/login"
}
