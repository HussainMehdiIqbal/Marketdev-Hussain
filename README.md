# 🚀 DevMarket3D

### 3D Developer Project Marketplace & Source Code Store

**DevMarket3D** is a full-stack marketplace where developers can discover, purchase, and securely download software projects and source code.

The platform includes a modern **3D interface, PKR checkout, manual payment verification, user authentication, admin management, licensing, and authorization-based secure downloads.**

---

## ✨ Key Features

* 🛍️ Project Marketplace
* 🔎 Search, Filter & Sort
* 💳 PKR Payment Checkout
* 🧾 Payment Proof Upload
* ✅ Manual Payment Verification
* 🔐 Secure Authentication
* 📦 Protected Source-Code Downloads
* 🎟️ License Generation
* 👤 User Dashboard
* 🛠️ Admin Dashboard
* 📊 Revenue & Download Analytics
* 📝 Project Management
* 🔔 Notifications
* 📜 Admin Activity Logs
* 🎨 Interactive 3D UI

---

## 🛠️ Tech Stack

**Next.js 16 • TypeScript • Tailwind CSS • Prisma • MySQL • NextAuth.js • React Three Fiber**

---

## 🔄 How It Works

```text
Browse Projects
      ↓
View Project Details
      ↓
Create Order
      ↓
Select Payment Method
      ↓
Upload Payment Proof
      ↓
Admin Verification
      ↓
License Generated
      ↓
Secure Download
```

---

# 🚀 Installation & Running

### 1. Clone Repository

```bash
git clone https://github.com/HussainMehdiIqbal/Marketdev-Hussain.git
cd Marketdev-Hussain
```

### 2. Install Dependencies

```bash
npm install
```

The project uses Node.js **20+** and MySQL **8+**.

### 3. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Configure your database and authentication values:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
AUTH_SECRET="your-secret"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"
ADMIN_NAME="Admin"
```

Generate an authentication secret with:

```bash
openssl rand -base64 32
```

### 4. Setup Database

```bash
npm run db:push
```

Seed the database:

```bash
npm run db:seed
```

Or use migrations:

```bash
npm run db:migrate
```

The seed creates the initial admin account and starter categories/technologies.

### 5. Start Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Admin Panel:

```text
http://localhost:3000/admin/login
```

---

## 🔐 Secure Downloads

Purchased source-code ZIP files are stored outside the public directory.

A download requires:

```text
Authenticated User
       +
Order Ownership
       +
Verified / Completed Payment
       ↓
Secure Download
```

Downloads are also logged with relevant request information.

---

## 👨‍💻 Developer

### Hussain Mehdi Iqbal

**BS Information Technology**

---

## 🎯 Project Goal

DevMarket3D aims to provide developers with a centralized platform for **discovering, purchasing, licensing, and securely accessing software projects and source code.**

---

## ⭐ Project Highlights

```text
Modern 3D Marketplace
Secure Authentication
PKR Checkout
Manual Payment Verification
License Management
Protected Downloads
Admin Control Panel
Prisma + MySQL Backend
Responsive UI
```

---

## 🛣️ Future Improvements

* 📧 Email notifications
* 🔑 Forgot-password system
* 📩 Contact form backend
* 📖 Admin installation-guide editor
* 📱 Enhanced mobile experience
* 💳 Additional payment integrations

Some of these areas are already scaffolded in the current project and can be wired up further.

---

## ⭐ Support

If you like this project:

⭐ Star the repository
🍴 Fork the project
🐛 Report issues
💡 Suggest improvements

---

<div align="center">

# 🚀 DevMarket3D

### **Discover • Purchase • License • Download**

**Built with Next.js • Prisma • MySQL • React Three Fiber**

</div>
