"use client";

import { useLanguage } from "@/shared/contexts/LanguageContext";

interface CategoryFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  selectedCategory: string | null | undefined;
  onSelectCategory: (category: string | null | undefined) => void;
}

export default function CategoryFilterModal({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterModalProps) {
  const { config, currentLanguage } = useLanguage();

  if (!isOpen) return null;

  const handleSelect = (category: string | null | undefined) => {
    onSelectCategory(category);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
          {currentLanguage === 'chinese' ? '按类别筛选' : 'Filter by Category'}
        </h2>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleSelect(undefined)}
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
              onClick={() => handleSelect(null)}
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
              <button
                key={category}
                onClick={() => handleSelect(category)}
                className={`px-3 py-2 rounded-md text-sm ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                style={{
                  backgroundColor: selectedCategory === category ? config.theme.primary : undefined
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {config.ui.buttons.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
