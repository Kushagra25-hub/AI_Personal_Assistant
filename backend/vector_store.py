from sentence_transformers import SentenceTransformer
import chromadb

from backend.rag import (
    load_documents,
    split_into_chunks,
)

model = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.PersistentClient(path="chroma_db")

collection = client.get_or_create_collection(
    name="knowledge"
)


def index_documents():

    # Clear old vectors
    existing = collection.get()

    if existing["ids"]:
        collection.delete(ids=existing["ids"])

    documents = load_documents()

    for i, doc in enumerate(documents):

        embedding = model.encode(doc["content"]).tolist()

        collection.add(
            ids=[str(i)],
            documents=[doc["content"]],
            embeddings=[embedding],
            metadatas=[
                {
                    "source": doc["source"],
                    "chunk": i
                }
            ]
        )

    print(f"Indexed {len(documents)} chunks.")


def index_text(text: str, source: str):

    chunks = split_into_chunks(text)

    start_id = collection.count()

    for i, chunk in enumerate(chunks):

        embedding = model.encode(chunk).tolist()

        collection.add(
            ids=[str(start_id + i)],
            documents=[chunk],
            embeddings=[embedding],
            metadatas=[
                {
                    "source": source,
                    "chunk": i
                }
            ]
        )

    return len(chunks)


def search_documents(query, n_results=3):

    query_embedding = model.encode(query).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )

    return {
        "documents": results["documents"][0],
        "metadatas": results["metadatas"][0]
    }


def get_documents():

    results = collection.get()

    documents = set()

    for metadata in results["metadatas"]:
        documents.add(metadata["source"])

    return sorted(documents)


if __name__ == "__main__":

    results = search_documents(
        "What are React components?"
    )

    print(results)

def delete_document(source: str):
    """
    Delete all chunks belonging to a document.
    """

    results = collection.get(
        where={"source": source}
    )

    if results["ids"]:
        collection.delete(ids=results["ids"])

    return len(results["ids"])