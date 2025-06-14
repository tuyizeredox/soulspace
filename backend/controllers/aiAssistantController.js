const User = require('../models/User');
const HealthTip = require('../models/HealthTip');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');

// Configuration for Gemini AI API
const PRIMARY_API_KEY = process.env.GEMINI_API_KEY; // Must be set in your .env file
const BACKUP_API_KEY_1 = process.env.GEMINI_API_KEY_BACKUP_1;
const BACKUP_API_KEY_2 = process.env.GEMINI_API_KEY_BACKUP_2;
const ADDITIONAL_API_KEY = 'AIzaSyC9Fv8cvUfcn5ZITMvwE8UcVQJwYNBY384'; // Additional API key provided

// API key rotation system
let currentApiKeyIndex = 0;
const apiKeys = [PRIMARY_API_KEY, BACKUP_API_KEY_1, BACKUP_API_KEY_2, ADDITIONAL_API_KEY].filter(key => key);

if (apiKeys.length === 0) {
  console.error('WARNING: No Gemini API keys are set in environment variables. AI assistant will not function properly.');
}

// Initialize with the primary API key
let genAI = new GoogleGenerativeAI(apiKeys[currentApiKeyIndex]);
const MODEL_NAME = 'gemini-1.5-flash'; // Using the flash model by default to avoid quota issues
const FALLBACK_MODEL = 'gemini-1.0-pro'; // Fallback model if the flash version hits quota limits
const EMERGENCY_FALLBACK_MODEL = 'gemini-1.0-pro-vision'; // Emergency fallback for when all else fails

// Hugging Face API for lightweight fallback
const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill';
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY || ''; // Optional, can work without it with rate limits

// Alternative models if the first one doesn't work well
const HUGGING_FACE_BACKUP_MODELS = [
  // Free models that work well without authentication issues
  'google/flan-t5-small',
  'google/flan-t5-base',
  'mistralai/Mistral-7B-Instruct-v0.1',
  'meta-llama/Llama-2-7b-chat-hf',
  'deepset/roberta-base-squad2',
  // Original models as fallbacks
  'facebook/blenderbot-1B-distill',
  'microsoft/DialoGPT-medium',
  'EleutherAI/gpt-neo-125M',
  'distilbert-base-uncased',
  'gpt2',
  'distilgpt2'
];

// Function to call Hugging Face API as a last resort fallback
const callHuggingFaceModel = async (message, healthContext = true) => {
  // If no API key is available and we're not using public models, skip directly to rule-based fallback
  if (!HUGGING_FACE_API_KEY || HUGGING_FACE_API_KEY.trim() === '') {
    console.log('No Hugging Face API key available, using rule-based fallback directly');
    return useRuleBasedFallback(message);
  }
  // Add a health context prefix to guide the model
  const healthPrefix = healthContext 
    ? "You are a helpful health assistant providing general health information. " 
    : "";
  
  // Simplify the message to focus on the core question
  const simplifiedMessage = message.length > 200 
    ? message.substring(0, 200) + "..."
    : message;
  
  // Format the message with health context
  const formattedMessage = healthPrefix + simplifiedMessage;
  
  // Prepare headers - use API key if available
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (HUGGING_FACE_API_KEY) {
    headers['Authorization'] = `Bearer ${HUGGING_FACE_API_KEY}`;
  }
  
  // Try the primary model first, then fall back to alternatives if needed
  let modelUrls = [HUGGING_FACE_API_URL];
  
  // Add backup model URLs
  HUGGING_FACE_BACKUP_MODELS.forEach(model => {
    modelUrls.push(`https://api-inference.huggingface.co/models/${model}`);
  });
  
  // Try each model in sequence
  for (const modelUrl of modelUrls) {
    try {
      console.log(`Trying Hugging Face model: ${modelUrl.split('/').pop()}`);
      
      // Determine the right request format based on the model
      let requestBody;
      
      if (modelUrl.includes('flan-t5')) {
        // Flan-T5 format
        requestBody = { 
          inputs: "Answer this health question: " + simplifiedMessage,
          parameters: {
            max_length: 150,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false
          }
        };
      } else if (modelUrl.includes('Mistral-7B-Instruct')) {
        // Mistral format
        requestBody = { 
          inputs: "<s>[INST] You are a helpful health assistant. " + simplifiedMessage + " [/INST]",
          parameters: {
            max_length: 200,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false
          }
        };
      } else if (modelUrl.includes('Llama-2-7b-chat')) {
        // Llama 2 chat format
        requestBody = { 
          inputs: "<s>[INST] <<SYS>> You are a helpful health assistant providing accurate and helpful information. <</SYS>> " + simplifiedMessage + " [/INST]",
          parameters: {
            max_length: 200,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false
          }
        };
      } else if (modelUrl.includes('roberta-base-squad2')) {
        // Question answering format
        requestBody = { 
          inputs: {
            question: simplifiedMessage,
            context: "Health is a state of complete physical, mental and social well-being and not merely the absence of disease or infirmity. Regular exercise, balanced nutrition, adequate rest, and good stress management are key components of maintaining good health. For specific health concerns, it's important to consult with healthcare professionals."
          }
        };
      } else if (modelUrl.includes('blenderbot')) {
        // BlenderBot format
        requestBody = { 
          inputs: {
            text: formattedMessage
          },
          parameters: {
            max_length: 100,
            temperature: 0.7,
            top_p: 0.9,
          }
        };
      } else if (modelUrl.includes('DialoGPT')) {
        // DialoGPT format
        requestBody = { 
          inputs: formattedMessage,
          parameters: {
            max_length: 100,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false
          }
        };
      } else if (modelUrl.includes('gpt2')) {
        // GPT-2 format
        requestBody = { 
          inputs: "You are a helpful health assistant. " + formattedMessage,
          parameters: {
            max_length: 100,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false
          }
        };
      } else if (modelUrl.includes('distilbert')) {
        // For text classification models, use a simple question-answer format
        requestBody = { 
          inputs: "Question: " + simplifiedMessage + " Answer:",
          parameters: {
            max_length: 100,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false
          }
        };
      } else {
        // Default format for other models
        requestBody = { 
          inputs: formattedMessage,
          parameters: {
            max_length: 150,
            temperature: 0.7,
            top_p: 0.9,
          }
        };
      }
      
      // Call the Hugging Face API with retry logic
      let retries = 2;
      let response;
      
      // For models that don't require authentication, remove the auth header
      if (modelUrl.includes('distilbert') || modelUrl.includes('gpt2') || 
          modelUrl.includes('flan-t5') || modelUrl.includes('roberta-base-squad2')) {
        delete headers['Authorization'];
        console.log(`Using public model ${modelUrl.split('/').pop()} without authentication`);
      }
      
      while (retries >= 0) {
        try {
          response = await fetch(modelUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
            timeout: 10000 // 10 second timeout
          });
          
          // If successful, break out of retry loop
          if (response.ok) break;
          
          // If model is still loading, wait and retry
          if (response.status === 503) {
            const waitTime = retries * 2000; // Increase wait time with each retry
            console.log(`Model still loading, waiting ${waitTime/1000}s before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retries--;
            continue;
          }
          
          // If we get a 403 Forbidden, it's likely an authentication issue
          if (response.status === 403) {
            console.log(`Authentication error for model ${modelUrl.split('/').pop()}, trying next model...`);
            throw new Error(`Hugging Face API authentication error: ${response.status} ${response.statusText}`);
          }
          
          // For other errors, try the next model
          throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
          
        } catch (fetchError) {
          if (retries > 0 && !fetchError.message.includes('authentication error')) {
            retries--;
            continue;
          }
          throw fetchError;
        }
      }
      
      if (!response || !response.ok) {
        throw new Error('Failed to get valid response after retries');
      }
      
      const data = await response.json();
      
      // Extract the generated text based on model type
      let generatedText = '';
      
      console.log(`Response from ${modelUrl.split('/').pop()}:`, JSON.stringify(data).substring(0, 200) + '...');
      
      if (modelUrl.includes('flan-t5')) {
        // Flan-T5 format
        if (typeof data === 'string') {
          generatedText = data;
        } else if (Array.isArray(data)) {
          generatedText = data[0]?.generated_text || '';
        }
      } else if (modelUrl.includes('Mistral-7B-Instruct') || modelUrl.includes('Llama-2-7b-chat')) {
        // Mistral and Llama format
        if (Array.isArray(data)) {
          generatedText = data[0]?.generated_text || '';
        } else if (data.generated_text) {
          generatedText = data.generated_text;
        } else if (typeof data === 'string') {
          generatedText = data;
        }
      } else if (modelUrl.includes('roberta-base-squad2')) {
        // Question answering format
        if (data.answer) {
          generatedText = data.answer;
        } else if (data.score && data.start && data.end) {
          generatedText = "Based on the information available, I'd recommend maintaining a healthy lifestyle with regular exercise, balanced nutrition, adequate rest, and good stress management. For specific health concerns, please consult with a healthcare professional.";
        }
      } else if (Array.isArray(data)) {
        // Some models return an array
        generatedText = data[0]?.generated_text || data[0]?.text || '';
      } else if (data.generated_text) {
        // BlenderBot format
        generatedText = data.generated_text;
      } else if (typeof data === 'object' && data.text) {
        // Some models use this format
        generatedText = data.text;
      } else if (typeof data === 'string') {
        // Simple string response
        generatedText = data;
      } else if (modelUrl.includes('gpt2') || modelUrl.includes('distilgpt2')) {
        // GPT-2 models often return different formats
        if (typeof data === 'object') {
          if (data[0] && data[0].generated_text) {
            generatedText = data[0].generated_text;
          } else if (data.generated_text) {
            generatedText = data.generated_text;
          } else {
            // Try to extract any text property
            const textProps = Object.keys(data).filter(key => 
              typeof data[key] === 'string' && data[key].length > 10
            );
            if (textProps.length > 0) {
              generatedText = data[textProps[0]];
            }
          }
        }
      } else if (modelUrl.includes('distilbert')) {
        // For classification models, they might return scores or other formats
        // Just use the input as the output with a generic response
        generatedText = "Based on your question, I'd recommend consulting with a healthcare professional for personalized advice.";
      }
      
      if (generatedText && generatedText.trim().length > 10) {
        console.log(`Successfully got response from Hugging Face model: ${modelUrl.split('/').pop()}`);
        
        // Clean up the response
        generatedText = generatedText
          .replace(/^['"]+|['"]+$/g, '') // Remove quotes at start/end
          .trim();
        
        // Add a disclaimer to make it clear this is a fallback
        return generatedText + "\n\n(Note: This is a simplified response. For more detailed health information, please try again later.)";
      }
      
      // If we got an empty or too short response, try the next model
      console.log(`Empty or too short response from ${modelUrl.split('/').pop()}, trying next model...`);
      
    } catch (modelError) {
      console.error(`Error with Hugging Face model ${modelUrl.split('/').pop()}:`, modelError);
      // Continue to the next model
    }
  }
  
  // If all models failed, use a rule-based fallback that doesn't require API calls
  console.error('All Hugging Face models failed, using rule-based fallback');
  return useRuleBasedFallback(message);
};

// Helper function for rule-based fallback responses
const useRuleBasedFallback = (message) => {
  // Extract keywords from the message
  const messageLower = message.toLowerCase();
  
  // Check for common health-related keywords to provide a relevant fallback
  if (messageLower.includes('headache') || messageLower.includes('head pain') || messageLower.includes('migraine')) {
    return "For headaches, it's generally recommended to rest in a quiet, dark room, stay hydrated, and take over-the-counter pain relievers like acetaminophen or ibuprofen if appropriate. If headaches are severe, persistent, or accompanied by other symptoms like fever, vision changes, or neck stiffness, please consult a healthcare provider.\n\n(Note: This is a simplified response. For more detailed health information, please try again later.)";
  } else if (messageLower.includes('cold') || messageLower.includes('flu') || messageLower.includes('fever') || messageLower.includes('cough')) {
    return "For cold and flu symptoms, rest, stay hydrated, and consider over-the-counter medications to manage fever and discomfort. If symptoms are severe, persistent, or include difficulty breathing, high fever, or chest pain, please seek medical attention.\n\n(Note: This is a simplified response. For more detailed health information, please try again later.)";
  } else if (messageLower.includes('stress') || messageLower.includes('anxiety') || messageLower.includes('worried') || messageLower.includes('nervous')) {
    return "Managing stress and anxiety often involves deep breathing exercises, regular physical activity, adequate sleep, and mindfulness practices. Consider talking to a mental health professional if stress or anxiety significantly impacts your daily life.\n\n(Note: This is a simplified response. For more detailed health information, please try again later.)";
  } else if (messageLower.includes('sleep') || messageLower.includes('insomnia') || messageLower.includes('tired') || messageLower.includes('fatigue')) {
    return "For better sleep, try maintaining a regular sleep schedule, creating a relaxing bedtime routine, limiting screen time before bed, and ensuring your sleep environment is comfortable, dark, and quiet. If sleep problems persist, consider consulting a healthcare provider.\n\n(Note: This is a simplified response. For more detailed health information, please try again later.)";
  } else if (messageLower.includes('diet') || messageLower.includes('nutrition') || messageLower.includes('food') || messageLower.includes('eat')) {
    return "A balanced diet typically includes a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats. It's recommended to limit processed foods, added sugars, and excessive salt. For personalized nutrition advice, consider consulting with a registered dietitian.\n\n(Note: This is a simplified response. For more detailed health information, please try again later.)";
  } else if (messageLower.includes('exercise') || messageLower.includes('workout') || messageLower.includes('fitness') || messageLower.includes('active')) {
    return "Regular physical activity is important for overall health. Adults should aim for at least 150 minutes of moderate-intensity aerobic activity or 75 minutes of vigorous activity per week, plus muscle-strengthening activities on 2 or more days per week. Always start gradually and consult with a healthcare provider before beginning a new exercise program, especially if you have existing health conditions.\n\n(Note: This is a simplified response. For more detailed health information, please try again later.)";
  } else if (messageLower.includes('depression') || messageLower.includes('sad') || messageLower.includes('mood') || messageLower.includes('mental health')) {
    return "Depression is a common but serious mood disorder that requires proper treatment. If you're experiencing persistent sadness, loss of interest in activities, changes in sleep or appetite, or thoughts of self-harm, please reach out to a mental health professional. Support is available through therapy, medication, lifestyle changes, and support groups.\n\n(Note: This is a simplified response. For more detailed health information, please try again later.)";
  } else if (messageLower.includes('blood pressure') || messageLower.includes('hypertension') || messageLower.includes('heart')) {
    return "Maintaining healthy blood pressure (generally below 120/80 mmHg) is important for heart health. Strategies include regular physical activity, a balanced diet low in sodium, limiting alcohol, not smoking, managing stress, and maintaining a healthy weight. If you have high blood pressure, follow your healthcare provider's recommendations regarding monitoring and medication.\n\n(Note: This is a simplified response. For more detailed health information, please try again later.)";
  } else if (messageLower.includes('diabetes') || messageLower.includes('blood sugar') || messageLower.includes('glucose')) {
    return "Managing diabetes involves monitoring blood glucose levels, taking prescribed medications, following a balanced diet, regular physical activity, and attending regular check-ups. Work closely with your healthcare team to develop a personalized management plan. Watch for signs of low or high blood sugar and know when to seek medical attention.\n\n(Note: This is a simplified response. For more detailed health information, please try again later.)";
  } else if (messageLower.includes('pregnancy') || messageLower.includes('pregnant') || messageLower.includes('baby')) {
    return "During pregnancy, it's important to attend regular prenatal check-ups, take prescribed prenatal vitamins, eat a balanced diet, stay physically active as recommended by your healthcare provider, avoid alcohol and tobacco, and get adequate rest. Contact your healthcare provider promptly if you experience severe nausea, vaginal bleeding, severe headaches, or decreased fetal movement.\n\n(Note: This is a simplified response. For more detailed health information, please try again later.)";
  } else {
    // If we can't determine a specific health topic, return a general health message
    return "I apologize, but I'm experiencing technical difficulties right now. As a general health reminder, maintaining a balanced diet, regular physical activity, adequate sleep, and stress management are key components of overall wellness. For specific health concerns, please consult with a healthcare professional.\n\n(Note: This is a simplified response. For more detailed health information, please try again later.)";
  }
};

// User-based rate limiting
const userRateLimiter = {
  // Store user request counts with timestamps
  users: new Map(),
  
  // Maximum requests per minute per user
  maxRequestsPerMinute: 5,
  
  // Maximum requests per hour per user
  maxRequestsPerHour: 30,
  
  // Maximum tokens per day per user
  maxTokensPerDay: 100000,
  
  // Check if a user has exceeded their rate limit
  isRateLimited: (userId) => {
    if (!userId) return false; // Skip rate limiting if no user ID
    
    const now = Date.now();
    const userStats = userRateLimiter.getOrCreateUserStats(userId);
    
    // Clean up old requests (older than 1 hour)
    userStats.requests = userStats.requests.filter(req => 
      now - req.timestamp < 60 * 60 * 1000
    );
    
    // Count requests in the last minute
    const requestsLastMinute = userStats.requests.filter(req => 
      now - req.timestamp < 60 * 1000
    ).length;
    
    // Count requests in the last hour
    const requestsLastHour = userStats.requests.length;
    
    // Check if user has exceeded limits
    if (requestsLastMinute >= userRateLimiter.maxRequestsPerMinute) {
      console.log(`User ${userId} rate limited: ${requestsLastMinute} requests in the last minute`);
      return {
        limited: true,
        reason: 'minute',
        retryAfter: '60s',
        message: 'You have sent too many requests in the last minute. Please wait a moment before trying again.'
      };
    }
    
    if (requestsLastHour >= userRateLimiter.maxRequestsPerHour) {
      console.log(`User ${userId} rate limited: ${requestsLastHour} requests in the last hour`);
      return {
        limited: true,
        reason: 'hour',
        retryAfter: '3600s',
        message: 'You have reached your hourly request limit. Please try again later.'
      };
    }
    
    // Check token usage for the day
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const midnightTimestamp = midnight.getTime();
    
    // Sum up tokens used today
    const tokensToday = userStats.tokenUsage
      .filter(usage => usage.timestamp >= midnightTimestamp)
      .reduce((sum, usage) => sum + usage.inputTokens + usage.outputTokens, 0);
    
    if (tokensToday >= userRateLimiter.maxTokensPerDay) {
      console.log(`User ${userId} token limit exceeded: ${tokensToday} tokens today`);
      return {
        limited: true,
        reason: 'tokens',
        retryAfter: '86400s',
        message: 'You have reached your daily token limit. Please try again tomorrow.'
      };
    }
    
    return { limited: false };
  },
  
  // Record a request for a user
  recordRequest: (userId, inputTokens = 0, outputTokens = 0) => {
    if (!userId) return; // Skip if no user ID
    
    const userStats = userRateLimiter.getOrCreateUserStats(userId);
    const now = Date.now();
    
    // Add this request
    userStats.requests.push({ timestamp: now });
    
    // Record token usage
    userStats.tokenUsage.push({
      timestamp: now,
      inputTokens,
      outputTokens
    });
    
    // Clean up old token usage records (older than 7 days)
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    userStats.tokenUsage = userStats.tokenUsage.filter(usage => 
      usage.timestamp >= sevenDaysAgo
    );
    
    // Update the map
    userRateLimiter.users.set(userId, userStats);
  },
  
  // Get or create user stats
  getOrCreateUserStats: (userId) => {
    if (!userRateLimiter.users.has(userId)) {
      userRateLimiter.users.set(userId, {
        requests: [],
        tokenUsage: []
      });
    }
    return userRateLimiter.users.get(userId);
  }
};

// Response caching system
const responseCache = {
  // Cache of responses
  cache: new Map(),
  
  // Maximum cache size
  maxSize: 1000,
  
  // Cache expiration time (1 hour)
  expirationTime: 60 * 60 * 1000,
  
  // Generate a cache key from a message and user ID
  generateKey: (message, userId) => {
    // Normalize the message by trimming whitespace and converting to lowercase
    const normalizedMessage = message.trim().toLowerCase();
    
    // Create a hash of the message for the cache key
    // Simple hash function for strings
    const hash = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash.toString(16); // Convert to hex string
    };
    
    return `${userId || 'anonymous'}-${hash(normalizedMessage)}`;
  },
  
  // Get a cached response
  get: (message, userId) => {
    const key = responseCache.generateKey(message, userId);
    const cachedItem = responseCache.cache.get(key);
    
    if (!cachedItem) {
      return null;
    }
    
    // Check if the cached item has expired
    if (Date.now() - cachedItem.timestamp > responseCache.expirationTime) {
      responseCache.cache.delete(key);
      return null;
    }
    
    console.log(`Cache hit for user ${userId}: "${message.substring(0, 30)}..."`);
    return cachedItem.response;
  },
  
  // Store a response in the cache
  set: (message, userId, response) => {
    // Don't cache error responses
    if (response.error || response.quotaExceeded) {
      return;
    }
    
    const key = responseCache.generateKey(message, userId);
    
    // Store the response with a timestamp
    responseCache.cache.set(key, {
      response,
      timestamp: Date.now()
    });
    
    // If the cache is too large, remove the oldest entries
    if (responseCache.cache.size > responseCache.maxSize) {
      const keysToDelete = Array.from(responseCache.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, Math.floor(responseCache.maxSize * 0.2))
        .map(entry => entry[0]);
      
      keysToDelete.forEach(key => responseCache.cache.delete(key));
    }
  },
  
  // Clear expired cache entries
  clearExpired: () => {
    const now = Date.now();
    let cleared = 0;
    
    responseCache.cache.forEach((value, key) => {
      if (now - value.timestamp > responseCache.expirationTime) {
        responseCache.cache.delete(key);
        cleared++;
      }
    });
    
    if (cleared > 0) {
      console.log(`Cleared ${cleared} expired cache entries`);
    }
    
    return cleared;
  }
};

// Set up periodic cache cleanup
setInterval(responseCache.clearExpired, 15 * 60 * 1000); // Every 15 minutes

// Token usage tracking to prevent quota limits
const tokenUsageTracker = {
  // Track usage per API key
  usage: apiKeys.map(() => ({
    inputTokens: 0,
    outputTokens: 0,
    requests: 0,
    lastReset: Date.now(),
    quotaExceeded: false,
    cooldownUntil: 0,
    consecutiveErrors: 0
  })),
  
  // Estimate tokens based on text length (improved approximation)
  estimateTokens: (text) => {
    if (!text) return 0;
    
    // More accurate token estimation:
    // - Count words (approximately 0.75 tokens per word)
    // - Count punctuation and special characters (approximately 1 token each)
    // - Add overhead for formatting
    
    // Count words
    const wordCount = text.split(/\s+/).length;
    
    // Count punctuation and special characters
    const punctuationCount = (text.match(/[.,!?;:()[\]{}'"\/\\<>@#$%^&*=+\-_`~]/g) || []).length;
    
    // Count numbers (approximately 1 token per 2-3 digits)
    const numberCount = (text.match(/\d+/g) || []).join('').length / 2.5;
    
    // Calculate estimated tokens with a safety margin
    const estimatedTokens = Math.ceil((wordCount * 0.75) + punctuationCount + numberCount + 5);
    
    // For very short texts, ensure a minimum token count
    if (estimatedTokens < 3 && text.length > 0) {
      return 3;
    }
    
    // For system prompts and longer texts, add additional overhead
    if (text.includes('Guidelines:') || text.includes('User information:')) {
      return Math.ceil(estimatedTokens * 1.2); // 20% overhead for structured text
    }
    
    return estimatedTokens;
  },
  
  // Check if a request would exceed our self-imposed limits BEFORE making the API call
  wouldExceedLimits: (inputText) => {
    const currentUsage = tokenUsageTracker.usage[currentApiKeyIndex];
    const estimatedInputTokens = tokenUsageTracker.estimateTokens(inputText);
    const estimatedOutputTokens = Math.ceil(estimatedInputTokens * 1.5); // Assume output is ~1.5x input
    const totalEstimatedTokens = estimatedInputTokens + estimatedOutputTokens;
    
    // Check if this key is in cooldown
    if (currentUsage.cooldownUntil > Date.now()) {
      const remainingCooldown = Math.ceil((currentUsage.cooldownUntil - Date.now()) / 1000);
      console.log(`API Key ${currentApiKeyIndex + 1} in cooldown for ${remainingCooldown}s`);
      return {
        exceeded: true,
        reason: 'in_cooldown',
        remainingSeconds: remainingCooldown
      };
    }
    
    // Check if this single request is too large (over 1000 tokens)
    if (estimatedInputTokens > 1000) {
      console.log(`Request too large: ${estimatedInputTokens} tokens exceeds safe limit of 1000`);
      return {
        exceeded: true,
        reason: 'request_too_large',
        estimatedTokens: estimatedInputTokens
      };
    }
    
    // Check if we've exceeded the per-minute token limit
    const timeSinceReset = Date.now() - currentUsage.lastReset;
    if (timeSinceReset < 60000) {
      const currentMinuteTokens = currentUsage.inputTokens + currentUsage.outputTokens;
      if (currentMinuteTokens + totalEstimatedTokens > 5000) { // Ultra-conservative limit
        console.log(`Minute token limit would be exceeded: ${currentMinuteTokens} + ${totalEstimatedTokens} > 5000`);
        return {
          exceeded: true,
          reason: 'minute_token_limit',
          currentUsage: currentMinuteTokens,
          estimatedTokens: totalEstimatedTokens
        };
      }
    }
    
    // Check if we've exceeded the per-minute request limit
    if (timeSinceReset < 60000 && currentUsage.requests >= 5) { // Ultra-conservative limit
      console.log(`Request limit would be exceeded: ${currentUsage.requests} >= 5`);
      return {
        exceeded: true,
        reason: 'minute_request_limit',
        currentRequests: currentUsage.requests
      };
    }
    
    // All checks passed
    return { exceeded: false };
  },
  
  // Mark a key as exceeded when we get a 429 error
  markKeyAsExceeded: (retryDelay = '60s') => {
    // Parse the retry delay (format: '60s', '120s', etc.)
    const delaySeconds = parseInt(retryDelay.replace('s', '')) || 60;
    const cooldownMs = delaySeconds * 1000;
    
    console.warn(`API Key ${currentApiKeyIndex + 1} exceeded quota, setting cooldown for ${delaySeconds}s`);
    
    // Set a cooldown period for this key
    tokenUsageTracker.usage[currentApiKeyIndex].cooldownUntil = Date.now() + cooldownMs;
    tokenUsageTracker.usage[currentApiKeyIndex].consecutiveErrors = 
      (tokenUsageTracker.usage[currentApiKeyIndex].consecutiveErrors || 0) + 1;
    
    // If we've had multiple consecutive errors, extend the cooldown
    if (tokenUsageTracker.usage[currentApiKeyIndex].consecutiveErrors > 1) {
      const extendedCooldown = cooldownMs * tokenUsageTracker.usage[currentApiKeyIndex].consecutiveErrors;
      console.warn(`Multiple consecutive errors (${tokenUsageTracker.usage[currentApiKeyIndex].consecutiveErrors}), extending cooldown to ${extendedCooldown/1000}s`);
      tokenUsageTracker.usage[currentApiKeyIndex].cooldownUntil = Date.now() + extendedCooldown;
    }
  },
  
  // Record usage for the current API key
  recordUsage: (inputText, outputText) => {
    const inputTokens = tokenUsageTracker.estimateTokens(inputText);
    const outputTokens = tokenUsageTracker.estimateTokens(outputText);
    const totalTokens = inputTokens + outputTokens;
    
    tokenUsageTracker.usage[currentApiKeyIndex].inputTokens += inputTokens;
    tokenUsageTracker.usage[currentApiKeyIndex].outputTokens += outputTokens;
    tokenUsageTracker.usage[currentApiKeyIndex].requests += 1;
    
    console.log(`API Key ${currentApiKeyIndex + 1} usage: ${inputTokens} input tokens, ${outputTokens} output tokens`);
    
    // Check if we're approaching limits
    const totalCurrentTokens = tokenUsageTracker.usage[currentApiKeyIndex].inputTokens + 
                        tokenUsageTracker.usage[currentApiKeyIndex].outputTokens;
    
    // If we're at 50% of our conservative limits, proactively set a cooldown
    if (totalCurrentTokens > 5000 || tokenUsageTracker.usage[currentApiKeyIndex].requests > 5) {
      console.warn(`API Key ${currentApiKeyIndex + 1} approaching quota limits, setting cooldown`);
      tokenUsageTracker.usage[currentApiKeyIndex].cooldownUntil = Date.now() + 60000; // 60 second cooldown
    }
    
    return { inputTokens, outputTokens, totalTokens };
  },
  
  // Check if we should use a different API key based on usage patterns
  shouldRotateKey: () => {
    const currentUsage = tokenUsageTracker.usage[currentApiKeyIndex];
    
    // If this key is in cooldown, we should rotate
    if (currentUsage.cooldownUntil > Date.now()) {
      return true;
    }
    
    // If we've used a lot of tokens in the last minute, consider rotating
    const totalTokens = currentUsage.inputTokens + currentUsage.outputTokens;
    const timeSinceReset = Date.now() - currentUsage.lastReset;
    
    // If we've used more than 10K tokens in less than a minute, rotate (extremely conservative)
    if (totalTokens > 10000 && timeSinceReset < 60000) {
      return true;
    }
    
    // If we've made more than 10 requests in less than a minute, rotate (extremely conservative)
    if (currentUsage.requests > 10 && timeSinceReset < 60000) {
      return true;
    }
    
    // If we've used more than 5K tokens in less than 30 seconds, rotate (ultra conservative)
    if (totalTokens > 5000 && timeSinceReset < 30000) {
      return true;
    }
    
    return false;
  },
  
  // Mark the current key as exceeded and set a cooldown period
  markKeyAsExceeded: (retryDelay) => {
    const delayMs = parseInt(retryDelay.replace(/[^0-9]/g, ''), 10) * 1000 || 30000;
    
    tokenUsageTracker.usage[currentApiKeyIndex].quotaExceeded = true;
    tokenUsageTracker.usage[currentApiKeyIndex].cooldownUntil = Date.now() + delayMs;
    
    console.log(`API Key ${currentApiKeyIndex + 1} marked as exceeded, cooling down for ${delayMs/1000}s`);
  },
  
  // Reset usage stats for a key (called periodically)
  resetUsage: (keyIndex) => {
    // Only reset if it's been more than a minute since the last reset
    const timeSinceReset = Date.now() - tokenUsageTracker.usage[keyIndex].lastReset;
    if (timeSinceReset > 60000) {
      tokenUsageTracker.usage[keyIndex].inputTokens = 0;
      tokenUsageTracker.usage[keyIndex].outputTokens = 0;
      tokenUsageTracker.usage[keyIndex].requests = 0;
      tokenUsageTracker.usage[keyIndex].lastReset = Date.now();
      
      // If the cooldown period has passed, clear the exceeded flag
      if (tokenUsageTracker.usage[keyIndex].cooldownUntil < Date.now()) {
        tokenUsageTracker.usage[keyIndex].quotaExceeded = false;
      }
      
      console.log(`Reset usage stats for API Key ${keyIndex + 1}`);
    }
  },
  
  // Reset all keys periodically
  resetAllKeys: () => {
    for (let i = 0; i < tokenUsageTracker.usage.length; i++) {
      tokenUsageTracker.resetUsage(i);
    }
  }
};

// Function to rotate to the next available API key
const rotateApiKey = () => {
  if (apiKeys.length <= 1) {
    console.warn('No backup API keys available for rotation');
    return false;
  }
  
  // Reset usage stats for all keys before attempting rotation
  tokenUsageTracker.resetAllKeys();
  
  // Try each API key in sequence
  let initialIndex = currentApiKeyIndex;
  let rotated = false;
  
  // First, try to find a key that has never been used in this session
  for (let i = 0; i < apiKeys.length; i++) {
    const keyIndex = (currentApiKeyIndex + i + 1) % apiKeys.length;
    
    if (apiKeys[keyIndex] && 
        tokenUsageTracker.usage[keyIndex].requests === 0 &&
        !tokenUsageTracker.usage[keyIndex].quotaExceeded &&
        tokenUsageTracker.usage[keyIndex].cooldownUntil <= Date.now()) {
      
      console.log(`Found unused API key ${keyIndex + 1}, rotating to it`);
      currentApiKeyIndex = keyIndex;
      genAI = new GoogleGenerativeAI(apiKeys[currentApiKeyIndex]);
      rotated = true;
      break;
    }
  }
  
  // If we couldn't find an unused key, try to find any usable key
  if (!rotated) {
    do {
      currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
      
      // Skip empty API keys or keys that are in cooldown
      if (!apiKeys[currentApiKeyIndex] || 
          tokenUsageTracker.usage[currentApiKeyIndex].quotaExceeded ||
          tokenUsageTracker.usage[currentApiKeyIndex].cooldownUntil > Date.now()) {
        console.log(`Skipping API key ${currentApiKeyIndex + 1} (empty or in cooldown)`);
        continue;
      }
      
      console.log(`Rotating to API key ${currentApiKeyIndex + 1}`);
      genAI = new GoogleGenerativeAI(apiKeys[currentApiKeyIndex]);
      rotated = true;
      break;
      
    } while (currentApiKeyIndex !== initialIndex); // Stop if we've checked all keys
  }
  
  if (!rotated) {
    console.warn('All API keys are either empty, invalid, or in cooldown');
    return false;
  }
  
  return true;
}

// Function to chunk a message into smaller parts to avoid token limits
const chunkMessage = (message, maxChunkSize = 200) => {
  // If message is short enough, return it as is
  if (message.length <= maxChunkSize) {
    return [message];
  }
  
  // Check if this is a system prompt + user message
  const systemPromptMatch = message.match(/^(.*?)\n\nUser message: (.*)/s);
  if (systemPromptMatch) {
    const [_, systemPrompt, userMessage] = systemPromptMatch;
    
    // If the user message is short, we can keep it with a shortened system prompt
    if (userMessage.length <= maxChunkSize / 2) {
      // Shorten the system prompt to fit within limits
      const availableSpace = maxChunkSize - userMessage.length - 15; // 15 for "\n\nUser message: "
      const shortenedSystemPrompt = shortenSystemPrompt(systemPrompt, availableSpace);
      return [`${shortenedSystemPrompt}\n\nUser message: ${userMessage}`];
    }
    
    // If user message is long, chunk it and add shortened system prompt to first chunk only
    const userChunks = chunkUserMessage(userMessage, maxChunkSize / 2);
    const shortenedSystemPrompt = shortenSystemPrompt(systemPrompt, maxChunkSize / 2);
    
    // Add system prompt to first chunk only
    return userChunks.map((chunk, index) => {
      if (index === 0) {
        return `${shortenedSystemPrompt}\n\nUser message: ${chunk}`;
      } else {
        return `Continuing user message: ${chunk}`;
      }
    });
  }
  
  // For regular messages (not system prompt + user message), use sentence-based chunking
  return chunkUserMessage(message, maxChunkSize);
};

// Helper function to chunk user messages by sentences
const chunkUserMessage = (message, maxChunkSize = 200) => {
  // Split message into sentences
  const sentences = message.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let currentChunk = '';
  
  // Group sentences into chunks
  for (const sentence of sentences) {
    // If adding this sentence would exceed the chunk size, start a new chunk
    if (currentChunk.length + sentence.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      // If a single sentence is longer than maxChunkSize, split it into words
      if (sentence.length > maxChunkSize) {
        const words = sentence.split(/\s+/);
        let wordChunk = '';
        
        for (const word of words) {
          if (wordChunk.length + word.length + 1 > maxChunkSize) {
            chunks.push(wordChunk);
            wordChunk = word;
          } else {
            wordChunk += (wordChunk ? ' ' : '') + word;
          }
        }
        
        if (wordChunk) {
          currentChunk = wordChunk;
        } else {
          currentChunk = '';
        }
      } else {
        currentChunk = sentence;
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
};

// Helper function to shorten system prompt while preserving key information
const shortenSystemPrompt = (systemPrompt, maxLength = 100) => {
  if (systemPrompt.length <= maxLength) {
    return systemPrompt;
  }
  
  // Extract the first paragraph (usually the role definition)
  const firstParagraph = systemPrompt.split('\n\n')[0];
  
  // Extract user information section if present
  const userInfoMatch = systemPrompt.match(/User information:(.*?)(?=Guidelines:|$)/s);
  const userInfo = userInfoMatch ? userInfoMatch[0].trim() : '';
  
  // Extract key guidelines (first 3-4 points)
  const guidelinesMatch = systemPrompt.match(/Guidelines:(.*)/s);
  let guidelines = '';
  if (guidelinesMatch) {
    const guidelinePoints = guidelinesMatch[0].split(/\d+\.\s/).slice(1, 5);
    guidelines = 'Guidelines:\n' + guidelinePoints.map((point, i) => `${i+1}. ${point.trim()}`).join('\n');
  }
  
  // Combine the most important parts
  let shortenedPrompt = firstParagraph;
  
  // Add user info if there's space
  if (shortenedPrompt.length + userInfo.length <= maxLength) {
    shortenedPrompt += '\n\n' + userInfo;
  } else {
    // Just add critical user info like medical conditions
    const medicalConditionsMatch = userInfo.match(/Medical conditions:(.*?)(?=\n|$)/);
    if (medicalConditionsMatch && shortenedPrompt.length + medicalConditionsMatch[0].length + 20 <= maxLength) {
      shortenedPrompt += '\n\nUser has: ' + medicalConditionsMatch[0];
    }
  }
  
  // Add guidelines if there's space
  if (shortenedPrompt.length + guidelines.length <= maxLength) {
    shortenedPrompt += '\n\n' + guidelines;
  }
  
  // If still too long, use a super-simplified prompt
  if (shortenedPrompt.length > maxLength) {
    // Use an ultra-minimal prompt that fits within the limit
    return "You are a helpful health assistant. Be brief and accurate.";
  }
  
  return shortenedPrompt;
};

// Helper function to add delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to handle quota exceeded errors
const handleQuotaExceeded = async (userMessage, formattedHistory) => {
  console.log('Handling quota exceeded error');
  
  // First try rotating to a backup API key
  const rotated = rotateApiKey();
  if (!rotated) {
    console.log('Could not rotate to a backup API key, trying fallback model');
    
    // Add a delay before trying the fallback model to avoid hitting limits
    console.log('Waiting 3 seconds before trying fallback model...');
    await delay(3000);
    
    // If we can't rotate, try using a less resource-intensive model
    try {
      const fallbackModel = genAI.getGenerativeModel({ 
        model: FALLBACK_MODEL,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          topK: 40,
          topP: 0.95,
        }
      });
      
      // Start a new chat session with the fallback model
      const fallbackChat = fallbackModel.startChat({
        history: formattedHistory.length > 0 ? formattedHistory : [],
      });
      
      // Try with the fallback model - chunk the message if it's long
      const messageChunks = chunkMessage(userMessage, 300); // Smaller chunks for fallback
      let fullResponse = '';
      
      // Process each chunk sequentially with delays between chunks
      for (const chunk of messageChunks) {
        console.log(`Processing chunk (${chunk.length} chars) with fallback model`);
        
        try {
          const chunkResult = await fallbackChat.sendMessage(chunk);
          const chunkResponse = chunkResult.response.text();
          fullResponse += chunkResponse + ' ';
          
          // Add a small delay between chunks to avoid rate limits
          if (messageChunks.length > 1) {
            await delay(1000);
          }
        } catch (chunkError) {
          console.error('Error processing chunk with fallback model:', chunkError);
          // Continue with next chunk instead of failing completely
          continue;
        }
      }
      
      return fullResponse.trim() || "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.";
    } catch (fallbackError) {
      console.error('Error with fallback model:', fallbackError);
      
      // Try one last emergency fallback model
      console.log('Trying emergency fallback model as last resort...');
      try {
        // Add an even longer delay before trying the emergency fallback
        await delay(5000);
        
        const emergencyModel = genAI.getGenerativeModel({ 
          model: EMERGENCY_FALLBACK_MODEL,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topK: 40,
            topP: 0.95,
          }
        });
        
        // Use a very simple prompt without history to minimize token usage
        const simplifiedPrompt = "You are a health assistant. Please provide a brief, helpful response to this question: " + 
          userMessage.substring(0, Math.min(100, userMessage.length));
        
        const emergencyResult = await emergencyModel.generateContent(simplifiedPrompt);
        const emergencyResponse = emergencyResult.response.text();
        
        if (emergencyResponse && emergencyResponse.trim().length > 10) {
          return emergencyResponse;
        } else {
          throw new Error("Emergency fallback model returned empty response");
        }
      } catch (emergencyError) {
        console.error('Error with emergency fallback model:', emergencyError);
        
        // As a final resort, try Hugging Face models
        console.log('Trying Hugging Face models as final resort...');
        try {
          const huggingFaceResponse = await callHuggingFaceModel(userMessage);
          if (huggingFaceResponse && huggingFaceResponse.trim().length > 10) {
            console.log('Successfully got response from Hugging Face model');
            return huggingFaceResponse;
          } else {
            throw new Error("Hugging Face models returned empty response");
          }
        } catch (huggingFaceError) {
          console.error('Error with Hugging Face models:', huggingFaceError);
          throw fallbackError; // Re-throw the original error to be handled by the caller
        }
      }
    }
  } else {
    // Try Hugging Face as a fallback before attempting to rotate API keys
    console.log('Trying Hugging Face models before API key rotation...');
    try {
      const huggingFaceResponse = await callHuggingFaceModel(userMessage);
      if (huggingFaceResponse && huggingFaceResponse.trim().length > 10) {
        console.log('Successfully got response from Hugging Face model');
        return huggingFaceResponse;
      }
    } catch (huggingFaceError) {
      console.error('Error with Hugging Face models:', huggingFaceError);
      // Continue with API key rotation if Hugging Face fails
    }
    
    // If we successfully rotated to a new API key, try again with the original model
    try {
      // Add a delay before trying with the new API key
      console.log('Waiting 2 seconds before trying with new API key...');
      await delay(2000);
      
      const newModel = genAI.getGenerativeModel({ model: MODEL_NAME });
      
      // Start a new chat session
      const newChat = newModel.startChat({
        history: formattedHistory.length > 0 ? formattedHistory : [],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      });
      
      // Try again with the new API key - chunk the message if it's long
      const messageChunks = chunkMessage(userMessage, 400); // Smaller chunks for retry
      let fullResponse = '';
      
      // Process each chunk sequentially with delays between chunks
      for (const chunk of messageChunks) {
        console.log(`Processing chunk (${chunk.length} chars) with new API key`);
        
        try {
          const chunkResult = await newChat.sendMessage(chunk);
          const chunkResponse = chunkResult.response.text();
          fullResponse += chunkResponse + ' ';
          
          // Add a small delay between chunks to avoid rate limits
          if (messageChunks.length > 1) {
            await delay(1000);
          }
        } catch (chunkError) {
          console.error('Error processing chunk with new API key:', chunkError);
          // Continue with next chunk instead of failing completely
          continue;
        }
      }
      
      return fullResponse.trim() || "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.";
    } catch (retryError) {
      console.error('Error with rotated API key:', retryError);
      
      // If the retry also fails, try the fallback model
      if (retryError.status === 429) {
        console.log('Rotated API key also hit quota limits, trying fallback model');
        
        // Add a longer delay before trying the fallback model
        console.log('Waiting 5 seconds before trying fallback model...');
        await delay(5000);
        
        try {
          const fallbackModel = genAI.getGenerativeModel({ 
            model: FALLBACK_MODEL,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
              topK: 40,
              topP: 0.95,
            }
          });
          
          // Start a new chat session with the fallback model
          const fallbackChat = fallbackModel.startChat({
            history: formattedHistory.length > 0 ? formattedHistory : [],
          });
          
          // Try with the fallback model - chunk the message if it's long
          const messageChunks = chunkMessage(userMessage, 250); // Even smaller chunks as last resort
          let fullResponse = '';
          
          // Process each chunk sequentially with longer delays between chunks
          for (const chunk of messageChunks) {
            console.log(`Processing chunk (${chunk.length} chars) with fallback model (last resort)`);
            
            try {
              const chunkResult = await fallbackChat.sendMessage(chunk);
              const chunkResponse = chunkResult.response.text();
              fullResponse += chunkResponse + ' ';
              
              // Add a longer delay between chunks to avoid rate limits
              if (messageChunks.length > 1) {
                await delay(2000);
              }
            } catch (chunkError) {
              console.error('Error processing chunk with fallback model (last resort):', chunkError);
              // Continue with next chunk instead of failing completely
              continue;
            }
          }
          
          return fullResponse.trim() || "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.";
        } catch (fallbackError) {
          console.error('Error with fallback model:', fallbackError);
          
          // Try one last emergency fallback model
          console.log('Trying emergency fallback model as last resort...');
          try {
            // Add an even longer delay before trying the emergency fallback
            await delay(5000);
            
            const emergencyModel = genAI.getGenerativeModel({ 
              model: EMERGENCY_FALLBACK_MODEL,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
                topK: 40,
                topP: 0.95,
              }
            });
            
            // Use a very simple prompt without history to minimize token usage
            const simplifiedPrompt = "You are a health assistant. Please provide a brief, helpful response to this question: " + 
              userMessage.substring(0, Math.min(100, userMessage.length));
            
            const emergencyResult = await emergencyModel.generateContent(simplifiedPrompt);
            const emergencyResponse = emergencyResult.response.text();
            
            if (emergencyResponse && emergencyResponse.trim().length > 10) {
              return emergencyResponse;
            } else {
              throw new Error("Emergency fallback model returned empty response");
            }
          } catch (emergencyError) {
            console.error('Error with emergency fallback model:', emergencyError);
            
            // As a final resort, try Hugging Face models
            console.log('Trying Hugging Face models as final resort...');
            try {
              const huggingFaceResponse = await callHuggingFaceModel(userMessage);
              if (huggingFaceResponse && huggingFaceResponse.trim().length > 10) {
                console.log('Successfully got response from Hugging Face model');
                return huggingFaceResponse;
              } else {
                throw new Error("Hugging Face models returned empty response");
              }
            } catch (huggingFaceError) {
              console.error('Error with Hugging Face models:', huggingFaceError);
              throw fallbackError; // Re-throw the original error to be handled by the caller
            }
          }
        }
      } else {
        throw retryError; // Re-throw to be handled by the caller
      }
    }
  }
}

// Helper function to create a system prompt for the AI
const createSystemPrompt = (user) => {
  // Get critical user information
  const userName = user.name || 'Patient';
  const userAge = user.profile?.dateOfBirth ? calculateAge(user.profile.dateOfBirth) : 'Unknown';
  const medicalConditions = user.profile?.chronicConditions || 'None provided';
  const allergies = user.profile?.allergies || 'None provided';
  
  // Create a more concise system prompt
  return `You are HealthBot, an AI health assistant for SoulSpace Health.

User: ${userName}, Age: ${userAge}
Medical: ${medicalConditions}
Allergies: ${allergies}

Guidelines:
1. Be friendly and conversational
2. For health questions, assess symptom severity to determine if medical care is needed
3. For non-urgent conditions, provide evidence-based self-care advice
4. Keep responses concise and actionable
5. For emergencies, recommend immediate care; for urgent issues, same-day care; for non-urgent, self-care with monitoring
6. Avoid making diagnoses; clarify you're an AI assistant, not a doctor`;
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// Helper function to assess if self-care is appropriate based on symptoms and user profile
const assessSelfCareAppropriateness = (symptoms, userProfile) => {
  // Define conditions that always require medical attention
  const alwaysConsultDoctor = [
    'chest pain', 'difficulty breathing', 'shortness of breath', 'severe pain',
    'head injury', 'loss of consciousness', 'seizure', 'stroke', 'heart attack',
    'coughing blood', 'vomiting blood', 'severe bleeding', 'severe burn',
    'broken bone', 'dislocation', 'poisoning', 'overdose', 'suicidal thoughts'
  ];

  // Check if any symptoms require immediate medical attention
  for (const condition of alwaysConsultDoctor) {
    if (symptoms.includes(condition)) {
      return {
        selfCareAppropriate: false,
        reason: `Symptoms like "${condition}" require professional medical attention.`
      };
    }
  }

  // Consider user's chronic conditions if available
  if (userProfile?.chronicConditions) {
    const chronicConditions = userProfile.chronicConditions.toLowerCase();
    const highRiskConditions = ['diabetes', 'heart disease', 'copd', 'asthma', 'immunocompromised', 'cancer', 'kidney disease'];

    for (const condition of highRiskConditions) {
      if (chronicConditions.includes(condition)) {
        // For high-risk patients, be more conservative about self-care
        return {
          selfCareAppropriate: true,
          monitorClosely: true,
          reason: `While self-care may be appropriate, patients with ${condition} should monitor symptoms closely and seek medical attention if there's any worsening.`
        };
      }
    }
  }

  // Default to self-care being appropriate for minor symptoms
  return {
    selfCareAppropriate: true,
    reason: 'Based on the symptoms described, self-care measures may be appropriate. Monitor for any worsening of symptoms.'
  };
};

// Process user message and get AI response
exports.processMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user.id;

    // Truncate very long inputs to prevent token limit issues
    const truncatedMessage = message.length > 4000 
      ? message.substring(0, 4000) + "... (message truncated due to length)"
      : message;

    // Check if user is rate limited
    const rateLimitCheck = userRateLimiter.isRateLimited(userId);
    if (rateLimitCheck.limited) {
      console.log(`User ${userId} is rate limited: ${rateLimitCheck.reason}`);
      return res.status(429).json({
        text: rateLimitCheck.message,
        error: "Rate limit exceeded",
        retryAfter: rateLimitCheck.retryAfter,
        quotaExceeded: true
      });
    }

    // Check cache for identical or very similar recent queries
    const cachedResponse = responseCache.get(truncatedMessage, userId);
    if (cachedResponse) {
      // Record the request for rate limiting purposes, but with zero tokens since we're using cache
      userRateLimiter.recordRequest(userId, 0, 0);
      console.log(`Using cached response for user ${userId}`);
      
      return res.status(200).json({
        ...cachedResponse,
        fromCache: true
      });
    }

    // Get user information for context
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert message to lowercase for easier pattern matching
    const currentMessage = message.toLowerCase();

    // Format conversation history for Gemini AI
    // Gemini uses 'user' and 'model' roles instead of 'user' and 'assistant'
    // The history must start with a user message, so we'll filter and ensure proper ordering
    let formattedHistory = conversationHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Ensure the history starts with a user message
    if (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
      // If the first message is from the AI, remove it
      formattedHistory = formattedHistory.slice(1);
    }

    // If after filtering we still have messages and the first one isn't from a user,
    // we'll just start fresh without history
    if (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
      formattedHistory = [];
    }

    // Create the system prompt
    const systemPrompt = createSystemPrompt(user);

    // Initialize the Gemini model with fallback options
    let model;
    let currentModel = MODEL_NAME;
    try {
      model = genAI.getGenerativeModel({ model: currentModel });
    } catch (error) {
      console.error(`Error initializing ${currentModel}, trying fallback model:`, error);
      
      // Try rotating API keys first
      if (error.status === 429) {
        const rotated = rotateApiKey();
        if (rotated) {
          try {
            model = genAI.getGenerativeModel({ model: currentModel });
            console.log(`Successfully initialized ${currentModel} with backup API key`);
          } catch (retryError) {
            console.error(`Error initializing ${currentModel} with backup API key:`, retryError);
            // Fall back to a less resource-intensive model
            currentModel = FALLBACK_MODEL;
            model = genAI.getGenerativeModel({ model: currentModel });
            console.log(`Falling back to ${currentModel}`);
          }
        } else {
          // If we couldn't rotate API keys, fall back to a less resource-intensive model
          currentModel = FALLBACK_MODEL;
          model = genAI.getGenerativeModel({ model: currentModel });
          console.log(`Falling back to ${currentModel}`);
        }
      } else {
        // For other errors, just try the fallback model
        currentModel = FALLBACK_MODEL;
        model = genAI.getGenerativeModel({ model: currentModel });
        console.log(`Falling back to ${currentModel}`);
      }
    }

    // Start a chat session with error handling
    let chat;
    try {
      chat = model.startChat({
        history: formattedHistory.length > 0 ? formattedHistory : [],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      });
    } catch (chatError) {
      console.error('Error starting chat session:', chatError);
      // If we can't start a chat session, try again with empty history
      chat = model.startChat({
        history: [],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      });
    }

    // Always include the system prompt to ensure the AI has proper context
    // This helps ensure the AI responds to all types of questions appropriately
    const fullUserMessage = `${systemPrompt}\n\nUser message: ${message}`;

    // PREEMPTIVE CHECK: Check if this request would exceed our self-imposed limits
    // Use extremely conservative limits to prevent hitting quota errors
    const estimatedInputTokens = tokenUsageTracker.estimateTokens(fullUserMessage);
    
    // If the message is too large, use a simplified version
    if (estimatedInputTokens > 2000) {
      console.log(`Message too large (${estimatedInputTokens} tokens), using simplified version`);
      // Create a simplified version with just the essential parts
      const simplifiedMessage = message.substring(0, Math.min(200, message.length));
      const simplifiedPrompt = "You are a health assistant. Be brief and helpful.";
      const simplifiedFullMessage = `${simplifiedPrompt}\n\nUser message: ${simplifiedMessage}`;
      
      // Check if even the simplified message would exceed limits
      const limitsCheck = tokenUsageTracker.wouldExceedLimits(simplifiedFullMessage);
      if (limitsCheck.exceeded) {
        console.log(`Even simplified message would exceed limits due to ${limitsCheck.reason}`);
        // Skip API call entirely and use fallback
        return res.json({
          text: useRuleBasedFallback(truncatedMessage),
          isHealthTip: true,
          timestamp: new Date(),
          fallbackResponse: true,
          preemptiveFallback: true
        });
      }
    } else {
      // Check if the full message would exceed limits
      const limitsCheck = tokenUsageTracker.wouldExceedLimits(fullUserMessage);
      if (limitsCheck.exceeded) {
        console.log(`Preemptively avoiding API call due to ${limitsCheck.reason}`);
        
        // Try rotating to a different API key
        const rotated = rotateApiKey();
        
        if (rotated) {
          console.log(`Rotated to API key ${currentApiKeyIndex + 1} to avoid limits`);
          
          // Check if the new key would also exceed limits
          const newLimitsCheck = tokenUsageTracker.wouldExceedLimits(fullUserMessage);
          if (newLimitsCheck.exceeded) {
            console.log(`New API key would also exceed limits due to ${newLimitsCheck.reason}`);
            // Skip API call entirely and use fallback
            return res.json({
              text: useRuleBasedFallback(truncatedMessage),
              isHealthTip: true,
              timestamp: new Date(),
              fallbackResponse: true,
              preemptiveFallback: true
            });
          }
          
          // Reinitialize the model with the new API key
          try {
            model = genAI.getGenerativeModel({ model: currentModel });
            console.log(`Successfully reinitialized model with new API key`);
          } catch (error) {
            console.error(`Error reinitializing model with new API key:`, error);
            // If we can't initialize with the new key, use fallback
            return res.json({
              text: useRuleBasedFallback(truncatedMessage),
              isHealthTip: true,
              timestamp: new Date(),
              fallbackResponse: true,
              preemptiveFallback: true
            });
          }
        } else {
          // If we couldn't rotate, use fallback response
          console.log(`Could not rotate API key, using fallback response`);
          return res.json({
            text: useRuleBasedFallback(truncatedMessage),
            isHealthTip: true,
            timestamp: new Date(),
            fallbackResponse: true,
            preemptiveFallback: true
          });
        }
      }
    }

    // Generate response from Gemini with error handling
    let aiResponse;
    let useGeminiResponse = true; // Flag to determine if we should use Gemini's response or fallback logic

    try {
      // Use an ultra-conservative chunking approach to reduce token usage
      // Use extremely small chunks and a minimal system prompt
      const maxChunkSize = 200; // Drastically reduced chunk size
      
      // Split the message into smaller parts first
      const simplifiedMessage = fullUserMessage.length > 500 ? 
        fullUserMessage.substring(0, 500) + "..." : 
        fullUserMessage;
      
      // Create even smaller chunks
      const messageChunks = chunkMessage(simplifiedMessage, maxChunkSize);
      
      console.log(`Message chunked into ${messageChunks.length} parts`);
      let fullResponse = '';
      let chunkResponses = [];
      
      // Limit the number of chunks we'll process to avoid quota issues
      const maxChunksToProcess = Math.min(messageChunks.length, 1);      if (messageChunks.length > maxChunksToProcess) {
        console.log(`Limiting processing to ${maxChunksToProcess} chunks to avoid quota issues`);
      }
      
      // Process each chunk sequentially with delays between chunks
      for (let i = 0; i < maxChunksToProcess; i++) {
        const chunk = messageChunks[i];
        console.log(`Processing chunk ${i+1}/${maxChunksToProcess} (${chunk.length} chars)`);
        
        // Check if processing this chunk would exceed our limits
        const chunkLimitsCheck = tokenUsageTracker.wouldExceedLimits(chunk);
        if (chunkLimitsCheck.exceeded) {
          console.log(`Skipping chunk ${i+1} as it would exceed limits due to ${chunkLimitsCheck.reason}`);
          chunkResponses.push("I'm having trouble processing this part of your message due to system limitations.");
          continue; // Skip to next chunk
        }
        
        try {
          // Add a longer delay between chunks to avoid rate limits
          if (i > 0) {
            const delayTime = 3000; // 3 second delay between chunks
            console.log(`Waiting ${delayTime/1000}s before processing next chunk...`);
            await delay(delayTime);
          }
          
          // Before making the API call, check if we should rotate keys preemptively
          if (tokenUsageTracker.shouldRotateKey()) {
            console.log('Preemptively rotating API key before processing chunk');
            const rotated = rotateApiKey();
            
            if (rotated) {
              // Reinitialize the model and chat with the new API key
              console.log('Reinitializing model with new API key');
              model = genAI.getGenerativeModel({ model: currentModel });
              
              // Start a new chat session with minimal context
              chat = model.startChat({
                history: [],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 500, // Reduced output tokens
                },
              });
            }
          }
          
          // Make the API call with a timeout
          const chunkPromise = chat.sendMessage(chunk);
          
          // Set a timeout for the API call (10 seconds)
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('API call timed out')), 10000);
          });
          
          // Race the API call against the timeout
          const chunkResult = await Promise.race([chunkPromise, timeoutPromise]);
          const chunkResponse = chunkResult.response.text();
          
          // Record successful API call
          if (tokenUsageTracker.usage[currentApiKeyIndex].consecutiveErrors > 0) {
            tokenUsageTracker.usage[currentApiKeyIndex].consecutiveErrors = 0;
          }
          
          // Track token usage for each chunk
          tokenUsageTracker.recordUsage(chunk, chunkResponse);
          
          chunkResponses.push(chunkResponse);
          
          // Check if we should rotate API keys between chunks
          if (tokenUsageTracker.shouldRotateKey()) {
            console.log('Rotating API key between chunks');
            const rotated = rotateApiKey();
            
            if (rotated) {
              // Reinitialize the model and chat with the new API key
              console.log('Reinitializing model with new API key');
              model = genAI.getGenerativeModel({ model: currentModel });
              
              // Start a new chat session with the previous responses as context
              const previousMessages = [];
              
              // Add the first chunk as user message
              if (messageChunks.length > 0) {
                previousMessages.push({
                  role: 'user',
                  parts: [{ text: messageChunks[0] }]
                });
              }
              
              // Add the first response as model message
              if (chunkResponses.length > 0) {
                previousMessages.push({
                  role: 'model',
                  parts: [{ text: chunkResponses[0] }]
                });
              }
              
              // Initialize new chat with previous context
              chat = model.startChat({
                history: previousMessages,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 800,
                },
              });
              
              console.log('Successfully reinitialized chat with new API key');
            }
          }
        } catch (chunkError) {
          console.error(`Error processing chunk ${i+1}:`, chunkError);
          
          // If this is a quota exceeded error, try rotating API keys
          if (chunkError.status === 429) {
            console.log('Quota exceeded during chunk processing, trying to rotate API key');
            
            // Mark the current key as exceeded
            tokenUsageTracker.markKeyAsExceeded(
              chunkError.errorDetails?.[2]?.retryDelay || '60s'
            );
            
            const rotated = rotateApiKey();
            
            if (rotated) {
              console.log(`Rotating to API key ${currentApiKeyIndex + 1}`);
              
              // Check if the new key would also exceed limits
              const simplifiedChunk = chunk.length > 200 ? 
                chunk.substring(0, 200) + "..." : 
                chunk;
              
              const newKeyLimitsCheck = tokenUsageTracker.wouldExceedLimits(simplifiedChunk);
              if (newKeyLimitsCheck.exceeded) {
                console.log(`New key would also exceed limits due to ${newKeyLimitsCheck.reason}`);
                chunkResponses.push("I'm having trouble processing this part of your message due to system limitations.");
                continue; // Skip to next chunk
              }
              
              // Reinitialize the model with the new API key
              try {
                console.log('Reinitializing model with new API key');
                model = genAI.getGenerativeModel({ model: currentModel });
                
                // Start a new chat session with the new API key
                chat = model.startChat({
                  history: [],
                  generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500, // Reduced output tokens
                  },
                });
                
                // Try this chunk again with the new API key
                console.log('Retrying chunk with new API key');
              
                // Add a longer delay before retrying
                await delay(3000);
                
                try {
                  // Try with a simplified version of the chunk
                  const simplifiedChunk = chunk.length > 200 ? 
                    chunk.substring(0, 200) + "..." : 
                    chunk;
                  
                  const retryResult = await chat.sendMessage(simplifiedChunk);
                  const retryResponse = retryResult.response.text();
                  chunkResponses.push(retryResponse);
                  
                  // Track token usage for the retry
                  tokenUsageTracker.recordUsage(simplifiedChunk, retryResponse);
                  
                  console.log('Successfully processed chunk with new API key');
                  continue; // Continue to the next chunk
                } catch (retryError) {
                  console.error('Error retrying chunk with new API key:', retryError);
                  // Fall through to use a placeholder for this chunk
                }
              } catch (initError) {
                console.error('Error initializing model with new API key:', initError);
                // Fall through to use a placeholder for this chunk
              }
            }
            
            // If we couldn't rotate or the retry failed, use a placeholder for this chunk
            chunkResponses.push("I'm having trouble processing this part of your message due to system limitations.");
          } else {
            // For other errors, use a placeholder for this chunk
            chunkResponses.push("I'm having trouble processing this part of your message. Please try again with a simpler question.");
          }
        }
      }
      
      // Combine all chunk responses
      fullResponse = chunkResponses.join(' ').trim();
      
      // Clean up the response by removing any placeholder text if we have enough content
      if (fullResponse.length > 100) {
        fullResponse = fullResponse
          .replace(/I'm having trouble processing this part of your message due to system limitations\./g, '')
          .replace(/I'm having trouble processing this part of your message\. Please try again with a simpler question\./g, '')
          .trim();
      }
      
      aiResponse = fullResponse;
      
      // Check if we should proactively rotate before hitting limits
      if (tokenUsageTracker.shouldRotateKey()) {
        console.log('Proactively rotating API key based on usage patterns');
        rotateApiKey();
      }

      // If the response is empty, too short, or only contains error messages, use fallback logic
      if (!aiResponse || 
          aiResponse.trim().length < 10 || 
          aiResponse.includes("I'm having trouble processing") ||
          aiResponse.includes("system limitations")) {
        useGeminiResponse = false;
        console.log('Gemini response inadequate, using fallback logic');
        // Instead of generic fallback, return a minimal error
        aiResponse = "Sorry, I'm unable to answer your question right now. Please try again later.";
      }
    } catch (sendError) {
      console.error('Error sending message to Gemini:', sendError);
      useGeminiResponse = false;

      // Check if this is a quota exceeded error
      if (sendError.status === 429) {
        const retryDelay = sendError.errorDetails?.find(d => d['@type'].includes('RetryInfo'))?.retryDelay || '30s';
        console.log(`API quota exceeded. Retry after: ${retryDelay}`);
        
        // Mark the current key as exceeded in the token tracker
        tokenUsageTracker.markKeyAsExceeded(retryDelay);
        
        // Try rotating to a new API key
        const rotated = rotateApiKey();
        
        if (rotated) {
          // Try again with the new API key and a simplified message
          try {
            console.log('Trying again with new API key and simplified message');
            
            // Wait before retrying
            await delay(2000);
            
            // Reinitialize the model with the new API key
            model = genAI.getGenerativeModel({ model: currentModel });
            
            // Create a simplified version of the message to reduce token usage
            const simplifiedMessage = truncatedMessage.length > 200 
              ? truncatedMessage.substring(0, 200) + "..."
              : truncatedMessage;
            
            // Create a minimal system prompt
            const minimalPrompt = `You are HealthBot, a health assistant. Be brief and helpful.`;
            
            // Combine into a simplified full message
            const simplifiedFullMessage = `${minimalPrompt}\n\nUser message: ${simplifiedMessage}`;
            
            // Start a new chat with minimal history
            const simpleChat = model.startChat({
              history: [],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500, // Reduced output tokens
              },
            });
            
            // Send the simplified message
            const simpleResult = await simpleChat.sendMessage(simplifiedFullMessage);
            aiResponse = simpleResult.response.text();
            
            if (aiResponse && aiResponse.trim().length > 10) {
              useGeminiResponse = true;
              console.log('Successfully got response with new API key and simplified message');
              
              // Track token usage
              tokenUsageTracker.recordUsage(simplifiedFullMessage, aiResponse);
              
              // Return the response
              return res.status(200).json({
                text: aiResponse,
                isHealthTip: true,
                timestamp: new Date(),
                simplifiedResponse: true
              });
            }
          } catch (retryError) {
            console.error('Error with retry using new API key:', retryError);
          }
        }
        
        // If retry with new API key failed or we couldn't rotate, use rule-based fallback
        console.log('API quota exceeded, using rule-based fallback');
        
        // Use our rule-based fallback
        aiResponse = useRuleBasedFallback(truncatedMessage);
        useGeminiResponse = true;
        console.log('Successfully recovered from quota exceeded error with rule-based fallback');
        
        // Return the response without the 429 status code
        return res.status(200).json({
          text: aiResponse,
          isHealthTip: true,
          timestamp: new Date(),
          fallbackResponse: true,
          ruleBasedResponse: true
        });
        
        /* Commenting out the complex fallback chain since it's not working reliably
        try {
          // Use the handleQuotaExceeded function to try multiple fallback options
          aiResponse = await handleQuotaExceeded(fullUserMessage, formattedHistory);
          
          if (aiResponse && aiResponse.trim().length > 10) {
            useGeminiResponse = true;
            console.log('Successfully recovered from quota exceeded error');
            
            // Record the token usage for the successful response
            tokenUsageTracker.recordUsage(fullUserMessage, aiResponse);
          } else {
            console.log('Fallback response too short, using default fallback');
            useGeminiResponse = false;
          }
        } catch (quotaHandlingError) {
          console.error('All quota handling attempts failed:', quotaHandlingError);
        }
        */
        
        // Check if we have a Hugging Face API key
        if (HUGGING_FACE_API_KEY && HUGGING_FACE_API_KEY.trim() !== '') {
          console.log('Trying Hugging Face model as last resort...');
          
          try {
            // Try using Hugging Face model as a last resort
            const huggingFaceResponse = await callHuggingFaceModel(message);
            
            if (huggingFaceResponse) {
              aiResponse = huggingFaceResponse;
              useGeminiResponse = true;
              console.log('Successfully got response from Hugging Face model');
              
              // Return the response without the 429 status code
              return res.status(200).json({
                text: aiResponse,
                isHealthTip: true,
                timestamp: new Date(),
                fallbackResponse: true,
                fromHuggingFace: true
              });
            }
          } catch (huggingFaceError) {
            console.error('Error with Hugging Face model:', huggingFaceError);
          }
        } else {
          console.log('No Hugging Face API key available, skipping Hugging Face models');
        }
        
        // Use our rule-based fallback directly
        console.log('Using rule-based fallback response');
        aiResponse = useRuleBasedFallback(message);
        useGeminiResponse = true;
        
        // Return the response without the 429 status code
        return res.status(200).json({
          text: aiResponse,
          isHealthTip: true,
          timestamp: new Date(),
          fallbackResponse: true,
          ruleBasedResponse: true
        });
      }

      // If we still don't have a valid response, provide a fallback
      if (!aiResponse || !useGeminiResponse) {
        // If we can't get a response from Gemini for other reasons, provide a fallback response
        if (currentMessage.includes('doctor')) {
          aiResponse = "I'm not a doctor. I'm an AI health assistant designed to provide general health information and guidance. While I can offer information about common health concerns and wellness tips, I cannot provide medical diagnoses or replace professional medical advice. For specific medical concerns, it's always best to consult with a qualified healthcare provider.";
        } else {
          aiResponse = "I apologize, but I'm having trouble processing your request right now. As a health assistant, I can provide general health information, but for specific medical advice, it's always best to consult with a healthcare professional.";
        }
      }
    }

    // Get conversation context from history
    const userMessages = formattedHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.parts[0].text.toLowerCase());

    const lastUserMessages = userMessages.slice(-3);

    // Extract key medical terms for better pattern matching
    const extractKeyTerms = (text) => {
      const medicalTerms = [
        // Symptoms
        'pain', 'ache', 'sore', 'hurt', 'discomfort', 'swelling', 'fever', 'cough', 'cold', 'flu',
        'headache', 'migraine', 'nausea', 'vomit', 'diarrhea', 'constipation', 'rash', 'itch',
        'fatigue', 'tired', 'exhausted', 'dizzy', 'faint', 'weak', 'numbness', 'tingle',
        'bleed', 'blood', 'bruise', 'burn', 'cut', 'wound', 'injury', 'sprain', 'strain',
        'breath', 'breathing', 'short of breath', 'wheeze', 'chest', 'heart', 'palpitation',
        'pressure', 'dizzy', 'vision', 'hearing', 'ear', 'eye', 'nose', 'throat', 'mouth',
        'stomach', 'abdomen', 'back', 'neck', 'shoulder', 'arm', 'leg', 'joint', 'muscle',
        'sleep', 'insomnia', 'appetite', 'weight', 'thirst', 'urination', 'bowel', 'stool',

        // Conditions
        'allergy', 'asthma', 'diabetes', 'hypertension', 'pressure', 'cholesterol', 'arthritis',
        'infection', 'virus', 'bacterial', 'inflammation', 'disease', 'disorder', 'syndrome',
        'cancer', 'tumor', 'depression', 'anxiety', 'stress', 'mental', 'heart', 'cardiac',
        'stroke', 'kidney', 'liver', 'lung', 'respiratory', 'digestive', 'gastrointestinal',
        'neurological', 'autoimmune', 'thyroid', 'hormone', 'deficiency', 'chronic', 'acute',

        // Treatments
        'medicine', 'medication', 'drug', 'pill', 'tablet', 'capsule', 'prescription', 'dose',
        'therapy', 'treatment', 'surgery', 'procedure', 'exercise', 'diet', 'nutrition',
        'supplement', 'vitamin', 'mineral', 'natural', 'alternative', 'home remedy',
        'prevention', 'management', 'recovery', 'rehabilitation', 'physical therapy',

        // Healthcare
        'doctor', 'physician', 'specialist', 'nurse', 'hospital', 'clinic', 'emergency',
        'appointment', 'checkup', 'test', 'scan', 'x-ray', 'mri', 'ct', 'ultrasound', 'blood test',
        'diagnosis', 'prognosis', 'symptom', 'side effect', 'complication', 'risk', 'benefit'
      ];

      return medicalTerms.filter(term => text.includes(term));
    };

    const keyTerms = extractKeyTerms(currentMessage);
    const previousKeyTerms = lastUserMessages.flatMap(msg => extractKeyTerms(msg));

    // More sophisticated assessment of whether an appointment should be suggested
    // First check if the AI response already suggests an appointment
    const appointmentKeywords = ['doctor', 'appointment', 'medical attention', 'healthcare provider', 'consult', 'professional', 'emergency'];
    let suggestAppointment = appointmentKeywords.some(keyword =>
      aiResponse.toLowerCase().includes(keyword)
    );

    // Assess symptom severity based on the user's message
    const emergencyKeywords = ['severe', 'unbearable', 'worst', 'extreme', 'excruciating', 'can\'t breathe', 'chest pain', 'collapsed', 'unconscious', 'seizure', 'stroke', 'heart attack'];
    const urgentKeywords = ['fever', 'infection', 'worsening', 'spreading', 'persistent', 'days', 'no improvement', 'getting worse'];

    const hasEmergencySymptoms = emergencyKeywords.some(keyword =>
      currentMessage.includes(keyword)
    );

    const hasUrgentSymptoms = urgentKeywords.some(keyword =>
      currentMessage.includes(keyword)
    );

    // Override appointment suggestion based on symptom severity
    if (hasEmergencySymptoms) {
      suggestAppointment = true; // Always suggest for emergency symptoms
    } else if (hasUrgentSymptoms && keyTerms.length > 0) {
      // For urgent symptoms, suggest appointment if medical terms are present
      suggestAppointment = true;
    }

    // Assess if self-care is appropriate based on the user's message and profile
    const selfCareAssessment = assessSelfCareAppropriateness(currentMessage, user.profile);

    // If self-care is not appropriate, suggest an appointment
    if (!selfCareAssessment.selfCareAppropriate) {
      suggestAppointment = true;
    }

    // Check if this is a follow-up to a previous question from the AI
    const aiMessages = formattedHistory
      .filter(msg => msg.role === 'model')
      .map(msg => msg.parts[0].text);

    const lastAiMessage = aiMessages.length > 0 ? aiMessages[aiMessages.length - 1] : '';
    const isFollowingUp = lastAiMessage.includes('could you provide more details') ||
                         lastAiMessage.includes('could you share more') ||
                         lastAiMessage.includes('can you tell me more');

    // Only use our predefined responses if Gemini failed or returned a very short response
    if (!useGeminiResponse) {
      // Check for greeting patterns
      if (
        (currentMessage.includes('hello') || currentMessage.includes('hi') || currentMessage.includes('hey')) &&
        userMessages.length <= 1
      ) {
        aiResponse = `Hello! I'm your AI health assistant. I can provide general health information and guidance. How can I help you today?`;
      }
      // Check for common symptoms and provide detailed responses
      else if (currentMessage.includes('headache')) {
      // Check for severity indicators
      const severe = (
        currentMessage.includes('severe') ||
        currentMessage.includes('worst') ||
        currentMessage.includes('terrible') ||
        currentMessage.includes('unbearable')
      );

      const persistent = (
        currentMessage.includes('days') ||
        currentMessage.includes('weeks') ||
        currentMessage.includes('constant') ||
        currentMessage.includes('won\'t go away')
      );

      if (severe || persistent) {
        aiResponse = 'Based on your description, your headache sounds concerning. Severe or persistent headaches can be symptoms of serious conditions that require medical attention. I strongly recommend scheduling an appointment with a doctor as soon as possible.';
        suggestAppointment = true;
      } else {
        aiResponse = 'Headaches can be caused by various factors including stress, dehydration, lack of sleep, or eye strain. For mild headaches, you can try:\n\n- Drinking water to stay hydrated\n- Taking a break from screens\n- Getting adequate rest\n- Using over-the-counter pain relievers like acetaminophen or ibuprofen (following package instructions)\n\nIf your headache persists for more than a few days, worsens significantly, or is accompanied by other symptoms like fever, vision changes, or neck stiffness, you should consult a healthcare professional.';
      }
    }
    else if (currentMessage.includes('fever')) {
      // Check for high fever or duration
      const highFever = (
        currentMessage.includes('high') ||
        currentMessage.includes('103') ||
        currentMessage.includes('104') ||
        currentMessage.includes('39')
      );

      const longDuration = (
        currentMessage.includes('days') ||
        currentMessage.includes('week')
      );

      if (highFever || longDuration) {
        aiResponse = 'A high or persistent fever requires medical attention. Please consult with a healthcare provider as soon as possible, as this could indicate a serious infection or condition that needs proper diagnosis and treatment.';
        suggestAppointment = true;
      } else {
        aiResponse = 'A mild fever (below 101°F or 38.3°C) is often your body\'s natural response to fighting an infection. To manage a mild fever:\n\n- Rest and stay hydrated\n- Take acetaminophen or ibuprofen as directed\n- Use a cool compress if comfortable\n\nHowever, if your fever is high (above 103°F or 39.4°C), lasts more than three days, or is accompanied by severe symptoms like difficulty breathing, chest pain, or confusion, you should seek medical care immediately.';
      }
    }
    else if (currentMessage.includes('cough')) {
      // Check for concerning symptoms
      const concerning = (
        currentMessage.includes('blood') ||
        currentMessage.includes('can\'t breathe') ||
        currentMessage.includes('difficult to breathe') ||
        currentMessage.includes('chest pain') ||
        currentMessage.includes('weeks')
      );

      if (concerning) {
        aiResponse = 'Coughing up blood, experiencing breathing difficulties, chest pain, or having a cough that persists for weeks are serious symptoms that require immediate medical attention. Please consult with a healthcare provider as soon as possible.';
        suggestAppointment = true;
      } else {
        aiResponse = 'A cough can be caused by various factors including viral infections, allergies, or irritants. For a common cough:\n\n- Stay hydrated and rest\n- Use honey (if over 1 year old) or cough drops to soothe your throat\n- Use a humidifier to add moisture to the air\n- Avoid irritants like smoke\n\nIf your cough persists for more than 2 weeks, produces discolored mucus, or is accompanied by fever, shortness of breath, or chest pain, you should consult a healthcare professional.';
      }
    }
    else if (currentMessage.includes('rash') || currentMessage.includes('skin')) {
      // Check for concerning symptoms
      const concerning = (
        currentMessage.includes('spreading') ||
        currentMessage.includes('fever') ||
        currentMessage.includes('pain') ||
        currentMessage.includes('face') ||
        currentMessage.includes('throat')
      );

      if (concerning) {
        aiResponse = 'A rash that is spreading rapidly, accompanied by fever or pain, or located on the face or throat could indicate a serious condition like an allergic reaction or infection. Please seek medical attention promptly.';
        suggestAppointment = true;
      } else {
        aiResponse = 'Skin rashes can be caused by allergic reactions, infections, heat, or irritants. For mild rashes:\n\n- Avoid scratching the affected area\n- Apply cool compresses\n- Use over-the-counter hydrocortisone cream for itching\n- Take an antihistamine if you suspect an allergic reaction\n\nIf the rash covers a large area, blisters, becomes painful, or doesn\'t improve within a few days, you should consult a healthcare professional.';
      }
    }
    else if (currentMessage.includes('stomach') || currentMessage.includes('nausea') || currentMessage.includes('vomit') || currentMessage.includes('diarrhea')) {
      // Check for concerning symptoms
      const concerning = (
        currentMessage.includes('blood') ||
        currentMessage.includes('severe') ||
        currentMessage.includes('days') ||
        currentMessage.includes('dehydrated')
      );

      if (concerning) {
        aiResponse = 'Severe or persistent digestive symptoms, especially those involving blood or causing dehydration, require medical attention. Please consult with a healthcare provider promptly.';
        suggestAppointment = true;
      } else {
        aiResponse = 'Digestive issues like nausea, vomiting, or diarrhea are often caused by viral infections, food poisoning, or dietary changes. To manage mild symptoms:\n\n- Stay hydrated with small sips of water or electrolyte solutions\n- Eat bland foods like bananas, rice, applesauce, and toast when you can tolerate food\n- Avoid dairy, fatty, spicy, or highly seasoned foods\n- Rest and monitor your symptoms\n\nIf symptoms are severe, persist for more than 2 days, or are accompanied by high fever, severe abdominal pain, or signs of dehydration, you should seek medical care.';
      }
    }
    else if (currentMessage.includes('chest pain') || currentMessage.includes('heart')) {
      aiResponse = 'Chest pain can be a symptom of serious conditions including heart problems and requires immediate medical attention. Please call emergency services or go to the nearest emergency room right away. Do not wait or try to self-treat chest pain.';
      suggestAppointment = true;
    }
    else if (currentMessage.includes('breathing') || currentMessage.includes('breath')) {
      aiResponse = 'Difficulty breathing is a serious symptom that requires prompt medical attention. Please seek emergency care if you\'re experiencing significant breathing problems. If your symptoms are mild but persistent, you should still consult with a healthcare provider soon.';
      suggestAppointment = true;
    }
    else if (currentMessage.includes('appointment') || currentMessage.includes('book') || currentMessage.includes('schedule') || currentMessage.includes('doctor')) {
      aiResponse = 'I can help you book an appointment with a healthcare provider. Would you like to schedule one now? You can choose between an in-person visit or a virtual consultation.';
      suggestAppointment = true;
    }
    else if (currentMessage.includes('stress') || currentMessage.includes('anxiety') || currentMessage.includes('depress')) {
      // Check for severity indicators
      const severe = (
        currentMessage.includes('severe') ||
        currentMessage.includes('suicid') ||
        currentMessage.includes('kill') ||
        currentMessage.includes('harm myself') ||
        currentMessage.includes('end my life')
      );

      if (severe) {
        aiResponse = 'I\'m concerned about what you\'re sharing. If you\'re having thoughts of harming yourself, please reach out to a mental health professional or crisis helpline immediately. In the US, you can call or text 988 to reach the Suicide and Crisis Lifeline, which provides 24/7 support. Your life matters, and help is available.';
        suggestAppointment = true;
      } else {
        aiResponse = 'Mental health is just as important as physical health. For managing stress and anxiety, you might try:\n\n- Deep breathing exercises or meditation\n- Regular physical activity\n- Maintaining a consistent sleep schedule\n- Limiting caffeine and alcohol\n- Connecting with supportive friends or family\n- Practicing mindfulness or relaxation techniques\n\nIf your symptoms are persistent or interfering with your daily life, speaking with a mental health professional can be very helpful. Would you like help finding mental health resources?';
        suggestAppointment = true;
      }
    }
    else if (currentMessage.includes('thank')) {
      aiResponse = 'You\'re welcome! I\'m glad I could help. If you have any other health questions or concerns in the future, don\'t hesitate to ask. Your health is important!';
    }
    else if (currentMessage.includes('bye') || currentMessage.includes('goodbye')) {
      aiResponse = 'Take care! Remember to prioritize your health and well-being. I\'m here if you need health information or guidance in the future.';
    }
    else if (currentMessage.includes('diet') || currentMessage.includes('nutrition') || currentMessage.includes('food') || currentMessage.includes('eat')) {
      // Check for specific diet questions
      if (currentMessage.includes('weight loss') || currentMessage.includes('lose weight')) {
        aiResponse = 'For healthy weight management, focus on sustainable lifestyle changes rather than restrictive diets:\n\n- Create a modest calorie deficit (about 500 calories/day for gradual weight loss)\n- Emphasize nutrient-dense foods like vegetables, fruits, lean proteins, and whole grains\n- Stay hydrated with water instead of sugary beverages\n- Include regular physical activity\n- Get adequate sleep\n- Practice mindful eating\n\nRemember that healthy weight loss is typically 1-2 pounds per week. For personalized advice, consider consulting with a registered dietitian or your healthcare provider.';
      } else if (currentMessage.includes('diabetes') || currentMessage.includes('blood sugar')) {
        aiResponse = 'For managing blood sugar levels, consider these nutritional approaches:\n\n- Monitor carbohydrate intake and choose complex carbs over simple sugars\n- Include fiber-rich foods which help regulate blood sugar\n- Maintain regular meal timing\n- Stay hydrated\n- Include lean proteins with meals\n- Limit highly processed foods and added sugars\n\nIt\'s important to work with your healthcare provider to develop a personalized nutrition plan for diabetes management.';
        suggestAppointment = true;
      } else {
        aiResponse = 'A balanced diet is fundamental to good health. General nutrition recommendations include:\n\n- Eat a variety of fruits and vegetables daily (aim for half your plate)\n- Choose whole grains over refined grains\n- Include lean proteins (plant or animal-based)\n- Incorporate healthy fats like those from nuts, seeds, and olive oil\n- Limit added sugars, sodium, and highly processed foods\n- Stay hydrated, primarily with water\n- Practice portion awareness\n\nThese are general guidelines - individual nutritional needs vary based on age, activity level, health conditions, and other factors.';
      }
    }
    else if (currentMessage.includes('exercise') || currentMessage.includes('workout') || currentMessage.includes('fitness') || currentMessage.includes('physical activity')) {
      // Check for specific exercise questions
      if (currentMessage.includes('back pain') || currentMessage.includes('joint pain') || currentMessage.includes('injury')) {
        aiResponse = 'When dealing with pain or injury, it\'s important to approach exercise cautiously:\n\n- Consult with a healthcare provider before starting any exercise program\n- Consider low-impact activities like swimming, walking, or stationary cycling\n- Gentle stretching and range-of-motion exercises may help, but stop if pain increases\n- Physical therapy exercises prescribed by a professional can be very beneficial\n\nI recommend speaking with a healthcare provider who can evaluate your specific condition and provide personalized guidance.';
        suggestAppointment = true;
      } else if (currentMessage.includes('start') || currentMessage.includes('beginner')) {
        aiResponse = 'For beginners starting an exercise routine:\n\n- Start slowly with manageable goals (even 10 minutes daily is beneficial)\n- Aim for a mix of cardiovascular activity, strength training, and flexibility exercises\n- Walking is an excellent starting point for many people\n- Focus on proper form rather than intensity or duration\n- Allow rest days between workouts, especially when beginning\n- Listen to your body and avoid pushing through pain\n\nThe CDC recommends adults aim for 150 minutes of moderate activity weekly, but it\'s perfectly fine to build up to this gradually.';
      } else {
        aiResponse = 'Regular physical activity offers numerous health benefits. General exercise recommendations include:\n\n- Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly\n- Include muscle-strengthening activities at least twice weekly\n- Add flexibility and balance exercises, especially as you age\n- Break up exercise into smaller sessions if needed\n- Find activities you enjoy to help maintain consistency\n- Include both structured exercise and everyday movement\n\nRemember that any amount of physical activity is better than none, and it\'s never too late to start.';
      }
    }
    // Check if multiple messages indicate a persistent issue
    else if (lastUserMessages.length >= 2 && lastUserMessages.some(msg =>
      msg.includes('still') || msg.includes('worse') || msg.includes('not better')
    )) {
      aiResponse = 'Based on our conversation, it seems your symptoms are persistent or worsening. When self-care measures don\'t improve your condition, it\'s best to consult with a healthcare professional for proper evaluation and treatment. Would you like help scheduling an appointment?';
      suggestAppointment = true;
    }
    else if (currentMessage.includes('medicine') || currentMessage.includes('medication') || currentMessage.includes('drug') || currentMessage.includes('pill') || currentMessage.includes('prescription')) {
      aiResponse = 'I understand you have a question about medication. While I can provide general information about medications, I cannot offer specific medical advice about prescriptions, dosages, or medication changes.\n\nFor medication-specific questions, please consult with your healthcare provider or pharmacist who can provide personalized guidance based on your medical history and current medications.\n\nWould you like me to help you schedule an appointment with a healthcare provider to discuss your medication questions?';
      suggestAppointment = true;
    }
    // Handle questions about what to do for specific conditions
    else if (currentMessage.includes('what should i do') || currentMessage.includes('how to treat') ||
             currentMessage.includes('how do i') || currentMessage.includes('what can i do') ||
             currentMessage.includes('how can i') || currentMessage.includes('what to do')) {

      // Check if there are specific symptoms or conditions mentioned
      if (keyTerms.length > 0 || previousKeyTerms.length > 0) {
        const relevantTerms = [...new Set([...keyTerms, ...previousKeyTerms])];

        // Common cold/flu symptoms
        if (relevantTerms.some(term => ['cold', 'flu', 'cough', 'congestion', 'sore throat', 'runny nose'].includes(term))) {
          aiResponse = 'For managing cold or flu symptoms:\n\n1. Rest and get plenty of sleep to help your immune system fight the infection\n2. Stay hydrated with water, clear broth, or warm lemon water with honey\n3. Use over-the-counter medications appropriately:\n   - Acetaminophen or ibuprofen can help with fever and pain\n   - Decongestants can help with nasal stuffiness\n   - Cough suppressants for dry coughs, expectorants for productive coughs\n4. Use a humidifier or take steamy showers to ease congestion\n5. Gargle with salt water to soothe a sore throat\n\nMost colds and mild flu cases resolve within 7-10 days. However, if you have a high fever (above 101.3°F or 38.5°C), severe symptoms, difficulty breathing, or symptoms that worsen after initially improving, you should consult a healthcare provider.';
        }
        // Headache
        else if (relevantTerms.includes('headache') || relevantTerms.includes('migraine')) {
          aiResponse = 'For managing headaches:\n\n1. Take an appropriate over-the-counter pain reliever like acetaminophen, ibuprofen, or aspirin (following package instructions)\n2. Rest in a quiet, dark room if light and sound sensitivity is present\n3. Apply a cold or warm compress to your head or neck\n4. Stay hydrated and maintain regular meals\n5. Practice relaxation techniques like deep breathing or meditation\n6. For recurring headaches, try to identify and avoid triggers (certain foods, stress, lack of sleep)\n\nIf your headache is sudden and severe, accompanied by fever, stiff neck, confusion, seizures, double vision, weakness, numbness, or difficulty speaking, seek emergency medical attention as these could indicate a serious condition.';
        }
        // Joint/muscle pain
        else if (relevantTerms.some(term => ['joint', 'muscle', 'back', 'neck', 'shoulder', 'knee', 'arthritis', 'sprain', 'strain'].includes(term))) {
          aiResponse = 'For managing joint or muscle pain:\n\n1. Rest the affected area and avoid activities that cause pain\n2. Apply ice for the first 48-72 hours to reduce inflammation (20 minutes on, 20 minutes off)\n3. After 48-72 hours, apply heat to increase blood flow and promote healing\n4. Take over-the-counter pain relievers like acetaminophen or anti-inflammatories like ibuprofen\n5. Use compression bandages for support if appropriate\n6. Elevate the affected limb if possible\n7. Gentle stretching and movement once acute pain subsides\n\nIf pain is severe, worsening, accompanied by significant swelling or inability to bear weight, or persists beyond a week, consult with a healthcare provider for proper evaluation and treatment.';
        }
        // Digestive issues
        else if (relevantTerms.some(term => ['stomach', 'nausea', 'vomit', 'diarrhea', 'constipation', 'indigestion', 'heartburn', 'acid reflux', 'gas', 'bloating'].includes(term))) {
          aiResponse = 'For managing digestive issues:\n\n1. Stay hydrated with water, clear broths, or electrolyte solutions\n2. Follow the BRAT diet for diarrhea (Bananas, Rice, Applesauce, Toast)\n3. Eat smaller, more frequent meals\n4. Avoid trigger foods (spicy, fatty, acidic foods, caffeine, alcohol)\n5. For heartburn, avoid lying down for 2-3 hours after eating\n6. For constipation, increase fiber intake gradually and stay well-hydrated\n7. Over-the-counter medications can help specific symptoms:\n   - Antacids for heartburn\n   - Anti-diarrheals for diarrhea (if not caused by infection)\n   - Gentle laxatives for constipation\n\nIf symptoms are severe, persistent, or accompanied by fever, severe pain, blood in stool or vomit, or signs of dehydration, seek medical attention promptly.';
        }
        // Skin issues
        else if (relevantTerms.some(term => ['rash', 'itch', 'skin', 'hives', 'eczema', 'acne', 'dermatitis'].includes(term))) {
          aiResponse = 'For managing skin issues:\n\n1. Avoid scratching to prevent infection and further irritation\n2. Keep the affected area clean with gentle, fragrance-free soap and water\n3. Apply cool compresses to relieve itching and inflammation\n4. Use over-the-counter hydrocortisone cream (1%) for itching and inflammation\n5. Take an antihistamine like diphenhydramine for allergic reactions\n6. Moisturize with fragrance-free lotions for dry skin conditions\n7. For acne, use products containing benzoyl peroxide or salicylic acid\n\nIf the rash is widespread, painful, blistering, accompanied by fever, or doesn\'t improve with home treatment, consult a healthcare provider. Also seek medical attention for any sudden, severe allergic reactions with breathing difficulties.';
        }
        // Sleep issues
        else if (relevantTerms.some(term => ['sleep', 'insomnia', 'tired', 'fatigue', 'exhausted'].includes(term))) {
          aiResponse = 'For improving sleep quality:\n\n1. Maintain a consistent sleep schedule, even on weekends\n2. Create a relaxing bedtime routine (reading, gentle stretching, warm bath)\n3. Optimize your sleep environment:\n   - Keep your bedroom cool, dark, and quiet\n   - Use comfortable bedding\n   - Remove electronic devices\n4. Limit caffeine, alcohol, and large meals before bedtime\n5. Reduce screen time 1-2 hours before bed (blue light can disrupt sleep)\n6. Regular physical activity can improve sleep quality (but not too close to bedtime)\n7. Practice relaxation techniques like deep breathing, meditation, or progressive muscle relaxation\n\nIf sleep problems persist despite these measures and interfere with daily functioning, consider consulting a healthcare provider to rule out underlying sleep disorders or other health conditions.';
        }
        // Stress/anxiety
        else if (relevantTerms.some(term => ['stress', 'anxiety', 'worry', 'nervous', 'panic', 'overwhelm', 'mental'].includes(term))) {
          aiResponse = 'For managing stress and anxiety:\n\n1. Practice deep breathing exercises (breathe in for 4 counts, hold for 1, exhale for 6)\n2. Try progressive muscle relaxation (tensing and releasing muscle groups)\n3. Engage in regular physical activity, which can reduce stress hormones\n4. Maintain a consistent sleep schedule and prioritize good sleep hygiene\n5. Limit caffeine and alcohol, which can worsen anxiety\n6. Practice mindfulness meditation or guided imagery\n7. Connect with supportive friends and family\n8. Set boundaries and practice saying no to excessive demands\n9. Break large tasks into smaller, manageable steps\n\nIf anxiety significantly interferes with daily activities, relationships, or quality of life, consider speaking with a mental health professional who can provide additional strategies and support.';
        }
        // Allergies
        else if (relevantTerms.some(term => ['allergy', 'allergic', 'hay fever', 'seasonal', 'pollen', 'dust', 'pet'].includes(term))) {
          aiResponse = 'For managing allergies:\n\n1. Identify and avoid allergen triggers when possible\n2. For environmental allergies:\n   - Keep windows closed during high pollen seasons\n   - Use air purifiers with HEPA filters\n   - Shower and change clothes after being outdoors\n   - Regularly clean and vacuum your home\n3. Over-the-counter medications can help:\n   - Antihistamines (like cetirizine, loratadine) for sneezing, itching, runny nose\n   - Decongestants for nasal congestion (use only short-term)\n   - Nasal corticosteroid sprays for inflammation\n4. Saline nasal irrigation can help clear allergens\n5. For severe or persistent allergies, consider seeing an allergist for proper testing and possibly immunotherapy\n\nIf you experience symptoms of a severe allergic reaction (difficulty breathing, swelling of face/throat, rapid heartbeat), seek emergency medical attention immediately.';
        }
        else {
          // Provide a more specific response based on the medical terms identified
          aiResponse = `Based on your mention of ${relevantTerms.join(', ')}, here are some general recommendations:\n\n1. Monitor your symptoms and note any changes in severity or new symptoms\n2. For mild discomfort, appropriate over-the-counter medications may help\n3. Ensure you're getting adequate rest and staying hydrated\n4. Avoid activities that worsen your symptoms\n\nHowever, for a proper assessment of your specific situation with ${relevantTerms.join(', ')}, I recommend consulting with a healthcare provider who can provide personalized advice based on your medical history and a thorough examination.`;
          suggestAppointment = true;
        }
      } else {
        // No specific medical terms found, ask for more details
        aiResponse = 'I\'d be happy to provide guidance, but could you please share more details about your specific symptoms or health concern? This will help me give you more relevant information about what you can do to address it.';
      }
    }
    // Handle information requests about specific conditions
    else if (currentMessage.includes('what is') || currentMessage.includes('tell me about') ||
             currentMessage.includes('information about') || currentMessage.includes('learn about')) {

      // Check for specific conditions
      if (currentMessage.includes('diabetes')) {
        aiResponse = 'Diabetes is a chronic condition that affects how your body turns food into energy. There are several types:\n\n- Type 1 diabetes: The body doesn\'t produce insulin. Usually diagnosed in children and young adults.\n\n- Type 2 diabetes: The body doesn\'t use insulin properly. This is the most common type and is often related to lifestyle factors.\n\n- Gestational diabetes: Occurs during pregnancy.\n\nCommon symptoms include increased thirst, frequent urination, unexplained weight loss, fatigue, blurred vision, and slow-healing sores.\n\nManagement typically involves monitoring blood sugar, medication or insulin therapy, healthy eating, regular physical activity, and maintaining a healthy weight. Regular medical check-ups are essential for managing diabetes effectively.';
      }
      else if (currentMessage.includes('hypertension') || (currentMessage.includes('blood') && currentMessage.includes('pressure'))) {
        aiResponse = 'Hypertension, or high blood pressure, is a common condition where the force of blood against artery walls is consistently too high. It\'s often called a "silent killer" because it typically has no symptoms but can lead to serious health problems like heart disease and stroke.\n\nBlood pressure is measured using two numbers: systolic (pressure when heart beats) and diastolic (pressure when heart rests). Normal blood pressure is below 120/80 mm Hg.\n\nManagement typically includes:\n\n- Regular monitoring\n- Healthy diet low in sodium\n- Regular physical activity\n- Maintaining healthy weight\n- Limiting alcohol\n- Not smoking\n- Medication if prescribed by a doctor\n- Stress management\n\nRegular check-ups are important for monitoring and managing hypertension.';
      }
      else if (currentMessage.includes('asthma')) {
        aiResponse = 'Asthma is a chronic condition affecting the airways in the lungs. In asthma, these airways become inflamed and narrow, causing symptoms like:\n\n- Wheezing\n- Shortness of breath\n- Chest tightness\n- Coughing, especially at night or early morning\n\nAsthma triggers vary by person but can include allergens, exercise, cold air, respiratory infections, and stress.\n\nManagement typically involves:\n\n- Identifying and avoiding triggers\n- Using controller medications daily to prevent symptoms\n- Having quick-relief medications for sudden symptoms\n- Following an asthma action plan developed with a healthcare provider\n- Regular medical check-ups\n\nWith proper management, most people with asthma can lead normal, active lives.';
      }
      else if (currentMessage.includes('arthritis')) {
        aiResponse = 'Arthritis refers to inflammation of one or more joints, causing pain and stiffness that typically worsen with age. There are over 100 types, with osteoarthritis and rheumatoid arthritis being most common.\n\n- Osteoarthritis: Caused by wear and tear on joints, affecting cartilage.\n\n- Rheumatoid arthritis: An autoimmune disorder where the immune system attacks joint linings.\n\nCommon symptoms include joint pain, stiffness, swelling, redness, and decreased range of motion.\n\nManagement approaches include:\n\n- Medications for pain and inflammation\n- Physical therapy to improve mobility\n- Regular exercise, particularly low-impact activities\n- Maintaining healthy weight to reduce joint stress\n- Heat and cold therapy\n- Assistive devices\n- In severe cases, surgical options like joint replacement\n\nEarly diagnosis and treatment can help manage symptoms and slow progression.';
      }
      else if (keyTerms.length > 0) {
        // Provide general information about the first medical term found
        aiResponse = `I understand you're looking for information about ${keyTerms[0]}. This is a health topic that can vary greatly in its specifics.\n\nFor the most accurate and personalized information about ${keyTerms[0]}, I recommend consulting with a healthcare provider who can provide guidance based on your specific situation and medical history.\n\nWould you like me to help you schedule an appointment to discuss this further with a healthcare professional?`;
        suggestAppointment = true;
      }
      else {
        aiResponse = 'I understand you\'re looking for health information. To help me provide relevant information, could you please specify which medical condition or health topic you\'d like to learn about?';
      }
    }
    // Handle very short queries or single words that might be symptoms
    else if (currentMessage.split(' ').length < 3 && !isFollowingUp) {
      // Ask follow-up questions to gather more information
      aiResponse = `I see you've mentioned "${currentMessage}". To help me better understand your concern, could you please provide more details:\n\n1. What symptoms are you experiencing exactly?\n2. When did they start?\n3. How severe are they?\n\nThe more information you share, the better guidance I can provide.`;
    }
    // Default case for other types of queries
    else {
      // More intelligent response for unrecognized health queries
      if (keyTerms.length > 0) {
        // Provide a response based on the medical terms identified
        aiResponse = `I notice you mentioned ${keyTerms.join(', ')}. While I can provide general health information, for personalized medical advice about your specific situation, it's best to consult with a healthcare professional.\n\nWould you like me to provide some general information about ${keyTerms[0]}, or would you prefer help booking an appointment with a healthcare provider?`;
        suggestAppointment = true;
      } else {
        // Truly generic response when no medical terms are found
        if (currentMessage.split(' ').length < 5 && !isFollowingUp) {
          // Ask follow-up questions for short messages
          aiResponse = 'To help me better understand your health concern, could you please provide more details:\n\n1. What symptoms are you experiencing?\n2. When did they start?\n3. How severe are they?\n\nThe more information you share, the better guidance I can provide.';
        } else {
          aiResponse = 'I understand you have a health-related question. To help you better, could you provide more details about your specific concern or symptoms? This will allow me to give you more relevant information or guidance.';
        }
      }
    }
    } // Close the if(!useGeminiResponse) block

    // Add self-care assessment reasoning to the response if available
    let finalResponse = aiResponse;

    // If we have a self-care assessment and it contains useful information,
    // append it to the response in appropriate cases
    if (selfCareAssessment && keyTerms.length > 0 && !currentMessage.includes('appointment')) {
      // For non-appointment related queries with medical terms
      if (selfCareAssessment.monitorClosely) {
        // For high-risk patients who should monitor closely
        finalResponse += `\n\nImportant note: ${selfCareAssessment.reason}`;
      } else if (!selfCareAssessment.selfCareAppropriate) {
        // For symptoms that require medical attention
        finalResponse += `\n\nCaution: ${selfCareAssessment.reason}`;
      }
    }

    // Prepare the response object
    const responseObject = {
      text: finalResponse,
      suggestAppointment: suggestAppointment,
      selfCareAppropriate: selfCareAssessment ? selfCareAssessment.selfCareAppropriate : true,
      timestamp: new Date()
    };
    
    // Record the request and token usage for rate limiting
    const requestInputTokens = tokenUsageTracker.estimateTokens(truncatedMessage);
    const requestOutputTokens = tokenUsageTracker.estimateTokens(finalResponse);
    userRateLimiter.recordRequest(userId, requestInputTokens, requestOutputTokens);
    
    // Cache the response for future similar queries
    responseCache.set(truncatedMessage, userId, responseObject);
    
    // Return the response with appointment suggestion flag and any additional context
    res.json(responseObject);

  } catch (error) {
    console.error('AI Assistant Error:', error);

    // Provide a more helpful error message based on the type of error
    let errorMessage = 'Error processing your request';
    let statusCode = 500;

    if (error.message && error.message.includes('First content should be with role')) {
      errorMessage = 'There was an issue with the conversation format. Starting a new conversation.';
      // This is a recoverable error, so we'll use a 200 status code
      statusCode = 200;

      // Return a fallback response that acknowledges the issue
      return res.json({
        text: "I apologize, but I had to reset our conversation. Could you please repeat your question?",
        suggestAppointment: false,
        selfCareAppropriate: true,
        conversationReset: true
      });
    } else if (error.message && (error.message.includes('API key') || error.message.includes('not found for API version'))) {
      // Handle API key issues or model not found errors
      console.error('AI model error:', error);

      // Try to provide a helpful response without the AI
      return res.json({
        text: "I'm a healthcare assistant for SoulSpace Health. I can provide general health information and guidance, but I'm not a doctor and cannot provide medical diagnoses. How can I help you today?",
        suggestAppointment: false,
        selfCareAppropriate: true,
        usingFallback: true
      });
    } else if (error.message && error.message.includes('timeout')) {
      errorMessage = 'The request took too long to process. Please try a shorter or simpler question.';
    } else if (error.name === 'GoogleGenerativeAIFetchError') {
      // Handle network or API fetch errors
      console.error('AI fetch error:', error);

      return res.json({
        text: "I'm having trouble connecting to my knowledge base right now. I'm still here to help though! Could you please ask your health question again?",
        suggestAppointment: false,
        selfCareAppropriate: true
      });
    }

    res.status(statusCode).json({
      message: errorMessage,
      error: error.message
    });
  }
};

// Get personalized health tips for the user
exports.getHealthTips = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get general health tips
    let healthTips = await HealthTip.find({ isGeneral: true }).limit(5);

    // If user has specific conditions, get relevant tips
    if (user.profile?.chronicConditions) {
      const conditions = user.profile.chronicConditions.toLowerCase();
      const conditionKeywords = ['diabetes', 'hypertension', 'asthma', 'arthritis', 'heart'];

      for (const keyword of conditionKeywords) {
        if (conditions.includes(keyword)) {
          const specificTips = await HealthTip.find({
            tags: { $in: [keyword] },
            isGeneral: false
          }).limit(2);

          healthTips = [...healthTips, ...specificTips];
        }
      }
    }

    // If we don't have enough tips, get more general ones
    if (healthTips.length < 6) {
      const additionalTips = await HealthTip.find({ isGeneral: true })
        .skip(healthTips.filter(tip => tip.isGeneral).length)
        .limit(6 - healthTips.length);

      healthTips = [...healthTips, ...additionalTips];
    }

    res.json(healthTips);

  } catch (error) {
    console.error('Health Tips Error:', error);
    res.status(500).json({
      message: 'Error fetching health tips',
      error: error.message
    });
  }
};

// Process guest message from home page chatbot
exports.processGuestMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    // Create a simplified system prompt for guest users
    const guestSystemPrompt = `You are SoulSpace Assistant, helping users with SoulSpace Health services.

Guidelines:
1. Be friendly and concise
2. Explain SoulSpace's services: appointment booking, health monitoring, AI assistance
3. Provide general health info but suggest consulting professionals for specific advice
4. Encourage registration for personalized health services`;

    // Initialize the Gemini model
    let model;
    try {
      model = genAI.getGenerativeModel({ model: MODEL_NAME });
    } catch (error) {
      console.error(`Error initializing ${MODEL_NAME}, trying fallback model:`, error);
      // Try fallback to an older model version if the primary one fails
      model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    }

    // Start a chat session
    const chat = model.startChat({
      history: [],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
      },
    });

    // Format the user message with the system prompt
    const userMessage = `${guestSystemPrompt}\n\nUser message: ${message}`;

    // Generate response from Gemini with error handling
    let aiResponse;
    let useGeminiResponse = true;

    try {
      // Use the improved chunking approach for guest messages too
      const messageChunks = chunkMessage(userMessage, 800);
      
      if (messageChunks.length > 1) {
        console.log(`Guest message chunked into ${messageChunks.length} parts`);
        let chunkResponses = [];
        
        // Process each chunk sequentially with delays between chunks
        for (let i = 0; i < messageChunks.length; i++) {
          const chunk = messageChunks[i];
          console.log(`Processing guest chunk ${i+1}/${messageChunks.length} (${chunk.length} chars)`);
          
          try {
            // Add a delay between chunks to avoid rate limits
            if (i > 0) {
              await delay(1000); // 1 second delay between chunks
            }
            
            const chunkResult = await chat.sendMessage(chunk);
            const chunkResponse = chunkResult.response.text();
            chunkResponses.push(chunkResponse);
            
            // Add a small delay after processing each chunk
            if (i < messageChunks.length - 1) {
              await delay(500);
            }
          } catch (chunkError) {
            console.error(`Error processing guest chunk ${i+1}:`, chunkError);
            
            // If this is a quota exceeded error, try rotating API keys
            if (chunkError.status === 429) {
              console.log('Quota exceeded during guest chunk processing, trying to rotate API key');
              const rotated = rotateApiKey();
              
              if (rotated) {
                // Reinitialize the model and chat with the new API key
                console.log('Reinitializing model with new API key for guest');
                model = genAI.getGenerativeModel({ model: MODEL_NAME });
                chat = model.startChat({
                  history: [],
                  generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 64,
                  },
                });
                
                // Try this chunk again with the new API key
                console.log('Retrying guest chunk with new API key');
                await delay(1000); // Wait a second before retrying
                
                try {
                  const retryResult = await chat.sendMessage(chunk);
                  const retryResponse = retryResult.response.text();
                  chunkResponses.push(retryResponse);
                  continue; // Continue to the next chunk
                } catch (retryError) {
                  console.error('Error retrying guest chunk with new API key:', retryError);
                  // Fall through to use a placeholder for this chunk
                }
              }
            }
            
            // If we couldn't rotate or the retry failed, use a placeholder for this chunk
            chunkResponses.push("I'm having trouble processing this part of your message.");
          }
        }
        
        // Combine all chunk responses
        aiResponse = chunkResponses.join(' ').trim();
        
        // Clean up the response
        aiResponse = aiResponse.replace(/I'm having trouble processing this part of your message\./g, '').trim();
      } else {
        // For short messages, just send as is
        const result = await chat.sendMessage(userMessage);
        const geminiResponse = result.response;
        aiResponse = geminiResponse.text();
      }

      // If the response is empty or too short, we'll use our fallback logic
      if (!aiResponse || aiResponse.trim().length < 10) {
        useGeminiResponse = false;
        console.log('Gemini response too short, using fallback logic');
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      useGeminiResponse = false;
      
      // Try rotating API keys if this is a quota exceeded error
      if (error.status === 429) {
        console.log('Quota exceeded for guest message, trying to rotate API key');
        const rotated = rotateApiKey();
        
        if (rotated) {
          try {
            // Reinitialize with new API key and try a simplified message
            console.log('Trying simplified guest message with new API key');
            await delay(1000);
            
            model = genAI.getGenerativeModel({ model: MODEL_NAME });
            chat = model.startChat({
              history: [],
              generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 64,
              },
            });
            
            // Create a simplified version of the message
            const simplifiedMessage = message.length > 100 
              ? message.substring(0, 100) + "..."
              : message;
            
            // Create a minimal system prompt
            const minimalPrompt = `You are SoulSpace Assistant. Be brief and helpful.`;
            
            // Combine into a simplified full message
            const simplifiedFullMessage = `${minimalPrompt}\n\nUser message: ${simplifiedMessage}`;
            
            // Start a new chat with minimal history
            const simpleChat = model.startChat({
              history: [],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500, // Reduced output tokens
              },
            });
            
            // Send the simplified message
            const simpleResult = await simpleChat.sendMessage(simplifiedFullMessage);
            aiResponse = simpleResult.response.text();
            
            if (aiResponse && aiResponse.trim().length > 10) {
              useGeminiResponse = true;
              console.log('Successfully got response with new API key and simplified message');
            }
          } catch (retryError) {
            console.error('Error with retry using new API key:', retryError);
          }
        }
      }
    }

    // If Gemini failed, use fallback responses
    if (!useGeminiResponse) {
      const currentMessage = message.toLowerCase();

      // Check for greeting patterns
      if (
        (currentMessage.includes('hello') || currentMessage.includes('hi') || currentMessage.includes('hey')) &&
        conversationHistory.length <= 1
      ) {
        aiResponse = `Hello! I'm SoulSpace's AI assistant. I can provide information about our healthcare platform and services. How can I help you today?`;
      }
      // Check for service-related queries
      else if (currentMessage.includes('service') || currentMessage.includes('offer') || currentMessage.includes('provide')) {
        aiResponse = `SoulSpace offers a comprehensive healthcare platform with features including:
1. Online appointment booking with healthcare providers
2. Virtual consultations and in-person visits
3. Real-time health monitoring through wearable device integration
4. AI-powered health assistant for personalized guidance
5. Secure medical records management
6. Medication tracking and reminders

Would you like to know more about any specific service?`;
      }
      // Check for appointment-related queries
      else if (currentMessage.includes('appointment') || currentMessage.includes('book') || currentMessage.includes('schedule') || currentMessage.includes('doctor')) {
        aiResponse = `SoulSpace makes it easy to book appointments with healthcare providers. You can choose between in-person visits or virtual consultations based on your needs. To get started, you'll need to create an account. Would you like to register now?`;
      }
      // Check for wearable device queries
      else if (currentMessage.includes('wearable') || currentMessage.includes('device') || currentMessage.includes('monitor')) {
        aiResponse = `SoulSpace integrates with popular wearable health devices to monitor vital signs like heart rate, blood pressure, and oxygen levels in real-time. This data helps our healthcare providers give you more personalized care. The platform supports most major fitness trackers and smartwatches.`;
      }
      // Check for health tips queries
      else if (currentMessage.includes('health tip') || currentMessage.includes('advice')) {
        aiResponse = `Here are some evidence-based health tips from SoulSpace:
1. Stay hydrated by drinking at least 8 glasses of water daily
2. Aim for 7-9 hours of quality sleep each night
3. Exercise regularly - at least 150 minutes of moderate activity per week
4. Maintain a balanced diet rich in fruits, vegetables, and whole grains
5. Practice stress management techniques like meditation or deep breathing
6. Take regular breaks when working at a computer to reduce eye strain

For personalized health recommendations, consider creating a SoulSpace account.`;
      }
      // Default response
      else {
        aiResponse = `I'm here to help you learn about SoulSpace's healthcare platform. We offer appointment booking, health monitoring, AI assistance, and more. What specific aspect of our services would you like to know about?`;
      }
    }

    // Return the AI response
    return res.json({
      text: aiResponse,
      isGuest: true
    });
  } catch (error) {
    console.error('Error in guest AI assistant:', error);
    return res.status(500).json({
      text: "I'm having trouble processing your request right now. Please try again later.",
      error: error.message
    });
  }
};

// Speech-to-text processing using Google's Speech-to-Text API via Gemini
exports.speechToText = async (req, res) => {
  try {
    // Check if audio data is provided
    if (!req.body || !req.body.audioData) {
      return res.status(400).json({
        success: false,
        message: 'No audio data provided'
      });
    }

    // We acknowledge receipt of the audio data but don't process it server-side yet
    // const { audioData } = req.body;

    // For this implementation, we'll use the browser's Web Speech API on the frontend
    // This backend endpoint will be used for future server-side processing if needed

    // For now, we'll just acknowledge receipt of the audio data
    res.json({
      success: true,
      message: 'Audio data received. Processing handled on client side.'
    });

  } catch (error) {
    console.error('Speech-to-Text Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing speech',
      error: error.message
    });
  }
};

// Text-to-speech processing
exports.textToSpeech = async (req, res) => {
  try {
    // Extract text from request body
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'No text provided for conversion'
      });
    }

    // For this implementation, we'll use the browser's Web Speech API on the frontend
    // This endpoint will be used for future server-side processing if needed

    // For now, we'll just acknowledge receipt of the text
    res.json({
      success: true,
      message: 'Text received. Speech synthesis handled on client side.',
      text: text // Echo back the text for client-side processing
    });

  } catch (error) {
    console.error('Text-to-Speech Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating speech',
      error: error.message
    });
  }
};
