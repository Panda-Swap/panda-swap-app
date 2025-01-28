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
    exportName: "Benutzerdefinierter Exportname",
    exportNamePlaceholder: "Geben Sie einen Namen für den Export ein",
    exportNameTips: "Dies wird der Name der exportierten Datei sein. Lassen Sie ihn leer, um den Standardnamen zu verwenden.",
    thumbnail: "Vorschaubild",
    thumbnailTips: "Das Bild wird auf 512x512 und 128x128 für Miniaturansichten verkleinert.",
    thumbnailError: "Fehler bei der Verarbeitung eines Bildes. Bitte stellen Sie sicher, dass es sich um eine gültige Bilddatei handelt.",
    compileGcode: "Kompilieren",
    compile3mf: "3mf herunterladen",
    totalPrintTime: "Gesamtdruckzeit: {time}",
    totalCost: "Gesamtkosten: {cost}",
    printer: {
      settings: "Drucker-Einstellungen",
      model: "Drucker-Modell",
      buildVolume: "Volumen aufbauen",
      width: "Breite",
      depth: "Tiefe",
      height: "Höhe",
    },
    filament: {
      slot: "Filament {number}",
      weight: "{amount}g",
      cost: "${amount}",
      noFilament: "Noch keine Dateien hochgeladen",
      noFilamentTip: "Laden Sie einige G-Code-Dateien hoch, um die Filamentnutzung zu sehen",
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