function WelcomeScreen({ onExampleClick }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <h1>🤖 AI Personal Assistant</h1>

        <p>
          Ask anything or upload documents to chat with your knowledge base.
        </p>

        <div className="example-prompts">
          <h3>Try asking:</h3>

          <button
            className="example-card"
            onClick={() =>
              onExampleClick("Summarize the uploaded document.")
            }
          >
            📄 Summarize this PDF
          </button>

          <button
            className="example-card"
            onClick={() =>
              onExampleClick("Explain React Hooks with examples.")
            }
          >
            ⚛ Explain React Hooks
          </button>

          <button
            className="example-card"
            onClick={() =>
              onExampleClick("Write a Python script to read a CSV file.")
            }
          >
            💻 Write a Python script
          </button>

          <button
            className="example-card"
            onClick={() =>
              onExampleClick("Compare the uploaded documents.")
            }
          >
            📊 Compare two documents
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;