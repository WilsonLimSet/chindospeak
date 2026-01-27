/**
 * Fuzzy matching for speech recognition validation
 * Handles common speech recognition errors and variations
 */

export function normalizeText(text: string, language: 'chinese' | 'indonesian'): string {
  let normalized = text.toLowerCase().trim();

  // Remove punctuation
  normalized = normalized.replace(/[.,!?;:'"()]/g, '');

  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ');

  // Language-specific normalization
  if (language === 'chinese') {
    // Remove tonal variations in romanized input (pinyin)
    const toneMap: Record<string, string> = {
      'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
      'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
      'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
      'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
      'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
      'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v',
    };

    normalized = normalized.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, match => {
      return toneMap[match] || match;
    });
  }

  return normalized;
}

export function calculateLevenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

export function calculateSimilarity(str1: string, str2: string): number {
  if (str1.length === 0 && str2.length === 0) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;

  const distance = calculateLevenshteinDistance(str1, str2);
  const maxLen = Math.max(str1.length, str2.length);

  return 1 - distance / maxLen;
}

export interface MatchResult {
  correct: boolean;
  similarity: number;
  normalizedUser: string;
  normalizedExpected: string;
}

export function isAnswerCorrect(
  userAnswer: string,
  expectedAnswer: string,
  language: 'chinese' | 'indonesian',
  threshold: number = 0.6
): MatchResult {
  const normalizedUser = normalizeText(userAnswer, language);
  const normalizedExpected = normalizeText(expectedAnswer, language);

  // Exact match
  if (normalizedUser === normalizedExpected) {
    return { correct: true, similarity: 1, normalizedUser, normalizedExpected };
  }

  // Check if user answer contains expected answer (for longer responses)
  if (normalizedUser.includes(normalizedExpected) && normalizedExpected.length > 2) {
    return { correct: true, similarity: 0.95, normalizedUser, normalizedExpected };
  }

  // Check if expected answer contains user answer (partial match)
  if (normalizedExpected.includes(normalizedUser) && normalizedUser.length > 2) {
    const ratio = normalizedUser.length / normalizedExpected.length;
    if (ratio >= 0.7) {
      return { correct: true, similarity: ratio, normalizedUser, normalizedExpected };
    }
  }

  // Fuzzy match using Levenshtein distance
  const similarity = calculateSimilarity(normalizedUser, normalizedExpected);

  return {
    correct: similarity >= threshold,
    similarity,
    normalizedUser,
    normalizedExpected
  };
}
