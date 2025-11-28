import { db } from "../config/database.js";

export const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, fullname, email FROM users");

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
