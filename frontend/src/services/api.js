const API_URL = "https://aipersonalassistant-production-e525.up.railway.app";

export async function getChats() {
  const response = await fetch(`${API_URL}/chats`);
  return response.json();
}

export async function createChat() {
  const response = await fetch(`${API_URL}/chats`, {
    method: "POST",
  });

  return response.json();
}

export async function deleteChat(chatId) {
  await fetch(`${API_URL}/chats/${chatId}`, {
    method: "DELETE",
  });
}

export async function renameChat(chatId, title) {
  await fetch(`${API_URL}/chats/${chatId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });
}

export async function getDocuments() {
  const response = await fetch(`${API_URL}/documents`);
  return response.json();
}

export async function deleteDocument(filename) {
  await fetch(`${API_URL}/documents/${filename}`, {
    method: "DELETE",
  });
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload-document`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Upload failed");
  }

  return data;
}