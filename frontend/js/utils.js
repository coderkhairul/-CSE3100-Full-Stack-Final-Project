// base API URL (change if your backend runs elsewhere)
const API_BASE = "http://localhost:3000/api";

function showMessage(el, text, timeout=4000){
  el.textContent = text;
  setTimeout(()=> el.textContent = "", timeout);
}

function saveAuth(token, user){
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

function clearAuth(){
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function getAuth(){
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return { token, user: user ? JSON.parse(user) : null };
}

// expose in browser global for non-module usage
window.__API = { API_BASE, showMessage, saveAuth, clearAuth, getAuth };
