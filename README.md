# ExamForge AI

An AI-powered exam management system with OCR capabilities, built with Express.js and React.

## Features

- User authentication and authorization
- Exam creation and management
- AI-powered question generation using Google Gemini
- OCR for image/PDF question extraction
- Real-time exam interface with fullscreen mode
- Result tracking and analytics
- Admin dashboard

## Prerequisites

- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Google Gemini API key (for AI features)
- Cloudinary account (optional, for media storage)

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/examforge
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.5-pro
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. Start the backend:
   ```bash
   npm run dev
   ```

   The API will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

   The app will run on `http://localhost:5173`

## Environment Variables

### Backend (.env)

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT authentication
- `GEMINI_API_KEY` - Google Gemini API key for AI features
- `GEMINI_MODEL` - Gemini model to use (default: gemini-2.5-pro)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name (optional)
- `CLOUDINARY_API_KEY` - Cloudinary API key (optional)
- `CLOUDINARY_API_SECRET` - Cloudinary API secret (optional)

## Project Structure

```
backend/
  ├── config/          # Database and service configurations
  ├── controllers/     # Business logic
  ├── middleware/      # Express middleware
  ├── models/          # Mongoose schemas
  ├── routes/          # API routes
  ├── services/        # External services (AI, OCR)
  ├── utils/           # Utility functions
  └── server.js        # Main server file

frontend/
  ├── src/
  │   ├── components/  # React components
  │   ├── features/    # Feature modules
  │   ├── pages/       # Page components
  │   ├── services/    # API services
  │   ├── store/       # Redux store
  │   └── utils/       # Utility functions
  └── vite.config.js   # Vite configuration
```

## Available Scripts

### Backend
- `npm run start` - Start production server
- `npm run dev` - Start development server with auto-reload

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Technologies Used

**Backend:**
- Express.js - Web framework
- MongoDB & Mongoose - Database
- JWT - Authentication
- Google Generative AI - AI question generation
- Tesseract.js - OCR
- Cloudinary - File storage

**Frontend:**
- React 18 - UI framework
- Redux Toolkit - State management
- React Query - Data fetching
- Vite - Build tool
- Tailwind CSS - Styling
- React Router - Routing

## Contributing

Feel free to fork this repository and submit pull requests.

## License

This project is open source and available under the MIT License.
