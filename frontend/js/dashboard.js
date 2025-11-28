function getAuth(){ return { token: localStorage.getItem("token"), user: JSON.parse(localStorage.getItem("user") || "null") }; }
function clearAuth(){ localStorage.removeItem("token"); localStorage.removeItem("user"); }

const { token, user } = getAuth();
if (!token) {
  window.location.href = "login.html";
} else {
  document.getElementById("welcome").textContent = `Welcome, ${user?.fullname || user?.email || "User"}`;
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearAuth();
  window.location.href = "login.html";
});

async function loadUsers(){
  try{
    const res = await fetch("http://localhost:3000/api/users", {
      headers: { Authorization: "Bearer " + token }
    });
    if (!res.ok) throw new Error("Unauthorized");
    const rows = await res.json();
    const ul = document.getElementById("usersList");
    ul.innerHTML = "";
    rows.forEach(r => {
      const li = document.createElement("li");
      li.textContent = `${r.fullname} — ${r.email}`;
      ul.appendChild(li);
    });
  }catch(err){
    // token invalid -> redirect to login
    clearAuth();
    window.location.href = "login.html";
  }
}

loadUsers();
