from PyPDF2 import PdfReader
from fastapi import UploadFile
import tempfile
import uuid
from core import supabase, settings

def parse_pdf(file: UploadFile) -> str:
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(file.file.read())
        tmp_path = tmp.name

    # Read PDF content
    reader = PdfReader(tmp_path)
    full_text = ""
    for page in reader.pages:
        full_text += page.extract_text() or ""
    return full_text

async def upload_pdf_to_supabase(file: UploadFile) -> str:
    # Create a unique filename
    file_ext = file.filename.split(".")[-1]
    new_filename = f"{uuid.uuid4()}.{file_ext}"

    # Read the file
    file_content = await file.read()

    # Upload to Supabase storage
    response = supabase.storage.from_(settings.SUPABASE_BUCKET_NAME).upload(
        path=new_filename,
        file=file_content,
        file_options={"content-type": file.content_type}
    )

    if "error" in response:
        raise Exception("Upload to Supabase failed")

    # Get public URL (optional)
    public_url = supabase.storage.from_(settings.SUPABASE_BUCKET_NAME).get_public_url(new_filename)
    return public_url
    