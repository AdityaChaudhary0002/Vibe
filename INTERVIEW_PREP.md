# 🎓 PingUp (Vibe) - Project Interview Documentation

This document contains a detailed breakdown of the PingUp (Vibe) project to help you understand the architecture, database schema, and key features for your resume and interviews.

---

## 1. Project Overview 🚀

**PingUp (Vibe)** is a full-stack social media application designed to connect users through posts, stories, and real-time messaging. It replicates core features of modern platforms like Instagram and LinkedIn.

**Key Highlights:**
- **Social Networking:** Users can follow others, send connection requests, and build a network.
- **Content Sharing:** Share text/image posts and 24-hour disappearing stories.
- **Real-time Interaction:** Chat with connections and get instant notifications.
- **Email System:** Automated email alerts for new connection requests.

---

## 2. Tech Stack 🛠️

### **Frontend (Client)**
- **React.js (Vite):** For building a fast, interactive Single Page Application (SPA).
- **Redux Toolkit:** For global state management (managing User data, Connections, Posts).
- **Tailwind CSS:** For rapid, responsive, and modern UI styling.
- **Clerk:** For secure Authentication (Login, Signup, Session Management).
- **Axios:** For making HTTP requests to the backend API.

### **Backend (Server)**
- **Node.js & Express.js:** RESTful API architecture.
- **MongoDB & Mongoose:** NoSQL database for flexible data modeling.
- **Inngest:** Event-driven background jobs (e.g., deleting stories automatically after 24h).
- **Nodemailer:** For sending transactional emails (Gmail SMTP).
- **ImageKit:** Cloud storage and optimization for user uploads (Profile pics, Post images).

---

## 3. Database Schema (MongoDB) 🗄️

Here is how the data is structured in the database.

### **1. User Model (`User.js`)**
Stores user profile information.
- `_id`: String (Synced with Clerk ID).
- `full_name`, `username`, `email`: Basic info.
- `bio`, `location`: Profile details.
- `profile_picture`, `cover_photo`: Image URLs.
- `followers`: Array of User IDs who follow this user.
- `following`: Array of User IDs this user follows.
- `connections`: Array of User IDs (Mutual connections).

### **2. Post Model (`Post.js`)**
Stores user posts.
- `user`: Reference to User (Owner of the post).
- `content`: Text content of the post.
- `image_urls`: Array of image links.
- `post_type`: Enum (`text`, `image`, `text_with_image`).
- `likes_count`: Array of User IDs who liked the post.

### **3. Story Model (`Story.js`)**
Stores 24-hour stories.
- `user`: Reference to User.
- `media_url`: Image/Video link.
- `media_type`: Enum (`image`, `video`, `text`).
- `views_count`: Array of User IDs who viewed the story.
- **Note:** Stories are automatically deleted by Inngest after 24 hours.

### **4. Connection Model (`Connection.js`)**
Tracks connection requests status.
- `from_user_id`: Sender.
- `to_user_id`: Receiver.
- `status`: Enum (`pending`, `accepted`).

### **5. Message Model (`Message.js`)**
Stores chat messages.
- `from_user_id`: Sender.
- `to_user_id`: Receiver.
- `text`: Message content.
- `message_type`: Enum (`text`, `image`).
- `seen`: Boolean (Read receipt).

---

## 4. Key Features & How They Work ⚙️

### **A. Authentication (Clerk + Webhooks)**
- User signs up on Clerk.
- Clerk triggers a **Webhook** (`user.created`).
- Our Backend listens to this webhook and creates a copy of the user in our MongoDB `User` collection.
- **Why?** To maintain relationships (followers, posts) in our own database while letting Clerk handle security.

### **B. Connection Requests & Email Notification**
1.  **User A** sends a request to **User B**.
2.  Backend creates a `Connection` document with status `pending`.
3.  **Immediately**, the backend uses `Nodemailer` to send an email to User B: *"You have a new connection request from User A"*.
4.  If User B accepts, status updates to `accepted` and both IDs are added to each other's `connections` list.

### **C. Image Uploads (ImageKit)**
- Images are not stored on the server directly (to save space).
- They are uploaded to **ImageKit** (Cloud).
- ImageKit returns a URL, which we store in MongoDB (`profile_picture`, `media_url`).

### **D. Background Jobs (Inngest)**
- **Story Deletion:** When a story is posted, an Inngest event is triggered (`app/story.delete`).
- Inngest waits for **24 hours** (sleep).
- After 24 hours, it executes the delete function to remove the story from MongoDB.

---

## 5. Directory Structure 📂

```
server/
├── controllers/    # Business logic (e.g., sendRequest, addPost)
├── models/         # Database Schemas
├── routes/         # API Endpoints (e.g., /api/user/connect)
├── configs/        # App Configs (Nodemailer, ImageKit)
├── inngest/        # Background Functions
└── server.js       # Main entry point

client/
├── src/
│   ├── components/ # Reusable UI pieces (PostCard, UserCard)
│   ├── pages/      # Full pages (Home, Profile, Messages)
│   ├── features/   # Redux State Slices
│   └── api/        # API Calls
```

---

## 6. Interview Q&A Cheatsheet 🗣️

**Q: Why did you use Inngest?**
**A:** To handle scheduled tasks like deleting stories after 24 hours reliably without keeping the server busy.

**Q: How do you handle User Authentication?**
**A:** I used **Clerk** for secure auth but synced user data to MongoDB via Webhooks to manage complex relationships like followers and posts.

**Q: How did you fix the Email Notification delay?**
**A:** Initially, it was a background job, but I moved it to the main controller for instant delivery using a direct Nodemailer call with Gmail SMTP.

**Q: How did you solve the Frontend Crash?**
**A:** I implemented **Data Sanitization** in the backend. When fetching posts/connections, I filtered out any references to deleted users (`null` values) to prevent the frontend from reading properties of null objects.

---

Good luck with your interview! 🚀
