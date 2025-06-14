/**
 * Generates a response from the chatbot
 * In a real app, this would call an AI service API
 */
export const generateChatbotResponse = async (message: string): Promise<string> => {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simple rule-based responses for demo purposes
    if (message.toLowerCase().includes("bonjour") || message.toLowerCase().includes("salut")) {
      return "Bonjour ! Comment puis-je vous aider aujourd'hui ?"
    }

    if (message.toLowerCase().includes("aide") || message.toLowerCase().includes("help")) {
      return "Je peux vous aider avec la navigation dans l'application, l'accès aux ressources pédagogiques, ou répondre à vos questions sur le Collège de Paris."
    }

    if (message.toLowerCase().includes("livre") || message.toLowerCase().includes("book")) {
      return "Vous pouvez accéder à notre bibliothèque numérique depuis l'onglet 'Bibliothèque'. Vous y trouverez des livres classés par domaine d'étude."
    }

    if (message.toLowerCase().includes("examen") || message.toLowerCase().includes("épreuve")) {
      return "Les annales d'examens sont disponibles dans l'onglet 'Épreuves'. Vous pouvez les filtrer par école et par niveau académique."
    }

    if (message.toLowerCase().includes("club") || message.toLowerCase().includes("communauté")) {
      return "Rejoignez nos clubs thématiques dans l'onglet 'Communauté'. Vous pouvez également créer votre propre club et inviter d'autres étudiants."
    }

    if (message.toLowerCase().includes("cv") || message.toLowerCase().includes("curriculum")) {
      return "Vous pouvez générer votre CV automatiquement depuis votre profil. Accédez à l'onglet 'Profil' puis 'Générateur de CV'."
    }

    // Default response
    return "Je ne suis pas sûr de comprendre votre demande. Pourriez-vous reformuler ou me poser une question plus précise sur EduSphere ?"
  } catch (error) {
    console.error("Error generating chatbot response:", error)
    return "Désolé, je rencontre des difficultés à traiter votre demande. Veuillez réessayer plus tard."
  }
}
