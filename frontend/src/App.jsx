import { useState, useRef, useEffect } from "react";
import "./App.css";
import UploadButton from "./components/UploadButton";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import SearchMode from "./components/SearchMode";
import ChatStatus from "./components/ChatStatus"
import { useDocuments } from "./hooks/useDocuments";
import { useChat } from "./hooks/useChat";
import { useStreaming } from "./hooks/useStreaming";


function App() {
  const [message, setMessage] = useState("");
  const {
  chats,
  setChats,
  currentChatId,
  setCurrentChatId,
  loadChats,
  createNewChat,
  deleteChat,
} = useChat();
  const {
    documents,
    loadDocuments,
    uploadDocument,
    deleteDocument,
  } = useDocuments();
  const {
  loading,
  setLoading,

  assistantStatus,
  setAssistantStatus,

  abortControllerRef,

  stopGeneration,
} = useStreaming();
  const [searchMode, setSearchMode] = useState("auto");
  const chatEndRef = useRef(null);
  const currentChat = chats.find(
    (chat) => chat.id === currentChatId
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [currentChat]);

  useEffect(() => {
  loadDocuments();
}, []);

  useEffect(() => {
  loadChats();
}, []);

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  async function regenerateResponse() {

    if (!currentChat) {
      return;
    }

    const messages = currentChat.messages;

    const lastUserIndex = [...messages]
      .map((m) => m.role)
      .lastIndexOf("user");

    if (lastUserIndex === -1) return;

    const lastUser = messages[lastUserIndex];

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id !== currentChatId) return chat;

        return {
          ...chat,
          messages: chat.messages.slice(
            0,
            lastUserIndex + 1
          ),
        };
      })
    );

    setTimeout(() => {
      sendMessage(lastUser.text, true);
    }, 0);
  }

  async function sendMessage(
    customPrompt = null,
    regenerate = false
  ) {

    const prompt =
  typeof customPrompt === "string"
    ? customPrompt
    : message;

    const generatedTitle =
      prompt.length > 30
        ? prompt.substring(0, 30) + "..."
        : prompt;

    if (!prompt.trim() || !currentChatId) return;

    const userMessage = {
      role: "user",
      text: prompt,
    };

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id !== currentChatId) return chat;

        return {
          ...chat,
          title:
            chat.title === "New Chat"
              ? generatedTitle
              : chat.title,
          messages: regenerate
            ? chat.messages
            : [...chat.messages, userMessage],
        };
      })
    );

    if (!customPrompt) {
      setMessage("");
    }

    setLoading(true);

    setAssistantStatus("🤖 Deciding the best source...");

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(
        "http://127.0.0.1:8000/chat-stream",
        {
          signal: abortControllerRef.current.signal,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: currentChatId,
            message: prompt,
            mode: searchMode,
          }),
        }
      );

      if (searchMode === "documents") {
    setAssistantStatus("📄 Searching documents...");
}
else if (searchMode === "web") {
    setAssistantStatus("🌐 Searching the web...");
}
else if (searchMode === "both") {
    setAssistantStatus("📚 Searching documents & web...");
}
else {
    setAssistantStatus("🤖 Choosing the best source...");
}

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const assistantMessage = {
        role: "assistant",
        text: "",
        sources: [],
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  assistantMessage,
                ],
              }
            : chat
        )
      );

      let result = "";
      setAssistantStatus("💬 Generating answer...");
      let firstChunk = true;

      while (true) {
        const { done, value } =await reader.read();

        if (done) break;

        if (firstChunk) {
          firstChunk = false;
        }

        const chunk = decoder.decode(value);

        result += chunk;

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  messages: chat.messages.map(
                    (msg, index) =>
                      index ===
                      chat.messages.length - 1
                        ? {
                            ...msg,
                            text: result,
                          }
                        : msg
                  ),
                }
              : chat
          )
        );
      }
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      console.error(error);

      const errorMessage = {
        role: "assistant",
        text: "Something went wrong.",
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  errorMessage,
                ],
              }
            : chat
        )
      );
    } finally {
      setAssistantStatus("");
      setLoading(false);
      abortControllerRef.current = null;
    }
  }

  return (
    <div className="app">
      <Sidebar
  chats={chats}
  documents={documents}
  currentChatId={currentChatId}
  setCurrentChatId={setCurrentChatId}
  createNewChat={createNewChat}
  deleteChat={deleteChat}
  deleteDocument={deleteDocument}
  onUpload={uploadDocument}
/>
      <div className="main-content">
        <h1>🤖 AI Personal Assistant</h1>

        <ChatWindow
          messages={currentChat?.messages ?? []}
          loading={loading}
          chatEndRef={chatEndRef}
          onExampleClick={sendMessage}
          sendMessage={sendMessage}
          regenerateResponse={regenerateResponse}
        />

        <div className="search-mode">
  <SearchMode
  searchMode={searchMode}
  setSearchMode={setSearchMode}
/>
</div>

<ChatStatus
    loading={loading}
    assistantStatus={assistantStatus}
/>

        <ChatInput
    message={message}
    setMessage={setMessage}
    sendMessage={sendMessage}
    handleKeyDown={handleKeyDown}
    regenerateResponse={regenerateResponse}
    loading={loading}
    stopGeneration={stopGeneration}
/>
      </div>
    </div>
  );
}

export default App;