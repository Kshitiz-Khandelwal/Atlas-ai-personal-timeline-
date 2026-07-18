import { AvatarState } from '../components/AvatarFace';

/**
 * Infers the AvatarFace animation state from LLM response sentiment, sarcasm markers, and user input.
 * Addresses the exact architectural requirement in Layer 6 of the research spec.
 */
export function inferAvatarState(
  response: string,
  isGenerating: boolean = false,
  isListening: boolean = false,
  sarcasmThreshold: number = 0.5
): AvatarState {
  if (isListening) {
    return 'LISTENING';
  }

  if (isGenerating) {
    return 'THINKING';
  }

  if (!response || response.trim().length === 0) {
    return 'NEUTRAL';
  }

  const textLower = response.toLowerCase();

  // 1. Detect Sarcasm & SASSY markers
  const sassyKeywords = [
    'oh sure',
    'right, because',
    'obviously',
    'good luck with that',
    'wow, really',
    'as if',
    'totally not',
    'whatever you say',
    'brilliant plan',
    'sure buddy',
    'bhai seriously',
  ];
  
  const hasSassyPunctuation = (response.match(/\?!/g) || []).length >= 1 || (response.match(/\.\.\./g) || []).length >= 2;
  const hasSassyWords = sassyKeywords.some((kw) => textLower.includes(kw));

  if (hasSassyWords || (hasSassyPunctuation && sarcasmThreshold > 0.4)) {
    return 'SASSY';
  }

  // 2. Detect Excitement / Active Delivery -> SPEAKING
  const hasExcitement = (response.match(/!/g) || []).length >= 2 || textLower.includes('let\'s go') || textLower.includes('exactly');
  if (hasExcitement || response.length > 40) {
    return 'SPEAKING';
  }

  // 3. Default agreement / calm response -> NEUTRAL
  return 'NEUTRAL';
}
