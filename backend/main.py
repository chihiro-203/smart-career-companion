from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv  # Import the load_dotenv function
import google.generativeai as genai
from core.database import Base, engine
from authentication import login 
from authentication import sign_up
from authentication import login_google
from authentication import login_github
from starlette.middleware.sessions import SessionMiddleware
# Load environment variables from .env file
load_dotenv()

# Configure the API key using the environment variable
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel("gemini-pro")
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow requests from your Next.js frontend (localhost:3000 for development)
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY"), same_site="lax")
app.include_router(login.router)
app.include_router(sign_up.router)
app.include_router(login_google.router)
app.include_router(login_github.router)

@app.post("/generate")
async def generate_content(user_input: str = Form(...)):
    response_data = model.generate_content(user_input)
    return {"response_text": response_data.text}
