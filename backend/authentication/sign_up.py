from fastapi import APIRouter, HTTPException, Depends
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from starlette import status
from models import user as models 
from core import database
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from models import user as models 

# Schema for user signup
class UserCreate(BaseModel):
    email: EmailStr
    password: str

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/signup", response_model=None)
def signup(user: UserCreate, db: Session = Depends(database.get_db)):
    try:
        hashed_password = pwd_context.hash(user.password)

        # Create a new user instance for the database
        new_user = models.User(
            email=user.email,
            password_hash=hashed_password,
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)  
    
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="User with this email already exists")

    return {
        "message": "User registered successfully",
        "authenticated": True, 
    }
