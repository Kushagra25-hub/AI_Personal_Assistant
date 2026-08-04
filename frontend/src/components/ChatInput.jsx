import { useRef } from "react";

function ChatInput({
  message,
  setMessage,
  sendMessage,
  handleKeyDown,
  loading,
  stopGeneration,
}) {
  const textareaRef = useRef(null);

  function handleChange(e) {
    setMessage(e.target.value);

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      textareaRef.current.scrollHeight + "px";
  }

  return (
    <div className="input-area">
      <textarea
        ref={textareaRef}
        placeholder="Type your message..."
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={1}
      />

      {loading ? (
  <button
    className="stop-btn"
    onClick={stopGeneration}
  >
    Stop
  </button>
) : (
  <button
  className="send-btn"
  onClick={() => sendMessage()}
>
  Send
</button>
)}
    </div>
  );
}

export default ChatInput;