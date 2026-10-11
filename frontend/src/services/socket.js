import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socketInstance = null;

/**
 * Get or initialize the singleton Socket.io client.
 */
export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('[SOC Stream] Connected to Real-Time Telemetry Socket:', socketInstance.id);
      socketInstance.emit('join_soc_room');
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[SOC Stream] Disconnected from Telemetry Socket:', reason);
    });

    socketInstance.on('connect_error', (error) => {
      console.debug('[SOC Stream] Telemetry connection attempt:', error.message);
    });
  }

  return socketInstance;
};

export default getSocket;

