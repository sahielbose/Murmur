const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "for",
  "is",
  "are",
  "it",
  "you",
  "we",
  "that",
  "this",
  "with",
  "do",
  "need",
  "get",
  "got",
  "so",
  "be",
  "by",
  "at",
  "my",
  "me",
  "your",
  "was",
  "were",
  "will",
  "can",
  "could",
  "would",
  "about",
  "from",
  "but",
  "not",
  "have",
  "has",
  "had",
  "they",
  "them",
]);

/** Lowercase word tokens, stopwords and very short words removed. */
export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9']+/g) ?? []).filter(
    (w) => w.length > 2 && !STOPWORDS.has(w),
  );
}

/** Count of distinct shared tokens between two token lists. */
export function overlapScore(a: string[], b: string[]): number {
  const setB = new Set(b);
  let n = 0;
  for (const w of new Set(a)) if (setB.has(w)) n++;
  return n;
}
