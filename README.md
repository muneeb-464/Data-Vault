# 🔐 Data-Vault App

A secure, AI-powered data storage web application that allows users to store, manage, and organize their personal data safely with modern authentication and intelligent automation.

---

## 🚀 Features

- 🔑 **Google Authentication (OAuth)**
- 🔒 **Secure Data Storage (Supabase)**
- 🤖 **AI Integration (Gemini API)**
- 📂 **Smart Dashboard for Data Management**
- 🔍 **Search & Filter Stored Data**
- ✏️ **Edit / Delete / Organize Entries**
- ☁️ **Cloud-Based & Scalable**
- 📊 **User-Friendly Interface**

---

## 🧠 AI Functionality

- Users can input content directly (instead of manual title/category)
- AI automatically:
  - Generates structured data
  - Organizes content
  - Updates dashboard dynamically
- If API quota is exceeded:
  - ⚠️ User gets a **"Quota Limit Reached"** message

---

## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend / Services
- Supabase (Auth + Database + Storage)
- Gemini AI API

### Deployment
- Vercel


##  📁 Project Structure

- **/src**
- **/components**
- **/pages**
- **/contexts**
- **/hooks**
- **/lib**
- **/supabase**
---


## ⚙️ Environment Variables

Create a `.env` file and add:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key

```
🔧 Installation & Setup
</br>
1️⃣ Clone the repository
```
git clone https://github.com/your-username/data-vault.git
```
2️⃣ Navigate to project folder

```
cd data-vault
```
3️⃣ Install dependencies
```
npm install
```
4️⃣ Run development server
```
npm run dev
```
🌐 Deployment

Deploy easily using Vercel:
```
npm run build
```
- Add environment variables in Vercel dashboard
- Set correct redirect URLs for authentication

🔐 Authentication Setup (Important)
Enable Google Provider in Supabase
Add redirect URLs:

Use this in your code:
```
emailRedirectTo: window.location.origin + "/dashboard"
```

## 📌 Future Improvements

- **📱 Mobile App Version**
- **🔔 Notifications System**
- **📊 Advanced Analytics Dashboard**
- **🧾 Export Data (PDF/CSV)**
- **🧠 More Advanced AI Automationss**
---

# 🤝 Contributing

- **1.Fork the repo**
- **2.Create a new branch**

`
git checkout -b feature-na
`

# 3.Commit changes
`
git commit -m "Added new feature"
`

# 4.Push to GitHub
`
git push origin feature-name
`

# 5.Open a Pull Request


📄 License

This project is licensed under the MIT License.`

# 👤 Author - Munib Sajjad

- Building AI-powered tools & scalable web apps
- Focused on productivity, automation, and user 

