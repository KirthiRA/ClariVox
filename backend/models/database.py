from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

# Hardcoded — no .env dependency for database
DATABASE_URL = "sqlite:///./clarivox.db"

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
    id         = Column(String, primary_key=True)
    email      = Column(String, unique=True, nullable=False)
    name       = Column(String)
    role       = Column(String, default="user")
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    meetings   = relationship("Meeting", back_populates="owner")

class Meeting(Base):
    __tablename__ = "meetings"
    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(String, ForeignKey("users.id"))
    title            = Column(String, nullable=False)
    filename         = Column(String, nullable=False)
    file_path        = Column(String, nullable=False)
    duration_seconds = Column(Float)
    status           = Column(String, default="pending")
    language         = Column(String, default="en")
    created_at       = Column(DateTime, default=datetime.utcnow)
    owner            = relationship("User", back_populates="meetings")
    transcript       = relationship("Transcript", back_populates="meeting", uselist=False)
    summary          = relationship("Summary",    back_populates="meeting", uselist=False)

class Transcript(Base):
    __tablename__ = "transcripts"
    id         = Column(Integer, primary_key=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), unique=True)
    full_text  = Column(Text)
    segments   = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    meeting    = relationship("Meeting", back_populates="transcript")

class Summary(Base):
    __tablename__ = "summaries"
    id            = Column(Integer, primary_key=True)
    meeting_id    = Column(Integer, ForeignKey("meetings.id"), unique=True)
    short_summary = Column(Text)
    key_points    = Column(Text)
    action_items  = Column(Text)
    decisions     = Column(Text)
    keywords      = Column(Text)
    sentiment     = Column(String)
    created_at    = Column(DateTime, default=datetime.utcnow)
    meeting       = relationship("Meeting", back_populates="summary")

Base.metadata.create_all(bind=engine)