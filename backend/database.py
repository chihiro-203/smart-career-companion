import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Database connection URL (from Supabase or local PostgreSQL)
DATABASE_URL = "https://hdbxmbcfrytztevvysjk.supabase.co"
DATABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkYnhtYmNmcnl0enRldnZ5c2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MTM0NDEsImV4cCI6MjA1Njk4OTQ0MX0.NAnowMYW6q5ptoJM7bZjalwdNM4ingV_sNbbdXmZr7U"

supabase: Client = create_client(DATABASE_URL, DATABASE_KEY)
