from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import google.generativeai as genai

os.environ['GOOGLE_API_KEY'] = "your-api-key"
genai.configure(api_key=os.environ['GOOGLE_API_KEY'])

model = genai.GenerativeModel('gemini-pro')

app = FastAPI()

# Allow requests from your Next.js frontend (localhost:3000 for development)
origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate")
async def generate_content(user_input: str = Form(...)):
    response_data = model.generate_content(user_input)
    return {"response_text": response_data.text}
