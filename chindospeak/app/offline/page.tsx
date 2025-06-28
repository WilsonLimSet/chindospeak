"use client";

import { useLanguage } from "@/shared/contexts/LanguageContext";
import Link from "next/link";

export default function OfflinePage() {
  const { config, currentLanguage } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-6 max-w-md bg-white dark:bg-gray-900 min-h-screen">
      <div className="text-center py-12">
        <div className="mb-8">
          <svg 
            className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {currentLanguage === 'chinese' ? '离线模式' : 'Offline Mode'}
        </h1>
        
        <div className="mb-8 text-gray-600 dark:text-gray-400 space-y-4">
          <p>
            {currentLanguage === 'chinese' 
              ? '您当前处于离线状态。某些功能可能受限。'
              : 'You are currently offline. Some features may be limited.'
            }
          </p>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              {currentLanguage === 'chinese' ? '离线可用功能：' : 'Available Offline:'}
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• {currentLanguage === 'chinese' ? '查看已保存的词卡' : 'View saved flashcards'}</li>
              <li>• {currentLanguage === 'chinese' ? '练习听力（已下载的词卡）' : 'Practice listening (downloaded cards)'}</li>
              <li>• {currentLanguage === 'chinese' ? '练习口语（已下载的词卡）' : 'Practice speaking (downloaded cards)'}</li>
              <li>• {currentLanguage === 'chinese' ? '复习词卡' : 'Review flashcards'}</li>
              <li>• {currentLanguage === 'chinese' ? '管理词卡' : 'Manage flashcards'}</li>
            </ul>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
              {currentLanguage === 'chinese' ? '需要网络连接：' : 'Requires Internet:'}
            </h3>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              <li>• {currentLanguage === 'chinese' ? '翻译新词汇' : 'Translating new words'}</li>
              <li>• {currentLanguage === 'chinese' ? '创建新词卡' : 'Creating new flashcards'}</li>
              <li>• {currentLanguage === 'chinese' ? '同步数据' : 'Syncing data'}</li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-4">
          <Link href="/review">
            <button 
              className="w-full py-3 px-6 text-white rounded-lg font-medium shadow-md transition-all duration-300"
              style={{ backgroundColor: config.theme.primary }}
            >
              {currentLanguage === 'chinese' ? '开始复习' : 'Start Reviewing'}
            </button>
          </Link>
          
          <Link href="/manage">
            <button 
              className="w-full py-3 px-6 text-white rounded-lg font-medium shadow-md transition-all duration-300"
              style={{ backgroundColor: config.theme.secondary }}
            >
              {currentLanguage === 'chinese' ? '管理词卡' : 'Manage Flashcards'}
            </button>
          </Link>
          
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 px-6 bg-gray-500 text-white rounded-lg font-medium shadow-md hover:bg-gray-600 transition-all duration-300"
          >
            {currentLanguage === 'chinese' ? '检查连接' : 'Check Connection'}
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>
            {currentLanguage === 'chinese' 
              ? '连接恢复后，您可以继续使用所有功能。'
              : 'When your connection is restored, you can continue using all features.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}