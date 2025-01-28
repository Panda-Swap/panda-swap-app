import type { GCodeFile } from '../../types/gcode';
import { calculateFilamentUsage, calculateTotalCost, generateFilamentDisplayHTML } from '../../utils/FileUpload/filament-calculator';
import { getCurrentLanguage, useTranslations } from '../../i18n/utils';

export function updateFilamentDisplay(files: readonly GCodeFile[], settings: any): void {
  const totalUsageElement = document.getElementById('total-usage');
  const totalCostElement = document.getElementById('total-cost');
  
  if (!totalUsageElement || !totalCostElement) return;

  const usageData = calculateFilamentUsage(files, settings);
  const lang = getCurrentLanguage();
  
  // Update filament usage display
  totalUsageElement.innerHTML = generateFilamentDisplayHTML(usageData, settings, lang);
  
  // Update total cost if enabled
  if (settings.display.showTotalCost) {
    const { t } = useTranslations(getCurrentLanguage());
    const totalCost = calculateTotalCost(usageData);
    totalCostElement.textContent = t('printSummary.totalCost', { 
      cost: totalCost.toFixed(2) 
    });
  } else {
    totalCostElement.textContent = '';
  }
}