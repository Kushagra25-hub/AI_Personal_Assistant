import ChatMessage from "./ChatMessage";
import WelcomeScreen from "./WelcomeScreen";

function ChatWindow({
  messages,
  loading,
  chatEndRef,
  regenerateResponse,
  sendMessage,
}) {
  const lastAssistantIndex = [...messages]
    .map((msg) => msg.role)
    .lastIndexOf("assistant");

  return (
    <div className="chat-container">
      {messages.length === 0 ? (
        <WelcomeScreen
    onExampleClick={sendMessage}
/>
      ) : (
        messages.map((msg, index) => (
          <ChatMessage
            key={index}
            role={msg.role}
            text={msg.text}
            isLastAssistant={index === lastAssistantIndex}
            loading={loading}
            onRegenerate={regenerateResponse}
          />
        ))
      )}

      {loading && (
        <div className="thinking-indicator">
          <div className="thinking-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <span>AI is thinking...</span>
        </div>
      )}

      <div ref={chatEndRef}></div>
    </div>
  );
}

export default ChatWindow;