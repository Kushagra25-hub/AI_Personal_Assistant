from fastapi.responses import StreamingResponse
import time
from fastapi import UploadFile, File
from backend.document_loader import extract_text
from backend.vector_store import index_text , get_documents 
from backend.database import initialize_database
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from backend.services.web_search import search_web
from backend.database import (
    initialize_database,
    create_chat,
    get_all_chats,
    get_chat,
    save_message,
    delete_chat,
    rename_chat,
    auto_title,
    get_chat_by_id,
    get_messages,
)
# from backend.vector_store import (
#     index_text,
#     get_documents,
#     delete_document,
# )
# from backend.ai import (
#     chat_with_ai,
#     stream_chat_with_ai,
#     LAST_SOURCES,
# )

app = FastAPI()

initialize_database()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    chat_id: int
    message: str
    mode: str = "documents"

class RenameChatRequest(BaseModel):
    title: str


@app.get("/")
def home():
    return {
        "message": "Welcome to AI Personal Assistant!"
    }



@app.get("/chats")
def get_chats():
    chats = get_all_chats()

    result = []

    for chat in chats:
        result.append(
            {
                "id": chat["id"],
                "title": chat["title"],
                "messages": get_chat(chat["id"])
            }
        )

    return result


@app.post("/chats")
def new_chat():
    return create_chat()


# @app.post("/chat")
# def chat(request: ChatRequest):

#     chat = get_chat_by_id(request.chat_id)

#     if chat and chat["title"] == "New Chat":
#         rename_chat(
#             request.chat_id,
#             auto_title(request.message)
#         )

#     response = chat_with_ai(
#         request.chat_id,
#         request.message,
#         request.mode,
#     )

#     return {
#         "response": response
#     }

@app.delete("/chats/{chat_id}")
def remove_chat(chat_id: int):
    delete_chat(chat_id)

    return {
        "message": "Chat deleted successfully."
    }

@app.put("/chats/{chat_id}")
def rename(chat_id: int, request: RenameChatRequest):
    rename_chat(chat_id, request.title)

    return {
        "message": "Chat renamed successfully."
    }

@app.get("/stream-test")
def stream_test():

    def generate():
        words = [
            "Hello ",
            "from ",
            "FastAPI ",
            "streaming!"
        ]

        for word in words:
            yield word
            time.sleep(0.5)

    return StreamingResponse(
        generate(),
        media_type="text/plain"
    )

# @app.post("/chat-stream")
# def chat_stream(request: ChatRequest):

#     chat = get_chat_by_id(request.chat_id)

#     if chat and chat["title"] == "New Chat":
#         rename_chat(
#             request.chat_id,
#             auto_title(request.message)
#         )

#     return StreamingResponse(
#         stream_chat_with_ai(
#             request.chat_id,
#             request.message,
#             request.mode,
#         ),
#         media_type="text/plain"
#     )

from fastapi import HTTPException


# @app.post("/upload-document")
# def upload_document(file: UploadFile = File(...)):
#     try:
#         text = extract_text(file)

#         if not text.strip():
#             raise HTTPException(
#                 status_code=400,
#                 detail="No readable text found in the document."
#             )

#         chunks = index_text(
#             text,
#             file.filename
#         )

#         return {
#             "message": "Document indexed successfully.",
#             "filename": file.filename,
#             "chunks": chunks
#         }

#     except ValueError as e:
#         raise HTTPException(
#             status_code=400,
#             detail=str(e)
#         )

#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Failed to process document: {e}"
#         )

@app.get("/documents")
def documents():

    return get_documents()

# @app.delete("/documents/{filename}")
# def remove_document(filename: str):

#     deleted = delete_document(filename)

#     return {
#         "message": "Document deleted successfully.",
#         "deleted_chunks": deleted,
#     }

@app.get("/web-search")
def web_search(q: str):
    return search_web(q)

# @app.get("/chat-sources/{chat_id}")
# def get_chat_sources(chat_id: int):
#     return LAST_SOURCES.get(chat_id, [])