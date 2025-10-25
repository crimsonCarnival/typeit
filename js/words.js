// words.js
// Utilities for generating sanitized word lists and word-mode content

// Clean a token according to the rules:
// - lowercase
// - remove leading/trailing quotes (") or (')
// - remove commas and periods anywhere
export const sanitizeToken = (token) => {
  if (!token) return ''
  let w = token.toLowerCase()
  // remove any double quotes (straight or curly) anywhere
  w = w.replace(/[\"“”]+/g, '')
  // remove leading/trailing single quotes (keep internal for contractions)
  w = w.replace(/^[']+|[']+$/g, '')
  // remove punctuation: commas, periods, question, exclamation, semicolon, colon
  w = w.replace(/[\.,?!;:]+/g, '')
  return w
}

// Build a de-duplicated array of sanitized words from an array of paragraphs
export const buildWordList = (paragraphs) => {
  const words = []
  const arr = Array.isArray(paragraphs) ? paragraphs : [paragraphs]
  arr.forEach(p => {
    const tokens = String(p).split(/\s+/)
    tokens.forEach(t => {
      const clean = sanitizeToken(t)
      if (clean) words.push(clean)
    })
  })
  return words
}

// Generate a space-separated string of random words
export const generateWordContent = (paragraphs, count = 50) => {
  const list = buildWordList(paragraphs)
  if (!count || count < 1) count = 50
  const picked = []
  for (let i = 0; i < count; i++) {
    const word = list[Math.floor(Math.random() * list.length)]
    picked.push(word)
  }
  return picked.join(' ')
}
