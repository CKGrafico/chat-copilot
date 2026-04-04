// Template-based reply generation engine (Phase 1).
// Detects intent from transcription text and returns 3 ranked reply candidates.
// Phase 2 (stretch): replace templates with LLM generation via Squad AI capability.

export type ReplyCandidate = {
  id: string;
  text: string;
  length: 'short' | 'medium' | 'long';
  tone: string;
};

const QUESTION_KEYWORDS = ['?', 'what', 'when', 'where', 'why', 'how', 'who', 'could you', 'can you', 'would you'];
const GRATITUDE_KEYWORDS = ['thank', 'thanks', 'appreciate', 'grateful'];

type Category = 'question' | 'gratitude' | 'general' | 'fallback';
type StyleKey = 'formal' | 'casual' | 'default';
type TemplateTriplet = [string, string, string]; // [short, medium, long]

function detectCategory(text: string): Category {
  if (text.trim().length < 10) return 'fallback';
  const lower = text.toLowerCase();
  if (QUESTION_KEYWORDS.some(kw => lower.includes(kw))) return 'question';
  if (GRATITUDE_KEYWORDS.some(kw => lower.includes(kw))) return 'gratitude';
  return 'general';
}

function detectStyle(instructions: string): StyleKey {
  const lower = instructions.toLowerCase();
  if (lower.includes('formal') || lower.includes('professional')) return 'formal';
  if (lower.includes('casual') || lower.includes('friendly')) return 'casual';
  return 'default';
}

const templates: Record<Category, Record<StyleKey, TemplateTriplet>> = {
  question: {
    formal: [
      'I would be pleased to address your inquiry.',
      'Thank you for your question. I have considered the matter carefully and am prepared to provide a thorough response. Please allow me to elaborate at your convenience.',
      'Thank you for raising this important question. I have reflected on it at length and would like to offer a comprehensive response. The topic you have raised merits careful consideration, and I am committed to addressing each aspect with the attention it deserves. Please feel free to follow up should you require further clarification.',
    ],
    casual: [
      'Good question! Happy to help.',
      "Great question! Let me think about that for a sec. I've got a few thoughts I'd love to share, it's something I've been thinking about too.",
      "Oh, that's such a good question! I've been thinking about it myself and have quite a few thoughts. Let me walk you through what I know, and feel free to ask follow-ups. I love digging into this kind of stuff! There's a lot of nuance here and I want to make sure we cover it all.",
    ],
    default: [
      'Good question. Let me think about that.',
      "That's a thoughtful question. I've been considering it and would like to share a few ideas. Let me know if you'd like more detail.",
      "That's a really interesting question and I appreciate you bringing it up. I've thought about this before and have several perspectives to share. Let me walk through my thinking step by step, and please feel free to ask for clarification on any point.",
    ],
  },
  gratitude: {
    formal: [
      'I am most grateful for your kind acknowledgement.',
      'Thank you sincerely for your generous words. Your recognition means a great deal to me and I am honoured to have been of assistance.',
      'I am deeply grateful for your thoughtful acknowledgement. It is a privilege to have had the opportunity to assist you, and your kind words are a source of great encouragement. I look forward to continuing to be of service in any way I can.',
    ],
    casual: [
      "Aw, thanks so much! Really means a lot.",
      "Aww, thank you! That honestly made my day. I'm really glad I could help and I appreciate you taking the time to say so.",
      "Thank you so much, that's so kind of you to say! It genuinely means a lot to me. I'm really happy I could help, and knowing that makes all the effort worthwhile. Please don't hesitate to reach out anytime — I'm always here!",
    ],
    default: [
      "Thank you, that means a lot.",
      "Thank you so much for the kind words. I'm glad I could help and your appreciation really does mean something to me.",
      "Thank you, I really appreciate you saying that. It's always encouraging to know that the help was useful. I'm happy to assist anytime, so please don't hesitate to reach out if you need anything else in the future.",
    ],
  },
  general: {
    formal: [
      'I understand. I shall give this matter due consideration.',
      'Thank you for bringing this to my attention. I have reviewed the matter and would like to offer my perspective in a structured manner. Please allow me to elaborate.',
      'I appreciate you sharing this with me. After careful consideration, I would like to provide a comprehensive response that addresses the key points you have raised. This is a matter I take seriously, and I am committed to engaging with it in a thorough and professional manner.',
    ],
    casual: [
      'Got it! Makes total sense.',
      "That makes a lot of sense to me. I hear what you're saying and I've had similar thoughts. Let's figure this out together!",
      "Yeah, totally get it! I've been thinking about exactly the same thing lately. There's a lot going on here and I love that we're talking about it. Let me share some of what's been on my mind, and we can go from there — I feel like we're on the same page already.",
    ],
    default: [
      'Understood. Thanks for sharing that.',
      "Thanks for sharing. I've been thinking about this and wanted to share a few thoughts. Let me know what you think.",
      "Thanks for bringing this up. It's something worth discussing. I've given it some thought and have a few perspectives I'd like to share. I think it's important to look at this from multiple angles, so let me walk through my thinking and we can go from there.",
    ],
  },
  fallback: {
    formal: [
      'Good day. How may I assist you?',
      'Good day. I am at your service and would be pleased to assist you with any matter you wish to discuss. Please do not hesitate to elaborate.',
      'Good day. I trust this message finds you well. I am fully available to assist you and would welcome the opportunity to be of service. Please feel free to share whatever is on your mind and I shall endeavour to respond in a timely and thorough manner.',
    ],
    casual: [
      "Hey! What's up?",
      "Hey there! Hope you're doing well. Feel free to share what's on your mind — I'm all ears!",
      "Hey! Great to hear from you. Hope everything's going well on your end. I've been thinking about you and wanted to check in. Feel free to share anything that's on your mind — I'm here and happy to chat about whatever!",
    ],
    default: [
      "Hi! Hope you're doing well.",
      "Hi there! Hope everything is going well. Feel free to share whatever is on your mind — I'm here to help.",
      "Hi! It's great to connect with you. I hope things are going well on your end. I'm here and happy to chat about anything you'd like to discuss — feel free to share what's on your mind and we can take it from there.",
    ],
  },
};

const TONE_LABELS: Record<StyleKey, string> = {
  formal: 'formal',
  casual: 'casual',
  default: 'friendly',
};

const LENGTHS: Array<'short' | 'medium' | 'long'> = ['short', 'medium', 'long'];

export function generateReplies(text: string, instructions: string): ReplyCandidate[] {
  const category = detectCategory(text);
  const style = detectStyle(instructions);
  const triplet = templates[category][style];
  const tone = TONE_LABELS[style];

  return triplet.map((tmpl, i) => ({
    id: crypto.randomUUID(),
    text: tmpl,
    length: LENGTHS[i],
    tone,
  }));
}
