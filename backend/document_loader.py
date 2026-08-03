from fastapi import UploadFile
from pypdf import PdfReader
from docx import Document
import io


def extract_text(file: UploadFile) -> str:
    """
    Extract text from TXT, MD, PDF, and DOCX files.
    """

    filename = file.filename.lower()

    # ---------- TXT / MD ----------
    if filename.endswith(".txt") or filename.endswith(".md"):
        return file.file.read().decode("utf-8")

    # ---------- PDF ----------
    elif filename.endswith(".pdf"):

        pdf = PdfReader(io.BytesIO(file.file.read()))

        text = ""

        for page in pdf.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text

    # ---------- DOCX ----------
    elif filename.endswith(".docx"):

        document = Document(io.BytesIO(file.file.read()))

        text = "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
        )

        return text

    # ---------- Unsupported ----------
    raise ValueError(
        "Unsupported file type. "
        "Please upload TXT, MD, PDF, or DOCX."
    )