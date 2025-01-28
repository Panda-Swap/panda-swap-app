//filament-calculator.ts

import type { GCodeFile } from '../../types/gcode';
import { getCurrentLanguage, useTranslations } from '../../i18n/utils';
import tinycolor from 'tinycolor2';

export interface FilamentUsageData {
  slotKey: string;
  color: string;
  weight: number;
  cost: number;
  filament_type: string;
  displayColor: string;
  textColor: string;
}

interface Settings {
  display: {
    emptyFilaments: boolean;
    showTotalCost: boolean;
    compactMode: boolean;
  };
}

export function calculateFilamentUsage(files: readonly GCodeFile[] = [], settings: Settings): FilamentUsageData[] {
  if (!files || files.length === 0) {
    return [];
  }

  const { t } = useTranslations(getCurrentLanguage());

  try {
    // Calculate totals per color across all files
    const totals = files.reduce((acc, file) => {
      if (!file?.metadata?.colors) return acc;

      file.metadata.colors.forEach(({ color, weight, cost = 0, filament_type = 'Unknown' }, index) => {
        const slotKey = t('printSummary.filament.slot', { number: index + 1 });
        if (!acc[slotKey]) {
          acc[slotKey] = { 
            color: color || '#FFFFFF', 
            weight: 0, 
            cost: 0, 
            filament_type 
          };
        }
        acc[slotKey].weight += (weight || 0) * (file.quantity || 1);
        acc[slotKey].cost += (cost || 0) * (file.quantity || 1);
      });
      return acc;
    }, {} as Record<string, { color: string; weight: number; cost: number; filament_type: string; }>);

    // Convert to array and process colors
    let usageData = Object.entries(totals).map(([slotKey, data]) => {
      const tc = tinycolor(data.color);
      return {
        slotKey,
        color: data.color,
        weight: data.weight,
        cost: data.cost,
        filament_type: data.filament_type,
        displayColor: tc.toString('hex8'),
        textColor: tc.isLight() ? '#000000' : '#FFFFFF'
      };
    });

    // Filter out empty slots if emptyFilaments is false
    if (!settings?.display?.emptyFilaments) {
      usageData = usageData.filter(data => data.weight > 0);
    }

    return usageData;
  } catch (error) {
    console.error('Error calculating filament usage:', error);
    return [];
  }
}

export function calculateTotalCost(usageData: FilamentUsageData[]): number {
  if (!usageData || !Array.isArray(usageData)) return 0;
  return usageData.reduce((sum, { cost }) => sum + (cost || 0), 0);
}

export function formatFilamentWeight(weight: number): string {
  return (weight || 0).toFixed(2);
}

export function formatFilamentCost(cost: number): string {
  return (cost || 0).toFixed(2);
}

export function generateFilamentDisplayHTML(
  usageData: FilamentUsageData[], 
  settings: Settings,
  lang: string
): string {
  const { t } = useTranslations(lang);

  if (!usageData || !Array.isArray(usageData) || usageData.length === 0) {
    return `
      <div class="text-center p-4 text-gray-500 dark:text-gray-400">
        ${t('printSummary.filament.noFilament')}
      </div>
    `;
  }
  
  if (!settings.display.compactMode) {
    // Detailed grid view with cards
    return `
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        ${usageData.map(({ slotKey, displayColor, textColor, filament_type, weight, cost }) => `
          <div 
            class="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 rounded-lg p-2 flex items-center gap-2"
            title="${filament_type}"
          >
            <div
              class="relative w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-medium flex-shrink-0 group"
              style="background-color: ${displayColor}"
            >
              <span style="color: ${textColor}">${slotKey.replace(/[^0-9]/g, '')}</span>
              <div class="absolute left-1/2 -translate-x-1/2 -bottom-8 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                ${displayColor}
              </div>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                ${t('printSummary.filament.weight', { amount: formatFilamentWeight(weight) })}
              </div>
              ${settings.display.showTotalCost ? `
                <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  ${t('printSummary.filament.cost', { amount: formatFilamentCost(cost) })}
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Compact view stays the same but with translations
  return `
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
      ${usageData.map(({ slotKey, displayColor, textColor, filament_type, weight, cost }) => `
        <div 
          class="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 rounded-lg p-2 flex items-center gap-2"
          title="${filament_type}"
        >
          <div
            class="relative w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-medium flex-shrink-0 group"
            style="background-color: ${displayColor}"
          >
            <span style="color: ${textColor}">${slotKey.replace(/[^0-9]/g, '')}</span>
            <div class="absolute left-1/2 -translate-x-1/2 -bottom-8 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
              ${displayColor}
            </div>
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
              ${t('printSummary.filament.weight', { amount: formatFilamentWeight(weight) })}
            </div>
            ${settings.display.showTotalCost ? `
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                ${t('printSummary.filament.cost', { amount: formatFilamentCost(cost) })}
              </div>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}