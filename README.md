
# 🟦 CSE3100 Full-Stack Final Project
A full-stack web application built for the **CSE 3100 Web Programming Sessional**, featuring user authentication, CRUD operations, Node.js (Express) backend, and MySQL database integration.

---

## 🚀 Project Overview
This project demonstrates full-stack development skills including:

- Frontend design & UI implementation  
- Backend REST API development  
- Database schema design (ER Diagram + SQL)  
- CRUD operations (Create, Read, Update, Delete)  
- User Authentication & Route Protection  
- GitHub Version Control & Collaboration  

---

## 🧑‍💻 Features

### 🔷 Frontend
- User Registration system  
- User Login system  
- Protected Dashboard (login required)  
- Logout functionality  
- Clean UI/UX with validation and error handling  
- Implemented using:
  - JavaScript
  - Modular functions
  - LocalStorage persistence
  - Try/Catch error handling
  - Separate JS files for cleaner code  

---

### 🔷 Backend
- Express.js server with modular routing  
- MySQL database connectivity  
- Secure SQL queries (SQL injection safe)  
- CRUD operations included:
  - Create  
  - Read  
  - Update  
  - Delete  
- Proper error handling (try/catch)  
- Clean project folder organisation  

---

### 🗄 Database (MySQL)
Includes ER diagram and SQL scripts:

- Entities & attributes defined  
- Primary / Foreign key relations marked  
- Normalized structure  
- SQL scripts:  
  ```
  queries.sql  
  queries_todo.sql  
  ```

---

## 🔧 Tech Stack

| Layer       | Tools |
|-------------|---------------------------|
| Frontend    | HTML, CSS, JavaScript     |
| Backend     | Node.js, Express.js       |
| Database    | MySQL                     |
| Tools       | Git, GitHub, VS Code      |
| Security    | JWT & SQL Injection Prevention |

---

## 📁 Project Folder Structure

```
project-root/
│
├── frontend/
│   ├── assets/
│   │   └── logo.png
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── todo.html
│   ├── js/
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── dashboard.js
│   │   ├── todo.js
│   │   └── utils.js
│   └── css/
│       ├── style.css
│       ├── login.css
│       ├── register.css
│       ├── dashboard.css
│       └── todo.css
│
├── backend/
│   ├── config/database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── todo.controller.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── authMiddleware.js
│   ├── models/
│   │   └── todo.model.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── todo.routes.js
│   ├── server.js
│   └── package.json
│
├── database/
│   ├── CSE 236_ CSE 3100 Final Project Requirements.pdf
│   ├── queries.sql
│   └── queries_todo.sql
│
└── README.md
```

---

## 🛠 How to Run the Project

### 1️⃣ Install dependencies
```bash
npm install
```

### 2️⃣ Import SQL files
- Open MySQL / phpMyAdmin
- Import `database/queries.sql` (+ queries_todo.sql if needed)

### 3️⃣ Start backend server
```bash
node backend/server.js
```

### 4️⃣ Open frontend
Open any of the following in your browser:

```
frontend/index.html
frontend/login.html
frontend/register.html
```

> Dashboard is protected — Login required.

---

## 🧑‍🤝‍🧑 Git Collaboration Rules

- Minimum **20 Git commits from frontend team**
- Minimum **10 commits from backend team**
- All commits pushed to **ONE shared GitHub repo**
- Balanced and fair contribution required  

---

## 🧑‍🏫 Presentation Requirements

- Show CRUD features live  
- Do NOT show code  
- Explain challenges + solutions  
- Max duration: **5–10 minutes**  

---

## 👨‍💻 Team Members

| Name | Role |
|------|------|
| Member 1 | Frontend + UI |
| Member 2 | Backend + API |
| Member 3 | Database + ER Diagram |
| Member 4 | Dashboard + CRUD |

(Add actual names here)

---

## 📜 License
This project is created for academic submission under  
**CSE 3100 - Web Programming Sessional**
