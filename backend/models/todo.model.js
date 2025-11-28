const db = require("../config/db");

module.exports = {
  getTodosByUser: (userId) =>
    db.query("SELECT * FROM todos WHERE user_id = ? ORDER BY id DESC", [
      userId,
    ]),

  createTodo: (userId, text) =>
    db.query("INSERT INTO todos (user_id, text) VALUES (?, ?)", [userId, text]),

  updateTodo: (id, userId, text) =>
    db.query("UPDATE todos SET text = ? WHERE id = ? AND user_id = ?", [
      text,
      id,
      userId,
    ]),

  deleteTodo: (id, userId) =>
    db.query("DELETE FROM todos WHERE id = ? AND user_id = ?", [id, userId]),
};
