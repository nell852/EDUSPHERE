/**
 * Generates a unique 6-character matricule for students
 * Format: 2 letters followed by 4 numbers
 */
export const generateMatricule = (): string => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"

  let matricule = ""

  // Generate 2 random letters
  for (let i = 0; i < 2; i++) {
    matricule += letters.charAt(Math.floor(Math.random() * letters.length))
  }

  // Generate 4 random numbers
  for (let i = 0; i < 4; i++) {
    matricule += numbers.charAt(Math.floor(Math.random() * numbers.length))
  }

  return matricule
}
