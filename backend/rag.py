from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
KNOWLEDGE_DIR = BASE_DIR / "knowledge"

def split_into_chunks(text, chunk_size=500):
    chunks = []

    for i in range(0, len(text), chunk_size):
        chunk = text[i:i + chunk_size]
        chunks.append(chunk)

    return chunks

def load_documents():
    documents = []

    for file in KNOWLEDGE_DIR.glob("*.txt"):

        text = file.read_text(encoding="utf-8")

        chunks = split_into_chunks(text)

        for chunk in chunks:

            documents.append(
                {
                    "source": file.name,
                    "content": chunk
                }
            )

    return documents

def search_documents(query):
    documents = load_documents()
    words = query.lower().split()

    results = []

    for doc in documents:
        content = doc["content"].lower()

        if any(word in content for word in words):
            results.append(doc)

    return results

if __name__ == "__main__":

    docs = load_documents()

    print(f"Total chunks: {len(docs)}")

    for doc in docs:
        print(doc)