import { useRef, useState } from "react";

export function useStreaming() {
  const [loading, setLoading] = useState(false);

  const [assistantStatus, setAssistantStatus] =
    useState("");

  const abortControllerRef = useRef(null);

  function stopGeneration() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  }

  return {
    loading,
    setLoading,

    assistantStatus,
    setAssistantStatus,

    abortControllerRef,

    stopGeneration,
  };
}