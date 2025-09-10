export interface ScreenReaderAnnouncement {
  message: string
  priority: 'polite' | 'assertive'
  timestamp: number
}

class AccessibilityManager {
  private announcements: ScreenReaderAnnouncement[] = []
  private announcementRegion: HTMLElement | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAnnouncementRegion()
    }
  }

  private initializeAnnouncementRegion() {
    const existingRegion = document.getElementById('accessibility-announcements')
    
    if (!existingRegion) {
      const region = document.createElement('div')
      region.id = 'accessibility-announcements'
      region.setAttribute('aria-live', 'polite')
      region.setAttribute('aria-atomic', 'true')
      region.setAttribute('role', 'status')
      region.style.position = 'absolute'
      region.style.left = '-10000px'
      region.style.width = '1px'
      region.style.height = '1px'
      region.style.overflow = 'hidden'
      
      document.body.appendChild(region)
      this.announcementRegion = region
    } else {
      this.announcementRegion = existingRegion
    }
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (typeof window === 'undefined') return

    const announcement: ScreenReaderAnnouncement = {
      message,
      priority,
      timestamp: Date.now(),
    }

    this.announcements.push(announcement)
    
    if (this.announcementRegion) {
      this.announcementRegion.setAttribute('aria-live', priority)
      
      setTimeout(() => {
        if (this.announcementRegion) {
          this.announcementRegion.textContent = message
        }
      }, 100)
    }

    console.log(`Screen Reader Announcement (${priority}): ${message}`)
  }

  announceGameStart(player1Username: string, player2Username: string) {
    this.announce(
      `Game started between ${player1Username} and ${player2Username}. Get ready for the first question!`,
      'assertive'
    )
  }

  announceQuestion(question: string, questionNumber: number, totalQuestions: number) {
    this.announce(
      `Question ${questionNumber} of ${totalQuestions}: ${question}`,
      'assertive'
    )
  }

  announceAnswer(playerUsername: string, isCorrect: boolean, points: number) {
    if (isCorrect) {
      this.announce(
        `${playerUsername} answered correctly and scored ${points} point${points !== 1 ? 's' : ''}!`,
        'assertive'
      )
    } else {
      this.announce(
        `${playerUsername} answered incorrectly.`,
        'polite'
      )
    }
  }

  announceScore(player1Username: string, player1Score: number, player2Username: string, player2Score: number) {
    this.announce(
      `Current score: ${player1Username} has ${player1Score} point${player1Score !== 1 ? 's' : ''}, ${player2Username} has ${player2Score} point${player2Score !== 1 ? 's' : ''}.`,
      'polite'
    )
  }

  announceGameEnd(winner: string | null, player1Username: string, player1Score: number, player2Username: string, player2Score: number) {
    if (winner) {
      this.announce(
        `Game over! ${winner} wins with ${winner === player1Username ? player1Score : player2Score} points! Final score: ${player1Username} ${player1Score}, ${player2Username} ${player2Score}.`,
        'assertive'
      )
    } else {
      this.announce(
        `Game over! It's a tie! Final score: ${player1Username} ${player1Score}, ${player2Username} ${player2Score}.`,
        'assertive'
      )
    }
  }

  announcePlayerJoined(playerUsername: string) {
    this.announce(
      `${playerUsername} joined the game.`,
      'polite'
    )
  }

  announceTimeRemaining(seconds: number) {
    if (seconds <= 10 && seconds > 0) {
      this.announce(
        `${seconds} second${seconds !== 1 ? 's' : ''} remaining.`,
        'assertive'
      )
    }
  }

  announceNavigation(section: string) {
    this.announce(
      `Navigated to ${section}.`,
      'polite'
    )
  }

  announceFormError(fieldName: string, errorMessage: string) {
    this.announce(
      `Error in ${fieldName}: ${errorMessage}`,
      'assertive'
    )
  }

  announceFormSuccess(message: string) {
    this.announce(
      `Success: ${message}`,
      'polite'
    )
  }

  getRecentAnnouncements(count: number = 10): ScreenReaderAnnouncement[] {
    return this.announcements.slice(-count)
  }

  clearAnnouncements() {
    this.announcements = []
  }
}

class NoOpAccessibilityManager {
  private announcements: ScreenReaderAnnouncement[] = []
  private announcementRegion: HTMLElement | null = null

  announce() {}
  announceGameStart() {}
  announceQuestion() {}
  announceAnswer() {}
  announceScore() {}
  announceGameEnd() {}
  announcePlayerJoined() {}
  announceFormSuccess() {}
  announceFormError() {}
  announceTimeRemaining() {}
  getRecentAnnouncements() { return [] }
  clearAnnouncements() {}
}

let accessibilityManagerInstance: AccessibilityManager | NoOpAccessibilityManager | null = null

export const accessibilityManager = (): AccessibilityManager => {
  if (typeof window === 'undefined') {
    // Return a no-op instance during SSR
    if (!accessibilityManagerInstance) {
      accessibilityManagerInstance = new NoOpAccessibilityManager()
    }
    return accessibilityManagerInstance as AccessibilityManager
  }
  
  if (!accessibilityManagerInstance || accessibilityManagerInstance instanceof NoOpAccessibilityManager) {
    accessibilityManagerInstance = new AccessibilityManager()
  }
  return accessibilityManagerInstance
}

export default accessibilityManager
