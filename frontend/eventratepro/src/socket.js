import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // Flask backend URL & port

export const socket = io(SOCKET_URL, {
  autoConnect: false, // connect manually
});
