# 🛡️ UTrack - Personal Security & Expense Tracking Platform

<div align="center">

![UTrack Logo](https://img.shields.io/badge/UTrack-Security%20%26%20Finance-blue?style=for-the-badge&logo=shield&logoColor=white)

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.0.0-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)](https://github.com/PATTASWAMY-VISHWAK-YASASHREE/UTrack)

*A modern web application that combines robust security features with intelligent expense tracking and progress monitoring.*

[🚀 Live Demo](#) | [📖 Documentation](#) | [🐛 Report Bug](https://github.com/PATTASWAMY-VISHWAK-YASASHREE/UTrack/issues) | [💡 Request Feature](https://github.com/PATTASWAMY-VISHWAK-YASASHREE/UTrack/issues)

</div>

---

## 🌟 Features

### 🔐 **Security First**
- **Advanced Authentication** - Secure user authentication with Firebase Auth
- **Real-time Security Monitoring** - Track and monitor security events
- **Data Encryption** - End-to-end encryption for sensitive data
- **Multi-factor Authentication** - Enhanced security with MFA support

### 💰 **Smart Expense Tracking**
- **Receipt Scanning** - AI-powered receipt scanning and categorization
- **Real-time Analytics** - Interactive charts and spending insights
- **Budget Management** - Set and track spending limits
- **Automated Categorization** - Machine learning-powered expense sorting

### 📊 **Progress Monitoring**
- **Goal Setting** - Define and track personal financial goals
- **Progress Visualization** - Beautiful charts and progress indicators
- **Alerts & Notifications** - Smart alerts for spending patterns
- **Detailed Reports** - Comprehensive spending and security reports

### 🤖 **AI-Powered Chat**
- **Intelligent Assistant** - Get answers about your finances and security
- **Natural Language Processing** - Ask questions in plain English
- **Personalized Recommendations** - AI-driven financial advice

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** - Modern React with latest features
- **Vite 7.0.4** - Lightning-fast build tool
- **React Router Dom 7.7.0** - Client-side routing
- **Lucide React** - Beautiful icon library
- **CSS3** - Modern styling with flexbox and grid

### Backend & Cloud Services
- **Firebase 12.0.0** - Complete backend solution
  - Authentication
  - Firestore Database
  - Cloud Storage
  - Hosting
- **Firebase Cloud Functions** - Serverless backend logic
- **SendGrid** - Email service integration

### Development Tools
- **ESLint** - Code linting and quality
- **Vite PWA Plugin** - Progressive Web App features
- **Firebase Emulator Suite** - Local development environment

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v20 or higher)
- **npm** or **yarn**
- **Firebase CLI**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PATTASWAMY-VISHWAK-YASASHREE/UTrack.git
   cd UTrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Firebase Functions dependencies**
   ```bash
   cd functions
   npm install
   cd ..
   ```

4. **Configure Firebase**
   ```bash
   # Login to Firebase
   firebase login
   
   # Initialize project (if not already done)
   firebase init
   ```

5. **Set up environment variables**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env with your Firebase configuration
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Start Firebase emulators** (in a new terminal)
   ```bash
   firebase emulators:start
   ```

The application will be available at `http://localhost:5173`

## 📱 Application Structure

```
UTrack/
├── 📁 src/
│   ├── 📁 components/          # Reusable UI components
│   ├── 📁 pages/              # Application pages
│   │   ├── LandingPage.jsx    # Welcome & onboarding
│   │   ├── Home.jsx           # Dashboard
│   │   ├── Scan.jsx           # Receipt scanning
│   │   ├── Ask.jsx            # AI chat interface
│   │   ├── Alerts.jsx         # Notifications & alerts
│   │   └── You.jsx            # User profile
│   ├── 📁 assets/             # Static assets
│   ├── firebase.js            # Firebase configuration
│   └── App.jsx                # Main application component
├── 📁 functions/              # Firebase Cloud Functions
│   ├── index.js               # Function definitions
│   └── package.json           # Functions dependencies
├── 📁 public/                 # Public assets
└── 📄 package.json            # Project dependencies
```

## 🎯 Usage

### 1. **Getting Started**
- Visit the landing page and create an account
- Complete the setup process
- Configure your security preferences

### 2. **Dashboard Overview**
- View your spending summary
- Check security status
- Monitor goal progress
- Access quick actions

### 3. **Expense Tracking**
- Scan receipts using your camera
- Manually add expenses
- Categorize transactions
- Set spending budgets

### 4. **Security Monitoring**
- Review security alerts
- Check login history
- Configure security settings
- Enable notifications

### 5. **AI Assistant**
- Ask questions about your finances
- Get spending insights
- Receive personalized recommendations
- Learn about security best practices

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production-ready application |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |
| `firebase serve` | Serve the app using Firebase hosting |
| `firebase deploy` | Deploy to Firebase hosting |
| `firebase emulators:start` | Start Firebase emulators for local development |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run Firebase Functions tests
cd functions && npm test
```

## 🚀 Deployment

### Firebase Hosting

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

### Environment Variables

Make sure to set these environment variables in your Firebase project:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
SENDGRID_API_KEY=your_sendgrid_api_key
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

<a href="https://github.com/PATTASWAMY-VISHWAK-YASASHREE/UTrack/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=PATTASWAMY-VISHWAK-YASASHREE/UTrack" />
</a>

## 📞 Support

- **Documentation**: [Wiki](https://github.com/PATTASWAMY-VISHWAK-YASASHREE/UTrack/wiki)
- **Issues**: [GitHub Issues](https://github.com/PATTASWAMY-VISHWAK-YASASHREE/UTrack/issues)
- **Discussions**: [GitHub Discussions](https://github.com/PATTASWAMY-VISHWAK-YASASHREE/UTrack/discussions)

## 🙏 Acknowledgments

- Firebase team for the excellent backend platform
- React community for the amazing ecosystem
- Vite team for the blazing-fast build tool
- All contributors who help make UTrack better

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

*Made with ❤️ by the UTrack Team*

</div>
