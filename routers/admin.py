from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db, User, Meeting, Transcript, Summary

router = APIRouter()

@router.get("/dashboard")
def admin_dashboard(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_meetings = db.query(Meeting).count()
    processing = db.query(Meeting).filter(Meeting.status == "processing").count()
    done = db.query(Meeting).filter(Meeting.status == "done").count()
    failed = db.query(Meeting).filter(Meeting.status == "failed").count()
    return {
        "total_users": total_users,
        "total_meetings": total_meetings,
        "status_breakdown": {
            "processing": processing,
            "done": done,
            "failed": failed
        }
    }

@router.get("/users")
def list_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.put("/users/{user_id}/role")
def update_user_role(user_id: str, role: str, db: Session = Depends(get_db)):
    if role not in {"user", "admin"}:
        raise HTTPException(400, "Role must be 'user' or 'admin'")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.role = role
    db.commit()
    return {"message": f"Role updated to {role}"}

@router.get("/meetings")
def list_all_meetings(db: Session = Depends(get_db)):
    return db.query(Meeting).all()

@router.delete("/meetings/{meeting_id}")
def admin_delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    m = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not m:
        raise HTTPException(404, "Meeting not found")
    db.delete(m)
    db.commit()
    return {"message": "Deleted by admin"}
