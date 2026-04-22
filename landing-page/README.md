# GreenRatchet Landing Page

A modern, dark-themed landing page for GreenRatchet - the cloud sustainability monitoring platform.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server (port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Lucide React icons

## Structure

```
landing-page/
├── app/
│   ├── layout.tsx      # Root layout with fonts
│   ├── page.tsx        # Main landing page
│   └── globals.css     # Global styles
├── components/
│   ├── navigation.tsx  # Sticky nav with mobile menu
│   ├── hero.tsx        # Hero section with dashboard preview
│   ├── features.tsx    # Feature cards grid
│   ├── how-it-works.tsx # Step-by-step process
│   ├── metrics.tsx     # KPI metrics showcase
│   ├── cta.tsx         # Call-to-action section
│   └── footer.tsx      # Footer with links
└── ...config files
```

## Design

- Dark background (#0a0a0a)
- Emerald accent color (#10b981)
- Subtle grid background pattern
- Glow effects and gradient borders
- Smooth animations and transitions
- Responsive design for all screen sizes
