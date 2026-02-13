# 🚀 Vibe - Next Gen Social Platform

Welcome to **Vibe**! 🌟
A cutting-edge, feature-rich social networking application built for 2026. Connect with friends, share moments, and vibe together with real-time video calls, AI-powered chat, and a stunning glassmorphic UI.

---

## ✨ Key Features

### 🎥 Real-Time Communication
- **HD Video & Voice Calls:** Seamless, low-latency calls powered by **ZegoCloud (WebRTC)**.
- **Instant Messaging:** Real-time chat with typing indicators and read receipts using **Socket.io**.
- **Group Chats:** Create groups and stay connected with your circle.

### 🤖 AI-Powered Experience
- **Voice-to-Text:** Send voice messages that are instantly transcribed using **Groq (Whisper)**.
- **Magic Translate:** Instantly translate chat messages into your language with **Gemini AI**.
- **Smart Suggestions:** AI-driven content and connection recommendations.

### 🎨 Modern UI/UX (2026 Design)
- **Glassmorphism:** Premium, translucent design elements with blur effects.
- **Dark Mode:** Fully supported, deeper and richer dark theme.
- **Infinite Scroll:** Buttery smooth feed experience.
- **Stories:** 24-hour disappearing stories with gradient rings and rich media support.

### 🛠️ Core Social Features
- **🔐 Secure Auth:** Powered by **Clerk** (Sign In, Sign Up, User Management).
- **🏠 Smart Feed:** Personalized content delivery.
- **🤝 Connections:** Follow/Unfollow system with "Active Now" status.
- **📧 Notifications:** Real-time in-app and email alerts (via **Nodemailer**).
- **🖼️ Optimized Media:** Fast image/video uploads via **ImageKit**.
- **⚙️ Background Jobs:** Automated cleanup and tasks using **Inngest**.

---

## 🛠️ Tech Stack

### **Frontend**
- **React.js 19** (Vite) - Ultra-fast UI library.
- **Tailwind CSS 4** - Next-gen styling engine.
- **Redux Toolkit** - State management.
- **Lucide React** - Modern iconography.
- **ZegoCloud UIKit** - Video/Voice SDK.

### **Backend**
- **Node.js & Express.js** - Scalable server framework.
- **MongoDB & Mongoose** - Flexible NoSQL database.
- **Socket.io** - Real-time bidirectional communication.
- **Google Generative AI (Gemini)** - LLM integration.
- **Groq SDK** - High-performance AI inference.
- **Inngest** - Event-driven background jobs.

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### **1. Clone the Repository**
```bash
git clone https://github.com/AdityaChaudhary0002/PingUp.git
cd PingUp
```

### **2. Install Dependencies**

**Client:**
```bash
cd client
npm install
```

**Server:**
```bash
cd server
npm install
```

---

### **3. Environment Variables (.env)**

Create a `.env` file in the **server** directory:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication (Clerk)
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
JWT_SECRET=your_jwt_secret

# AI Services
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Image Storage (ImageKit)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url

# Background Jobs (Inngest)
INNGEST_SIGNING_KEY=your_inngest_signing_key
INNGEST_EVENT_KEY=your_inngest_event_key

# Email (Nodemailer)
SMTP_USER=your_gmail_address
SMTP_PASS=your_gmail_app_password
SENDER_EMAIL=your_gmail_address

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

Create a `.env` file in the **client** directory:
```env
# Auth
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# API
VITE_API_URL=http://localhost:4000

# Video Calls (ZegoCloud)
VITE_ZEGO_APP_ID=your_zego_app_id
VITE_ZEGO_SERVER_SECRET=your_zego_server_secret
```

---

### **4. Run the Application**

**Start Backend:**
```bash
cd server
npm run server
```

**Start Frontend:**
```bash
cd client
npm run dev
```

---

## 🤝 Contributing

Contributions are welcome!
1.  Fork the repo.
2.  Create a branch (`git checkout -b feature/NewFeature`).
3.  Commit changes (`git commit -m 'Add NewFeature'`).
4.  Push to branch (`git push origin feature/NewFeature`).
5.  Open a Pull Request.

---

## 📄 License
This project is licensed under the MIT License.

---

### **Designed & Developed with ❤️ by Aditya**
