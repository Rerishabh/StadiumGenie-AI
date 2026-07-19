import { generateChatResponse } from '../services/ai.service.js';
import mongoose from 'mongoose';

const MAX_MESSAGE_LENGTH = 2000; // characters
const MAX_HISTORY_TURNS = 10;

/**
 * POST /api/v1/ai/chat
 *
 * Body:
 *   message    {string}  required — user's question
 *   stadiumId  {string}  optional — MongoDB ObjectId
 *   eventId    {string}  optional — MongoDB ObjectId
 *   history    {Array}   optional — prior conversation turns
 */
export async function chat(req, res) {
  try {
    const { message, stadiumId, eventId, history } = req.body;

    // --- Input validation ---
    if (!message || typeof message !== 'string') {
      return res.status(422).json({
        success: false,
        message: 'message is required and must be a string',
        errors: [{ param: 'message', message: 'required' }],
        statusCode: 422,
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.status(422).json({
        success: false,
        message: 'message cannot be empty',
        errors: [{ param: 'message', message: 'cannot be empty' }],
        statusCode: 422,
      });
    }
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(422).json({
        success: false,
        message: `message must be ${MAX_MESSAGE_LENGTH} characters or fewer`,
        errors: [{ param: 'message', message: `too long (max ${MAX_MESSAGE_LENGTH})` }],
        statusCode: 422,
      });
    }

    // Validate optional IDs
    const safeStadiumId = stadiumId && mongoose.Types.ObjectId.isValid(stadiumId) ? stadiumId : null;
    const safeEventId = eventId && mongoose.Types.ObjectId.isValid(eventId) ? eventId : null;

    // Sanitize history — limit length, allow only recognized roles
    const safeHistory = Array.isArray(history)
      ? history
          .slice(-MAX_HISTORY_TURNS * 2) // keep last N turns (each turn = 2 entries)
          .filter(h => h && (h.role === 'user' || h.role === 'model') && typeof h.parts === 'string')
          .map(h => ({ role: h.role, parts: [{ text: String(h.parts).slice(0, MAX_MESSAGE_LENGTH) }] }))
      : [];

    const { reply, contextUsed, configError } = await generateChatResponse({
      message: trimmedMessage,
      stadiumId: safeStadiumId,
      eventId: safeEventId,
      history: safeHistory,
    });

    return res.status(200).json({
      success: true,
      message: 'AI response generated',
      data: {
        reply,
        contextUsed: !!contextUsed,
        configError: !!configError,
      },
    });
  } catch (e) {
    if (e && e.statusCode) {
      return res.status(e.statusCode).json({
        success: false,
        message: e.message || 'AI service error',
        errors: [],
        statusCode: e.statusCode,
      });
    }
    console.error('[ai.controller] Unexpected error:', e && e.message ? e.message : e);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [],
      statusCode: 500,
    });
  }
}
