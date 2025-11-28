import express from "express";
import mysql from "mysql";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import todoRoutes from "./routes/todo.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("API Server is running! 🚀");
});

// Routes (only use the ESM-imported routes — remove any require(...) here)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/todos", todoRoutes);

// MySQL Connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cse3100_project",
});

connection.connect((err) => {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
});

// Start Server
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
