import UploadButton from "./UploadButton";

function KnowledgeBase({
  documents,
  onUpload,
  deleteDocument,
}) {
  return (
    <div className="knowledge-base">
      <h3>📚 Knowledge Base</h3>

      {documents.length === 0 ? (
        <p className="empty-text">
          No documents uploaded.
        </p>
      ) : (
        documents.map((doc) => (
          <div
            key={doc}
            className="document-item"
          >
            <span>📄 {doc}</span>

            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteDocument(doc);
              }}
            >
              🗑
            </button>
          </div>
        ))
      )}

      <UploadButton onUpload={onUpload} />
    </div>
  );
}

export default KnowledgeBase;