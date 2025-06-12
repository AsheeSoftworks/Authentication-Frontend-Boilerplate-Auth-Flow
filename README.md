# 🔐 Authentication Backend Boilerplate - Auth Flow

A modern, production-ready authentication frontend built with Next.js 15, TypeScript, and Tailwind CSS. This boilerplate integrates seamlessly with a backend API to provide a complete, secure, and responsive authentication experience.

Perfect for SaaS applications, dashboards, and any project needing a full-featured auth flow out of the box.

---

## ✨ Features

### 🔒 **Complete Authentication System**
- **User Registration** with email verification
- **Secure Login/Logout** with JWT tokens
- **Password Reset** functionality
- **Google OAuth** integration
- **Email Verification** system
- **Token Auto-refresh** mechanism

### 🎨 **Modern UI/UX**
- **Responsive Design** built with Tailwind CSS
- **Dark/Light Mode** support with next-themes
- **Beautiful Components** using Radix UI primitives
- **Form Validation** with React Hook Form + Zod
- **Toast Notifications** with Sonner
- **Loading States** and error handling

### 🛡️ **Security Features**
- **Protected Routes** with middleware
- **Token Management** with secure cookies
- **Request Interceptors** for automatic token handling
- **CSRF Protection** ready
- **Type-safe** with TypeScript

### 🚀 **Developer Experience**
- **State Management** with Zustand
- **API Client** with Axios interceptors
- **Form Management** with React Hook Form
- **Schema Validation** with Zod
- **Hot Reload** with Turbopack support

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 with App Router |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Radix UI + shadcn/ui |
| **State Management** | Zustand with persistence |
| **Forms** | React Hook Form + Zod |
| **HTTP Client** | Axios with interceptors |
| **Authentication** | JWT + Google OAuth |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
auth-flow/
├── 📂 app/
│   ├── 📂 dashboard/          # Protected dashboard pages
│   ├── 📂 forgot-password/    # Password reset flow
│   ├── 📂 reset-password/     # Password reset confirmation
│   ├── 📂 signin/             # Login page
│   ├── 📂 signup/             # Registration page
│   ├── 📂 verify-email/       # Email verification page
│   ├── 📄 favicon.ico
│   ├── 📄 globals.css
│   ├── 📄 layout.tsx
│   └── 📄 page.tsx
├── 📂 components/
│   └── 📂 ui/                 # Reusable UI components
│       ├── 📄 ResetPassword.tsx
│       └── 📄 VerifyEmail.tsx
├── 📂 hooks/
│   └── 📄 use-toast.ts        # Toast notification hook
├── 📂 lib/
│   └── 📄 utils.ts            # Utility functions
├── 📂 store/
│   └── 📄 auth.ts             # Zustand auth store
├── 📄 middleware.ts           # Route protection
└── 📄 package.json
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn** or **pnpm**
- **Backend API** (compatible with the auth endpoints)

### 1. Clone the Repository

```bash
git clone https://github.com/AsheeSoftworks/Authentication-Frontend-Boilerplate-Auth-Flow.git
cd auth-flow
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Google OAuth 
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Start Development Server

```bash
# Using npm
npm run dev

# Using yarn  
yarn dev

# Using pnpm
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application! 🎉

---

## 📖 Usage Guide

### Authentication Store

The app uses Zustand for state management with persistence:

```typescript
import useAuthStore from '@/store/auth'

// In your component
const { user, isAuthenticated, logIn, signUp, logOut } = useAuthStore()

// Login
await logIn(email, password)

// Register  
await signUp(name, email, password, confirmPassword)

// Logout
await logOut()
```

### Protected Routes

Routes are automatically protected using Next.js middleware:

```typescript
// Protected routes - require authentication
const protectedRoutes = ["/dashboard", "/profile", "/settings"]

// Auth routes - redirect to dashboard if already logged in  
const authRoutes = ["/login", "/signup", "/verify-email"]
```

### API Client

Pre-configured Axios client with token management:

```typescript
import apiClient from '@/lib/apiClient'

// Automatically includes auth headers
const response = await apiClient.get('/api/user/profile')
```

---

## 🎨 Customization

### Theme Configuration

The app supports dark/light mode out of the box. Theme configuration is in:
- `app/globals.css` - CSS variables and base styles
- `tailwind.config.ts` - Tailwind theme customization

### UI Components

All UI components are built with Radix UI and are fully customizable:
- Located in `components/ui/`
- Based on shadcn/ui design system  
- Styled with Tailwind CSS

### Authentication Flow

Customize the auth flow by modifying:
- `store/auth.ts` - Auth logic and API calls
- `middleware.ts` - Route protection rules
- Individual page components for UI changes

---

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🌐 API Endpoints

Your backend should implement these endpoints:

```
POST /api/auth/register          # User registration
POST /api/auth/login             # User login  
POST /api/auth/refresh-token     # Token refresh
POST /api/auth/verify-token      # Token verification
POST /api/auth/verify/:token     # Email verification
POST /api/auth/request-password-reset  # Request password reset
POST /api/auth/reset-password    # Reset password
POST /api/auth/resend-verification # Resend verification email
POST /api/auth/google/login      # Google OAuth login
```

---

## 📝 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) section
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Low-level UI primitives
- [Zustand](https://github.com/pmndrs/zustand) - State management solution

---

<div align="center">

**[⭐ Star this repo](https://github.com/AsheeSoftworks/Authentication-Frontend-Boilerplate-Auth-Flow)** if you found it helpful!

</div>

**Happy Coding! 🎉**