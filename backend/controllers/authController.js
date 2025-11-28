import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/database.js";

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (existing.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)",
      [fullname, email, hashed]
    );

    res.json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [userRows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (userRows.length === 0)
      return res.status(400).json({ message: "Invalid email or password" });

    const user = userRows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, email: user.email }, "SECRET_TOKEN", {
      expiresIn: "1d",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, fullname: user.fullname, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
