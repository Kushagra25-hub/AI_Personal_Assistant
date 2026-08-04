function ChatList({
  chats,
  currentChatId,
  setCurrentChatId,
  deleteChat,
}) {
  return (
    <div className="chat-list">
      <h3>💬 Chats</h3>

      {chats.map((chat) => (
        <div
          key={chat.id}
          className={
            currentChatId === chat.id
              ? "chat-item active"
              : "chat-item"
          }
        >
          <span
            onClick={() => setCurrentChatId(chat.id)}
            style={{ flex: 1, cursor: "pointer" }}
          >
            💬 {chat.title}
          </span>

          <button
            className="delete-btn"
            onClick={() => deleteChat(chat.id)}
          >
            🗑
          </button>
        </div>
      ))}
    </div>
  );
}

export default ChatList;