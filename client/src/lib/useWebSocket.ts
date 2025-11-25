import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socketUrl = `${protocol}//${window.location.host}`;
    
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
  };
}
