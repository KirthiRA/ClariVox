from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
import os

app = FastAPI(
    title="Clarivox API",
    description="AI Voice Intelligence Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/files", StaticFiles(directory="uploads"), name="files")

from routers import meetings, users, admin, auth
app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(meetings.router, prefix="/api/meetings", tags=["Meetings"])
app.include_router(users.router,    prefix="/api/users",    tags=["Users"])
app.include_router(admin.router,    prefix="/api/admin",    tags=["Admin"])

@app.get("/")
def root():
    return {"status": "ok", "message": "Clarivox API running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/favicon.ico")
def favicon():
    return Response(status_code=204)