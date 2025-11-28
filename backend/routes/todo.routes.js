import express from "express";
import mysql from "mysql2/promise";

const router = express.Router();

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "cse3100_project",
  waitForConnections: true,
  connectionLimit: 10,
});

async function getUserByUsername(identifier) {
  if (!identifier) return null;
  try {
    const [cols] = await pool.query(
      "SHOW COLUMNS FROM `users` LIKE 'username'"
    );
    if (Array.isArray(cols) && cols.length > 0) {
      const [rows] = await pool.query(
        "SELECT id, username, email FROM users WHERE username = ? OR email = ? LIMIT 1",
        [identifier, identifier]
      );
      return rows && rows[0] ? rows[0] : null;
    } else {
      const [rows] = await pool.query(
        "SELECT id, email FROM users WHERE email = ? LIMIT 1",
        [identifier]
      );
      if (rows && rows[0]) {
        rows[0].username = rows[0].email;
        return rows[0];
      }
      return null;
    }
  } catch (err) {
    console.error("getUserByUsername error:", err);
    return null;
  }
}

// GET /api/todos?username=...
router.get("/", async (req, res) => {
  try {
    const username = req.query.username;
    if (!username) return res.json({ todos: [] });
    const user = await getUserByUsername(username);
    if (!user) return res.json({ todos: [] });
    const [todos] = await pool.query(
      "SELECT id, user_id, text, created_at, updated_at FROM todos WHERE user_id = ? ORDER BY created_at DESC",
      [user.id]
    );
    const out = (todos || []).map((t) => ({
      ...t,
      username: user.username || user.email,
    }));
    return res.json({ todos: out });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/todos  body: { text, username }
router.post("/", async (req, res) => {
  try {
    const { text, username } = req.body;
    if (!text || !username)
      return res.status(400).json({ error: "text and username required" });
    const user = await getUserByUsername(username);
    if (!user) return res.status(400).json({ error: "user not found" });
    const [result] = await pool.query(
      "INSERT INTO todos (user_id, text) VALUES (?, ?)",
      [user.id, text]
    );
    const insertId = result.insertId;
    const [rows] = await pool.query(
      "SELECT id, user_id, text, created_at, updated_at FROM todos WHERE id = ?",
      [insertId]
    );
    const todo = rows[0];
    if (todo) todo.username = user.username || user.email;
    return res.status(201).json({ todo });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/todos/:id  body: { text, username }
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { text, username } = req.body;
    if (!text || !username)
      return res.status(400).json({ error: "text and username required" });
    const user = await getUserByUsername(username);
    if (!user) return res.status(400).json({ error: "user not found" });
    const [result] = await pool.query(
      "UPDATE todos SET text = ?, updated_at = NOW() WHERE id = ? AND user_id = ?",
      [text, id, user.id]
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ error: "Todo not found or not owned by user" });
    const [rows] = await pool.query(
      "SELECT id, user_id, text, created_at, updated_at FROM todos WHERE id = ?",
      [id]
    );
    const todo = rows[0];
    if (todo) todo.username = user.username || user.email;
    return res.json({ todo });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/todos/:id  body: { username }
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "username required" });
    const user = await getUserByUsername(username);
    if (!user) return res.status(400).json({ error: "user not found" });
    const [result] = await pool.query(
      "DELETE FROM todos WHERE id = ? AND user_id = ?",
      [id, user.id]
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ error: "Todo not found or not owned by user" });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
