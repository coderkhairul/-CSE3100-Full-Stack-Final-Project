// backend/middleware/auth.js
const auth = (req, res, next) => {
  // Temporary basic auth middleware
  // Later you can implement JWT or session based auth
  console.log("Auth middleware running");
  next();
};

export default auth;
