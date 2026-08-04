import { useRef, useState } from "react";
import toast from "react-hot-toast";

function UploadButton({ onUpload }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(event) {
    const file = event.target.files[0];

    if (!file) return;

    setUploading(true);

    try {
      const data = await onUpload(file);

      toast.success(
        `${data.filename} uploaded successfully!\nIndexed ${data.chunks} chunks.`,
        {
          duration: 3000,
        }
      );
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <>
      <button
        className="upload-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "⏳ Uploading..." : "📤 Upload Document"}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.pdf,.docx"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
}

export default UploadButton;