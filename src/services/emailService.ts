/**
 * Sends an email with the matricule to the user
 * In a real app, this would use a proper email service
 */
export const sendMatriculeEmail = async (email: string, matricule: string): Promise<void> => {
  try {
    console.log(`Sending matricule ${matricule} to ${email}`)

    // In a real app, this would call an API to send an email
    // For now, we'll just simulate a successful email send

    return Promise.resolve()
  } catch (error) {
    console.error("Error sending matricule email:", error)
    return Promise.reject(error)
  }
}
