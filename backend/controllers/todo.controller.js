// backend/controllers/todo.controller.js
const todoController = {
  getTodos: (req, res) => {
    res.json({ message: "Get todos - working!" });
  },

  createTodo: (req, res) => {
    res.json({ message: "Create todo - working!" });
  },

  updateTodo: (req, res) => {
    res.json({ message: "Update todo - working!" });
  },

  deleteTodo: (req, res) => {
    res.json({ message: "Delete todo - working!" });
  },
};

export default todoController;
