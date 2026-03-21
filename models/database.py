from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./meetings.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)          # Supabase user UUID
    email = Column(String, unique=True, nullable=False)
    name = Column(String)
    role = Column(String, default="user")          # "user" or "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    meetings = relationship("Meeting", back_populates="owner")

class Meeting(Base):
    __tablename__ = "meetings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    duration_seconds = Column(Float)
    status = Column(String, default="pending")     # pending | processing | done | failed
    language = Column(String, default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User", back_populates="meetings")
    transcript = relationship("Transcript", back_populates="meeting", uselist=False)
    summary = relationship("Summary", back_populates="meeting", uselist=False)

class Transcript(Base):
    __tablename__ = "transcripts"
    id = Column(Integer, primary_key=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), unique=True)
    full_text = Column(Text)
    segments = Column(Text)                        # JSON: [{start, end, speaker, text}]
    created_at = Column(DateTime, default=datetime.utcnow)
    meeting = relationship("Meeting", back_populates="transcript")

class Summary(Base):
    __tablename__ = "summaries"
    id = Column(Integer, primary_key=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), unique=True)
    short_summary = Column(Text)
    key_points = Column(Text)                      # JSON: [string]
    action_items = Column(Text)                    # JSON: [string]
    decisions = Column(Text)                       # JSON: [string]
    keywords = Column(Text)                        # JSON: [string]
    sentiment = Column(String)                     # positive | neutral | negative
    created_at = Column(DateTime, default=datetime.utcnow)
    meeting = relationship("Meeting", back_populates="summary")

Base.metadata.create_all(bind=engine)
