import type { TranslationKeys } from '../config';

const translations: TranslationKeys = {
  app: {
    title: "Panda Swap",
    description: "Queue you print files for Panda Swap",
    welcome: "Welcome to Panda Swap",
  },
  common: {
    toggleTheme: 'Toggle theme',
    settings: 'Settings',
    language: 'Language'
  },
  error: {
    invalidFile: "Invalid File",
    uploadFailed: "Upload Failed",
  },
  settings: {
    preview: {
      title: 'File Preview',
      renderTubes: 'Render Tubes',
      buildArea: 'Build Volume',
      showPreview: 'Preview',
    },
    gcode: {
      title: 'GCODE Settings',
      buildPlateSwap: 'Build Plate Swap GCODE'
    },
    display: {
      title: 'Print Summary',
      emptyFilaments: 'Unused Filament',
      showTotalCost: 'Total Cost',
      showPrinterInfo: 'Printer Info',
      compactMode: 'Compact Mode',
    }
  },
  fileUpload: {
    title: 'Upload GCODE Files',
    dragDrop: 'Drag and drop your GCODE files here',
    or: 'or',
    browse: 'Browse files',
    fileListLabel: 'File List',
    inputLabel: 'File Input',
    noFileSelected: 'No file selected',
  },
  printSummary: {
    exportName: "Custom Export Name",
    exportNamePlaceholder: "Enter a name for the export",
    exportNameTips: "This will be the name of the exported file. Leave blank to use the default name.",
    thumbnail: "Thumbnail",
    thumbnailTips: "Image will be resized to 512x512 and 128x128 for thumbnails",
    thumbnailError: "Error processing image. Please ensure it's a valid image file.",
    compileGcode: "Download gcode",
    compile3mf: "Download 3mf",
    totalPrintTime: "Total print time: {time}",
    totalCost: "Total cost: {cost}",
    printer: {
      settings: "Printer Settings",
      model: "Printer Model",
      buildVolume: "Build Volume",
      width: "Width",
      depth: "Depth",
      height: "Height",
    },
    filament: {
      slot: "Filament {number}",
      weight: "{amount}g",
      cost: "${amount}",
      noFilament: "No files uploaded yet",
      noFilamentTip: "Upload some G-code files to see filament usage",
    }
  },
  fileList: {
    quantity: {
      label: "Print Quantity"
    },
    dragHandle: "Drag to reorder",
    fileInfo: {
      file: "File: {name}",
      filamentUsage: "Filament Usage:",
      printTime: "Print Time:",
      totalTime: "Total Time:"
    },
    deleteFile: "Delete File"
  }
};

export default translations;