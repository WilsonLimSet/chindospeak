"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { UnifiedLocalStorage } from "@/shared/utils/localStorage";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import { usePwa } from "@/shared/contexts/PwaContext";
import { ConversationSession, ConversationMessage, ConversationScenario, Flashcard } from "@/shared/types";
import Link from "next/link";
import { MessageCircle, Mic, MicOff, Volume2, Play, Pause, Square, Waves, Settings } from "lucide-react";

export default function ConversePage() {
  const { config, currentLanguage } = useLanguage();
  const { isPwa } = usePwa();
  const [localStorage] = useState(() => new UnifiedLocalStorage(`${config.code}-flashcards`));
  
  const [currentSession, setCurrentSession] = useState<ConversationSession | null>(null);
  const [conversationState, setConversationState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [showScenarios, setShowScenarios] = useState(true);
  const [userVocab, setUserVocab] = useState<Flashcard[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recognition, setRecognition] = useState<any | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conversationCount, setConversationCount] = useState(0);
  
  const animationRef = useRef<number | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    // Load user's vocabulary for context
    const flashcards = localStorage.getFlashcards();
    setUserVocab(flashcards);
    
    // Initialize speech APIs
    initializeSpeechAPIs();
  }, [localStorage]);

  const initializeSpeechAPIs = useCallback(() => {
    try {
      // Initialize Speech Recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = currentLanguage === 'chinese' ? 'zh-CN' : 'id-ID';
        
        recognitionInstance.onstart = () => {
          setConversationState('listening');
          startAudioVisualization();
        };
        
        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          handleUserSpeech(transcript);
        };
        
        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setErrorMessage('Speech recognition failed. Please try again.');
          setConversationState('idle');
          stopAudioVisualization();
        };
        
        recognitionInstance.onend = () => {
          stopAudioVisualization();
        };
        
        setRecognition(recognitionInstance);
      } else {
        setErrorMessage('Speech recognition not supported in this browser.');
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        setSynthesis(window.speechSynthesis);
      } else {
        setErrorMessage('Speech synthesis not supported in this browser.');
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing speech APIs:', error);
      setErrorMessage('Failed to initialize voice features.');
    }
  }, [currentLanguage]);

  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;
      
      const updateAudioLevel = () => {
        if (analyserRef.current && conversationState === 'listening') {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setErrorMessage('Microphone access denied. Please allow microphone access to use voice features.');
    }
  };

  const stopAudioVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  };

  // Predefined conversation scenarios
  const scenarios: ConversationScenario[] = [
    {
      id: "restaurant",
      name: currentLanguage === 'chinese' ? "餐厅点餐" : "Pesan Makanan",
      description: currentLanguage === 'chinese' ? "Practice ordering food at a restaurant" : "Practice ordering food at a restaurant",
      difficulty: "beginner",
      systemPrompt: `You are a helpful ${currentLanguage === 'chinese' ? 'Chinese' : 'Indonesian'} conversation partner helping someone practice restaurant conversations. Keep responses natural and encouraging. Focus on common restaurant vocabulary.`,
      icon: "🍽️"
    },
    {
      id: "directions",
      name: currentLanguage === 'chinese' ? "问路指路" : "Bertanya Arah",
      description: currentLanguage === 'chinese' ? "Ask for and give directions" : "Ask for and give directions",
      difficulty: "intermediate",
      systemPrompt: `You are a helpful ${currentLanguage === 'chinese' ? 'Chinese' : 'Indonesian'} conversation partner helping someone practice asking for and giving directions.`,
      icon: "🗺️"
    },
    {
      id: "shopping",
      name: currentLanguage === 'chinese' ? "购物砍价" : "Berbelanja",
      description: currentLanguage === 'chinese' ? "Practice shopping and bargaining" : "Practice shopping conversations",
      difficulty: "intermediate",
      systemPrompt: `You are a helpful ${currentLanguage === 'chinese' ? 'Chinese' : 'Indonesian'} conversation partner helping someone practice shopping conversations.`,
      icon: "🛍️"
    },
    {
      id: "general",
      name: currentLanguage === 'chinese' ? "日常对话" : "Percakapan Umum",
      description: currentLanguage === 'chinese' ? "General conversation practice" : "General conversation practice",
      difficulty: "advanced",
      systemPrompt: `You are a helpful ${currentLanguage === 'chinese' ? 'Chinese' : 'Indonesian'} conversation partner. Have natural conversations.`,
      icon: "💬"
    }
  ];

  const startConversation = (scenario: ConversationScenario) => {
    const session: ConversationSession = {
      id: uuidv4(),
      language: currentLanguage,
      scenario: scenario.id,
      difficulty: scenario.difficulty,
      userVocab: userVocab,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCurrentSession(session);
    setShowScenarios(false);
    setConversationCount(0);
    
    // Start with AI greeting
    const greeting = scenario.id === 'restaurant' 
      ? (currentLanguage === 'chinese' ? "你好！欢迎来到我们的餐厅。你想吃什么？" : "Selamat datang di restoran kami! Anda ingin memesan apa?")
      : (currentLanguage === 'chinese' ? "你好！我们开始练习对话吧。" : "Halo! Mari kita mulai berlatih percakapan.");
    
    speakText(greeting);
  };

  const startListening = () => {
    if (recognition && conversationState === 'idle') {
      setErrorMessage(null);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && conversationState === 'listening') {
      recognition.stop();
      setConversationState('idle');
      stopAudioVisualization();
    }
  };

  const handleUserSpeech = async (transcript: string) => {
    if (!currentSession) return;
    
    setConversationState('processing');
    
    const userMessage: ConversationMessage = {
      id: uuidv4(),
      role: 'user',
      content: transcript,
      timestamp: new Date()
    };
    
    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      updatedAt: new Date()
    };
    
    setCurrentSession(updatedSession);
    setConversationCount(prev => prev + 1);
    
    // TODO: Integrate with AI API for response
    // For now, simulate AI response
    setTimeout(() => {
      const responses = currentLanguage === 'chinese' ? [
        "很好！你说得对。",
        "我明白了。继续说吧。",
        "不错！让我们继续练习。",
        "你的发音很清楚。"
      ] : [
        "Bagus sekali! Anda benar.",
        "Saya mengerti. Silakan lanjutkan.",
        "Tidak buruk! Mari kita lanjutkan berlatih.",
        "Pelafalan Anda jelas."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage: ConversationMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date()
      };
      
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, aiMessage],
        updatedAt: new Date()
      } : null);
      
      speakText(randomResponse);
    }, 1000);
  };

  const speakText = (text: string) => {
    if (synthesis) {
      setConversationState('speaking');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage === 'chinese' ? 'zh-CN' : 'id-ID';
      utterance.rate = 0.9;
      
      utterance.onend = () => {
        setConversationState('idle');
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setConversationState('idle');
      };
      
      synthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthesis) {
      synthesis.cancel();
      setConversationState('idle');
    }
  };

  const endConversation = () => {
    stopSpeaking();
    stopListening();
    setCurrentSession(null);
    setShowScenarios(true);
    setConversationState('idle');
    setConversationCount(0);
  };

  const getStateIcon = () => {
    switch (conversationState) {
      case 'listening':
        return <Mic className="w-12 h-12" />;
      case 'processing':
        return <Waves className="w-12 h-12 animate-pulse" />;
      case 'speaking':
        return <Volume2 className="w-12 h-12 animate-pulse" />;
      default:
        return <MessageCircle className="w-12 h-12" />;
    }
  };

  const getStateText = () => {
    switch (conversationState) {
      case 'listening':
        return currentLanguage === 'chinese' ? "正在听..." : "Mendengarkan...";
      case 'processing':
        return currentLanguage === 'chinese' ? "正在思考..." : "Memproses...";
      case 'speaking':
        return currentLanguage === 'chinese' ? "正在说话..." : "Berbicara...";
      default:
        return currentLanguage === 'chinese' ? "点击开始对话" : "Tap to start conversation";
    }
  };

  if (!isPwa) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md bg-white dark:bg-gray-900 min-h-screen">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Voice Conversation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Install the app to use voice conversation features
          </p>
          <Link href="/">
            <button 
              className="px-6 py-3 rounded-md text-white font-medium"
              style={{ backgroundColor: config.theme.primary }}
            >
              Go to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: config.theme.primary }}></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing voice features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl min-h-screen">
      {showScenarios ? (
        <div>
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <MessageCircle className="w-8 h-8 mr-3" style={{ color: config.theme.primary }} />
            Voice Conversation
          </h1>
          
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}
          
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
              🎤 Ready for Voice Practice?
            </h2>
            <p className="text-blue-600 dark:text-blue-400 text-sm">
              I know your {userVocab.length} flashcard words and will adapt our conversation to your level.
              Choose a scenario for completely hands-free voice practice!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => startConversation(scenario)}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 text-left"
              >
                <div className="flex items-center mb-3">
                  <span className="text-3xl mr-3">{scenario.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {scenario.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      scenario.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      scenario.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {scenario.difficulty}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {scenario.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {scenarios.find(s => s.id === currentSession?.scenario)?.name || 'Voice Conversation'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {conversationCount} exchanges completed
            </p>
          </div>

          {/* Main Voice Interface */}
          <div className="relative mb-8">
            {/* Animated audio level visualization */}
            <div 
              className="absolute inset-0 rounded-full border-4 transition-all duration-200"
              style={{ 
                borderColor: config.theme.primary + '40',
                transform: `scale(${1 + audioLevel * 0.3})`,
                opacity: conversationState === 'listening' ? 0.6 : 0
              }}
            />
            
            {/* Main button */}
            <button
              onClick={() => {
                if (conversationState === 'idle') {
                  startListening();
                } else if (conversationState === 'listening') {
                  stopListening();
                } else if (conversationState === 'speaking') {
                  stopSpeaking();
                }
              }}
              disabled={conversationState === 'processing'}
              className={`w-32 h-32 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-105 ${
                conversationState === 'processing' ? 'cursor-not-allowed opacity-75' : 'hover:shadow-xl'
              }`}
              style={{ 
                backgroundColor: conversationState === 'listening' ? '#ef4444' : 
                                conversationState === 'speaking' ? '#10b981' : 
                                config.theme.primary 
              }}
            >
              {getStateIcon()}
            </button>
          </div>

          {/* State text */}
          <p className="text-xl font-medium text-gray-900 dark:text-white mb-8 text-center">
            {getStateText()}
          </p>

          {/* Controls */}
          <div className="flex space-x-4">
            <button
              onClick={endConversation}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              End Conversation
            </button>
          </div>

          {errorMessage && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 max-w-md">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">{errorMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}