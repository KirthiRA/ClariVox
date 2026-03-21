from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from models.database import get_db, Meeting, Transcript, Summary
from services.ai_service import process_meeting
import shutil, os, json

router = APIRouter()
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")

def process_and_save(meeting_id: int, file_path: str, language: str, db: Session):
    """Background task: run AI pipeline, update DB."""
    try:
        db.query(Meeting).filter(Meeting.id == meeting_id).update({"status": "processing"})
        db.commit()

        result = process_meeting(file_path, language or None)

        # Save transcript
        tr = Transcript(
            meeting_id=meeting_id,
            full_text=result["transcript"]["full_text"],
            segments=json.dumps(result["transcript"]["segments"])
        )
        db.add(tr)

        # Save summary
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
    except Exception as e:
        db.query(Meeting).filter(Meeting.id == meeting_id).update({"status": "failed"})
        db.commit()
        raise e

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

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    meeting = Meeting(
        user_id=user_id,
        title=title,
        filename=file.filename,
        file_path=file_path,
        language=language,
        status="pending"
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    background_tasks.add_task(process_and_save, meeting.id, file_path, language, db)

    return {"id": meeting.id, "status": "pending", "message": "Processing started"}

@router.get("/")
def list_meetings(user_id: str, db: Session = Depends(get_db)):
    meetings = db.query(Meeting).filter(Meeting.user_id == user_id).all()
    return meetings

@router.get("/{meeting_id}")
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    m = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not m:
        raise HTTPException(404, "Meeting not found")
    return {
        "meeting": m,
        "transcript": m.transcript,
        "summary": m.summary
    }

@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    m = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not m:
        raise HTTPException(404, "Meeting not found")
    if os.path.exists(m.file_path):
        os.remove(m.file_path)
    db.delete(m)
    db.commit()
    return {"message": "Deleted"}
