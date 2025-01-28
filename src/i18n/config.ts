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
        exportName: string;
        exportNamePlaceholder: string;
        exportNameTips: string;
        thumbnail: string;
        thumbnailTips: string;
        thumbnailError: string;
        compileGcode: string;
        totalPrintTime: string;
        totalCost: string;
        printer: {
          settings: string;
          model: string;
          buildVolume: string;
          width: string;
          depth: string;
          height: string;
        };
        filament: {
          slot: string;
          weight: string;
          cost: string;
          noFilament: string;
          noFilamentTip: string;
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