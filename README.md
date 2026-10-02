

````markdown
# Smart Queue Management System

A web-based Smart Queue Management System that allows users to generate queue tokens and administrators to manage queues and serve customers efficiently.

## 🚀 Features

### User
- User registration and login
- View active queues
- Generate queue tokens
- View token status
- Track people before their token
- Cancel waiting tokens
- Live queue status updates

### Admin
- Admin login
- Create and manage queues
- Activate / deactivate queues
- Call the next token
- Complete served tokens
- View current and next tokens
- Delete queues

## 🛠️ Technologies Used

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- MongoDB Atlas
- JWT Authentication
- bcrypt.js
- REST API

## 📁 Project Structure

```text
Smart-Queue-Backend/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── createAdmin.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── user-dashboard.html
│   ├── admin-dashboard.html
│   └── style.css
│
└── .gitignore
````

## ▶️ Run the Project

### Backend

```bash
cd backend
npm install
npm start
```

Backend runs on:

```text
http://localhost:5000
```

### Frontend

Open the `frontend` folder using **VS Code Live Server**.

## 🔐 Environment Variables

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Do not upload `.env` to GitHub.

## 🎯 Project Purpose

The system is designed to reduce waiting time and provide a simple digital queue management experience for users and administrators.

live Demo: http://10.125.29.75:5500/
## 👩‍💻 Author

**Mahalakshmi S**

B.E. Computer Science and Engineering
Prathyusha Engineering College


