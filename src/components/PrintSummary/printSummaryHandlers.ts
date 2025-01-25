// printSummaryHandlers.ts
import { filesStore } from '../../store/file-store';
import { settingsStore } from '../../store/settings-store';
import { getCurrentLanguage, useTranslations } from '../../i18n/utils';
import { compileGCode, downloadGCode, calculateTotalTime, compile3MF, download3MF } from '../../utils/PrintSummary/gcode-handlers';
import { updateFilamentDisplay } from './filamentDisplayHandlers';
import { formatTime } from '../../utils/format-handlers';

export function setupPrintSummaryHandlers(): void {
  function initializeListeners() {
    const compileButton = document.getElementById('compile-button');
    const compile3mfButton = document.getElementById('compile-3mf-button');

    if (compileButton) {
      compileButton.addEventListener('click', () => {
        const files = filesStore.get();
        if (files.length > 0) {
          const compiledGCode = compileGCode(files);
          downloadGCode(compiledGCode);
        }
      });
    }

    if (compile3mfButton) {
      compile3mfButton.addEventListener('click', async () => {
        const files = filesStore.get();
        if (files.length > 0) {
          const compiledGCode = compileGCode(files);
          const blob = await compile3MF(compiledGCode);
          download3MF(blob);
        }
      });
    }
  }
  function initializeTranslations() {
    const { t } = useTranslations(getCurrentLanguage());
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key) element.textContent = t(key);
    });
  }

  function updateSummary() {
    const files = filesStore.get();
    const settings = settingsStore.get();
    
    const compileButton = document.getElementById('compile-button') as HTMLButtonElement;
    const compile3mfButton = document.getElementById('compile-3mf-button') as HTMLButtonElement;
    
    if (compileButton) compileButton.disabled = files.length === 0;
    if (compile3mfButton) compile3mfButton.disabled = files.length === 0;

    const totalTime = calculateTotalTime(files);
    const totalTimeElement = document.querySelector('#total-time');
    if (totalTimeElement) {
      const { t } = useTranslations(getCurrentLanguage());
      totalTimeElement.textContent = t('printSummary.totalPrintTime', {
        time: formatTime(totalTime)
      });
    }
    
    updateFilamentDisplay(files, settings);
  }

  initializeTranslations();
  initializeListeners();

  window.addEventListener('language-change', () => {
    initializeTranslations();
    updateSummary();
  });

  filesStore.subscribe(updateSummary);
  settingsStore.subscribe(updateSummary);

  // Add console logs to track execution
document.getElementById('compile-button')?.addEventListener('click', () => {
  console.log('GCode button clicked');
  const files = filesStore.get();
  console.log('Files:', files);
  if (files.length > 0) {
    const compiledGCode = compileGCode(files);
    console.log('Compiled GCode:', compiledGCode.slice(0, 100));
    downloadGCode(compiledGCode);
  }
});

document.getElementById('compile-3mf-button')?.addEventListener('click', async (e) => {
  try {
    e.preventDefault();
    const files = filesStore.get();
    if (files.length > 0) {
      const compiledGCode = compileGCode(files);
      const blob = await compile3MF(compiledGCode).catch(error => {
        console.error('Error in compile3MF:', error);
        throw error;
      });
      if (blob) {
        download3MF(blob);
      }
    }
  } catch (error) {
    console.error('Error in click handler:', error);
  }
});

  // document.getElementById('compile-button')?.addEventListener('click', () => {
  //   const files = filesStore.get();
  //   if (files.length > 0) {
  //     const compiledGCode = compileGCode(files);
  //     downloadGCode(compiledGCode);
  //   }
  // });

  // document.getElementById('compile-3mf-button')?.addEventListener('click', async () => {
  //   const files = filesStore.get();
  //   if (files.length > 0) {
  //     const compiledGCode = compileGCode(files);
  //     const blob = await compile3MF(compiledGCode);
  //     download3MF(blob);
  //   }
  // });
}