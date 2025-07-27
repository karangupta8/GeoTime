# GeoTime - Interactive Historical Map

An interactive web application that displays historical events on a 3D globe using Mapbox GL JS and a Node.js backend API.

## Features

- 🗺️ Interactive 3D globe with Mapbox GL JS
- 📅 Timeline slider to explore events by year
- 🎯 Historical event markers with detailed information
- 🔄 Real-time data from Wikipedia API and curated events
- 💾 Backend API with caching system
- 🎨 Beautiful dark theme with glowing markers

## Quick Start

```sh
# Install dependencies (frontend + backend)
npm install
cd server && npm install && cd ..

# Start both frontend and backend
npm run dev
```

Visit http://localhost:8080 and enter your Mapbox API key when prompted.

## API Endpoints

- `GET /api/events?year=1969` - Get historical events by year
- `GET /api/events/:id` - Get specific event details  
- `GET /api/categories` - Get available categories

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f1fb4145-9716-420a-aada-bd22d5f21fd5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
