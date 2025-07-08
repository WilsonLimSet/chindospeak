"use client";

import { useState, useEffect } from "react";
import { UnifiedLocalStorage } from "@/shared/utils/localStorage";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import { usePwa } from "@/shared/contexts/PwaContext";
import { Flashcard, Category } from "@/shared/types";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { Plus, Edit2, Trash2, Tag, Filter, BookOpen, Volume2, Mic } from "lucide-react";

export default function ManagePage() {
  const { config, currentLanguage } = useLanguage();
  const { isPwa } = usePwa();
  const [localStorage] = useState(() => new UnifiedLocalStorage(`${config.code}-flashcards`));
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "word" | "difficulty" | "nextReview">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [editValues, setEditValues] = useState<{
    word: string;
    pronunciation: string;
    translation: string;
    difficulty: number;
    categoryId?: string;
    readingReviewLevel: number;
    listeningReviewLevel: number;
    speakingReviewLevel: number;
  }>({ 
    word: "", 
    pronunciation: "", 
    translation: "", 
    difficulty: 1,
    categoryId: undefined,
    readingReviewLevel: 0,
    listeningReviewLevel: 0,
    speakingReviewLevel: 0
  });
  
  // Category management state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryManageModal, setShowCategoryManageModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    color: "#FF5733"
  });
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 10;

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string | null | undefined>(undefined);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalCards: 0,
    reviewedToday: 0,
    averageScore: 0,
    streakDays: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Reset to page 1 when search or sort or category changes
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortDirection, selectedCategory]);

  const loadData = () => {
    const cards = localStorage.getFlashcards();
    setFlashcards(cards);
    
    const cats = localStorage.getCategories();
    setCategories(cats);
    
    const statistics = localStorage.getStudyStats();
    setStats(statistics);
  };

  // Filter cards by search term and selected category
  const filteredCards = flashcards.filter(card => {
    const matchesSearch = 
      card.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.pronunciation && card.pronunciation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      card.translation.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === undefined) {
      return matchesSearch;
    }
    
    if (selectedCategory === null) {
      return matchesSearch && !card.category;
    }
    
    return matchesSearch && card.category === selectedCategory;
  });

  // Sort cards
  const sortedCards = [...filteredCards].sort((a, b) => {
    let compareValue = 0;
    
    switch (sortBy) {
      case "word":
        compareValue = a.word.localeCompare(b.word, currentLanguage === 'chinese' ? 'zh-CN' : 'id-ID');
        break;
      case "difficulty":
        const aDiff = a.difficulty ?? 0;
        const bDiff = b.difficulty ?? 0;
        compareValue = aDiff - bDiff;
        break;
      case "nextReview":
        // Get the earliest next review date among all skills
        const aNextReview = Math.min(
          new Date(a.readingNextReviewDate).getTime(),
          new Date(a.listeningNextReviewDate).getTime(),
          new Date(a.speakingNextReviewDate).getTime()
        );
        const bNextReview = Math.min(
          new Date(b.readingNextReviewDate).getTime(),
          new Date(b.listeningNextReviewDate).getTime(),
          new Date(b.speakingNextReviewDate).getTime()
        );
        compareValue = aNextReview - bNextReview;
        break;
      case "date":
      default:
        compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    
    return sortDirection === "asc" ? compareValue : -compareValue;
  });

  // Get current cards for pagination
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = sortedCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(sortedCards.length / cardsPerPage);

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      localStorage.deleteFlashcard(id);
      setFlashcards(flashcards.filter(card => card.id !== id));
      setConfirmDelete(null);
      loadData(); // Refresh stats
    } else {
      setConfirmDelete(id);
    }
  };

  const handleEdit = (card: Flashcard) => {
    setEditingCard(card.id);
    setEditValues({
      word: card.word,
      pronunciation: card.pronunciation || "",
      translation: card.translation,
      difficulty: card.difficulty ?? 1,
      categoryId: card.categoryId,
      readingReviewLevel: card.readingReviewLevel ?? 0,
      listeningReviewLevel: card.listeningReviewLevel ?? 0,
      speakingReviewLevel: card.speakingReviewLevel ?? 0
    });
  };

  const handleSaveEdit = (card: Flashcard) => {
    if (!editingCard) return;
    
    const updatedCard: Partial<Flashcard> = {
      word: editValues.word,
      pronunciation: editValues.pronunciation || undefined,
      translation: editValues.translation,
      difficulty: editValues.difficulty,
      categoryId: editValues.categoryId,
      readingReviewLevel: editValues.readingReviewLevel,
      listeningReviewLevel: editValues.listeningReviewLevel,
      speakingReviewLevel: editValues.speakingReviewLevel,
      updatedAt: new Date()
    };
    
    localStorage.updateFlashcard(editingCard, updatedCard);
    
    // Update local state
    setFlashcards(flashcards.map(c => 
      c.id === editingCard ? { ...c, ...updatedCard } : c
    ));
    
    setEditingCard(null);
    loadData(); // Refresh stats
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditValues({ 
      word: "", 
      pronunciation: "", 
      translation: "", 
      difficulty: 1, 
      categoryId: undefined,
      readingReviewLevel: 0,
      listeningReviewLevel: 0,
      speakingReviewLevel: 0
    });
  };

  const handleExport = () => {
    const data = localStorage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.ui.appName}-flashcards.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const parsed = JSON.parse(data);
        
        // Validate the import data structure
        let flashcardsToImport = [];
        
        if (Array.isArray(parsed)) {
          // Old format: direct array of flashcards
          flashcardsToImport = parsed;
        } else if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
          // New format: object with flashcards property
          flashcardsToImport = parsed.flashcards;
        } else {
          throw new Error('Invalid file format - no flashcards found');
        }

        // Import the flashcards
        const result = localStorage.importData(data);
        
        if (result.success) {
          // Refresh the local data
          loadData();
          
          // Show success message
          alert(`Successfully imported ${flashcardsToImport.length} flashcards!`);
        } else {
          throw new Error(result.message);
        }
        
        // Reset the file input
        event.target.value = '';
      } catch (error) {
        console.error('Import error:', error);
        alert('Error importing file. Please make sure it\'s a valid flashcards export file.');
        event.target.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  // Category management functions
  const handleAddCategory = () => {
    setCategoryForm({ name: "", color: "#FF5733" });
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setCategoryForm({ name: category.name, color: category.color });
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) return;

    if (editingCategory) {
      // Update existing category
      localStorage.updateCategory(editingCategory.id, {
        name: categoryForm.name.trim(),
        color: categoryForm.color
      });
    } else {
      // Add new category
      const newCategory: Category = {
        id: uuidv4(),
        name: categoryForm.name.trim(),
        color: categoryForm.color,
        createdAt: new Date()
      };
      localStorage.addCategory(newCategory);
    }

    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({ name: "", color: "#FF5733" });
    loadData();
  };

  const handleDeleteCategory = (categoryId: string) => {
    localStorage.deleteCategory(categoryId);
    if (selectedCategory === categoryId) {
      setSelectedCategory(undefined);
    }
    setConfirmDeleteCategory(null);
    loadData();
  };

  const renderCategoryFilterModal = () => {
    if (!showCategoryFilter) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
            {currentLanguage === 'chinese' ? '按类别筛选' : 'Filter by Category'}
          </h2>
          
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => {
                  setSelectedCategory(undefined);
                  setShowCategoryFilter(false);
                }}
                className={`px-3 py-2 rounded-md text-sm ${
                  selectedCategory === undefined
                    ? 'text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                style={{
                  backgroundColor: selectedCategory === undefined ? config.theme.primary : undefined
                }}
              >
                All Categories
              </button>
              
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setShowCategoryFilter(false);
                }}
                className={`px-3 py-2 rounded-md text-sm ${
                  selectedCategory === null
                    ? 'text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                style={{
                  backgroundColor: selectedCategory === null ? config.theme.primary : undefined
                }}
              >
                No Category
              </button>
              
              {categories.map(category => (
                <div key={category.id} className="flex items-center">
                  <button
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setShowCategoryFilter(false);
                    }}
                    className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? 'text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    style={{
                      backgroundColor: selectedCategory === category.id ? category.color : undefined
                    }}
                  >
                    <span 
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </button>
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Edit category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteCategory(category.id)}
                    className="ml-1 p-1 text-gray-400 hover:text-red-500"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setShowCategoryFilter(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {config.ui.buttons.cancel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isPwa) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md bg-white dark:bg-gray-900 min-h-screen">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {config.ui.navigation.manage}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Install the app to use management features
          </p>
          <Link href="/">
            <button 
              className="px-6 py-3 rounded-md text-white font-medium"
              style={{ backgroundColor: config.theme.primary }}
            >
              Go to Create Page
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-6xl min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
          <svg className="w-8 h-8 mr-3" style={{ color: config.theme.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Manage Flashcards
        </h1>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Cards</p>
            <p className="text-3xl font-bold" style={{ color: config.theme.primary }}>
              {stats.totalCards}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Reviewed Today</p>
            <p className="text-2xl font-bold" style={{ color: config.theme.secondary }}>
              {stats.reviewedToday}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Average Score</p>
            <p className="text-3xl font-bold" style={{ color: config.theme.primary }}>
              {stats.averageScore}%
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Streak Days</p>
            <p className="text-3xl font-bold" style={{ color: config.theme.secondary }}>
              {stats.streakDays}
            </p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="mb-6">
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search flashcards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          
          {/* Action Buttons - Mobile Friendly Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-xs sm:text-sm flex items-center gap-1"
              >
                <span>Sort</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showSortMenu && (
                <div className="absolute top-full mt-1 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 min-w-[180px]">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setSortBy("date");
                        setSortDirection("desc");
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                        sortBy === "date" && sortDirection === "desc" ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      Newest First
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("date");
                        setSortDirection("asc");
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                        sortBy === "date" && sortDirection === "asc" ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      Oldest First
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("word");
                        setSortDirection("asc");
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                        sortBy === "word" ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      Word (A-Z)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("difficulty");
                        setSortDirection("asc");
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                        sortBy === "difficulty" && sortDirection === "asc" ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      Easiest First
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("difficulty");
                        setSortDirection("desc");
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                        sortBy === "difficulty" && sortDirection === "desc" ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      Hardest First
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("nextReview");
                        setSortDirection("asc");
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                        sortBy === "nextReview" ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      Due for Review
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowCategoryManageModal(true)}
              className="px-3 py-2 text-white rounded-md hover:opacity-90 text-xs sm:text-sm flex items-center justify-center gap-1"
              style={{ backgroundColor: config.theme.primary }}
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              Categories
            </button>
            
            <button
              onClick={() => setShowCategoryFilter(true)}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-xs sm:text-sm flex items-center justify-center gap-1"
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              Filter
            </button>
            
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="px-3 py-2 text-white rounded-md hover:opacity-90 cursor-pointer text-xs sm:text-sm text-center"
              style={{ backgroundColor: config.theme.primary }}
            >
              Import
            </label>
            
            <button
              onClick={handleExport}
              className="px-3 py-2 text-white rounded-md hover:opacity-90 text-xs sm:text-sm"
              style={{ backgroundColor: config.theme.secondary }}
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {currentCards.map((card) => (
          <div key={card.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            {editingCard === card.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {config.name} Word
                    </label>
                    <input
                      type="text"
                      value={editValues.word}
                      onChange={(e) => setEditValues({ ...editValues, word: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  {config.features.hasRomanization && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {currentLanguage === 'chinese' ? 'Pinyin' : 'Pronunciation'}
                      </label>
                      <input
                        type="text"
                        value={editValues.pronunciation}
                        onChange={(e) => setEditValues({ ...editValues, pronunciation: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      English Translation
                    </label>
                    <input
                      type="text"
                      value={editValues.translation}
                      onChange={(e) => setEditValues({ ...editValues, translation: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Difficulty (1-5)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={editValues.difficulty}
                      onChange={(e) => setEditValues({ ...editValues, difficulty: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={editValues.categoryId || ""}
                      onChange={(e) => setEditValues({ ...editValues, categoryId: e.target.value || undefined })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">No Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Skill-Specific Review Levels */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Review Levels (0-5)</h4>
                  
                  {/* Reading Level */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <label className="text-sm text-blue-800 dark:text-blue-300 font-medium">Reading Level</label>
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {[0, 1, 2, 3, 4, 5].map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setEditValues({...editValues, readingReviewLevel: level})}
                          className={`px-2 py-1 rounded-md text-sm transition-colors ${
                            editValues.readingReviewLevel === level 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Listening Level */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 className="w-4 h-4 text-green-600" />
                      <label className="text-sm text-green-800 dark:text-green-300 font-medium">Listening Level</label>
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {[0, 1, 2, 3, 4, 5].map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setEditValues({...editValues, listeningReviewLevel: level})}
                          className={`px-2 py-1 rounded-md text-sm transition-colors ${
                            editValues.listeningReviewLevel === level 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Speaking Level */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Mic className="w-4 h-4 text-purple-600" />
                      <label className="text-sm text-purple-800 dark:text-purple-300 font-medium">Speaking Level</label>
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {[0, 1, 2, 3, 4, 5].map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setEditValues({...editValues, speakingReviewLevel: level})}
                          className={`px-2 py-1 rounded-md text-sm transition-colors ${
                            editValues.speakingReviewLevel === level 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(card)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    {config.ui.buttons.save}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    {config.ui.buttons.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {card.word}
                      </h3>
                      {card.pronunciation && (
                        <span className="text-sm text-gray-600 dark:text-gray-400 italic">
                          {card.pronunciation}
                        </span>
                      )}
                      {card.categoryId && (() => {
                        const category = localStorage.getCategoryById(card.categoryId);
                        return category ? (
                          <span 
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full text-white"
                            style={{ backgroundColor: category.color + '90' }}
                          >
                            <span 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {card.translation}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(card)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                        confirmDelete === card.id
                          ? 'bg-red-600 text-white'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                      {confirmDelete === card.id ? 'Confirm' : 'Delete'}
                    </button>
                  </div>
                </div>

                {/* Skill Levels */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Reading</span>
                      </div>
                      <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        Level {card.readingReviewLevel}
                      </span>
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      Next: {card.readingNextReviewDate}
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">Listening</span>
                      </div>
                      <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                        Level {card.listeningReviewLevel}
                      </span>
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Next: {card.listeningNextReviewDate}
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Speaking</span>
                      </div>
                      <span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                        Level {card.speakingReviewLevel}
                      </span>
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">
                      Next: {card.speakingNextReviewDate}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2 items-center">
            {/* Previous button */}
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>

            {/* First page */}
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-3 py-2 rounded-md ${
                currentPage === 1
                  ? 'text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              style={{
                backgroundColor: currentPage === 1 ? config.theme.primary : undefined
              }}
            >
              1
            </button>

            {/* Show ellipsis if needed */}
            {currentPage > 3 && (
              <span className="px-2 text-gray-500">...</span>
            )}

            {/* Pages around current page */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                page !== 1 && 
                page !== totalPages && 
                Math.abs(page - currentPage) <= 1
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === page
                      ? 'text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: currentPage === page ? config.theme.primary : undefined
                  }}
                >
                  {page}
                </button>
              ))}

            {/* Show ellipsis if needed */}
            {currentPage < totalPages - 2 && (
              <span className="px-2 text-gray-500">...</span>
            )}

            {/* Last page */}
            {totalPages > 1 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`px-3 py-2 rounded-md ${
                  currentPage === totalPages
                    ? 'text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                style={{
                  backgroundColor: currentPage === totalPages ? config.theme.primary : undefined
                }}
              >
                {totalPages}
              </button>
            )}

            {/* Next button */}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {sortedCards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || selectedCategory !== undefined
              ? 'No flashcards match your filters.'
              : 'No flashcards yet.'}
          </p>
          <Link href="/">
            <button 
              className="px-6 py-3 rounded-md text-white font-medium"
              style={{ backgroundColor: config.theme.primary }}
            >
              {config.ui.navigation.create} Your First Flashcard
            </button>
          </Link>
        </div>
      )}

      {renderCategoryFilterModal()}
      
      {/* Category Management Modal */}
      {showCategoryManageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Manage Categories
            </h2>
            
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No categories yet. Create your first category to organize your flashcards.
                </p>
                <button
                  onClick={() => {
                    setShowCategoryManageModal(false);
                    handleAddCategory();
                  }}
                  className="px-4 py-2 text-white rounded-md hover:opacity-90"
                  style={{ backgroundColor: config.theme.primary }}
                >
                  Create Category
                </button>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-md">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-gray-900 dark:text-white font-medium">
                        {category.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({flashcards.filter(card => card.categoryId === category.id).length} cards)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowCategoryManageModal(false);
                          handleEditCategory(category);
                        }}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setConfirmDeleteCategory(category.id);
                          setShowCategoryManageModal(false);
                        }}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => {
                    setShowCategoryManageModal(false);
                    handleAddCategory();
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Category
                </button>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowCategoryManageModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Category Add/Edit Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter category name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <div 
                    className="px-3 py-2 rounded-md text-white text-sm"
                    style={{ backgroundColor: categoryForm.color }}
                  >
                    Preview
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={!categoryForm.name.trim()}
                className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: config.theme.primary }}
              >
                {editingCategory ? 'Update' : 'Add'} Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation */}
      {confirmDeleteCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Delete Category
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this category? This will remove the category from all flashcards but won&apos;t delete the flashcards themselves.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDeleteCategory(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCategory(confirmDeleteCategory)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}