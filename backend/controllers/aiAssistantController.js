const User = require('../models/User');
const HealthTip = require('../models/HealthTip');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuration for Gemini AI API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Must be set in your .env file
if (!GEMINI_API_KEY) {
  console.error('WARNING: GEMINI_API_KEY is not set in environment variables. AI assistant will not function properly.');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const MODEL_NAME = 'gemini-1.5-pro'; // Using the latest Gemini model version

// Helper function to create a system prompt for the AI
const createSystemPrompt = (user) => {
  return `You are a smart, conversational AI health assistant for SoulSpace Health.
Your name is HealthBot. You can answer a wide range of questions, with a focus on health topics.

User information:
- Name: ${user.name || 'Patient'}
- Age: ${user.profile?.dateOfBirth ? calculateAge(user.profile.dateOfBirth) : 'Unknown'}
- Medical conditions: ${user.profile?.chronicConditions || 'None provided'}
- Allergies: ${user.profile?.allergies || 'None provided'}

Guidelines:
1. Be conversational, friendly, and empathetic
2. Answer all types of questions to the best of your ability, not just health-related ones
3. For health questions, carefully assess symptom severity to determine when professional medical care is needed
4. For non-urgent conditions, provide evidence-based self-care advice first
5. Only recommend doctor appointments when symptoms indicate they're truly necessary
6. Respect privacy and maintain confidentiality
7. Avoid making definitive diagnoses
8. Keep responses concise and easy to understand
9. Provide actionable advice when appropriate
10. Consider the urgency level: emergency (immediate care), urgent (same-day care), non-urgent (self-care with monitoring)
11. For chronic conditions, help users understand when changes warrant medical attention
12. If asked about being a doctor, explain that you're an AI assistant with health knowledge but not a medical professional
13. Be helpful with all questions, even if they're not health-related`;
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
    try {
      model = genAI.getGenerativeModel({ model: MODEL_NAME });
    } catch (error) {
      console.error(`Error initializing ${MODEL_NAME}, trying fallback model:`, error);
      // Try fallback to an older model version if the primary one fails
      model = genAI.getGenerativeModel({ model: 'gemini-pro' });
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
    const userMessage = `${systemPrompt}\n\nUser message: ${message}`;

    // Generate response from Gemini with error handling
    let aiResponse;
    let useGeminiResponse = true; // Flag to determine if we should use Gemini's response or fallback logic

    try {
      const result = await chat.sendMessage(userMessage);
      const geminiResponse = result.response;
      aiResponse = geminiResponse.text();

      // If the response is empty or too short, we'll use our fallback logic
      if (!aiResponse || aiResponse.trim().length < 10) {
        useGeminiResponse = false;
        console.log('Gemini response too short, using fallback logic');
      }
    } catch (sendError) {
      console.error('Error sending message to Gemini:', sendError);
      useGeminiResponse = false;

      // If we can't get a response from Gemini, provide a fallback response
      if (currentMessage.includes('doctor')) {
        aiResponse = "I'm not a doctor. I'm an AI health assistant designed to provide general health information and guidance. While I can offer information about common health concerns and wellness tips, I cannot provide medical diagnoses or replace professional medical advice. For specific medical concerns, it's always best to consult with a qualified healthcare provider.";
      } else {
        aiResponse = "I apologize, but I'm having trouble processing your request right now. As a health assistant, I can provide general health information, but for specific medical advice, it's always best to consult with a healthcare professional.";
      }
    }

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

    // Return the response with appointment suggestion flag and any additional context
    res.json({
      text: finalResponse,
      suggestAppointment: suggestAppointment,
      selfCareAppropriate: selfCareAssessment ? selfCareAssessment.selfCareAppropriate : true
    });

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
    const guestSystemPrompt = `You are a smart, conversational AI assistant for SoulSpace Health.
Your name is SoulSpace Assistant. You can answer a wide range of questions, with a focus on SoulSpace's services and general health topics.

Guidelines:
1. Be conversational, friendly, and empathetic
2. Focus on explaining SoulSpace's services and features
3. Provide general health information but avoid making specific medical recommendations
4. Encourage users to register for a full account to access personalized health services
5. Keep responses concise and easy to understand
6. Highlight SoulSpace's key features: appointment booking, health monitoring, AI assistance
7. For health questions, provide general information but suggest consulting a healthcare professional for specific advice
8. Be helpful and informative about the platform's capabilities`;

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
      const result = await chat.sendMessage(userMessage);
      const geminiResponse = result.response;
      aiResponse = geminiResponse.text();

      // If the response is empty or too short, we'll use our fallback logic
      if (!aiResponse || aiResponse.trim().length < 10) {
        useGeminiResponse = false;
        console.log('Gemini response too short, using fallback logic');
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      useGeminiResponse = false;
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
