import type { TranslationKeys } from '../config';

const translations: TranslationKeys = {
  app: {
    title: "Panda Swap",
    description: "Stellen Sie Ihre Druckdateien in die Warteschlange für Panda Swap",
    welcome: "Willkommen bei Panda Swap",
  },
  common: {
    toggleTheme: 'Thema umschalten',
    settings: 'Einstellungen',
    language: 'Sprache'
  },
  error: {
    invalidFile: "Ungültige Datei",
    uploadFailed: "Hochladen fehlgeschlagen",
  },
  settings: {
    preview: {
      title: 'Einstellungen für die Dateivorschau',
      renderTubes: 'Verputzrohre',
      buildArea: 'Volumen aufbauen',
      showPreview: 'Vorschau',
    },
    gcode: {
      title: 'GCode-Einstellungen',
      buildPlateSwap: 'Bauplatte tauschen GCode'
    },
    display: {
      title: 'Zusammenfassung drucken',
      emptyFilaments: 'Unbenutztes Filament',
      showTotalCost: 'Gesamtkosten',
      showPrinterInfo: 'Drucker-Infos',
      compactMode: 'Kompakt-Modus',
    }
  },
  fileUpload: {
    title: 'GCODE-Dateien hochladen',
    dragDrop: 'Ziehen Sie Ihre GCODE-Dateien hierher und legen Sie sie ab',
    or: 'oder',
    browse: 'Dateien durchsuchen',
    fileListLabel: 'Datei-Liste',
    inputLabel: 'Datei-Eingabe',
  },
  printSummary: {
    title: "Zusammenfassung drucken",
    compileGcode: "Kompilieren",
    totalPrintTime: "Gesamtdruckzeit: {time}",
    totalCost: "Gesamtkosten: {cost}",
    printer: {
      single: "Drucker: {name}",
      multiple: "Drucker: {names}"
    },
    filament: {
      slot: "Filament {number}",
      weight: "{amount}g",
      cost: "${amount}"
    }
  },
  fileList: {
    quantity: {
      label: "Anzahl drucken"
    },
    dragHandle: "Ziehen zum Neuordnen",
    fileInfo: {
      file: "Datei: {name}",
      filamentUsage: "Verwendung von Filamenten:",
      printTime: "Druckzeit:",
      totalTime: "Zeit insgesamt:"
    },
    deleteFile: "Datei löschen"
  }
};

export default translations;