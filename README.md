# ExpenseFlow - Complete Expense Management System

A full-stack expense management application with MongoDB, Express, React, and Node.js.

## 🚀 Live Demo

- **Backend API:** https://expenseflow-fvo0.onrender.com
- **Frontend:** (Coming soon on Vercel/Netlify)

## 📁 Project Structure

```
expenseflow/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   ├── server.js
│   └── package.json
│
└── frontend-web/     # React Web Application
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── services/
    ├── public/
    └── package.json
```

## ✨ Features

- 💰 **Expense & Income Tracking** - Categorize all transactions
- 📊 **Analytics Dashboard** - Visual insights with charts
- 💳 **Budget Management** - Set and track budgets
- 🤝 **Debt & Loan Tracking** - Manage money lent/borrowed
- 👥 **Multi-user Support** - Family/team expense management
- 🔐 **JWT Authentication** - Secure user sessions
- 📱 **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- Axios for API calls
- React Router for navigation
- CSS3 with premium design

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

Start backend:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend-web
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## 🌐 Deployment

**Backend:** Deployed on Render
- Auto-deploys from `main` branch
- Environment variables configured in Render dashboard

**Frontend:** Can be deployed on:
- Vercel (recommended)
- Netlify
- GitHub Pages

## 📝 API Documentation

Base URL: `https://expenseflow-fvo0.onrender.com/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Expenses
- `GET /expenses` - Get all expenses
- `POST /expenses` - Create expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

### Analytics
- `GET /analytics/dashboard` - Dashboard data
- `GET /analytics/trends` - Spending trends

### Debts
- `GET /debts` - Get all debts
- `POST /debts` - Create debt
- `POST /debts/:id/payment` - Add payment

### Budgets
- `GET /budgets` - Get all budgets
- `POST /budgets` - Create budget
- `PUT /budgets/:id` - Update budget

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Rajan Goswami
- GitHub: [@rajan9182](https://github.com/rajan9182)

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Render for backend deployment
- Font Awesome for icons
