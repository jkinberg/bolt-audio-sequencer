import { SoundType, Step } from '../types';

// Map sound types to numeric values for URL encoding
const SOUND_TO_NUMBER: Record<SoundType, string> = {
  null: '0',
  'kick': '1',
  'snare': '2',
  'hihat': '3',
  'cymbal': '4',
  'handclap': '5',
  'cowbell': '6',
  'delete': '0', // Delete maps to no sound
};

// Map numeric values back to sound types for URL decoding
const NUMBER_TO_SOUND: Record<string, SoundType> = {
  '0': null,
  '1': 'kick',
  '2': 'snare',
  '3': 'hihat',
  '4': 'cymbal',
  '5': 'handclap',
  '6': 'cowbell',
};

export const encodePattern = (steps: Step[]): string => {
  return steps.map(step => SOUND_TO_NUMBER[step.sound] || '0').join('');
};

export const decodePattern = (patternString: string): SoundType[] => {
  // Ensure we have exactly 16 characters, pad with '0' if needed
  const normalizedPattern = patternString.padEnd(16, '0').substring(0, 16);
  
  return normalizedPattern.split('').map(char => {
    return NUMBER_TO_SOUND[char] || null;
  });
};

export const generateShareUrl = (tempo: number, steps: Step[]): string => {
  const baseUrl = window.location.origin + window.location.pathname;
  const pattern = encodePattern(steps);
  
  const params = new URLSearchParams();
  params.set('t', tempo.toString());
  params.set('p', pattern);
  
  return `${baseUrl}?${params.toString()}`;
};

export const parseUrlParams = (): { tempo?: number; pattern?: SoundType[] } => {
  const urlParams = new URLSearchParams(window.location.search);
  const result: { tempo?: number; pattern?: SoundType[] } = {};
  
  // Parse tempo
  const tempoParam = urlParams.get('t');
  if (tempoParam) {
    const tempo = parseInt(tempoParam, 10);
    if (!isNaN(tempo) && tempo >= 30 && tempo <= 200) {
      result.tempo = tempo;
    }
  }
  
  // Parse pattern
  const patternParam = urlParams.get('p');
  if (patternParam && /^[0-6]{1,16}$/.test(patternParam)) {
    result.pattern = decodePattern(patternParam);
  }
  
  return result;
};