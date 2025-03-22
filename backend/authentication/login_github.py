import os
from fastapi import Depends, HTTPException, Request
from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Depends, HTTPException
from dotenv import load_dotenv 

load_dotenv()

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

# Configure OAuth with GitHub
oauth = OAuth()

oauth.register(
    name="github",
    client_id=os.getenv("GITHUB_CLIENT_ID"),
    client_secret=os.getenv("GITHUB_CLIENT_SECRET"),
    authorize_url="https://github.com/login/oauth/authorize",
    authorize_params=None,
    access_token_url="https://github.com/login/oauth/access_token",
    access_token_params=None,
    refresh_token_url=None,
    redirect_uri="http://localhost:8000/auth/github/callback",
    client_kwargs={"scope": "user:email"},
)

GITHUB_REDIRECT_URL="http://127.0.0.1:8000/auth/github/callback"

#Basic OAuth Github login logic
@router.get("/github")
async def github_login(request: Request):
    return await oauth.github.authorize_redirect(request, GITHUB_REDIRECT_URL)


@router.get("/github/callback")
async def github_callback(request: Request):
    try:
        token = await oauth.github.authorize_access_token(request)

        return {
            "message": "Login successful",
            "authenticated": True,  
            "access_token": token["access_token"],
            "token_type": "bearer",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth Error: {str(e)}")

# TODO implement OAuth Github logic for supabase