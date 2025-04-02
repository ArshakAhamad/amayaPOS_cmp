import pool from "../config/db.js";
import bcrypt from "bcryptjs";

class User {
  // Find a user by username
  static async findByUsername(username) {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username],
    );
    return rows[0];
  }

  // Create a new user
  static async create({ username, password, role, fullName, email }) {
    const [result] = await pool.execute(
      "INSERT INTO users (username, password, role, fullName, email) VALUES (?, ?, ?, ?, ?)",
      [username, password, role, fullName, email],
    );
    return result.insertId;
  }
}

export default User;
