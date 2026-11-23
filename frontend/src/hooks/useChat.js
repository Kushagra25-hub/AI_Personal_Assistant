import { useState } from "react";
import {
  getChats,
  createChat,
  deleteChat as deleteChatAPI,
  renameChat,
} from "../services/api";

export function useChat() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  async function loadChats() {
    try {
      const data = await getChats();

      if (data && data.length > 0) {
        setChats(data);
        setCurrentChatId(data[0].id);
      } else {
        const newChat = await createChat();
        setChats([newChat]);
        setCurrentChatId(newChat.id);
      }
    } catch (err) {
      console.error("Failed to load chats:", err);
    }
  }

  async function createNewChat() {
    try {
      const newChat = await createChat();

      setChats((prev) => [...prev, newChat]);
      setCurrentChatId(newChat.id);
      return newChat;
    } catch (err) {
      console.error("Failed to create new chat:", err);
      return null;
    }
  }

  async function deleteChat(chatId) {
    try {
      await deleteChatAPI(chatId);

      const updatedChats = chats.filter(
        (chat) => chat.id !== chatId
      );

      if (updatedChats.length > 0) {
        setChats(updatedChats);
        if (currentChatId === chatId) {
          setCurrentChatId(updatedChats[0].id);
        }
      } else {
        const newChat = await createChat();
        setChats([newChat]);
        setCurrentChatId(newChat.id);
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  }

  async function updateChatTitle(chatId, title) {
    try {
      await renameChat(chatId, title);

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, title }
            : chat
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  return {
    chats,
    setChats,

    currentChatId,
    setCurrentChatId,

    loadChats,
    createNewChat,
    deleteChat,
    updateChatTitle,
  };
}