# 🚀 Vibe - Social Media Platform

Welcome to  Vibe**! 🌟
A modern, feature-rich social networking application built to connect people, share moments, and vibe together. Whether you're posting updates, sharing stories that vanish in 24 hours, or messaging friends, PingUp handles it all seamlessly.

---

## ✨ Features

- **🔐 Secure Authentication:** Powered by **Clerk** (Sign In, Sign Up, User Management).
- **🏠 News Feed:** Create and view posts with text and images. Like and interact with content.
- **📸 Stories:** Share fleeting moments with **24-hour disappearing stories** (handled by background jobs).
- **🤝 Connections:** Send connection requests, follow/unfollow users, and build your network.
- **📧 Email Notifications:** Get instant email alerts when someone sends you a connection request (powered by **Nodemailer**).
- **💬 Messaging:** Real-time chat interface to stay in touch with your connections.
- **🔍 Discover People:** Search for users by name, username, or location.
- **🖼️ Media Uploads:** Fast and optimized image uploads using **ImageKit**.
- **⚙️ Background Jobs:** Automated tasks like story deletion and reminders using **Inngest**.

---

## 🛠️ Tech Stack

### **Frontend**
- **React.js** (Vite) - Fast and modern UI library.
- **Redux Toolkit** - State management for user data and connections.
- **Tailwind CSS** - Utility-first CSS framework for styling.
- **Lucide React** - Beautiful icons.
- **React Router DOM** - Client-side routing.
- **Axios** - HTTP client for API requests.

### **Backend**
- **Node.js & Express.js** - Robust server-side framework.
- **MongoDB & Mongoose** - NoSQL database for flexible data storage.
- **Nodemailer** - Sending emails via SMTP (Gmail).
- **Inngest** - Serverless background job processing (e.g., deleting old stories).
- **ImageKit** - Cloud-based image optimization and storage.
- **Clerk SDK** - Backend validation for secure API routes.

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/PingUp.git
cd PingUp
```

### **2. Install Dependencies**

You need to install dependencies for both the **client** (frontend) and **server** (backend).

**For Client:**
```bash
cd client
npm install
```

**For Server:**
```bash
cd server
npm install
```

---

### **3. Environment Variables (.env)**

Create a `.env` file in the **server** directory and add the following credentials:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication (Clerk)
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
JWT_SECRET=your_jwt_secret

# Image Storage (ImageKit)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url

# Background Jobs (Inngest)
INNGEST_SIGNING_KEY=your_inngest_signing_key
INNGEST_EVENT_KEY=your_inngest_event_key

# Email Service (Nodemailer - Gmail)
SMTP_USER=your_gmail_address
SMTP_PASS=your_gmail_app_password  # (No spaces!)
SENDER_EMAIL=your_gmail_address

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

Create a `.env` file in the **client** directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:4000
```

---

### **4. Run the Application**

**Start the Backend Server:**
Open a terminal in the `server` folder:
```bash
npm run server
```
*Server runs on port 4000 by default.*

**Start the Frontend Client:**
Open a new terminal in the `client` folder:
```bash
npm run dev
```
*Client runs on port 5173 by default.*

---

## 📂 Project Structure

```
PingUp/
├── client/          # React Frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components (PostCard, Navbar, etc.)
│   │   ├── pages/       # Application Pages (Home, Profile, Connect, etc.)
│   │   ├── features/    # Redux slices (userSlice, connectionSlice)
│   │   └── api/         # Axios configuration
│   └── ...
│
├── server/          # Node.js Backend
│   ├── controllers/ # Logic for Users, Posts, Stories, Messages
│   ├── models/      # Mongoose Schemas (User, Post, Story, Connection)
│   ├── routes/      # Express API Routes
│   ├── configs/     # Configuration (ImageKit, Nodemailer)
│   ├── inngest/     # Background job functions
│   └── scripts/     # Utility scripts (e.g., test-email.js)
│
└── README.md        # Project Documentation
```

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the project:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

### **Designed & Developed with ❤️ by Aditya**
