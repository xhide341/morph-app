import { useEffect, useState } from "react";
import { wsService } from "../services/websocket_service";

export const WebSocketTest = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    // Connect to WebSocket
    wsService.connect("test-room");

    // Subscribe to test messages
    wsService.subscribe("test", (data) => {
      setMessages((prev) => [...prev, data.payload]);
    });

    return () => {
      wsService.disconnect();
    };
  }, []);

  const sendMessage = () => {
    wsService.send({
      type: "test",
      payload: inputMessage,
    });
    setInputMessage("");
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">WebSocket Test</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="rounded border p-2"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Send
          </button>
        </div>
      </div>
      <div className="rounded border p-4">
        <h3 className="mb-2 font-semibold">Messages:</h3>
        {messages.map((msg, index) => (
          <div key={index} className="mb-1">
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
};
