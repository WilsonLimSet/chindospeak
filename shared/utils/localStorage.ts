// Unified localStorage utilities for language learning apps

import { Flashcard, ReviewSession, Category, StreakData, DailyChallenge, DailyActivity, NotificationSettings } from '@/shared/types';

export class UnifiedLocalStorage {
  private prefix: string;

  constructor(appPrefix: string = 'unified-lang-app') {
    this.prefix = appPrefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}-${key}`;
  }

  // Flashcard operations
  getFlashcards(): Flashcard[] {
    try {
      const stored = localStorage.getItem(this.getKey('flashcards'));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveFlashcards(flashcards: Flashcard[]): void {
    try {
      localStorage.setItem(this.getKey('flashcards'), JSON.stringify(flashcards));
    } catch {
      // Save failed silently
    }
  }

  addFlashcard(flashcard: Flashcard): void {
    const flashcards = this.getFlashcards();
    flashcards.push(flashcard);
    this.saveFlashcards(flashcards);
  }

  updateFlashcard(id: string, updates: Partial<Flashcard>): void {
    const flashcards = this.getFlashcards();
    const index = flashcards.findIndex(card => card.id === id);
    if (index !== -1) {
      flashcards[index] = { ...flashcards[index], ...updates, updatedAt: new Date() };
      this.saveFlashcards(flashcards);
    }
  }

  deleteFlashcard(id: string): void {
    const flashcards = this.getFlashcards();
    const filtered = flashcards.filter(card => card.id !== id);
    this.saveFlashcards(filtered);
  }

  // Review session operations
  addReviewSession(flashcardId: string, session: Omit<ReviewSession, 'id' | 'flashcardId'>): void {
    const flashcards = this.getFlashcards();
    const flashcard = flashcards.find(card => card.id === flashcardId);
    
    if (flashcard) {
      const newSession: ReviewSession = {
        id: this.generateId(),
        flashcardId,
        ...session
      };
      
      flashcard.reviewHistory.push(newSession);
      this.updateFlashcard(flashcardId, { reviewHistory: flashcard.reviewHistory });
    }
  }

  // Category operations
  getCategories(): Category[] {
    try {
      const stored = localStorage.getItem(this.getKey('categories'));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(this.getKey('categories'), JSON.stringify(categories));
    } catch {
      // Save failed silently
    }
  }

  addCategory(category: Category): void {
    const categories = this.getCategories();
    categories.push(category);
    this.saveCategories(categories);
  }

  updateCategory(id: string, updates: Partial<Category>): void {
    const categories = this.getCategories();
    const index = categories.findIndex(cat => cat.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      this.saveCategories(categories);
    }
  }

  deleteCategory(id: string): void {
    // Remove category
    const categories = this.getCategories();
    const filtered = categories.filter(cat => cat.id !== id);
    this.saveCategories(filtered);
    
    // Remove categoryId from affected flashcards
    const flashcards = this.getFlashcards();
    const updatedFlashcards = flashcards.map(card => {
      if (card.categoryId === id) {
        const { categoryId, ...cardWithoutCategory } = card;
        return cardWithoutCategory;
      }
      return card;
    });
    this.saveFlashcards(updatedFlashcards);
  }

  getCategoryById(id: string): Category | undefined {
    const categories = this.getCategories();
    return categories.find(cat => cat.id === id);
  }

  getFlashcardsByCategory(categoryId?: string): Flashcard[] {
    const flashcards = this.getFlashcards();
    
    if (!categoryId) {
      return flashcards.filter(card => !card.categoryId);
    }
    
    return flashcards.filter(card => card.categoryId === categoryId);
  }

  // Legacy category support (for backward compatibility)
  getLegacyCategories(): string[] {
    const flashcards = this.getFlashcards();
    const categories = new Set<string>();
    
    flashcards.forEach(card => {
      if (card.category) {
        categories.add(card.category);
      }
    });
    
    return Array.from(categories).sort();
  }

  // Statistics and analytics
  getStudyStats(): {
    totalCards: number;
    reviewedToday: number;
    averageScore: number;
    streakDays: number;
  } {
    const flashcards = this.getFlashcards();
    const today = new Date().toDateString();
    
    const totalCards = flashcards.length;
    const reviewedToday = flashcards.filter(card => 
      card.reviewHistory.some(session => 
        new Date(session.reviewedAt).toDateString() === today
      )
    ).length;
    
    // Calculate average score from recent reviews
    const allReviews = flashcards.flatMap(card => card.reviewHistory);
    const recentReviews = allReviews.filter(session => 
      Date.now() - new Date(session.reviewedAt).getTime() < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );
    
    const averageScore = recentReviews.length > 0 
      ? recentReviews.reduce((sum, session) => sum + (session.wasCorrect ? 1 : 0), 0) / recentReviews.length * 100
      : 0;
    
    // Calculate streak (simplified - days with any reviews)
    const streakDays = this.calculateStreakDays(allReviews);
    
    return {
      totalCards,
      reviewedToday,
      averageScore: Math.round(averageScore),
      streakDays
    };
  }

  private calculateStreakDays(reviews: ReviewSession[]): number {
    if (reviews.length === 0) return 0;
    
    const reviewDates = [...new Set(reviews.map(session => 
      new Date(session.reviewedAt).toDateString()
    ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < reviewDates.length; i++) {
      const reviewDate = new Date(reviewDates[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (reviewDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // App settings
  getAppSettings(): Record<string, any> {
    try {
      const stored = localStorage.getItem(this.getKey('settings'));
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  saveAppSettings(settings: Record<string, any>): void {
    try {
      localStorage.setItem(this.getKey('settings'), JSON.stringify(settings));
    } catch {
      // Save failed silently
    }
  }

  getSetting(key: string, defaultValue?: any): any {
    const settings = this.getAppSettings();
    return settings[key] ?? defaultValue;
  }

  setSetting(key: string, value: any): void {
    const settings = this.getAppSettings();
    settings[key] = value;
    this.saveAppSettings(settings);
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Data export/import
  exportData(): string {
    const data = {
      flashcards: this.getFlashcards(),
      settings: this.getAppSettings(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);
      
      // Import categories first
      if (data.categories && Array.isArray(data.categories)) {
        // Transform legacy categories format
        const transformedCategories = data.categories.map((category: any) => ({
          id: category.id || crypto.randomUUID(),
          name: category.name || 'Unnamed Category',
          color: category.color || '#FF5733',
          createdAt: category.createdAt ? new Date(category.createdAt) : new Date()
        }));
        
        this.saveCategories(transformedCategories);
      }
      
      if (data.flashcards && Array.isArray(data.flashcards)) {
        // Get existing flashcards to merge with imported ones
        const existingFlashcards = this.getFlashcards();
        
        // Transform legacy format to ChindoSpeak format
        const transformedFlashcards = data.flashcards.map((card: any) => {
          const today = new Date().toISOString().split('T')[0];

          // Handle Indonesian format with text/translation fields
          const wordValue = card.text || card.chinese || card.word || '';

          const transformedCard = {
            id: card.id || crypto.randomUUID(),
            word: wordValue,
            pronunciation: card.pinyin || card.pronunciation || '',
            translation: card.translation || card.english || '',
            categoryId: card.categoryId || undefined,
            difficulty: card.reviewLevel || card.difficulty || 1,
            createdAt: card.createdAt ? new Date(card.createdAt) : new Date(),
            updatedAt: new Date(),
            reviewHistory: [],
            
            // Reading skill - handle missing fields gracefully
            readingReviewLevel: card.readingReviewLevel !== undefined ? card.readingReviewLevel : 0,
            readingNextReviewDate: card.readingNextReviewDate || today,
            readingDifficulty: 1,
            
            // Listening skill - handle missing fields gracefully
            listeningReviewLevel: card.listeningReviewLevel !== undefined ? card.listeningReviewLevel : 0,
            listeningNextReviewDate: card.listeningNextReviewDate || today,
            listeningDifficulty: 1,
            
            // Speaking skill - handle missing fields gracefully
            speakingReviewLevel: card.speakingReviewLevel !== undefined ? card.speakingReviewLevel : 0,
            speakingNextReviewDate: card.speakingNextReviewDate || today,
            speakingDifficulty: 1
          };
          
          return transformedCard;
        });
        
        // Create a map of existing flashcards for easy lookup
        const existingCardsMap = new Map(existingFlashcards.map(card => [card.id, card]));
        
        // Merge transformed flashcards, updating existing ones and adding new ones
        transformedFlashcards.forEach((card: Flashcard) => {
          existingCardsMap.set(card.id, card);
        });
        
        // Convert map back to array
        const mergedFlashcards = Array.from(existingCardsMap.values());
        
        this.saveFlashcards(mergedFlashcards);
      }
      
      if (data.settings && typeof data.settings === 'object') {
        this.saveAppSettings(data.settings);
      }
      
      return { success: true, message: 'Data imported successfully' };
    } catch {
      return { success: false, message: 'Invalid data format' };
    }
  }

  // Skill level management
  calculateNextReviewDate(level: number): string {
    const today = new Date();
    let daysToAdd = 0;
    
    switch (level) {
      case 0: daysToAdd = 0; break;  // Review today
      case 1: daysToAdd = 1; break;  // 1 day
      case 2: daysToAdd = 3; break;  // 3 days
      case 3: daysToAdd = 5; break;  // 5 days
      case 4: daysToAdd = 10; break; // 10 days
      case 5: daysToAdd = 24; break; // 24 days
      default: daysToAdd = 0;
    }
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysToAdd);
    return nextDate.toISOString().split('T')[0];
  }

  updateReadingReviewLevel(flashcardId: string, wasCorrect: boolean): void {
    const flashcards = this.getFlashcards();
    const flashcard = flashcards.find(card => card.id === flashcardId);
    
    if (flashcard) {
      if (wasCorrect) {
        flashcard.readingReviewLevel = Math.min(5, flashcard.readingReviewLevel + 1);
      } else {
        flashcard.readingReviewLevel = 0;
      }
      flashcard.readingNextReviewDate = this.calculateNextReviewDate(flashcard.readingReviewLevel);
      this.saveFlashcards(flashcards);
    }
  }

  updateListeningReviewLevel(flashcardId: string, wasCorrect: boolean): void {
    const flashcards = this.getFlashcards();
    const flashcard = flashcards.find(card => card.id === flashcardId);
    
    if (flashcard) {
      if (wasCorrect) {
        flashcard.listeningReviewLevel = Math.min(5, flashcard.listeningReviewLevel + 1);
      } else {
        flashcard.listeningReviewLevel = 0;
      }
      flashcard.listeningNextReviewDate = this.calculateNextReviewDate(flashcard.listeningReviewLevel);
      this.saveFlashcards(flashcards);
    }
  }

  updateSpeakingReviewLevel(flashcardId: string, wasCorrect: boolean): void {
    const flashcards = this.getFlashcards();
    const flashcard = flashcards.find(card => card.id === flashcardId);
    
    if (flashcard) {
      if (wasCorrect) {
        flashcard.speakingReviewLevel = Math.min(5, flashcard.speakingReviewLevel + 1);
      } else {
        flashcard.speakingReviewLevel = 0;
      }
      flashcard.speakingNextReviewDate = this.calculateNextReviewDate(flashcard.speakingReviewLevel);
      this.saveFlashcards(flashcards);
    }
  }

  getFlashcardsForReadingReview(): Flashcard[] {
    const flashcards = this.getFlashcards();
    const today = new Date().toISOString().split('T')[0];
    return flashcards.filter(card => card.readingNextReviewDate <= today);
  }

  getFlashcardsForListeningReview(): Flashcard[] {
    const flashcards = this.getFlashcards();
    const today = new Date().toISOString().split('T')[0];
    return flashcards.filter(card => card.listeningNextReviewDate <= today);
  }

  getFlashcardsForSpeakingReview(): Flashcard[] {
    const flashcards = this.getFlashcards();
    const today = new Date().toISOString().split('T')[0];
    return flashcards.filter(card => card.speakingNextReviewDate <= today);
  }

  // Engagement Features

  // Streak tracking
  getStreakData(): StreakData {
    const flashcards = this.getFlashcards();
    const allReviews = flashcards.flatMap(card => card.reviewHistory);
    const today = new Date().toDateString();

    const currentStreak = this.calculateStreakDays(allReviews);

    const hasReviewedToday = allReviews.some(
      session => new Date(session.reviewedAt).toDateString() === today
    );

    // Get last review date
    const sortedReviews = [...allReviews].sort(
      (a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime()
    );
    const lastReviewDate = sortedReviews.length > 0
      ? new Date(sortedReviews[0].reviewedAt).toISOString().split('T')[0]
      : null;

    // Track longest streak
    const storedLongest = this.getSetting('longestStreak', 0);
    if (currentStreak > storedLongest) {
      this.setSetting('longestStreak', currentStreak);
    }

    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, storedLongest),
      lastReviewDate,
      hasReviewedToday
    };
  }

  // Daily Challenge
  getDailyChallenge(): DailyChallenge | null {
    try {
      const stored = localStorage.getItem(this.getKey('dailyChallenge'));
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  saveDailyChallenge(challenge: DailyChallenge): void {
    try {
      localStorage.setItem(this.getKey('dailyChallenge'), JSON.stringify(challenge));
    } catch {
      // Save failed silently
    }
  }

  updateChallengeProgress(increment: number, type?: string): void {
    const challenge = this.getDailyChallenge();
    if (!challenge || challenge.completed) return;

    // Only update if the activity matches the challenge type
    if (type && challenge.type !== type && challenge.type !== 'review_count') return;

    challenge.currentValue += increment;

    if (challenge.currentValue >= challenge.targetValue) {
      challenge.completed = true;
      challenge.completedAt = new Date().toISOString();
    }

    this.saveDailyChallenge(challenge);
  }

  // Activity History for Heat Map
  getActivityHistory(days: number = 90): DailyActivity[] {
    const flashcards = this.getFlashcards();
    const activityMap = new Map<string, DailyActivity>();

    // Initialize dates for the range
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activityMap.set(dateStr, {
        date: dateStr,
        reviewCount: 0,
        correctCount: 0
      });
    }

    // Aggregate reviews
    for (const card of flashcards) {
      for (const session of card.reviewHistory) {
        const sessionDate = new Date(session.reviewedAt).toISOString().split('T')[0];
        const activity = activityMap.get(sessionDate);

        if (activity) {
          activity.reviewCount++;
          if (session.wasCorrect) activity.correctCount++;
        }
      }
    }

    // Convert to sorted array (oldest first)
    return Array.from(activityMap.values()).sort(
      (a, b) => a.date.localeCompare(b.date)
    );
  }

  // Due cards count for notifications
  getDueCardsCount(): number {
    const reading = this.getFlashcardsForReadingReview().length;
    const listening = this.getFlashcardsForListeningReview().length;
    const speaking = this.getFlashcardsForSpeakingReview().length;
    return reading + listening + speaking;
  }

  // Notification settings
  getNotificationSettings(): NotificationSettings {
    try {
      const stored = localStorage.getItem(this.getKey('notificationSettings'));
      return stored ? JSON.parse(stored) : {
        enabled: false,
        permissionGranted: false,
        lastPromptDate: null
      };
    } catch {
      return {
        enabled: false,
        permissionGranted: false,
        lastPromptDate: null
      };
    }
  }

  saveNotificationSettings(settings: NotificationSettings): void {
    try {
      localStorage.setItem(this.getKey('notificationSettings'), JSON.stringify(settings));
    } catch {
      // Save failed silently
    }
  }

  // Clear all data
  clearAllData(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}