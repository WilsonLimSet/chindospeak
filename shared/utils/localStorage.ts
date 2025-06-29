// Unified localStorage utilities for language learning apps

import { Flashcard, ReviewSession, Category } from '@/shared/types';

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
    } catch (error) {
      console.error('Error loading flashcards:', error);
      return [];
    }
  }

  saveFlashcards(flashcards: Flashcard[]): void {
    try {
      localStorage.setItem(this.getKey('flashcards'), JSON.stringify(flashcards));
    } catch (error) {
      console.error('Error saving flashcards:', error);
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
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  }

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(this.getKey('categories'), JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
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
    } catch (error) {
      console.error('Error loading app settings:', error);
      return {};
    }
  }

  saveAppSettings(settings: Record<string, any>): void {
    try {
      localStorage.setItem(this.getKey('settings'), JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving app settings:', error);
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
        // Transform legacy format to ChindoSpeak format
        const transformedFlashcards = data.flashcards.map((card: any) => {
          const today = new Date().toISOString().split('T')[0];
          
          // Handle Indonesian format with text/translation fields
          return {
            id: card.id || crypto.randomUUID(),
            word: card.text || card.chinese || card.word || '',
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
        });
        
        this.saveFlashcards(transformedFlashcards);
      }
      
      if (data.settings && typeof data.settings === 'object') {
        this.saveAppSettings(data.settings);
      }
      
      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      console.error('Error importing data:', error);
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