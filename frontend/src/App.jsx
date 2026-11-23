import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
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
import { API_URL } from "./services/api";


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

    if (!prompt.trim()) return;

    let activeChatId = currentChatId;
    if (!activeChatId) {
      const newChat = await createNewChat();
      if (newChat?.id) {
        activeChatId = newChat.id;
      } else {
        toast.error("Failed to connect to backend server. Please verify the backend is running.");
        return;
      }
    }

    const generatedTitle =
      prompt.length > 30
        ? prompt.substring(0, 30) + "..."
        : prompt;

    const userMessage = {
      role: "user",
      text: prompt,
    };

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id !== activeChatId) return chat;

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

    let assistantMessageAdded = false;

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(
        `${API_URL}/chat-stream`,
        {
          signal: abortControllerRef.current.signal,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: activeChatId,
            message: prompt,
            mode: searchMode,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server error (${response.status})`);
      }

      if (searchMode === "documents") {
        setAssistantStatus("📄 Searching documents...");
      } else if (searchMode === "web") {
        setAssistantStatus("🌐 Searching the web...");
      } else if (searchMode === "both") {
        setAssistantStatus("📚 Searching documents & web...");
      } else {
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
          chat.id === activeChatId
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
      assistantMessageAdded = true;

      let result = "";
      setAssistantStatus("💬 Generating answer...");

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        result += chunk;

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  messages: chat.messages.map(
                    (msg, index) =>
                      index === chat.messages.length - 1
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

      console.error("Chat error:", error);

      const errorMessageText = error.message?.includes("Failed to fetch")
        ? "Could not connect to backend server. Make sure it is running on http://127.0.0.1:8000"
        : `Something went wrong: ${error.message || "Unknown error"}`;

      const errorMessage = {
        role: "assistant",
        text: errorMessageText,
      };

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id !== activeChatId) return chat;

          if (assistantMessageAdded && chat.messages.length > 0) {
            return {
              ...chat,
              messages: chat.messages.map((msg, idx) =>
                idx === chat.messages.length - 1 ? errorMessage : msg
              ),
            };
          }

          return {
            ...chat,
            messages: [...chat.messages, errorMessage],
          };
        })
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