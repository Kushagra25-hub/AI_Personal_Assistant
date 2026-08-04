import ChatList from "./ChatList";
import KnowledgeBase from "./KnowledgeBase";
import UploadButton from "./UploadButton";

function Sidebar({
  chats,
  currentChatId,
  setCurrentChatId,
  createNewChat,
  deleteChat,
  documents,
  onUpload,
  deleteDocument,
}) {
  return (
    <div className="sidebar">
      <button
        className="new-chat-btn"
        onClick={createNewChat}
      >
        + New Chat
      </button>

      <ChatList
        chats={chats}
        currentChatId={currentChatId}
        setCurrentChatId={setCurrentChatId}
        deleteChat={deleteChat}
      />

      <hr className="sidebar-divider" />

      <KnowledgeBase
    documents={documents}
    onUpload={onUpload}
    deleteDocument={deleteDocument}
/>
    </div>
  );
}

export default Sidebar;