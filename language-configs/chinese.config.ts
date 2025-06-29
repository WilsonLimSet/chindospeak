import { BaseLanguageConfig, BaseLanguageService } from './base.config';
import { VoiceConfig, TranslationServiceConfig, PronunciationServiceConfig } from '@/shared/types';

export const chineseConfig: BaseLanguageConfig = {
  code: 'zh-CN',
  name: 'Chinese',
  nativeName: '中文',
  rtl: false,
  
  voiceOptions: [
    {
      name: 'Google 普通话（中国大陆）',
      lang: 'zh-CN',
      priority: 10,
      gender: 'female',
      region: 'China'
    },
    {
      name: 'Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)',
      lang: 'zh-CN',
      priority: 9,
      gender: 'female',
      region: 'China'
    },
    {
      name: 'Microsoft Yunxi Online (Natural) - Chinese (Mainland)',
      lang: 'zh-CN',
      priority: 8,
      gender: 'male',
      region: 'China'
    },
    {
      name: 'Ting-Ting',
      lang: 'zh-CN',
      priority: 7,
      gender: 'female',
      region: 'China'
    }
  ] as VoiceConfig[],

  translationService: {
    type: 'baidu',
    apiUrl: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
    requiresAuth: true,
    mockFallback: true
  } as TranslationServiceConfig,

  pronunciationService: {
    type: 'pinyin',
    library: 'chinese-to-pinyin',
    apiEndpoint: '/api/pinyin'
  } as PronunciationServiceConfig,

  ui: {
    appName: 'ChindoSpeak',
    navigation: {
      listen: '听',
      speak: '说',
      review: '复习',
      create: '创建',
      manage: '管理'
    },
    buttons: {
      play: '播放',
      stop: '停止',
      correct: '正确',
      incorrect: '错误',
      next: '下一个',
      previous: '上一个',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑'
    },
    messages: {
      loading: '加载中...',
      error: '发生错误',
      success: '成功',
      noFlashcards: '没有词卡',
      installPrompt: '安装应用以获得最佳体验'
    }
  },

  theme: {
    primary: '#ef4444', // cs-red
    secondary: '#ffa500', // cs-salmon  
    accent: '#ff6b6b',
    background: '#ffffff',
    text: '#000000'
  },

  features: {
    hasRomanization: true,
    hasToneMarkers: true,
    hasGender: false,
    writingDirection: 'ltr',
    complexScript: true
  }
};

export class ChineseLanguageService extends BaseLanguageService {
  async translateText(text: string, type: string = 'translation'): Promise<any> {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, type, language: 'chinese' })
    });
    return response.json();
  }

  async getRomanization(text: string): Promise<string> {
    const response = await fetch('/api/pinyin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await response.json();
    return data.pinyin;
  }

  validateInput(text: string): boolean {
    // Check if text contains Chinese characters
    const chineseRegex = /[\u4e00-\u9fff]/;
    return chineseRegex.test(text);
  }

  async getExampleSentence(word: string): Promise<string> {
    const response = await this.translateText(word, 'example');
    return response.trans_result?.[0]?.dst || `这是一个包含"${word}"的例句。`;
  }
}