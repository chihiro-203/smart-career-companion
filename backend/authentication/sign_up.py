from fastapi import APIRouter, HTTPException, Depends
from passlib.context import CryptContext
from database import supabase
from pydantic import BaseModel, EmailStr
from starlette import status

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

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate):
    # Hash the password
    hashed_password = pwd_context.hash(user.password)

    # Check if the user already exists
    existing_user = supabase.table("Authentication").select("email").eq("email", user.email).execute()
    if existing_user.data: 
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Prepare user data for insertion
    new_user_data = user.dict()
    new_user_data["password"] = hashed_password 

    # Insert user into Supabase
    response = supabase.table("Authentication").insert(new_user_data).execute()
    
    return {"message": "User registered successfully", "user": response.data}