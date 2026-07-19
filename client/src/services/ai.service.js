import api from '../api/axios';

/**
 * Send a chat message to the StadiumGenie AI backend.
 *
 * @param {object} params
 * @param {string} params.message    - User's message
 * @param {string} [params.stadiumId] - Optional MongoDB ID for grounding context
 * @param {string} [params.eventId]   - Optional MongoDB ID for grounding context
 * @param {Array}  [params.history]   - Prior conversation turns [{role, parts}]
 * @returns {Promise<AxiosResponse>}
 */
export async function sendChatMessage({ message, stadiumId, eventId, history = [] }) {
  return api.post('/ai/chat', {
    message,
    stadiumId: stadiumId || undefined,
    eventId: eventId || undefined,
    history,
  });
}
