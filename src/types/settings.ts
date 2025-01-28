export interface PreviewSettings {
  renderTubes: boolean;
  buildArea: boolean;
  showPreview: boolean;
}

export interface DisplaySettings {
  emptyFilaments: boolean;
  showTotalCost: boolean;
  showPrinterInfo: boolean;
  compactMode: boolean;
}

export interface GCodeSettings {
  buildPlateSwap: string;
}

export interface Settings {
  preview: PreviewSettings;
  display: DisplaySettings;
  gcode: GCodeSettings;
  custom: GCodeSettings;
}
