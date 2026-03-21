from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from models.database import get_db, Meeting, Transcript, Summary, User
from services.ai_service import process_meeting
import shutil, os, json
from datetime import datetime

router = APIRouter()
UPLOAD_DIR = "./uploads"

def get_audio_duration(file_path: str) -> float:
    """Get duration in seconds using ffprobe"""
    try:
        import subprocess
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", file_path],
            capture_output=True, text=True, timeout=10
        )
        return float(result.stdout.strip())
    except Exception:
        return 0.0

def process_and_save(meeting_id: int, file_path: str, language: str):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine("sqlite:///./clarivox.db", connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        db.query(Meeting).filter(Meeting.id == meeting_id).update({"status": "processing"})
        db.commit()

        result = process_meeting(file_path, language or None)

        tr = Transcript(
            meeting_id=meeting_id,
            full_text=result["transcript"]["full_text"],
            segments=json.dumps(result["transcript"]["segments"])
        )
        db.add(tr)

        s = result["summary"]
        sm = Summary(
            meeting_id=meeting_id,
            short_summary=s["short_summary"],
            key_points=json.dumps(s["key_points"]),
            action_items=json.dumps(s["action_items"]),
            decisions=json.dumps(s["decisions"]),
            keywords=json.dumps(s["keywords"]),
            sentiment=s["sentiment"]
        )
        db.add(sm)

        db.query(Meeting).filter(Meeting.id == meeting_id).update({"status": "done"})
        db.commit()
        print(f"Meeting {meeting_id} processed successfully")
    except Exception as e:
        print(f"Processing failed for meeting {meeting_id}: {e}")
        db.query(Meeting).filter(Meeting.id == meeting_id).update({"status": "failed"})
        db.commit()
    finally:
        db.close()

@router.post("/upload")
async def upload_meeting(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(...),
    language: str = Form("en"),
    user_id: str = Form(...),
    db: Session = Depends(get_db)
):
    allowed = {".mp3", ".mp4", ".wav", ".m4a", ".ogg", ".webm"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(400, f"File type {ext} not supported.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, email=f"{user_id}@clarivox.ai", name="User")
        db.add(user)
        db.commit()

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    safe_name = f"{user_id[:8]}_{int(datetime.utcnow().timestamp())}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    duration = get_audio_duration(file_path)

    meeting = Meeting(
        user_id=user_id,
        title=title,
        filename=file.filename,
        file_path=file_path,
        duration_seconds=duration,
        language=language,
        status="pending"
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    background_tasks.add_task(process_and_save, meeting.id, file_path, language)

    return {
        "id":       meeting.id,
        "status":   "pending",
        "duration": duration,
        "message":  "Upload successful! AI processing started."
    }

@router.get("/")
def list_meetings(user_id: str, db: Session = Depends(get_db)):
    meetings = db.query(Meeting).filter(Meeting.user_id == user_id)\
        .order_by(Meeting.created_at.desc()).all()
    result = []
    for m in meetings:
        result.append({
            "id":               m.id,
            "title":            m.title,
            "filename":         m.filename,
            "status":           m.status,
            "language":         m.language,
            "duration_seconds": m.duration_seconds,
            "created_at":       m.created_at.isoformat() if m.created_at else None,
        })
    return result

@router.get("/{meeting_id}")
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    m = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not m:
        raise HTTPException(404, "Meeting not found")

    transcript_data = None
    if m.transcript:
        transcript_data = {
            "full_text": m.transcript.full_text,
            "segments":  json.loads(m.transcript.segments or "[]"),
        }

    summary_data = None
    if m.summary:
        summary_data = {
            "short_summary": m.summary.short_summary,
            "key_points":    json.loads(m.summary.key_points   or "[]"),
            "action_items":  json.loads(m.summary.action_items or "[]"),
            "decisions":     json.loads(m.summary.decisions    or "[]"),
            "keywords":      json.loads(m.summary.keywords     or "[]"),
            "sentiment":     m.summary.sentiment,
        }

    return {
        "meeting": {
            "id":               m.id,
            "title":            m.title,
            "filename":         m.filename,
            "status":           m.status,
            "language":         m.language,
            "duration_seconds": m.duration_seconds,
            "created_at":       m.created_at.isoformat() if m.created_at else None,
        },
        "transcript": transcript_data,
        "summary":    summary_data,
    }

@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    m = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not m:
        raise HTTPException(404, "Meeting not found")
    try:
        if m.file_path and os.path.exists(m.file_path):
            os.remove(m.file_path)
    except Exception:
        pass
    db.delete(m)
    db.commit()
    return {"message": "Deleted"}