# Clarivox — AI Voice Intelligence Platform

> Clarity from every voice

Clarivox transcribes, summarizes and extracts insights from your meeting recordings using AI.

## Tech Stack
- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: FastAPI (Python)
- **AI**: faster-whisper (transcription) + HuggingFace BART (summarization)
- **Database**: SQLite + SQLAlchemy
- **Auth**: Supabase

## Setup

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Mac/Linux
# venv\Scripts\activate    # Windows
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload --port 8000
# → http://localhost:8000/docs
```

### 3. Environment Variables

**frontend/.env**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:8000/api
```

**backend/.env**
```
DATABASE_URL=sqlite:///./clarivox.db
SUPABASE_JWT_SECRET=your_jwt_secret
UPLOAD_DIR=./uploads
WHISPER_MODEL=base
```

## Pages
| Route | Page |
|---|---|
| `/login` | Sign in / Sign up |
| `/dashboard` | User dashboard |
| `/upload` | Upload meeting |
| `/meetings` | Meeting history |
| `/profile` | Profile settings |
| `/settings` | App settings |
| `/admin` | Admin dashboard |
| `/admin/users` | User management |
| `/admin/meetings` | All meetings |

## Brand
- **Name**: Clarivox
- **Tagline**: Clarity from every voice
- **Colors**: #5b8dee (blue) · #a78bfa (purple)
- **Font**: Inter
