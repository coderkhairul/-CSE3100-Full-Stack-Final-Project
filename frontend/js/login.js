const loginForm = document.getElementById("loginForm");
const loginButton = loginForm.querySelector('button[type="submit"]');
const msg = document.getElementById("message");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // loading state
  loginButton.disabled = true;
  loginButton.textContent = "Logging in...";

  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      window.__API.showMessage(
        msg,
        data.message || data.error || "Login failed"
      );
      return;
    }

    window.__API.saveAuth(data.token, data.user);
    window.location.href = "dashboard.html";
  } catch (err) {
    console.error("Login error:", err);
    window.__API.showMessage(
      msg,
      "An unexpected error occurred. Please try again later."
    );
  } finally {
    // restore button state
    loginButton.disabled = false;
    loginButton.textContent = "Login";
  }
});
