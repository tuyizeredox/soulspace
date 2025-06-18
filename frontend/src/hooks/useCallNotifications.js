import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getStoredUserId } from '../utils/tokenManager';

const useCallNotifications = (onIncomingCall, onCallStatusChange) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const userId = getStoredUserId();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      upgrade: true,
      rememberUpgrade: true,
      autoConnect: true,
      timeout: 20000,
      forceNew: true,
      auth: {
        userId: userId,
        userType: 'healthcare' // or determine from user role
      }
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to notification server');
      setIsConnected(true);
      
      // Join user's notification room
      newSocket.emit('join-user-room', {
        userId: userId,
        userType: 'healthcare'
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from notification server:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setIsConnected(false);
    });

    // Call notification handlers
    newSocket.on('incoming-call', (callData) => {
      console.log('📞 Incoming call notification:', callData);
      
      const notification = {
        id: Date.now(),
        type: 'incoming-call',
        title: 'Incoming Call',
        message: `${callData.caller.name} is calling you`,
        data: callData,
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev]);
      
      if (onIncomingCall) {
        onIncomingCall(callData);
      }
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        const browserNotification = new Notification('Incoming Call', {
          body: `${callData.caller.name} is calling you`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `call-${callData.caller.id}`,
          requireInteraction: true,
          actions: [
            { action: 'accept', title: 'Accept' },
            { action: 'decline', title: 'Decline' }
          ]
        });

        browserNotification.onclick = () => {
          window.focus();
          browserNotification.close();
        };

        // Auto close after 30 seconds
        setTimeout(() => {
          browserNotification.close();
        }, 30000);
      }
    });

    newSocket.on('call-ended', (callData) => {
      console.log('📞 Call ended notification:', callData);
      
      if (onCallStatusChange) {
        onCallStatusChange('ended', callData);
      }
      
      const notification = {
        id: Date.now(),
        type: 'call-ended',
        title: 'Call Ended',
        message: `Call with ${callData.caller?.name || 'Unknown'} has ended`,
        data: callData,
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev]);
    });

    newSocket.on('call-accepted', (callData) => {
      console.log('📞 Call accepted notification:', callData);
      
      if (onCallStatusChange) {
        onCallStatusChange('accepted', callData);
      }
    });

    newSocket.on('call-rejected', (callData) => {
      console.log('📞 Call rejected notification:', callData);
      
      if (onCallStatusChange) {
        onCallStatusChange('rejected', callData);
      }
      
      const notification = {
        id: Date.now(),
        type: 'call-rejected',
        title: 'Call Declined',
        message: `${callData.receiver?.name || 'User'} declined your call`,
        data: callData,
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev]);
    });

    // Doctor/Patient status updates
    newSocket.on('doctor-online', (doctorData) => {
      console.log('👨‍⚕️ Doctor came online:', doctorData);
      
      const notification = {
        id: Date.now(),
        type: 'doctor-online',
        title: 'Doctor Available',
        message: `${doctorData.name} is now available for consultations`,
        data: doctorData,
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev]);
    });

    newSocket.on('appointment-reminder', (appointmentData) => {
      console.log('📅 Appointment reminder:', appointmentData);
      
      const notification = {
        id: Date.now(),
        type: 'appointment-reminder',
        title: 'Appointment Reminder',
        message: `Your appointment with ${appointmentData.doctor?.name || 'Doctor'} is in ${appointmentData.minutesUntil} minutes`,
        data: appointmentData,
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev]);
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('Appointment Reminder', {
          body: notification.message,
          icon: '/favicon.ico',
          tag: `appointment-${appointmentData.id}`
        });
      }
    });

    // Cleanup
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [userId, onIncomingCall, onCallStatusChange]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Methods
  const sendCallRequest = (receiverId, callerInfo, callType = 'video') => {
    if (socket && isConnected) {
      const callData = {
        caller: callerInfo,
        receiverId: receiverId,
        callType: callType,
        timestamp: new Date().toISOString(),
        room: `call-${callerInfo.id}-${receiverId}`
      };
      
      socket.emit('call-request', callData);
      
      console.log('📞 Sent call request:', callData);
      return callData.room;
    } else {
      console.error('❌ Socket not connected, cannot send call request');
      return null;
    }
  };

  const acceptCall = (callData) => {
    if (socket && isConnected) {
      socket.emit('call-accepted', {
        ...callData,
        acceptedAt: new Date().toISOString()
      });
      
      console.log('✅ Call accepted:', callData);
    }
  };

  const rejectCall = (callData) => {
    if (socket && isConnected) {
      socket.emit('call-rejected', {
        ...callData,
        rejectedAt: new Date().toISOString()
      });
      
      console.log('❌ Call rejected:', callData);
    }
  };

  const endCall = (callData) => {
    if (socket && isConnected) {
      socket.emit('call-ended', {
        ...callData,
        endedAt: new Date().toISOString()
      });
      
      console.log('📞 Call ended:', callData);
    }
  };

  const updateOnlineStatus = (isOnline, userType = 'doctor') => {
    if (socket && isConnected) {
      socket.emit('update-online-status', {
        userId: userId,
        isOnline: isOnline,
        userType: userType,
        timestamp: new Date().toISOString()
      });
      
      console.log(`👤 Updated online status: ${isOnline ? 'online' : 'offline'}`);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  return {
    socket,
    isConnected,
    notifications,
    sendCallRequest,
    acceptCall,
    rejectCall,
    endCall,
    updateOnlineStatus,
    markNotificationAsRead,
    clearNotifications,
    removeNotification
  };
};

export default useCallNotifications;