import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";

function ChatMessage({
  role,
  text,
  isLastAssistant,
  loading,
  onRegenerate,
  sources = [],
}) {
  const avatar = role === "assistant" ? "🤖" : "👤";

  return (
    <div className={`message-row ${role}`}>
      <div className={`avatar ${role}`}>
        {avatar}
      </div>

      <div className={`message ${role}`}>
        <div className="markdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({
                inline,
                className,
                children,
                ...props
              }) {
                const match =
                  /language-(\w+)/.exec(className || "");

                if (!inline && match) {
                  return (
                    <CodeBlock language={match[1]}>
                      {String(children).replace(/\n$/, "")}
                    </CodeBlock>
                  );
                }

                return (
                  <code
                    className={className}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {text}
          </ReactMarkdown>
          
        </div>
        {sources.length > 0 && (
    <div className="sources">
      <h4>Sources</h4>

      {sources.map((source, index) => (
        <div key={index} className="source-item">
          {source.type === "document" ? "📄" : "🌐"}{" "}

          {source.type === "document" ? (
            source.source
          ) : (
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
            >
              {source.title || source.url}
            </a>
          )}
        </div>
      ))}
    </div>
  )}

        {role === "assistant" &&
  isLastAssistant &&
  !loading && (
            <div className="message-actions">
  <button
    className="copy-btn"
    onClick={() => navigator.clipboard.writeText(text)}
  >
    📋 Copy
  </button>

  <button
    className="regenerate-btn"
    onClick={onRegenerate}
  >
    🔄 Regenerate
  </button>
</div>
          )}
      </div>
    </div>
  );
}

export default ChatMessage;