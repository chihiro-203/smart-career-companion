from fastapi import APIRouter, Depends, HTTPException
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from database import supabase
from pydantic import BaseModel, EmailStr
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from starlette import status
from typing import Annotated

# Schema for user creation (Signup)
class UserLogin(BaseModel):
    email: EmailStr
    password: str

#Token schema
class Token(BaseModel):
    access_token: str
    token_type: str
    
router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/token')

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# #Login using Oauth2
# @router.post("/login", response_model=Token)
# async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
#     user = form_data
#     response = supabase.table("Authentication").select("*").eq("email", user.username).execute()

#     user_data = response.data

#     if not response or not verify_password(user.password, hash_password(user_data[0]["password"])):
#         raise HTTPException(status_code=400, detail="Invalid username or password")
    
#     token = create_access_token(data={"sub": user.username})
#     return {"access_token": token, "token_type": "bearer"}

#Login without using Oauth2
@router.post("/login")
async def login(user: UserLogin):
    response = supabase.table("Authentication").select("*").eq("email", user.email).execute()

    user_data = response.data

    if not response or not verify_password(user.password, hash_password(user_data[0]["password"])):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}
   