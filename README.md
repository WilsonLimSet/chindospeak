# ChindoSpeak

ChindoSpeak is a Progressive Web App for learning Mandarin Chinese and Indonesian with flashcards, listening practice, speaking review, drive mode, and short-form video imports.

## Architecture Overview

This project implements a unified architecture that consolidates the Chinese and Indonesian language learning applications into a single, maintainable codebase.

### Directory Structure

```
chindospeak/
├── shared/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # Shared React contexts
│   ├── utils/              # Utility functions and services
│   ├── types/              # TypeScript type definitions
│   └── hooks/              # Custom React hooks
├── language-configs/
│   ├── base.config.ts      # Base language configuration interface
│   ├── chinese.config.ts   # Chinese language configuration
│   └── indonesian.config.ts # Indonesian language configuration
├── apps/
│   ├── chinese/            # Chinese learning app instance
│   └── indonesian/         # Indonesian learning app instance
└── package.json           # Root package configuration
```

## Key Features

- **Learn from Video**: paste a TikTok, Instagram Reel, or YouTube Short and generate a transcript, translation, phrase drill, speaking prompt, and review-ready flashcards.
- **Spaced Repetition Flashcards**: separate reading, listening, and speaking review levels.
- **Listening and Speaking Practice**: practice saved cards with audio and speech recognition.
- **Drive Mode**: hands-free review for cards that are due.
- **Offline PWA**: installable mobile experience with local-first card storage.

### Unified Components
- **PwaWrapper**: PWA installation handling
- **AudioButton**: Language-agnostic audio playback
- **PwaContext**: PWA state management
- **UnifiedAudioService**: Cross-language TTS service
- **UnifiedTranslationService**: Multi-provider translation service

### Language Configuration System
Each language is configured through a structured configuration file that defines:
- Voice options and priorities
- Translation service settings
- UI text and translations
- Theme colors
- Language-specific features (romanization, tone markers, etc.)

### Translation Services
Supports multiple translation providers:
- **Baidu Translate** (Chinese) - With API key authentication
- **MyMemory** (Indonesian) - Free, no authentication required
- **Google Translate** (Extensible)

### Audio Services
Unified text-to-speech system with:
- Language-specific voice prioritization
- Cross-browser compatibility
- Fallback voice selection
- Speech control (play, pause, stop)

## Benefits of Unified Architecture

1. **Code Reuse**: ~70% reduction in duplicate code
2. **Maintainability**: Single codebase for common functionality
3. **Consistency**: Uniform user experience across languages
4. **Extensibility**: Easy to add new languages
5. **Type Safety**: Shared TypeScript definitions
6. **Performance**: Shared dependencies and optimizations

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install local video tooling for the video import feature:
   ```bash
   brew install yt-dlp ffmpeg
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

   Add `OPENAI_API_KEY` to `.env.local` for video transcription, OCR, vocab extraction, and speaking prompts. Baidu and Google translation keys are optional.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Adding a New Language

1. Create a new language configuration in `language-configs/`
2. Implement the `BaseLanguageConfig` interface
3. Add translation service support if needed
4. Create an app instance in `apps/`
5. Configure voice options and UI text

## Migration from Original Apps

The original language-specific apps have been analyzed and their common components extracted into the shared directory. Language-specific functionality has been abstracted into configuration files, allowing for easy maintenance and extension.

## Technology Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **PWA** - Offline capability
- **Web Speech API** - Text-to-speech
- **OpenAI Whisper + GPT-4o-mini** - Video transcription, OCR reconciliation, lesson generation
- **yt-dlp + ffmpeg** - Local short-form video processing
- **Multiple Translation APIs** - Baidu, MyMemory, Google (extensible)

## License

Private project for language learning applications.
