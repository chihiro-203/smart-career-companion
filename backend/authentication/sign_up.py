from fastapi import APIRouter, HTTPException, Depends
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from starlette import status
from models import user as models 
from core import database
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Schema for user signup
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    phone: str
    address: str

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/signup", response_model=None)
def signup(user: UserCreate, db: Session = Depends(database.get_db)):
    try:
        logger.info(user.password)
        hashed_password = pwd_context.hash(user.password)

        # Create a new user instance for the database
        new_user = models.User(
            email=user.email,
            password_hash=hashed_password,
            phone=user.phone,
            address=user.address
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)  
    
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="User with this email already exists")

    return {"message": "User registered successfully"}