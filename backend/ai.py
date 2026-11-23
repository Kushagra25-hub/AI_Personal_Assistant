from groq import Groq

from backend.services.web_search import search_web
from backend.vector_store import search_documents
from backend.config import GROQ_API_KEY, GROQ_MODEL
from backend.chat_memory import SYSTEM_PROMPT
from backend.database import (
    save_message,
    get_messages,
)

LAST_SOURCES = {}

client = Groq(api_key=GROQ_API_KEY)


def choose_mode(message: str) -> str:
    """
    Decide whether the query should use:
    - documents
    - web
    - both
    """
    try:
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": """
You are a routing assistant.

Reply with ONLY one word:
documents
web
both

Rules:
- If the question is about uploaded company/internal documents -> documents
- If it requires current or recent information -> web
- If it needs both internal documents and public information -> both

Never explain your answer.
""",
                },
                {
                    "role": "user",
                    "content": message,
                },
            ],
            temperature=0,
        )

        mode = completion.choices[0].message.content.strip().lower()

        if mode not in ["documents", "web", "both"]:
            mode = "documents"

        print("Chosen mode:", mode)
        return mode
    except Exception as e:
        print("Routing Error (defaulting to documents):", e)
        return "documents"


def build_rag_context(message: str, mode: str = "documents"):
    context = ""
    sources = []

    # ---------- Documents ----------
    if mode in ["documents", "both"]:
        try:
            results = search_documents(message)

            documents = results.get("documents", [])
            metadatas = results.get("metadatas", [])

            for document, metadata in zip(documents, metadatas):
                context += f"Source: {metadata['source']}\n"
                context += document
                context += "\n\n"

            for metadata in metadatas:
                sources.append(
                    {
                        "type": "document",
                        "source": metadata["source"],
                    }
                )
        except Exception as e:
            print("Document search error:", e)

    # ---------- Web ----------
    if mode in ["web", "both"]:
        try:
            web = search_web(message)

            for item in web.get("results", []):
                context += f"Web Source: {item['url']}\n"
                context += item.get("content", "")
                context += "\n\n"

                sources.append(
                    {
                        "type": "web",
                        "title": item.get("title", ""),
                        "url": item["url"],
                    }
                )
        except Exception as e:
            print("Web search error:", e)

    return {
        "context": context,
        "sources": sources,
    }


def build_conversation(
    chat_id: int,
    message: str,
    mode: str = "documents",
):
    """
    Build the complete conversation history including:
    - System prompt
    - Previous chat history
    - RAG context
    """

    conversation = [SYSTEM_PROMPT.copy()]

    conversation.extend(
        get_messages(chat_id, limit=10)
    )

    if mode == "auto":
        mode = choose_mode(message)

    rag = build_rag_context(message, mode)
    context = rag["context"]
    sources = rag["sources"]

    if context.strip():
        conversation.append(
            {
                "role": "system",
                "content": (
                    "Use the following information to answer the user's question. "
                    "If the information is relevant, base your answer on it.\n\n"
                    f"{context}"
                ),
            }
        )

    # Add the current user message
    conversation.append(
        {
            "role": "user",
            "content": message,
        }
    )

    return conversation, sources


def chat_with_ai(
    chat_id: int,
    message: str,
    mode: str = "documents",
):
    """
    Non-streaming chat.
    """

    save_message(chat_id, "user", message)

    conversation, sources = build_conversation(
        chat_id,
        message,
        mode,
    )

    try:
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=conversation,
        )

        ai_response = completion.choices[0].message.content

        save_message(
            chat_id,
            "assistant",
            ai_response,
        )

        return {
            "answer": ai_response,
            "sources": sources,
        }

    except Exception as e:
        print("Groq Error:", repr(e))
        return f"Error: {e}"


def stream_chat_with_ai(
    chat_id: int,
    message: str,
    mode: str = "documents",
):
    """
    Streaming chat.
    """

    save_message(chat_id, "user", message)

    try:
        conversation, sources = build_conversation(
            chat_id,
            message,
            mode,
        )
    except Exception as e:
        print("Error building conversation:", e)
        error_msg = f"Error preparing context: {e}"
        yield error_msg
        save_message(chat_id, "assistant", error_msg)
        LAST_SOURCES[chat_id] = []
        return

    try:
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=conversation,
            stream=True,
        )

        full_response = ""

        for chunk in completion:
            delta = chunk.choices[0].delta.content

            if delta:
                full_response += delta
                yield delta

        save_message(
            chat_id,
            "assistant",
            full_response,
        )

        LAST_SOURCES[chat_id] = sources

    except Exception as e:
        print("Groq Streaming Error:", repr(e))
        error_msg = f"Sorry, an error occurred while generating the response: {e}"
        yield error_msg
        save_message(chat_id, "assistant", error_msg)
        LAST_SOURCES[chat_id] = []

