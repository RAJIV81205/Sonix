# 🎵 Sonix

A modern, feature-rich web music player built with cutting-edge technologies for the ultimate listening experience.

## ✨ Features

- **🎧 Modern Music Player**: Sleek, intuitive interface for seamless music playback
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🎶 Queue Management**: Add songs to queue with flexible playback controls
- **🔗 Spotify Integration**: Import your Spotify playlists directly into Sonix
- **💾 Cloud Storage**: Save and sync your music library across devices
- **🎨 Beautiful UI**: Smooth animations and modern design elements
- **⚡ Fast Performance**: Optimized for speed and responsiveness

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) - React framework for production
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Animations**: [Framer Motion](https://www.framer.com/motion/) - Production-ready motion library
- **Backend**: [Firebase](https://firebase.google.com/) - Backend-as-a-Service platform
- **API Integration**: Spotify Web API for playlist imports

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Spotify Developer account (for playlist import feature)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sonix.git
   cd sonix
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Spotify Configuration
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Key Features in Detail

### 🎵 Music Player
- Play, pause, skip, and repeat functionality
- Volume control with mute option
- Progress bar with seek functionality
- Shuffle mode for randomized playback

### 📱 Queue Management
- Add individual songs or entire playlists to queue
- Reorder queue items with drag-and-drop
- View upcoming tracks
- Clear queue or remove specific items

### 🔗 Spotify Integration
- Connect your Spotify account securely
- Browse and import your existing playlists
- Sync playlist metadata and track information
- Maintain playlist organization from Spotify

### 💾 Data Persistence
- User accounts and authentication via Firebase Auth
- Cloud storage for playlists and user preferences
- Real-time synchronization across devices
- Offline capability for downloaded content

## 🏗️ Project Structure

```
sonix/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and configurations
│   ├── store/              # State management
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── styles/                 # Global styles
└── docs/                   # Documentation
```

## 🎨 Design Philosophy

Sonix focuses on providing a clean, modern interface that puts music first. The design emphasizes:

- **Minimalism**: Clean layouts without visual clutter
- **Accessibility**: High contrast ratios and keyboard navigation
- **Responsiveness**: Seamless experience across all device sizes
- **Performance**: Smooth animations and fast loading times

## 🤝 Contributing

We welcome contributions to Sonix! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Vercel](https://vercel.com/) for deployment and hosting
- [Spotify](https://developer.spotify.com/) for their comprehensive API
- [Firebase](https://firebase.google.com/) for backend services
- The open-source community for inspiration and tools

## 📞 Support

If you encounter any issues or have questions, please:

1. Check the [documentation](docs/)
2. Search existing [issues](https://github.com/yourusername/sonix/issues)
3. Create a new issue if needed

---
