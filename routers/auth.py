from fastapi import APIRouter

router = APIRouter()

@router.get("/me")
def get_me():
    # Supabase handles auth — verify JWT in middleware
    return {"message": "Authenticated via Supabase JWT"}
