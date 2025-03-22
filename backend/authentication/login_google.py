from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, Request
import os
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv 
from fastapi.responses import RedirectResponse
# import supabase

load_dotenv()

oauth = OAuth()

# Register Google OAuth
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    authorize_params={"scope": "openid email profile"},
    access_token_url="https://oauth2.googleapis.com/token",
    access_token_params=None,
    userinfo_endpoint="https://openidconnect.googleapis.com/v1/userinfo",
    jwks_uri="https://www.googleapis.com/oauth2/v3/certs",
    redirect_uri="https://xpctibgfzqfnabzfbwtf.supabase.co/auth/v1/callback",
    client_kwargs={"scope": "openid email profile"},
)

GOOGLE_REDIRECT_URL = "http://127.0.0.1:8000/auth/google/callback"

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

# @router.get("/google")
# async def google_login():
#     auth_url = f"{os.getenv('SUPABASE_URL')}/auth/v1/authorize?provider=google&redirect_to={GOOGLE_REDIRECT_URL}"
#     print(auth_url)
#     return RedirectResponse(url=auth_url)

# @router.get("/google/callback")
# async def google_callback(request: Request):
#     code = request.query_params.get("code")
#     if not code:
#         raise HTTPException(status_code=400, detail="Missing authorization code")
    
#     print(code)
    
#     # response = supabase.auth.exchange_code_for_session(code)
#     # if "error" in response:
#     #     raise HTTPException(status_code=400, detail=response["error"])
    
#     # user = response["user"]
#     # session = response["session"]
#     return {"message": "Login successful"}

@router.get("/google")
async def google_login(request: Request):
    return await oauth.google.authorize_redirect(request, GOOGLE_REDIRECT_URL)

@router.get("/google/callback")
async def google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user = token.get('userinfo')

    return {"message": "Login successful", "user": user, "token": token}

