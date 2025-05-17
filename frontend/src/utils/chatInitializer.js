/**
 * Utility functions for initializing chat functionality consistently
 * across doctor and patient chat interfaces
 */

import axios from './axiosConfig';
import { makeRequest } from './requestManager';
import { loadChatHistory, saveChatHistory, isStorageAvailable } from './chatStorage';

/**
 * Initialize a chat session with proper error handling and caching
 * @param {Object} params - Parameters for chat initialization
 * @param {string} params.targetUserId - ID of the user to chat with (doctor or patient)
 * @param {Object} params.currentUser - Current user object
 * @param {Function} params.accessChat - Function to access or create a chat
 * @param {Function} params.fetchMessages - Function to fetch messages
 * @param {Function} params.setChatId - State setter for chat ID
 * @param {Function} params.setMessages - State setter for messages
 * @param {Function} params.setLoading - State setter for loading state
 * @param {Function} params.setConnectionError - State setter for connection error state
 * @param {Function} params.fetchUserDetails - Function to fetch details of the target user
 * @param {Function} params.scrollToBottom - Function to scroll to bottom of messages
 * @returns {Promise<Object>} - Result of the initialization
 */
export const initializeChat = async ({
  targetUserId,
  currentUser,
  accessChat,
  fetchMessages,
  setChatId,
  setMessages,
  setLoading,
  setConnectionError,
  fetchUserDetails,
  scrollToBottom,
  setSelectedChat
}) => {
  if (!targetUserId || !currentUser) {
    return { success: false, error: 'Missing required parameters' };
  }

  // Track performance metrics
  const startTime = performance.now();
  const requestId = `init-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  try {
    setLoading(true);
    console.log(`[${requestId}] Initializing chat with user ID: ${targetUserId}`);

    // STEP 1: Get authentication token
    const authToken = localStorage.getItem('token') ||
                     localStorage.getItem('userToken') ||
                     localStorage.getItem('patientToken') ||
                     localStorage.getItem('persistentToken');

    if (authToken) {
      console.log(`[${requestId}] Using authentication token`);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      setConnectionError(false);
    } else {
      console.error(`[${requestId}] No authentication token found`);
      setConnectionError(true);
      throw new Error('Authentication token not found');
    }

    // STEP 2: Check if localStorage is available
    const storageAvailable = isStorageAvailable();
    console.log(`[${requestId}] localStorage available: ${storageAvailable}`);

    // Check for cached chat ID and messages for immediate display
    let cachedChatId = null;
    if (storageAvailable) {
      try {
        cachedChatId = localStorage.getItem(`chat_${targetUserId}`);
        if (cachedChatId) {
          console.log(`[${requestId}] Found cached chat ID: ${cachedChatId}`);
          setChatId(cachedChatId);

          // Try to load cached messages for immediate display
          try {
            const cachedMessages = loadChatHistory(cachedChatId);
            if (cachedMessages && cachedMessages.length > 0) {
              console.log(`[${requestId}] Using ${cachedMessages.length} cached messages for immediate display`);
              setMessages(cachedMessages);
              setTimeout(scrollToBottom, 100);
            }
          } catch (cacheError) {
            console.error(`[${requestId}] Error loading cached messages:`, cacheError);
          }
        }
      } catch (storageError) {
        console.error(`[${requestId}] Error accessing localStorage:`, storageError);
      }
    }

    // STEP 3: Check if backend is available - use a more reliable endpoint
    let isBackendAvailable = true;
    try {
      // Use a more reliable endpoint that we know exists
      await axios.get('/api/chats', {
        timeout: 2000,
        // Add cache-busting parameter to prevent caching
        params: { _t: Date.now() }
      });
      console.log(`[${requestId}] Backend is available - chats endpoint responded`);
    } catch (pingError) {
      console.warn(`[${requestId}] Backend may not be available:`, pingError);

      // Try another endpoint as fallback
      try {
        await axios.get('/api/users/current', {
          timeout: 2000,
          params: { _t: Date.now() }
        });
        console.log(`[${requestId}] Backend is available - users endpoint responded`);
        isBackendAvailable = true;
      } catch (secondError) {
        console.warn(`[${requestId}] Second backend check also failed:`, secondError);
        isBackendAvailable = false;

        // If we have cached data, we can continue in offline mode
        if (cachedChatId) {
          console.log(`[${requestId}] Using cached data in offline mode`);
          setLoading(false);
          return { success: true, offline: true, chatId: cachedChatId };
        }
      }
    }

    // STEP 4: Fetch user details and access chat in parallel
    if (isBackendAvailable) {
      try {
        console.log(`[${requestId}] Fetching user information and accessing chat in parallel`);

        // Add timeout to prevent hanging indefinitely
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 15000)
        );

        // Start both operations in parallel for better performance
        // Use Promise.race to implement a timeout
        const [userDetailsResult, chatResponse] = await Promise.race([
          Promise.all([
            // Fetch user details with error handling
            fetchUserDetails(targetUserId).catch(err => {
              console.error(`[${requestId}] Error fetching user details:`, err);
              return null; // Return null on error but don't fail the whole operation
            }),

            // Access chat with optimized caching
            (async () => {
              try {
                // First check if we have a cached chat ID
                if (cachedChatId) {
                  console.log(`[${requestId}] Using cached chat ID for access: ${cachedChatId}`);

                  // Try to get chat details from the cache first
                  const cachedMessages = loadChatHistory(cachedChatId);
                  if (cachedMessages && cachedMessages.length > 0) {
                    console.log(`[${requestId}] Found ${cachedMessages.length} cached messages`);

                    // Create a temporary chat object from cache
                    const tempChat = {
                      _id: cachedChatId,
                      participants: [
                        { _id: currentUser._id || currentUser.id, name: currentUser.name || 'Current User' },
                        { _id: targetUserId, name: 'Doctor' }
                      ],
                      messages: cachedMessages,
                      isGroup: false,
                      lastMessage: cachedMessages[cachedMessages.length - 1]
                    };

                    // Start the real access chat in the background
                    setTimeout(() => {
                      accessChat(targetUserId).catch(err => {
                        console.error(`[${requestId}] Background access chat error:`, err);
                      });
                    }, 0);

                    // Return the temporary chat immediately
                    return tempChat;
                  }
                }

                // If no cache or cache is empty, do the regular access chat
                return await accessChat(targetUserId);
              } catch (error) {
                console.error(`[${requestId}] Error in optimized access chat:`, error);
                throw error;
              }
            })()
          ]),
          timeoutPromise
        ]);

        // Log the results for debugging
        console.log(`[${requestId}] User details fetched:`, !!userDetailsResult);
        console.log(`[${requestId}] Chat response:`, chatResponse);

        if (chatResponse && chatResponse._id) {
          console.log(`[${requestId}] Chat accessed successfully: ${chatResponse._id}`);
          setChatId(chatResponse._id);

          if (setSelectedChat) {
            setSelectedChat(chatResponse);
          }

          // Save chat ID to localStorage for future use if available
          if (storageAvailable) {
            try {
              localStorage.setItem(`chat_${targetUserId}`, chatResponse._id);
            } catch (storageError) {
              console.error(`[${requestId}] Error saving chat ID to localStorage:`, storageError);
            }
          }

          // STEP 5: Fetch messages if needed
          // Check if we have a recent timestamp for this chat
          let isCacheRecent = false;
          if (storageAvailable) {
            try {
              const cacheTimestamp = localStorage.getItem(`${chatResponse._id}_timestamp`);
              isCacheRecent = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 60000; // 1 minute
              console.log(`[${requestId}] Cache timestamp: ${cacheTimestamp}, is recent: ${isCacheRecent}`);
            } catch (storageError) {
              console.error(`[${requestId}] Error checking cache timestamp:`, storageError);
            }
          }

          if (isCacheRecent) {
            console.log(`[${requestId}] Using recent cached messages, skipping fetch`);
            setLoading(false);
          } else {
            // Fetch fresh messages
            console.log(`[${requestId}] Fetching fresh messages`);

            try {
              // Add timeout to prevent hanging indefinitely
              const fetchTimeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Fetch messages timeout')), 10000)
              );

              // Check if we already have cached messages to display immediately
              const cachedMessages = loadChatHistory(chatResponse._id);
              if (cachedMessages && cachedMessages.length > 0) {
                console.log(`[${requestId}] Using ${cachedMessages.length} cached messages while fetching fresh ones`);
                // Update messages immediately with cached data
                setMessages(cachedMessages);
                // Force scroll to bottom after messages are loaded
                setTimeout(scrollToBottom, 50);
              }

              // Use the optimized fetchMessages function with a limit of 50 messages
              // This will run in parallel with displaying cached messages
              const fetchResult = await Promise.race([
                fetchMessages(chatResponse._id, 50),
                fetchTimeoutPromise
              ]);

              console.log(`[${requestId}] Messages fetched successfully:`, fetchResult?.length || 0);

              // Save to local storage for offline access if available
              if (fetchResult && fetchResult.length > 0 && storageAvailable) {
                try {
                  saveChatHistory(chatResponse._id, fetchResult);
                  localStorage.setItem(`${chatResponse._id}_timestamp`, Date.now().toString());
                  console.log(`[${requestId}] Saved ${fetchResult.length} messages to local storage`);
                } catch (storageError) {
                  console.error(`[${requestId}] Error saving to local storage:`, storageError);
                }
              }

              // Force scroll to bottom after messages are loaded
              setTimeout(scrollToBottom, 100);
            } catch (fetchError) {
              console.error(`[${requestId}] Error fetching messages:`, fetchError);

              // Try to use cached messages as fallback
              if (cachedChatId) {
                try {
                  const cachedMessages = loadChatHistory(cachedChatId);
                  if (cachedMessages && cachedMessages.length > 0) {
                    console.log(`[${requestId}] Using cached messages as fallback`);
                    setMessages(cachedMessages);
                    setTimeout(scrollToBottom, 100);
                  }
                } catch (cacheError) {
                  console.error(`[${requestId}] Error loading cached messages:`, cacheError);
                }
              }
            } finally {
              setLoading(false);
            }
          }

          // Log performance metrics
          console.log(`[${requestId}] Chat initialization completed in ${Math.round(performance.now() - startTime)}ms`);
          return { success: true, chatId: chatResponse._id };
        } else {
          console.warn(`[${requestId}] No chat ID returned from accessChat`);
          setLoading(false);
          return { success: false, error: 'Failed to access chat' };
        }
      } catch (error) {
        console.error(`[${requestId}] Error in chat initialization:`, error);

        // Try to use cached data as fallback
        if (cachedChatId) {
          try {
            const cachedMessages = loadChatHistory(cachedChatId);
            if (cachedMessages && cachedMessages.length > 0) {
              console.log(`[${requestId}] Using cached messages as fallback after error`);
              setMessages(cachedMessages);
              setTimeout(scrollToBottom, 100);
              setLoading(false);
              return { success: true, offline: true, chatId: cachedChatId };
            }
          } catch (cacheError) {
            console.error(`[${requestId}] Error loading cached messages:`, cacheError);
          }
        }

        setLoading(false);
        return { success: false, error: error.message || 'Unknown error' };
      }
    }

    setLoading(false);
    return { success: false, error: 'Backend unavailable' };
  } catch (error) {
    console.error(`[${requestId}] Error initializing chat:`, error);
    setLoading(false);
    return { success: false, error: error.message || 'Unknown error' };
  }
};

export default {
  initializeChat
};
