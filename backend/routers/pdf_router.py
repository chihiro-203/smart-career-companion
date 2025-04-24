from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from services import parse_pdf, upload_pdf_to_supabase
from core.logger import logger


router = APIRouter(
    prefix="/pdf_parser",
    tags=["pdf_parser"],
    responses={
        404: {"description": "Not found"},
        500: {"description": "Internal server error"},
    },
)

@router.post("/upload")
async def upload_pdf(pdf_file: UploadFile = File(...)):
    try:
        logger.info(f"Received file: {pdf_file.filename}")

        # Step 1: Parse the file
        parsed_text = parse_pdf(pdf_file)

        # Step 2: Upload the file to Supabase
        pdf_file.file.seek(0)  # rewind file for re-read
        supabase_url = await upload_pdf_to_supabase(pdf_file)

        logger.info(f"File uploaded to Supabase: {supabase_url}")

        return {
            "message": "PDF parsed and uploaded successfully",
            "text": parsed_text,
            "supabase_url": supabase_url
        }
    except Exception as e:
        logger.error(f"PDF processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    