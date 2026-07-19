import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { sendChatMessage } from '../../services/ai.service';

const LANGUAGES = [
  { code: 'auto', label: 'Auto' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' },
  { code: 'pt', label: 'PT' },
  { code: 'ar', label: 'AR' },
  { code: 'hi', label: 'HI' }
];

const TRANSLATIONS = {
  en: {
    welcome: "👋 Welcome to **StadiumGenie AI Assistant** — powered by Google Gemini!\n\nI can help you with stadium navigation, accessibility, transportation, facilities, and fan assistance for FIFA World Cup 2026.\n\nAsk me anything, or tap a quick prompt below.",
    placeholder: "Ask anything about the stadium...",
    quick_navigation: "🗺️ Navigation",
    quick_accessibility: "♿ Accessibility",
    quick_transportation: "🚌 Transit",
    quick_facilities: "🍔 Facilities",
    quick_rules: "🎫 Entry Rules",
    quick_ticket: "❓ Ticket Help",
    nav_text: "How do I navigate to my seat section?",
    access_text: "What accessibility services are available?",
    trans_text: "How can I get to the stadium by public transit?",
    fac_text: "Where are the food courts and restrooms?",
    rules_text: "What items are not allowed inside the stadium?",
    ticket_text: "How do I verify or check in my ticket?",
    note: "AI responses grounded with live stadium data.",
    disclaimer: "AI responses may be inaccurate · For emergencies contact stadium security",
    sys_prompt: "You are the StadiumGenie AI Assistant. Respond in English. Do not translate proper names."
  },
  es: {
    welcome: "👋 ¡Bienvenido al **Asistente de IA de StadiumGenie**!\n\nPuedo ayudarte con la navegación, accesibilidad, transporte, instalaciones y asistencia al aficionado para la Copa Mundial de la FIFA 2026.\n\nPregúntame lo que quieras o toca una de las siguientes opciones.",
    placeholder: "Pregunta cualquier cosa sobre el estadio...",
    quick_navigation: "🗺️ Navegación",
    quick_accessibility: "♿ Accesibilidad",
    quick_transportation: "🚌 Transporte",
    quick_facilities: "🍔 Instalaciones",
    quick_rules: "🎫 Reglas de Entrada",
    quick_ticket: "❓ Ayuda de Entradas",
    nav_text: "¿Cómo navego a mi sección de asientos?",
    access_text: "¿Qué servicios de accesibilidad están disponibles?",
    trans_text: "¿Cómo llego al estadio en transporte público?",
    fac_text: "¿Dónde están los patios de comida y los baños?",
    rules_text: "¿Qué artículos no están permitidos dentro del estadio?",
    ticket_text: "¿Cómo verifico o hago el check-in de mi entrada?",
    note: "Respuestas de IA validadas con datos del estadio.",
    disclaimer: "Las respuestas pueden ser imprecisas · En caso de emergencia contacte a seguridad",
    sys_prompt: "You are the StadiumGenie AI Assistant. Respond in Spanish. Do not translate proper names."
  },
  fr: {
    welcome: "👋 Bienvenue dans l'**assistant IA StadiumGenie** !\n\nJe peux vous aider pour l'orientation dans le stade, l'accessibilité, les transports, les installations et l'assistance aux supporters.\n\nPosez-moi vos questions ou appuyez sur une action rapide ci-dessous.",
    placeholder: "Posez votre question sur le stade...",
    quick_navigation: "🗺️ Orientation",
    quick_accessibility: "♿ Accessibilité",
    quick_transportation: "🚌 Transports",
    quick_facilities: "🍔 Installations",
    quick_rules: "🎫 Règles d'entrée",
    quick_ticket: "❓ Aide Billets",
    nav_text: "Comment me rendre à ma section de sièges ?",
    access_text: "Quels services d'accessibilité sont disponibles ?",
    trans_text: "Comment se rendre au stade en transports en commun ?",
    fac_text: "Où se trouvent les espaces restauration et les toilettes ?",
    rules_text: "Quels objets sont interdits dans le stade ?",
    ticket_text: "Comment vérifier ou enregistrer mon billet ?",
    note: "Réponses IA basées sur les données en temps réel.",
    disclaimer: "Les réponses peuvent être inexactes · Pour les urgences contactez la sécurité",
    sys_prompt: "You are the StadiumGenie AI Assistant. Respond in French. Do not translate proper names."
  },
  de: {
    welcome: "👋 Willkommen beim **StadiumGenie KI-Assistenten**!\n\nIch kann Ihnen bei der Navigation im Stadion, Barrierefreiheit, Transport, Einrichtungen und Fan-Unterstützung helfen.\n\nFragen Sie mich alles oder tippen Sie unten auf eine Schnellaktion.",
    placeholder: "Fragen Sie etwas über das Stadion...",
    quick_navigation: "🗺️ Navigation",
    quick_accessibility: "♿ Barrierefreiheit",
    quick_transportation: "🚌 Transport",
    quick_facilities: "🍔 Einrichtungen",
    quick_rules: "🎫 Einlassregeln",
    quick_ticket: "❓ Ticket-Hilfe",
    nav_text: "Wie finde ich meinen Sitzplatzbereich?",
    access_text: "Welche barrierefreien Dienste gibt es?",
    trans_text: "Wie komme ich mit öffentlichen Verkehrsmitteln zum Stadion?",
    fac_text: "Wo sind die Gastronomiebereiche und Toiletten?",
    rules_text: "Welche Gegenstände sind im Stadion verboten?",
    ticket_text: "Wie verifiziere oder checke ich mein Ticket ein?",
    note: "Antworten mit Live-Stadiondaten abgeglichen.",
    disclaimer: "KI-Antworten können ungenau sein · Bei Notfällen Sicherheitsdienst rufen",
    sys_prompt: "You are the StadiumGenie AI Assistant. Respond in German. Do not translate proper names."
  },
  pt: {
    welcome: "👋 Bem-vindo ao **Assistente de IA do StadiumGenie**!\n\nPosso ajudar com navegação no estádio, acessibilidade, transporte, instalações e assistência aos torcedores.\n\nPergunte-me qualquer coisa ou toque em um atalho abaixo.",
    placeholder: "Pergunte algo sobre o estádio...",
    quick_navigation: "🗺️ Navegação",
    quick_accessibility: "♿ Acessibilidade",
    quick_transportation: "🚌 Transporte",
    quick_facilities: "🍔 Instalações",
    quick_rules: "🎫 Regras de Entrada",
    quick_ticket: "❓ Ajuda de Ingressos",
    nav_text: "Como faço para navegar até o meu setor de assentos?",
    access_text: "Quais serviços de acessibilidade estão disponíveis?",
    trans_text: "Como posso chegar ao estádio por transporte público?",
    fac_text: "Onde ficam as praças de alimentação e os banheiros?",
    rules_text: "Quais itens não são permitidos dentro do estádio?",
    ticket_text: "Como verifico ou faço o check-in do meu ingresso?",
    note: "Respostas geradas com base nas informações do estádio.",
    disclaimer: "As respostas podem conter erros · Em emergências contate a segurança",
    sys_prompt: "You are the StadiumGenie AI Assistant. Respond in Portuguese. Do not translate proper names."
  },
  ar: {
    welcome: "👋 مرحبًا بك في **مساعد الذكاء الاصطناعي لـ StadiumGenie**!\n\nيمكنني مساعدتك في التنقل داخل الاستاد، والوصول لذوي الاحتياجات الخاصة، والمواصلات، والمرافق، ومساعدة المشجعين.\n\nاسألني عن أي شيء، أو اضغط على إجراء سريع أدناه.",
    placeholder: "اسأل أي شيء عن الاستاد...",
    quick_navigation: "🗺️ التنقل",
    quick_accessibility: "♿ ذوي الاحتياجات",
    quick_transportation: "🚌 المواصلات",
    quick_facilities: "🍔 المرافق",
    quick_rules: "🎫 قواعد الدخول",
    quick_ticket: "❓ مساعدة التذاكر",
    nav_text: "كيف أصل إلى قسم المقاعد الخاص بي؟",
    access_text: "ما هي خدمات ذوي الاحتياجات الخاصة المتوفرة؟",
    trans_text: "كيف يمكنني الوصول إلى الاستاد عبر وسائل النقل العام؟",
    fac_text: "أين توجد مطاعم المأكولات ودورات المياه؟",
    rules_text: "ما هي الأشياء الممنوع إدخالها إلى الاستاد؟",
    ticket_text: "كيف يمكنني التحقق من تذكرتي أو تسجيل الدخول بها؟",
    note: "تم التحقق من الإجابات باستخدام بيانات الاستاد الحية.",
    disclaimer: "قد تكون الإجابات غير دقيقة · لحالات الطوارئ اتصل بالأمن",
    sys_prompt: "You are the StadiumGenie AI Assistant. Respond in Arabic. Do not translate proper names."
  },
  hi: {
    welcome: "👋 **StadiumGenie AI असिस्टेंट** में आपका स्वागत है!\n\nमैं आपको स्टेडियम नेविगेशन, एक्सेसिबिलिटी, परिवहन, सुविधाओं और प्रशंसक सहायता में मदद कर सकता हूँ।\n\nमुझसे कुछ भी पूछें, या नीचे दिए गए त्वरित संकेतों पर टैप करें।",
    placeholder: "स्टेडियम के बारे में कुछ भी पूछें...",
    quick_navigation: "🗺️ नेविगेशन",
    quick_accessibility: "♿ एक्सेसिबिलिटी",
    quick_transportation: "🚌 परिवहन",
    quick_facilities: "🍔 सुविधाएं",
    quick_rules: "🎫 प्रवेश नियम",
    quick_ticket: "❓ टिकट सहायता",
    nav_text: "मैं अपने सीट सेक्शन तक कैसे पहुँचूँ?",
    access_text: "यहाँ कौन सी एक्सेसिबिलिटी सेवाएं उपलब्ध हैं?",
    trans_text: "मैं सार्वजनिक परिवहन द्वारा स्टेडियम कैसे पहुँच सकता हूँ?",
    fac_text: "फूड कोर्ट और वॉशरूम कहाँ हैं?",
    rules_text: "स्टेडियम के अंदर किन वस्तुओं की अनुमति नहीं है?",
    ticket_text: "मैं अपना टिकट कैसे सत्यापित या चेक-इन करूँ?",
    note: "स्टेडियम के लाइव डेटा से प्रमाणित प्रतिक्रियाएं।",
    disclaimer: "AI की प्रतिक्रियाएं गलत हो सकती हैं · आपातकाल में सुरक्षा से संपर्क करें",
    sys_prompt: "You are the StadiumGenie AI Assistant. Respond in Hindi. Do not translate proper names."
  }
};

/* ── Extract context IDs from the current page URL ───────────────── */
function usePageContext() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const stadiumMatch = location.pathname.match(/\/stadiums\/([a-f0-9]{24})/i);
  const eventMatch = location.pathname.match(/\/events\/([a-f0-9]{24})/i);
  const stadiumId = stadiumMatch?.[1] || params.get('stadiumId') || null;
  const eventId = eventMatch?.[1] || params.get('eventId') || null;
  return { stadiumId, eventId };
}

/* ── Individual message bubble ───────────────────────────────────── */
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
        isUser ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-indigo-600 to-blue-500 text-white'
      }`}>
        {isUser ? 'You' : '✦'}
      </div>
      <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
        isUser
          ? 'bg-blue-600 text-white rounded-br-sm'
          : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'
      }`}>
        <p className="whitespace-pre-wrap">{msg.text}</p>
        <p className={`text-[10px] mt-1 ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
          {msg.timestamp}
        </p>
      </div>
    </div>
  );
}

/* ── Main Widget ─────────────────────────────────────────────────── */
export default function ChatWidget({ inlineMode = false, stadiumId: propStadiumId = null, eventId: propEventId = null }) {
  const { isAuthenticated } = useContext(AuthContext);
  const { stadiumId: urlStadiumId, eventId: urlEventId } = usePageContext();

  const stadiumId = propStadiumId || urlStadiumId;
  const eventId = propEventId || urlEventId;

  const [open, setOpen] = useState(inlineMode || false);
  const [language, setLanguage] = useState('auto');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const getLanguageCode = useCallback(() => {
    if (language !== 'auto') return language;
    const browserLang = navigator.language ? navigator.language.split('-')[0].toLowerCase() : 'en';
    return TRANSLATIONS[browserLang] ? browserLang : 'en';
  }, [language]);

  function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Hook for custom window event trigger from navbars
  useEffect(() => {
    function handleOpenChat() {
      setOpen(true);
    }
    window.addEventListener('open-stadium-genie-chat', handleOpenChat);
    return () => window.removeEventListener('open-stadium-genie-chat', handleOpenChat);
  }, []);

  // Update/re-render welcome message when open or language changes
  useEffect(() => {
    if (open && messages.length <= 1) {
      const code = getLanguageCode();
      const text = TRANSLATIONS[code]?.welcome || TRANSLATIONS.en.welcome;
      setMessages([
        {
          role: 'model',
          text,
          timestamp: now(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, open]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSend = useCallback(async (text) => {
    const message = (text || input).trim();
    if (!message || loading) return;

    setInput('');
    setError(null);

    const userMsg = { role: 'user', text: message, timestamp: now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const activeLang = getLanguageCode();
    const systemPrompt = TRANSLATIONS[activeLang]?.sys_prompt || TRANSLATIONS.en.sys_prompt;

    // Inject language directive to Gemini context
    const contextualMessage = `[System Prompt: ${systemPrompt}] ${message}`;

    // Build history, ensuring the first item starts with role 'user'
    const firstUserIdx = messages.findIndex((m) => m.role === 'user');
    const historyMessages = firstUserIdx !== -1 ? messages.slice(firstUserIdx) : [];

    const history = historyMessages
      .filter((m) => m.role === 'user' || m.role === 'model')
      .slice(-16)
      .map((m) => ({ role: m.role, parts: m.text }));

    try {
      const res = await sendChatMessage({ message: contextualMessage, stadiumId, eventId, history });
      const { reply, contextUsed, configError } = res?.data?.data || {};

      let displayReply = reply || 'I could not generate a response. Please try again.';

      if (contextUsed) {
        displayReply += `\n\n_ℹ️ ${TRANSLATIONS[activeLang]?.note || TRANSLATIONS.en.note}_`;
      }
      if (configError) {
        displayReply = '⚠️ The AI assistant is not yet configured. Please contact venue staff for assistance.';
      }

      setMessages((prev) => [...prev, { role: 'model', text: displayReply, timestamp: now() }]);
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Something went wrong. Please try again.';
      setError(errMsg);
      setMessages((prev) => [...prev, {
        role: 'model',
        text: `❌ ${errMsg}`,
        timestamp: now(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, messages, stadiumId, eventId, getLanguageCode]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const code = getLanguageCode();
  const t = TRANSLATIONS[code] || TRANSLATIONS.en;

  const QUICK_PROMPTS = [
    { label: t.quick_navigation, text: t.nav_text },
    { label: t.quick_accessibility, text: t.access_text },
    { label: t.quick_transportation, text: t.trans_text },
    { label: t.quick_facilities, text: t.fac_text },
    { label: t.quick_rules, text: t.rules_text },
    { label: t.quick_ticket, text: t.ticket_text }
  ];

  if (inlineMode) {
    return (
      <div
        id="chat-widget-panel-inline"
        className="w-full h-full flex flex-col bg-slate-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-base font-black">✦</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-extrabold text-white leading-none">StadiumGenie AI</p>
            <p className="text-[9px] text-blue-200 mt-0.5 truncate font-semibold">StadiumGenie Assistant</p>
          </div>
          
          {/* Compact Language Selector */}
          <div className="relative shrink-0 mr-1">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/15 text-white border border-white/20 rounded-lg text-[9px] font-bold px-1 py-0.5 outline-none hover:bg-white/25 transition-all cursor-pointer focus:ring-1 focus:ring-blue-300"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} style={{ color: '#0f172a', backgroundColor: '#ffffff' }} className="font-bold text-slate-900">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {(stadiumId || eventId) && (
            <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/20 text-green-300 border border-green-400/30">
              📍 Context
            </span>
          )}
        </div>

        {/* AI label banner */}
        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 border-b border-blue-100 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <p className="text-[10px] font-semibold text-blue-750">
            AI responses grounded in live stadium context
          </p>
        </div>

        {/* Not-authenticated notice */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="text-4xl animate-bounce">🔒</div>
            <p className="text-sm font-bold text-slate-700">Sign In Required</p>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Please sign in to your account to utilize the StadiumGenie AI Assistant.
            </p>
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-550 text-white font-bold rounded-xl text-xs transition shadow-sm uppercase tracking-wider"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {loading && (
                <div className="flex gap-2 items-end">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-xs text-white font-bold">✦</div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Permanently Visible Quick Prompts */}
            <div className="px-4 pb-2 pt-1.5 flex flex-wrap gap-1 bg-slate-50/50 border-t border-slate-100 shrink-0">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => handleSend(qp.text)}
                  disabled={loading}
                  className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-white border border-slate-205 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all cursor-pointer whitespace-nowrap"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Input section */}
            <div className="px-3 pb-3 pt-2 border-t border-slate-100 bg-white shrink-0">
              {error && (
                <p className="text-[10px] text-red-500 font-semibold mb-1 px-1">⚠️ {error}</p>
              )}
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  id="chat-widget-input-inline"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  placeholder={t.placeholder}
                  rows={1}
                  maxLength={2000}
                  className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-805 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 min-h-[38px] max-h-[100px]"
                  style={{ scrollbarWidth: 'thin' }}
                />
                <button
                  id="chat-widget-send-inline"
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="shrink-0 w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
                >
                  <svg xmlns="http://www.w3.org/2050/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              </div>
              <p className="text-[8px] text-slate-400 text-center mt-1.5 leading-none">
                {t.disclaimer}
              </p>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {/* ── Floating trigger button ─────────────────────────────── */}
      <button
        id="chat-widget-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open StadiumGenie AI Assistant"
        title="StadiumGenie AI Assistant"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          open
            ? 'bg-slate-700 rotate-45'
            : 'bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
        }`}
        style={{ boxShadow: '0 8px 32px rgba(59,130,246,0.35)' }}
      >
        {open ? '✕' : '✦'}
      </button>

      {/* ── Chat Panel ─────────────────────────────────────────── */}
      {open && (
        <div
          id="chat-widget-panel"
          className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] flex flex-col bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          style={{ height: '540px', maxHeight: 'calc(100vh - 120px)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-base font-black">✦</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-white leading-none">StadiumGenie AI</p>
              <p className="text-[9px] text-blue-200 mt-0.5 truncate">StadiumGenie Assistant</p>
            </div>
            
            {/* Compact Language Selector */}
            <div className="relative shrink-0 mr-1">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white/15 text-white border border-white/20 rounded-lg text-[9px] font-bold px-1 py-0.5 outline-none hover:bg-white/25 transition-all cursor-pointer focus:ring-1 focus:ring-blue-300"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} style={{ color: '#0f172a', backgroundColor: '#ffffff' }} className="font-bold text-slate-900">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {(stadiumId || eventId) && (
              <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/20 text-green-300 border border-green-400/30">
                📍 Context
              </span>
            )}
            <button
              onClick={() => setOpen(false)}
              className="ml-1 text-white/70 hover:text-white transition text-lg leading-none"
              aria-label="Close AI assistant"
            >✕</button>
          </div>

          {/* AI label banner */}
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 border-b border-blue-100 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[10px] font-semibold text-blue-750">
              AI responses grounded in live stadium context
            </p>
          </div>

          {/* Not-authenticated notice */}
          {!isAuthenticated ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="text-4xl animate-bounce">🔒</div>
              <p className="text-sm font-bold text-slate-700">Sign In Required</p>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Please sign in to your account to utilize the StadiumGenie AI Assistant.
              </p>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-550 text-white font-bold rounded-xl text-xs transition shadow-sm uppercase tracking-wider"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} />
                ))}
                {loading && (
                  <div className="flex gap-2 items-end">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-xs text-white font-bold">✦</div>
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Permanently Visible Quick Prompts */}
              <div className="px-4 pb-2 pt-1.5 flex flex-wrap gap-1 bg-slate-50/50 border-t border-slate-100 shrink-0">
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp.label}
                    onClick={() => handleSend(qp.text)}
                    disabled={loading}
                    className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-white border border-slate-205 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>

              {/* Input section */}
              <div className="px-3 pb-3 pt-2 border-t border-slate-100 bg-white shrink-0">
                {error && (
                  <p className="text-[10px] text-red-500 font-semibold mb-1 px-1">⚠️ {error}</p>
                )}
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    id="chat-widget-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    placeholder={t.placeholder}
                    rows={1}
                    maxLength={2000}
                    className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-805 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 min-h-[38px] max-h-[100px]"
                    style={{ scrollbarWidth: 'thin' }}
                  />
                  <button
                    id="chat-widget-send"
                    onClick={() => handleSend()}
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                    className="shrink-0 w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  </button>
                </div>
                <p className="text-[8px] text-slate-400 text-center mt-1.5 leading-none">
                  {t.disclaimer}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
