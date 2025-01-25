export const LANG_STORAGE_KEY = 'lang-preference';

export type TranslationKeys = {
    app: {
      title: string;
      description:  string;
      welcome:  string;
    };
    common: {
      toggleTheme: string;
      settings: string;
      language: string;
    };
    settings: {
      preview: {
        title: string;
        renderTubes: string;
        buildArea: string;
        showPreview: string;
      };
      gcode: {
        title: string;
        buildPlateSwap: string;
      };
      display: {
        title: string;
        emptyFilaments: string;
        showTotalCost: string;
        showPrinterInfo: string;
        compactMode: string;
      };
    };
    error: {
      invalidFile: string;
      uploadFailed: string;
    }
    fileUpload: {
      title: string;
      dragDrop: string;
      or: string;
      browse: string;
      fileListLabel: string;
      inputLabel: string
    };
    printSummary: {
        title: string;
        compileGcode: string;
        compile3mf: string;
        totalPrintTime: string;
        totalCost: string;
        printer: {
          single: string;
          multiple: string;
        };
        filament: {
          slot: string;
          weight: string;
          cost: string;
        };
      };
      fileList: {
        quantity: {
          label: string;
        };
        dragHandle: string;
        fileInfo: {
          file: string;
          filamentUsage: string;
          printTime: string;
          totalTime: string;
        };
        deleteFile: string;
      };
  };

export const languageNames: Record<string, string> = {
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'zh': '中文',
  'ja': '日本語',
  'ko': '한국어',
  'uk': "Українська",
  'pt': 'Português',
  'it': 'Italiano'
};