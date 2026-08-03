# 🤖 AI Personal Assistant

An AI-powered Personal Assistant built with **React**, **FastAPI**, **Groq LLM**, and **ChromaDB**. The assistant supports Retrieval-Augmented Generation (RAG), document uploads, semantic search, web search, and real-time streaming responses.

---

## 🚀 Features

- 💬 Multi-chat conversations
- ⚡ Real-time streaming AI responses
- ⏹ Stop response generation
- 🔄 Regenerate AI responses
- 📚 Retrieval-Augmented Generation (RAG)
- 📄 Upload PDF, DOCX, TXT & Markdown documents
- 🧠 Semantic document search with ChromaDB
- 🌐 Integrated Web Search
- 🔍 Multiple Search Modes
  - Auto
  - Documents
  - Web
  - Both
- 📝 Markdown support
- 💻 Syntax highlighted code blocks
- 📋 Copy generated code
- 💾 Persistent chat history
- 🎨 Responsive modern UI

---

# 🛠 Tech Stack

### Frontend
- React
- Vite
- React Markdown
- Highlight.js
- React Hot Toast

### Backend
- FastAPI
- Groq API (Llama 3.3 70B)
- ChromaDB
- Sentence Transformers
- SQLite
- Python

---

# 📁 Project Structure

```
AI_Personal_Assistant/
│
├── backend/
│   ├── services/
│   ├── ai.py
│   ├── database.py
│   ├── vector_store.py
│   ├── document_loader.py
│   ├── rag.py
│   ├── main.py
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── requirements.txt
├── README.md
└── .gitignore
```

---

# ⚙️ Installation

## Clone the repository

```bash
git clone https://github.com/Kushagra25-hub/AI_Personal_Assistant.git

cd AI_Personal_Assistant
```

---

## Backend Setup

Create a virtual environment

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the backend (or project root, depending on your configuration):

```env
GROQ_API_KEY=your_groq_api_key
```

Start the backend

```bash
uvicorn backend.main:app --reload
```

Backend URL

```
http://127.0.0.1:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# 📚 Usage

1. Create a new chat.
2. Upload one or more documents.
3. Select a search mode:
   - Auto
   - Documents
   - Web
   - Both
4. Ask questions.
5. Receive real-time AI responses.

---

# 🔍 Search Modes

### 🤖 Auto
Automatically chooses the most suitable source.

### 📄 Documents
Answers using uploaded documents only.

### 🌐 Web
Answers using web search only.

### 📚 Both
Combines uploaded documents and web search.

# 🔮 Planned Features

- 📚 Source citations
- 🎤 Voice assistant
- 🌙 Dark mode
- 📄 Export chats
- 🧠 Long-term conversation memory
- 🤖 Multiple LLM support
- 👤 User authentication

---

# 👨‍💻 Author

**Kushagra**

- GitHub: https://github.com/Kushagra25-hub

If you found this project helpful, consider giving it a ⭐ on GitHub!
