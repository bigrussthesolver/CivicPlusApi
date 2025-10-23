# Calendar Events App

React + TypeScript frontend for managing calendar events.

## What you need

- Node.js (16+)
- The backend API running

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and update the backend URL:

```env
VITE_API_BASE_URL=https://localhost:5132
```

## Run it

```bash
npm run dev
```

Opens at http://localhost:5173

## Build for production

```bash
npm run build
```

## Project structure

```
src/
├── components/          # UI components
│   ├── EventList.tsx    # Shows all events
│   ├── EventCard.tsx    # Single event card
│   └── AddEventForm.tsx # Create new events
├── hooks/
│   └── useEvents.ts     # State management
├── services/
│   └── eventService.ts  # API calls
├── types/
│   └── models.ts        # TypeScript types
└── App.tsx              # Main component
```

## What it does

**View events** - Shows your calendar events in a nice grid. Loading states, error handling, all that.

**Add events** - Form with validation for title, description, start/end dates. Character counters so you don't go over the limits.

## Tech used

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Axios
- date-fns

## Common issues

**Can't connect to backend?**
- Make sure backend is running
- Check the URL in `.env` matches what the backend shows in the console

**CORS errors?**
- Backend needs to allow `http://localhost:5173` It is already set in the backend


## That's it

Pretty straightforward. The backend handles auth and caching, this just displays the data and lets you add events.