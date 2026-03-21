from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.database import get_db, User, Meeting
from datetime import datetime, timedelta
import os

router = APIRouter()

MAX_MEETINGS = int(os.getenv("MAX_MEETINGS_FREE", "5"))
MAX_STORAGE_MB = float(os.getenv("MAX_STORAGE_MB", "500"))

@router.post("/sync")
def sync_user(user_id: str, email: str, name: str = "", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, email=email, name=name)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user

@router.get("/{user_id}/stats")
def get_user_stats(user_id: str, db: Session = Depends(get_db)):
    """Real-time user stats for dashboard and profile"""
    total = db.query(Meeting).filter(Meeting.user_id == user_id).count()
    done  = db.query(Meeting).filter(Meeting.user_id == user_id, Meeting.status == "done").count()
    processing = db.query(Meeting).filter(Meeting.user_id == user_id, Meeting.status == "processing").count()
    failed = db.query(Meeting).filter(Meeting.user_id == user_id, Meeting.status == "failed").count()

    # Storage used (sum of file sizes)
    meetings = db.query(Meeting).filter(Meeting.user_id == user_id).all()
    storage_bytes = 0
    for m in meetings:
        try:
            if m.file_path and os.path.exists(m.file_path):
                storage_bytes += os.path.getsize(m.file_path)
        except Exception:
            pass
    storage_mb = round(storage_bytes / (1024 * 1024), 2)

    # Recent activity (last 5 meetings)
    recent = db.query(Meeting).filter(Meeting.user_id == user_id)\
        .order_by(Meeting.created_at.desc()).limit(5).all()

    # This week count
    week_ago = datetime.utcnow() - timedelta(days=7)
    this_week = db.query(Meeting).filter(
        Meeting.user_id == user_id,
        Meeting.created_at >= week_ago
    ).count()

    return {
        "total_meetings":    total,
        "done":              done,
        "processing":        processing,
        "failed":            failed,
        "storage_mb":        storage_mb,
        "storage_limit_mb":  MAX_STORAGE_MB,
        "meetings_limit":    MAX_MEETINGS,
        "this_week":         this_week,
        "plan":              "pro",
        "recent_activity": [
            {
                "id":         m.id,
                "title":      m.title,
                "status":     m.status,
                "created_at": m.created_at.isoformat() if m.created_at else None,
                "duration":   m.duration_seconds,
            }
            for m in recent
        ]
    }

@router.put("/{user_id}/name")
def update_name(user_id: str, name: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.name = name
    db.commit()
    return {"message": "Name updated", "name": name}