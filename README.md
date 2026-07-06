# Jeebhar (MERN Stack SPA)

Single Page Application for a social media marketing agency focused on restaurants.

## Tech stack

- **MongoDB** + Mongoose
- **Express.js** API
- **React 18 + TypeScript** frontend
- **Tailwind CSS** styling
- **Node.js** runtime

## Features implemented

- Sticky responsive navbar:
  - Jeebhar brand on top-left
  - Home, Our Services, Our Work, Our Reels, Media Kit, Contact Us
- Hero section with motivation-focused messaging for restaurants.
- Services tiles with click-to-expand long text.
- Our Experience section showing media kit style metrics (followers, interactions, etc.).
- Our Work image carousel with right/left arrows.
- Our Reels cards with thumbnail; click opens Instagram in new tab.
- Contact form (name, email, phone, subject, email body) with backend submission.
- Contact submission:
  - stored in MongoDB
  - email notification sent to your inbox using SMTP config
- Footer with address, email, phone, and social links.
- Built-in editor section to add/edit/remove:
  - work images/cards
  - reels thumbnail + Instagram links

## Important editable areas

- `server/src/default-content.js`  
  Contains default content with comments marked as `EDITABLE`.
- `client/src/assets/media-kit.pdf`  
  Placeholder media kit PDF. Replace with your real PDF or document.
- Footer/contact/social details are in default content and update via API/editor.

## Setup

### 1) Install dependencies

```bash
npm install
npm run install:all
```

### 2) Configure backend environment

Copy and fill env values:

```bash
copy server\.env.example server\.env
```

Set required SMTP and Mongo details in `server/.env`:

- `MONGODB_URI`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_TO`
- `MAIL_FROM`

### 3) Run app (frontend + backend)

```bash
npm run dev
```

- React (Vite): `http://localhost:5173`
- API: `http://localhost:5000`

## API endpoints

- `GET /api/health`
- `GET /api/content`
- `PUT /api/content` (updates full content document)
- `POST /api/contact` (saves inquiry + sends mail notification)

## Notes

- This is an implementation-ready starter. Replace placeholders (images, links, PDF, contact details) with your final brand assets.
- For production, lock CORS origin and secure the content update endpoint with authentication.
