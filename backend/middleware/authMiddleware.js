import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const header = req.headers["authorization"];

  if (!header)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  const token = header.split(" ")[1];

  jwt.verify(token, "SECRET_TOKEN", (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = user;
    next();
  });
};
