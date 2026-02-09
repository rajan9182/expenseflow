# 🚀 Quick Start Guide

## External Drive Issue Workaround

Since the project is on an external drive, npm has issues with symlinks. Here's how to proceed:

### Option 1: Run from External Drive (Recommended for Testing)

1. **Install Backend Dependencies:**
```bash
cd /media/rajangoswami/0E99-EFD2/ExpenseManagement/backend
npm install --no-bin-links
```

2. **Install Frontend Dependencies:**
```bash
cd /media/rajangoswami/0E99-EFD2/ExpenseManagement/frontend-web
npm install --no-bin-links @vitejs/plugin-react vite
npm install --no-bin-links react react-dom react-router-dom axios
```

3. **Start MongoDB:**
```bash
sudo systemctl start mongod
# Verify it's running
sudo systemctl status mongod
```

4. **Seed Database (First Time Only):**
```bash
cd /media/rajangoswami/0E99-EFD2/ExpenseManagement/backend
node server.js &
# Wait 5 seconds, then:
curl -X POST http://localhost:5000/api/seed
```

5. **Start Backend:**
```bash
cd /media/rajangoswami/0E99-EFD2/ExpenseManagement/backend
./start.sh
# Or manually: node server.js
```

6. **Start Frontend (New Terminal):**
```bash
cd /media/rajangoswami/0E99-EFD2/ExpenseManagement/frontend-web
./start.sh
# Or manually: npx vite --host
```

7. **Access the App:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Option 2: Copy to Home Directory (Recommended for Development)

```bash
# Copy project to home directory
cp -r /media/rajangoswami/0E99-EFD2/ExpenseManagement ~/ExpenseManagement
cd ~/ExpenseManagement

# Install dependencies normally
cd backend && npm install
cd ../frontend-web && npm install

# Follow steps 3-7 from Option 1
```

## 📋 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@family.com | admin123 |
| **Papa** | papa@family.com | papa123 |
| **Mummy** | mummy@family.com | mummy123 |
| **Sister** | sister@family.com | sister123 |

## 🎯 What to Test

1. **Login Page:**
   - Try demo account buttons
   - Login with different roles
   - Beautiful glassmorphism UI

2. **Dashboard:**
   - View financial overview
   - Check category breakdown
   - See recent expenses

3. **Add Expense:**
   - Create new expense
   - Try different categories
   - Test form validation

4. **Expense List:**
   - View all expenses
   - Delete expenses
   - Filter by date/category

5. **Admin Features:**
   - Login as admin
   - View all family members' expenses
   - Access family analytics

## 🐛 Common Issues

**MongoDB not running:**
```bash
sudo systemctl start mongod
```

**Port already in use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Dependencies not installing:**
```bash
# Always use --no-bin-links on external drives
npm install --no-bin-links
```

## ✨ Features to Explore

- 🎨 Premium dark theme with glassmorphism
- 📊 Real-time analytics dashboard
- 💰 Category-wise expense tracking
- 👥 Multi-user family management
- 🔐 Secure JWT authentication
- 📱 Responsive design
- ⚡ Fast and smooth animations

Enjoy tracking your family expenses! 💸
