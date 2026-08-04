function ChatStatus({
  loading,
  assistantStatus,
}) {
  if (!loading || !assistantStatus) {
    return null;
  }

  return (
    <div className="assistant-status">
      {assistantStatus}
    </div>
  );
}

export default ChatStatus;