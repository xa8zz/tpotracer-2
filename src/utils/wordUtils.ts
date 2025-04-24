// List of words for the typing test
const WORD_LIST = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'code', 'data', 'file', 'type', 'test', 'class', 'function', 'array', 'string', 'number',
  'object', 'method', 'system', 'program', 'value', 'key', 'language', 'variable', 'interface', 'component',
  'script', 'module', 'browser', 'server', 'client', 'database', 'query', 'request', 'response', 'error'
];

/**
 * Gets a random set of words from the word list
 * @param count Number of random words to return
 * @returns Array of random words
 */
export const getRandomWords = (count: number): string[] => {
  const result: string[] = [];
  const wordListCopy = [...WORD_LIST];
  
  // Ensure we don't try to get more words than exist in the list
  const actualCount = Math.min(count, WORD_LIST.length);
  
  for (let i = 0; i < actualCount; i++) {
    // Get a random index
    const randomIndex = Math.floor(Math.random() * wordListCopy.length);
    // Add the word to our result
    result.push(wordListCopy[randomIndex]);
    // Remove the word from our copy to avoid duplicates
    wordListCopy.splice(randomIndex, 1);
  }
  
  return result;
};