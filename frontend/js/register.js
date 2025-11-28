function showMessage(el, text, timeout = 4000) {
  el.textContent = text;
  setTimeout(() => (el.textContent = ""), timeout);
}

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("message");

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        showMessage(msg, data.message || data.error || "Registration failed");
        return;
      }

      showMessage(msg, "Registration successful. Redirecting to login...");
      setTimeout(() => (window.location.href = "login.html"), 1400);
    } catch (err) {
      showMessage(msg, "Server error, try again");
    }
  });
