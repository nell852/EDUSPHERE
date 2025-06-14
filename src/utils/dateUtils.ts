/**
 * Utilitaires pour la gestion des dates
 */

export const formatDate = (
  date: Date | string,
  format: "short" | "long" | "time" | "datetime" | "relative" = "short",
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return "Date invalide"
  }

  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  switch (format) {
    case "short":
      return dateObj.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })

    case "long":
      return dateObj.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })

    case "time":
      return dateObj.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })

    case "datetime":
      return dateObj.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

    case "relative":
      if (diffInDays === 0) {
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

        if (diffInHours === 0) {
          if (diffInMinutes === 0) {
            return "À l'instant"
          } else if (diffInMinutes === 1) {
            return "Il y a 1 minute"
          } else {
            return `Il y a ${diffInMinutes} minutes`
          }
        } else if (diffInHours === 1) {
          return "Il y a 1 heure"
        } else {
          return `Il y a ${diffInHours} heures`
        }
      } else if (diffInDays === 1) {
        return "Hier"
      } else if (diffInDays < 7) {
        return `Il y a ${diffInDays} jours`
      } else if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7)
        return weeks === 1 ? "Il y a 1 semaine" : `Il y a ${weeks} semaines`
      } else if (diffInDays < 365) {
        const months = Math.floor(diffInDays / 30)
        return months === 1 ? "Il y a 1 mois" : `Il y a ${months} mois`
      } else {
        const years = Math.floor(diffInDays / 365)
        return years === 1 ? "Il y a 1 an" : `Il y a ${years} ans`
      }

    default:
      return dateObj.toLocaleDateString("fr-FR")
  }
}

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}min`
}

export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const today = new Date()

  return dateObj.toDateString() === today.toDateString()
}

export const isYesterday = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  return dateObj.toDateString() === yesterday.toDateString()
}

export const isSameWeek = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1
  const d2 = typeof date2 === "string" ? new Date(date2) : date2

  const startOfWeek1 = new Date(d1)
  startOfWeek1.setDate(d1.getDate() - d1.getDay())

  const startOfWeek2 = new Date(d2)
  startOfWeek2.setDate(d2.getDate() - d2.getDay())

  return startOfWeek1.toDateString() === startOfWeek2.toDateString()
}

export const addDays = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date)
  dateObj.setDate(dateObj.getDate() + days)
  return dateObj
}

export const addHours = (date: Date | string, hours: number): Date => {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date)
  dateObj.setHours(dateObj.getHours() + hours)
  return dateObj
}

export const getStartOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date)
  dateObj.setHours(0, 0, 0, 0)
  return dateObj
}

export const getEndOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date)
  dateObj.setHours(23, 59, 59, 999)
  return dateObj
}

export const formatTimeAgo = (date: Date | string): string => {
  return formatDate(date, "relative")
}

export const getWeekDays = (startDate?: Date): Date[] => {
  const start = startDate || new Date()
  const startOfWeek = new Date(start)
  startOfWeek.setDate(start.getDate() - start.getDay())

  const days = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    days.push(day)
  }

  return days
}

export const getMonthName = (monthIndex: number): string => {
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ]
  return months[monthIndex] || ""
}

export const getDayName = (dayIndex: number): string => {
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
  return days[dayIndex] || ""
}
