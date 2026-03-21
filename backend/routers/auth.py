from fastapi import APIRouter, Header, HTTPException
from typing import Optional

router = APIRouter()

@router.get("/verify")
def verify_token(authorization: Optional[str] = Header(None)):
    return {"status": "ok"}
