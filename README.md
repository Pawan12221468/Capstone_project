# Knowledge Scout (Doc & AI Learning Hub)
An intelligent learning and document analysis platform that transforms study materials into interactive, intelligent conversations and structured learning roadmaps.

🚀 Features
- **AI Learning Roadmaps**: Tell the AI what you want to learn, and get a structured, step-by-step course.
- **Document Intelligence**: Upload PDF documents for AI-powered text extraction and Q&A.
- **AI Tutor**: Interactive chat with an AI assistant for contextual learning.
- **Progress Tracking**: Track your learning journey across different roadmap topics.
- **Modern UI**: Sleek, curved dark-themed design with smooth Framer Motion animations.

🛠️ Tech Stack
### Frontend
- **React 19** with **TypeScript**
- **Tailwind CSS** for premium styling
- **Framer Motion** for smooth transitions
- **Zustand** & **Context API** for state management

### Backend
- **Node.js** with **Express.js**
- **Prisma ORM** for database management
- **MongoDB Atlas** (Cloud Database)
- **Groq Cloud AI** for high-speed AI processing (LLM)

🚀 Quick Start
1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   # In root directory
   npm install
   # In frontend and backend folders
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. **Set up environment variables**:
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   DATABASE_URL="mongodb+srv://your_user:your_password@cluster.mongodb.net/knowledge_scout"
   JWT_SECRET="your_secret_key"
   GROQ_API_KEY="your_groq_api_key"
   ```
4. **Sync Database**:
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```
5. **Start development servers**:
   ```bash
   # Backend
   cd backend && npm run dev
   # Frontend
   cd frontend && npm start
   ```

📁 Project Structure
- `frontend/`: React application (UI/UX)
- `backend/`: Node.js API & AI Services
- `backend/prisma/`: Database schema and client
- `backend/uploads/`: Temporary storage for document processing

🧪 Features in Action
- **AI Roadmaps**: Uses Groq AI to generate structured learning paths from user prompts.
- **Markdown Rendering**: Custom-built renderer for beautiful, code-highlighted AI responses.
- **Pill-Shaped Search**: Professional, modern search interface for the AI Roadmap generator.

🤝 Support
📧 Email: puk.dubeyo1@gmail.com
📄 License: MIT
