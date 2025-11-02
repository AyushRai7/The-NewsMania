# 📰 NewsMania – AI-Powered News Aggregation Platform

**NewsMania** is a full-stack web application that brings global news closer to you — faster and smarter.  
It fetches real-time headlines, **summarizes** each article using AI, and lets users **translate** into multiple languages — all in one clean, modern interface.

---

## 🚀 Features

### 🧠 AI-Powered Summarization
- Automatically generates concise and readable summaries for every news article.  
- Built using AI APIs for fast and accurate contextual understanding.

### 🌐 Multi-Language Translation
- Instantly translate both article **titles and summaries** into 10+ languages.  
- Uses free, reliable translation APIs for seamless performance.

### 🕶️ Dark/Light Mode
- Sleek modern UI with full theme toggle support to match your preference.

### 📑 Bookmarking System
- Save your favorite news articles locally for later reading.  
- Persistent even after page refresh.

### 🏷️ Category & Smart Search
- Browse trending articles by **category** (Sports, Health, Technology, Business, etc.).  
- Perform **intelligent keyword searches** to find articles instantly.  

### 🔐 User Authentication
- Secure **Signup & Login** system using **JWT tokens** and **bcrypt password encryption**.  
- Backend powered by **MongoDB Atlas**.

### 🧾 Real-time Updates
- Smart refresh for new news items and summaries without losing bookmarks or login session.

---

## 🖼️ Screenshots

<img width="2844" height="1470" alt="Screenshot 2025-11-02 135650" src="https://github.com/user-attachments/assets/94d99246-4f9b-41e9-b22e-2d02240bfb8c" />
<img width="2838" height="1467" alt="Screenshot 2025-11-02 161834" src="https://github.com/user-attachments/assets/e7b14930-d2b9-4beb-9556-d194b5ac7f12" />

---

## 🏗️ Tech Stack

### **Frontend**
- React.js (Vite)
- CSS3
- Toastify (for notifications)

### **Backend**
- Node.js + Express.js
- MongoDB Atlas with Mongoose
- JWT Authentication
- AI Summarizer & Translation APIs (LibreTranslate, HuggingFace)

---

## ⚙️ Project Setup Guide

### 1️⃣ Clone Repository
```bash
git clone https://github.com/yourusername/newsmania.git
cd newsmania

# The project has two folders:
# backend/  → npm start
# frontend/ → npm run dev
