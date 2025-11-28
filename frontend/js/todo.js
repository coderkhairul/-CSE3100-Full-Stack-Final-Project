// script.js (server-connected)
// Replace API_BASE if your backend is on another host/port
const API_BASE = window.API_BASE || "http://localhost:3000/api";
const TODO_API = API_BASE + "/todos";

let inputBox;
let addBtn;
let todoList;

let editTodo = null; // { id, li, originalText }
let token = null;
let currentUser = null; // <-- added

// local fallback helpers
function loadLocalTodos() {
  try {
    const raw = localStorage.getItem("todos_local");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function saveLocalTodos(list) {
  try {
    localStorage.setItem("todos_local", JSON.stringify(list));
  } catch (e) {}
}
function pushOfflineQueue(item) {
  try {
    const q = JSON.parse(localStorage.getItem("todos_offline") || "[]");
    q.push(item);
    localStorage.setItem("todos_offline", JSON.stringify(q));
  } catch (e) {}
}
async function syncOfflineTodos() {
  try {
    const q = JSON.parse(localStorage.getItem("todos_offline") || "[]");
    if (!Array.isArray(q) || q.length === 0) return;
    for (const it of q.slice()) {
      try {
        const res = await fetch(TODO_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: "Bearer " + token } : {}),
          },
          body: JSON.stringify({
            text: it.text,
            username: currentUser || localStorage.getItem("username"),
          }),
        });
        if (res.ok) {
          const cur = JSON.parse(localStorage.getItem("todos_offline") || "[]");
          cur.shift();
          localStorage.setItem("todos_offline", JSON.stringify(cur));
        } else break;
      } catch (e) {
        break;
      }
    }
  } catch (e) {}
}

// try to find an id-like value inside an object (recursive, shallow)
function findIdInObject(obj, depth = 0) {
  if (!obj || depth > 4) return "";
  // common id patterns: _id, id, todoId, etc.
  if (typeof obj === "string" && /^[a-f0-9]{24}$/i.test(obj)) return obj;
  if (typeof obj === "number") return String(obj);
  if (typeof obj === "object") {
    if (obj._id && (typeof obj._id === "string" || typeof obj._id === "number"))
      return String(obj._id);
    if (obj.id && (typeof obj.id === "string" || typeof obj.id === "number"))
      return String(obj.id);
    if (
      obj.todoId &&
      (typeof obj.todoId === "string" || typeof obj.todoId === "number")
    )
      return String(obj.todoId);
    for (const k of Object.keys(obj)) {
      try {
        const v = obj[k];
        const found = findIdInObject(v, depth + 1);
        if (found) return found;
      } catch (e) {}
    }
  }
  return "";
}

// create li with edit/delete buttons
function createTodoLI(todo) {
  const li = document.createElement("li");
  // robust id extraction using helper
  let id = "";
  try {
    id = findIdInObject(todo) || "";
    if (!id && todo && (todo._id || todo.id))
      id = String(todo._id || todo.id || "");
  } catch (e) {
    id = "";
  }
  if (!id) id = "local-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  li.dataset.id = id;

  const p = document.createElement("p");
  p.textContent =
    todo && (todo.text || todo.title || todo.todo)
      ? todo.text || todo.title || todo.todo
      : "";
  li.appendChild(p);

  // show owner (if available)
  const owner =
    (todo &&
      (todo.username || (todo.user && todo.user.username) || todo.owner)) ||
    "";
  if (owner) {
    const span = document.createElement("small");
    span.style.display = "block";
    span.style.color = "#666";
    span.textContent = `by: ${owner}`;
    li.appendChild(span);
  }

  // only allow edit/delete for current user
  if (currentUser && owner && owner !== currentUser) {
    return li;
  }

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "btn editBtn";
  editBtn.textContent = "Edit";
  li.appendChild(editBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn deleteBtn";
  deleteBtn.textContent = "Remove";
  li.appendChild(deleteBtn);

  return li;
}

// robust parse helper
async function parseResponse(res) {
  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : {};
  } catch (e) {
    return text;
  }
}

// show an inline banner for errors/info
function showBanner(text, isError = true) {
  let b = document.getElementById("todo-banner");
  if (!b) {
    b = document.createElement("div");
    b.id = "todo-banner";
    b.style =
      "position:fixed;top:0;left:0;right:0;padding:8px;text-align:center;z-index:9999;font-weight:600";
    document.body.appendChild(b);
  }
  b.style.background = isError ? "#f8d7da" : "#d1ecf1";
  b.style.color = isError ? "#721c24" : "#0c5460";
  b.textContent = text;
  setTimeout(() => {
    if (b) b.remove();
  }, 6000);
}

// load todos (with fallback)
async function loadTodos() {
  if (!todoList) return;
  todoList.innerHTML = "";
  try {
    // ask server for this user's todos if username present
    const url = currentUser
      ? `${TODO_API}?username=${encodeURIComponent(currentUser)}`
      : TODO_API;
    const res = await fetch(url, {
      headers: token ? { Authorization: "Bearer " + token } : {},
    });
    const body = await parseResponse(res);
    if (!res.ok) {
      console.error("Load todos HTTP error", res.status, body);
      showBanner(
        "Server returned error while loading todos. See console.",
        true
      );
      const local = loadLocalTodos();
      local.forEach((t) => todoList.appendChild(createTodoLI(t)));
      return;
    }
    const todos = Array.isArray(body) ? body : body.todos || body.data || [];
    if (!Array.isArray(todos)) {
      showBanner(
        "Unexpected todos format from server; using local cache.",
        true
      );
      const local = loadLocalTodos();
      local.forEach((t) => todoList.appendChild(createTodoLI(t)));
      return;
    }
    // debug: log first few items so we can inspect ids
    console.log("Loaded todos from server (count):", todos.length);
    todos.slice(0, 10).forEach((t, i) => console.log("todo[" + i + "]:", t));
    // filter by username on client in case server returned all
    const filtered = currentUser
      ? todos.filter((t) => {
          const owner =
            (t && (t.username || (t.user && t.user.username) || t.owner)) || "";
          return !owner || owner === currentUser; // show items without owner or owned by currentUser
        })
      : todos;
    filtered.forEach((t) => todoList.appendChild(createTodoLI(t)));
    saveLocalTodos(todos);
    syncOfflineTodos();
  } catch (err) {
    console.error("Fetch loadTodos error:", err);
    showBanner("Server error while loading todos. Using local cache.", true);
    const local = loadLocalTodos();
    local.forEach((t) => todoList.appendChild(createTodoLI(t)));
  }
}

// add or edit
async function addTodo() {
  if (!inputBox) return;
  const inputText = inputBox.value.trim();
  if (!inputText) {
    alert("You must write something");
    return;
  }

  // edit flow
  if (addBtn.dataset.mode === "edit" && editTodo) {
    const id = editTodo.id || "";
    // if local placeholder -> create on server first (same behaviour kept)
    if (id.startsWith("local-") || !id) {
      try {
        const res = await fetch(TODO_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: "Bearer " + token } : {}),
          },
          body: JSON.stringify({
            text: inputText,
            username:
              currentUser || localStorage.getItem("username") || undefined,
          }),
        });
        const body = await parseResponse(res);
        if (!res.ok) {
          console.error("Create (from edit) failed", res.status, body);
          showBanner("Create failed; see console.", true);
          return;
        }
        const created = (body && (body.todo || body.data)) || body || {};
        const newId =
          findIdInObject(created) || created.id || created._id || "";
        if (newId) editTodo.li.dataset.id = String(newId);
        editTodo.li.querySelector("p").textContent = inputText;
        const local = loadLocalTodos();
        const idx = local.findIndex((x) => (x.id || x._id) == id);
        if (idx >= 0) {
          local[idx].text = inputText;
          local[idx].id = newId || local[idx].id;
          saveLocalTodos(local);
        }
        editTodo = null;
        addBtn.dataset.mode = "add";
        addBtn.textContent = "Add";
        inputBox.value = "";
        showBanner("Edited and synced to server", false);
        return;
      } catch (err) {
        console.error("Create-from-edit error", err);
        showBanner("Network error while creating item. Try again later.", true);
        return;
      }
    }

    // normal PUT when we have a server id
    try {
      const res = await fetch(`${TODO_API}/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify({
          text: inputText,
          username:
            currentUser || localStorage.getItem("username") || undefined,
        }),
      });
      const body = await parseResponse(res);
      if (!res.ok) {
        console.error("Update failed", res.status, body);
        showBanner("Update failed; see console.", true);
        return;
      }
      editTodo.li.querySelector("p").textContent = inputText;
      const local = loadLocalTodos();
      const idx = local.findIndex((x) => (x.id || x._id) == id);
      if (idx >= 0) {
        local[idx].text = inputText;
        saveLocalTodos(local);
      }
      editTodo = null;
      addBtn.dataset.mode = "add";
      addBtn.textContent = "Add";
      inputBox.value = "";
      showBanner("Updated on server", false);
      return;
    } catch (err) {
      console.error("Update error:", err);
      showBanner("Update network error. Try again later.", true);
      return;
    }
  }

  // CREATE: POST to server and require successful response
  try {
    const res = await fetch(TODO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      // ensure we send the logged-in username
      body: JSON.stringify({
        text: inputText,
        username: currentUser || localStorage.getItem("username") || undefined,
      }),
    });
    const body = await parseResponse(res);
    console.log("POST response", res.status, body);
    if (!res.ok) {
      console.error("Save failed", res.status, body);
      showBanner(
        (body && (body.error || body.message)) ||
          "Save failed on server. See console.",
        true
      );
      return;
    }
    // accept several shapes: { todo: {...} } or {...} or id
    const created = (body && (body.todo || body.data)) || body || {};
    const newId = findIdInObject(created) || created.id || created._id || "";
    const obj = {
      id: newId || "srv-" + Date.now(),
      text: created.text || created.todo || inputText,
      username:
        created.username ||
        currentUser ||
        localStorage.getItem("username") ||
        "",
      ...created,
    };
    // insert into UI and update local cache
    todoList.insertBefore(createTodoLI(obj), todoList.firstChild);
    const local = loadLocalTodos();
    local.unshift(obj);
    saveLocalTodos(local);
    inputBox.value = "";
    showBanner("Saved on server", false);
  } catch (err) {
    console.error("Save error (network):", err);
    showBanner(
      "Network error while saving. Ensure server is running and CORS allows requests from this origin.",
      true
    );
  }
}

// delegated handler
async function updateTodo(e) {
  const btn = e.target.closest("button");
  if (!btn) return;
  console.log("clicked button:", btn.className, "text:", btn.textContent);

  if (btn.matches(".deleteBtn")) {
    const li = btn.closest("li");
    const id = li?.dataset.id;
    if (!id) {
      li.remove();
      return;
    }
    if (!confirm("Are you sure to delete this task?")) return;
    try {
      const res = await fetch(`${TODO_API}/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify({
          username:
            currentUser || localStorage.getItem("username") || undefined,
        }),
      });
      const body = await parseResponse(res);
      if (!res.ok) {
        console.error("Delete failed", res.status, body);
        showBanner("Delete failed on server; see console.", true);
        return;
      }
      li.remove();
      const local = loadLocalTodos();
      const idx = local.findIndex((x) => (x.id || x._id) == id);
      if (idx >= 0) {
        local.splice(idx, 1);
        saveLocalTodos(local);
      }
    } catch (err) {
      console.error("Delete error:", err);
      showBanner("Network error while deleting. Try again later.", true);
    }
    return;
  }

  if (btn.matches(".editBtn")) {
    const li = btn.closest("li");
    const id = li?.dataset.id || "";
    console.log("enter edit for id=", id);
    if (!id) {
      showBanner(
        "Cannot edit: missing id for this item (check server response).",
        true
      );
      console.error(
        "Edit canceled: missing dataset.id on LI",
        li,
        "todo element:",
        li?.innerHTML
      );
      return;
    }
    const p = li.querySelector("p");
    inputBox.value = p ? p.textContent : "";
    inputBox.focus();
    editTodo = { id: id, li, originalText: inputBox.value };
    addBtn.dataset.mode = "edit";
    addBtn.textContent = "Edit";
    return;
  }
}

// bind after DOM ready
document.addEventListener("DOMContentLoaded", () => {
  inputBox = document.getElementById("inputBox");
  addBtn = document.getElementById("addBtn");
  todoList = document.getElementById("todoList");

  // read saved auth info so we can send username with requests
  token = localStorage.getItem("token");

  // try multiple common keys and a DOM fallback for username
  currentUser =
    localStorage.getItem("username") ||
    localStorage.getItem("email") ||
    (() => {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "null");
        return u && (u.username || u.email);
      } catch (e) {
        return null;
      }
    })() ||
    (() => {
      const el =
        document.getElementById("currentUsername") ||
        document.querySelector("[data-username]");
      return el ? el.textContent || el.value || el.dataset.username : null;
    })();

  console.log("script: token=", !!token, "currentUser=", currentUser);

  if (!inputBox || !addBtn || !todoList) {
    console.error("Missing DOM elements");
    return;
  }
  addBtn.dataset.mode = "add";
  addBtn.textContent = addBtn.textContent || "Add";
  addBtn.addEventListener("click", addTodo);
  todoList.addEventListener("click", updateTodo);
  loadTodos();
});
