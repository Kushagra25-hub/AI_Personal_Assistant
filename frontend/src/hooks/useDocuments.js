import { useState } from "react";
import {
  getDocuments,
  uploadDocument as uploadDocumentAPI,
  deleteDocument as deleteDocumentAPI,
} from "../services/api";

export function useDocuments() {
  const [documents, setDocuments] = useState([]);

  async function loadDocuments() {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to load documents:", error);
    }
  }

  async function uploadDocument(file) {
    try {
      const data = await uploadDocumentAPI(file);

      await loadDocuments();

      return data;
    } catch (error) {
      console.error("Failed to upload document:", error);
      throw error;
    }
  }

  async function deleteDocument(filename) {
    try {
      await deleteDocumentAPI(filename);

      setDocuments((prev) =>
        prev.filter((doc) =>
          typeof doc === "string"
            ? doc !== filename
            : doc.filename !== filename
        )
      );
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  }

  return {
    documents,
    loadDocuments,
    uploadDocument,
    deleteDocument,
  };
}