function SearchMode({
  searchMode,
  setSearchMode,
}) {
  return (
    <div className="search-mode-buttons">

      <button
        className={
          searchMode === "auto"
            ? "active"
            : ""
        }
        onClick={() => setSearchMode("auto")}
      >
        🤖 Auto
      </button>

      <button
        className={
          searchMode === "documents"
            ? "active"
            : ""
        }
        onClick={() =>
          setSearchMode("documents")
        }
      >
        📄 Documents
      </button>

      <button
        className={
          searchMode === "web"
            ? "active"
            : ""
        }
        onClick={() => setSearchMode("web")}
      >
        🌐 Web
      </button>

      <button
        className={
          searchMode === "both"
            ? "active"
            : ""
        }
        onClick={() => setSearchMode("both")}
      >
        📚 Both
      </button>

    </div>
  );
}

export default SearchMode;