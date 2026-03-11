// TYPE CONCEPT: Function parameter and return types
// This function takes a string and returns a string
export function toTitleCase(text: string): string {
  // Split by spaces, capitalize first letter of each word, join back together
  return text
    .toLowerCase()  // First make everything lowercase
    .split(' ')     // Split into words
    .map(word => {
      // TYPE CONCEPT: TypeScript knows 'word' is a string because we split a string
      if (word.length === 0) return word;
      // Capitalize first letter + rest of the word
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');  // Join words back with spaces
}

// WHY this exists: Ensures consistent formatting regardless of how users type
// "pasta carbonara" -> "Pasta Carbonara"
// "PASTA CARBONARA" -> "Pasta Carbonara"
// "PaStA cArBoNaRa" -> "Pasta Carbonara"
