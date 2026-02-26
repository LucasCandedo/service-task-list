# 🔧 Service Task List

A modern PWA for managing repair and service tasks. Track pending and paid repairs, archive completed jobs, and manage your workflow.

![Service Task List](./public/favicon.svg)

## Features

- ✅ **Add repair tasks** — Name, price, and payment status (Pending / Paid)
- 📦 **Archive** — Move completed tasks to the archive
- 🗑️ **Trash with restore** — Deleted tasks go to trash; restore or permanently delete
- 🎨 **Theme customization** — Choose from 8 primary colors
- 🌙 **Dark / Light mode** — Toggle between dark and light themes
- 💾 **LocalStorage persistence** — All data saved locally in the browser
- 📱 **PWA** — Install on Android (and iOS) as a native-like app
- 📊 **Dashboard stats** — See pending vs paid totals at a glance

## Tech Stack

- **React 18** + **Vite 5**
- **Tailwind CSS v3** for styling
- **Shadcn/ui** components (Radix UI primitives)
- **Lucide React** icons
- **vite-plugin-pwa** for PWA support
- **LocalStorage** for data persistence

## Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/service-task-list.git
cd service-task-list

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploy to Vercel

1. Push to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Deploy — no extra configuration needed (vercel.json handles SPA routing)

## PWA Installation (Android)

1. Open the app in Chrome on Android
2. Tap the browser menu → **"Add to Home Screen"**
3. The app installs as a standalone PWA

## Project Structure

```
service-task-list/
├── public/
│   ├── favicon.svg       # App icon (SVG)
│   ├── icon-192.png      # PWA icon 192x192
│   └── icon-512.png      # PWA icon 512x512
├── src/
│   ├── components/
│   │   └── ui/           # Shadcn/ui components
│   ├── lib/
│   │   └── utils.js      # cn() utility
│   ├── App.jsx           # Main application
│   ├── index.css         # Global styles + CSS variables
│   └── main.jsx          # Entry point
├── index.html
├── vite.config.js        # Vite + PWA config
├── tailwind.config.js
├── vercel.json
└── package.json
```

## License

MIT
