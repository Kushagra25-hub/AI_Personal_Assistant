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

      setChats(data);

      if (data.length > 0) {
        setCurrentChatId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function createNewChat() {
    try {
      const newChat = await createChat();

      setChats((prev) => [...prev, newChat]);
      setCurrentChatId(newChat.id);
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteChat(chatId) {
    try {
      await deleteChatAPI(chatId);

      const updatedChats = chats.filter(
        (chat) => chat.id !== chatId
      );

      setChats(updatedChats);

      if (currentChatId === chatId) {
        if (updatedChats.length > 0) {
          setCurrentChatId(updatedChats[0].id);
        } else {
          setCurrentChatId(null);
        }
      }
    } catch (err) {
      console.error(err);
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