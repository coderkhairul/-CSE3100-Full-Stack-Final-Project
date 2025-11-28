import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const db = await mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "cse3100_project",
  connectionLimit: 10,
});
