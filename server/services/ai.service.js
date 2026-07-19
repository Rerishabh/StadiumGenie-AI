import Stadium from '../models/stadium.model.js';
import Event from '../models/event.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Lazily initialize the Gemini client only when a valid key is present.
 * Returns null if key is not configured so the caller can fail gracefully.
 */
function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey.trim());
}

/**
 * Fetch stadium context block from MongoDB.
 * Returns a descriptive text string (or null if not found).
 */
async function fetchStadiumContext(stadiumId) {
  if (!stadiumId) return null;
  try {
    const stadium = await Stadium.findById(stadiumId).lean().exec();
    if (!stadium) return null;
    const parts = [
      `Stadium Name: ${stadium.name}`,
      stadium.city && `City: ${stadium.city}`,
      stadium.state && `State/Region: ${stadium.state}`,
      stadium.country && `Country: ${stadium.country}`,
      stadium.address && `Address: ${stadium.address}`,
      stadium.capacity && `Seating Capacity: ${stadium.capacity.toLocaleString()} seats`,
      stadium.description && `Description: ${stadium.description}`,
      Array.isArray(stadium.facilities) && stadium.facilities.length > 0 &&
        `Facilities: ${stadium.facilities.join(', ')}`,
      Array.isArray(stadium.amenities) && stadium.amenities.length > 0 &&
        `Amenities: ${stadium.amenities.join(', ')}`,
      Array.isArray(stadium.sportsSupported) && stadium.sportsSupported.length > 0 &&
        `Sports Supported: ${stadium.sportsSupported.join(', ')}`,
      (stadium.latitude && stadium.longitude) &&
        `GPS Coordinates: ${stadium.latitude}, ${stadium.longitude}`,
    ].filter(Boolean);
    return parts.join('\n');
  } catch (err) {
    console.warn('[ai.service] Stadium context fetch failed:', err.message);
    return null;
  }
}

/**
 * Fetch event context block from MongoDB.
 * Returns a descriptive text string (or null if not found).
 */
async function fetchEventContext(eventId) {
  if (!eventId) return null;
  try {
    const event = await Event.findById(eventId).populate('stadiumId', 'name city country address capacity facilities amenities').lean().exec();
    if (!event) return null;
    const parts = [
      `Event Title: ${event.title}`,
      event.sport && `Sport: ${event.sport}`,
      event.organizer && `Organizer: ${event.organizer}`,
      event.description && `Description: ${event.description}`,
      event.startDateTime && `Start Time: ${new Date(event.startDateTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}`,
      event.endDateTime && `End Time: ${new Date(event.endDateTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}`,
      event.status && `Status: ${event.status}`,
      event.availableSeats !== undefined && `Available Seats: ${event.availableSeats}`,
      event.price !== undefined && `Ticket Price: ₹${event.price}`,
    ];

    // Augment with stadium info if populated
    if (event.stadiumId && typeof event.stadiumId === 'object') {
      const s = event.stadiumId;
      parts.push(
        s.name && `Venue Name: ${s.name}`,
        s.city && `Venue City: ${s.city}`,
        s.country && `Venue Country: ${s.country}`,
        s.address && `Venue Address: ${s.address}`,
        s.capacity && `Venue Capacity: ${s.capacity.toLocaleString()} seats`,
        Array.isArray(s.facilities) && s.facilities.length > 0 && `Venue Facilities: ${s.facilities.join(', ')}`,
        Array.isArray(s.amenities) && s.amenities.length > 0 && `Venue Amenities: ${s.amenities.join(', ')}`,
      );
    }

    return parts.filter(Boolean).join('\n');
  } catch (err) {
    console.warn('[ai.service] Event context fetch failed:', err.message);
    return null;
  }
}

/**
 * Build the system instruction for Gemini.
 * Grounds the assistant in stadium/event facts when available.
 */
function buildSystemPrompt(stadiumContext, eventContext) {
  const contextSections = [];

  if (stadiumContext) {
    contextSections.push(`--- STADIUM INFORMATION (from our database) ---\n${stadiumContext}\n--- END STADIUM INFORMATION ---`);
  }
  if (eventContext) {
    contextSections.push(`--- EVENT INFORMATION (from our database) ---\n${eventContext}\n--- END EVENT INFORMATION ---`);
  }  const groundingBlock = contextSections.length > 0
    ? `\nYou have access to the following verified information from our system:\n\n${contextSections.join('\n\n')}\n\nUse this factual information to ground your responses. Clearly indicate when you are providing information from our database vs general guidance.`
    : `\nNo specific stadium or event context is available for this session. Provide general multi-sport stadium fan guidance.`;

  return `You are StadiumGenie AI, the official AI assistant for StadiumGenie — a multi-sport smart stadium discovery, ticketing, and indoor navigation platform supporting Football, Cricket, Basketball, Tennis, Hockey, and Badminton.

Your areas of expertise include:
- Stadium layouts & navigation map nodes:
  * Gates: Gate A, Gate B, Gate C, Gate D.
  * Seating sections: Section 100, Section 200 (Note: Section 200 is stairs-only, NOT wheelchair accessible), Section 300, Section 400.
  * Concourse facilities: Concourse Food Court, First Aid Medical Center, Restroom East, Restroom West, Information Desk.
  * Parking Exits: Zone 1, Zone 2.
- Accessibility support: Help fans locate elevators, ramps, wheelchair-accessible seating, sensory rooms, and recommend accessible routing paths (avoiding stairs-only Section 200).
- Transportation & Parking advice (Metro links, shuttle drop-offs, taxi stands, Parking Zone 1 and 2).
- Ticketing information: Ticket-aware guidance helping attendees find their sections, recommended entry gates, and QR code check-in steps.
- General fan rules (bag policies, prohibited items, smart gate check-ins).
- Grounding: When answering queries about gates, amenities, or layouts, prioritize the verified stadium context provided. If details are not in the context, refer them to the Stadium Hub map tab or venue staff.

IMPORTANT SAFETY RULE: For any emergency, medical situation, or security threat, always immediately direct the user to contact official stadium security staff, emergency services (call local emergency number), or follow official stadium evacuation instructions. Do not invent emergency procedures.

LANGUAGE RULE: Detect the language of the user's message and respond in that same language. Do not translate proper names of venues or tournaments.
${groundingBlock}`;
}

/**
 * Main service function — called by the controller.
 * @param {object} params
 * @param {string} params.message - User's chat message
 * @param {string} [params.stadiumId] - Optional MongoDB ObjectId for stadium context
 * @param {string} [params.eventId] - Optional MongoDB ObjectId for event context
 * @param {Array}  [params.history] - Optional prior conversation turns [{role, parts}]
 * @returns {Promise<{reply: string, contextUsed: boolean}>}
 */
export async function generateChatResponse({ message, stadiumId, eventId, history = [] }) {
  const genAI = getGenAIClient();

  if (!genAI) {
    return {
      reply: "I'm sorry, the AI assistant is not configured yet. Please ask stadium staff for assistance or visit the information desk at the venue.",
      contextUsed: false,
      configError: true,
    };
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  // Fetch grounding context in parallel
  const [stadiumContext, eventContext] = await Promise.all([
    fetchStadiumContext(stadiumId),
    fetchEventContext(eventId),
  ]);

  const systemInstruction = buildSystemPrompt(stadiumContext, eventContext);
  const contextUsed = !!(stadiumContext || eventContext);

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
    });

    // Build safe conversation history (filter to only valid role/parts pairs)
    const safeHistory = Array.isArray(history)
      ? history.filter(h => h && (h.role === 'user' || h.role === 'model') && h.parts)
      : [];

    const chat = model.startChat({
      history: safeHistory,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.4,
        topP: 0.85,
      },
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return { reply, contextUsed };
  } catch (err) {
    console.error('[ai.service] Gemini API error:', err.message || err);
    // Surface a non-sensitive, user-friendly message
    throw Object.assign(new Error('AI service temporarily unavailable. Please try again shortly or contact stadium staff.'), {
      statusCode: 503,
    });
  }
}
