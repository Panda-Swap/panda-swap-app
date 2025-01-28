import type { GCodeFile, Color } from '../../types/gcode';
import { parseGCodeFile } from './gcode-parser';
import { filesStore } from '../../store/file-store';
import JSZip from 'jszip';

export interface FileHandlerCallbacks {
  onError: (message: string) => void;
  onProgress?: (message: string) => void;
}

interface GCodeEntry {
  name: string;
  content: string;
}

export function compareColors(colors1: Color[], colors2: Color[]): boolean {
  if (colors1.length !== colors2.length) {
    return false;
  }
  for (let i = 0; i < colors1.length; i++) {
    if (colors1[i].color !== colors2[i].color) {
      return false;
    }
  }
  return true;
}

export async function validateGCodeFile(content: string): Promise<boolean> {
  const requiredHeaders = [
    '; model printing time:',
    'filament_colour =',
    '; filament used [g] ='
  ];
  return requiredHeaders.every(header => content.includes(header));
}

async function extract3MFContent(file: File, callbacks: FileHandlerCallbacks): Promise<GCodeEntry[]> {
  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    
    // Find all .gcode files in the archive
    const gcodeFiles = Object.values(contents.files).filter(file => 
      file.name.toLowerCase().endsWith('.gcode')
    );

    if (gcodeFiles.length === 0) {
      throw new Error('No GCode files found in 3MF archive');
    }

    callbacks.onProgress?.(`Found ${gcodeFiles.length} plate(s) in ${file.name}`);

    // Extract all GCode files
    const gcodeEntries: GCodeEntry[] = await Promise.all(
      gcodeFiles.map(async (gcodeFile) => {
        const content = await gcodeFile.async('string');
        // Use the gcode filename without extension as the plate name
        const plateName = gcodeFile.name.replace(/\.gcode$/i, '');
        callbacks.onProgress?.(`Extracting plate: ${plateName}`);
        return {
          name: plateName,
          content
        };
      })
    );

    return gcodeEntries;
  } catch (error) {
    throw new Error(`Failed to extract 3MF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getFileContents(file: File, callbacks: FileHandlerCallbacks): Promise<GCodeEntry[]> {
  if (file.name.toLowerCase().endsWith('.3mf')) {
    return await extract3MFContent(file, callbacks);
  }
  // For regular .gcode files, return as single entry
  return [{
    name: file.name.replace(/\.gcode$/i, ''),
    content: await file.text()
  }];
}

export async function processFiles(fileList: FileList, callbacks: FileHandlerCallbacks): Promise<void> {
  const files = Array.from(fileList).filter(file => 
    file.name.toLowerCase().endsWith('.gcode') || 
    file.name.toLowerCase().endsWith('.3mf')
  );

  if (files.length === 0) {
    callbacks.onError('No valid GCode or 3MF files selected.');
    return;
  }

  const existingFiles = filesStore.get();
  const newFiles: GCodeFile[] = [];

  for (const file of files) {
    try {
      const gcodeEntries = await getFileContents(file, callbacks);

      for (const entry of gcodeEntries) {
        // Check if file is already uploaded
        if (existingFiles.some(f => f.name === entry.name)) {
          callbacks.onError(`Plate "${entry.name}" has already been uploaded.`);
          continue;
        }

        // Validate GCode content
        if (!await validateGCodeFile(entry.content)) {
          callbacks.onError(`Plate "${entry.name}" appears to be invalid or corrupted.`);
          continue;
        }

        const metadata = parseGCodeFile(entry.content, entry.name);

        // Check if colors match with existing files
        if (existingFiles.length > 0) {
          const matchingFile = existingFiles.find(f => 
            compareColors(f.metadata.colors, metadata.colors)
          );
          if (!matchingFile) {
            callbacks.onError(`Plate "${entry.name}" has different colors than the existing files.`);
            continue;
          }
        }

        newFiles.push({
          id: crypto.randomUUID(),
          name: entry.name,
          content: entry.content,
          quantity: 1,
          metadata
        });

        callbacks.onProgress?.(`Successfully processed plate: ${entry.name}`);
      }
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      callbacks.onError(
        `Error processing file "${file.name}". ${
          file.name.toLowerCase().endsWith('.3mf')
            ? 'Please make sure it contains valid GCode files.'
            : 'Please make sure it\'s a valid GCode file.'
        }`
      );
    }
  }

  if (newFiles.length > 0) {
    filesStore.set([...existingFiles, ...newFiles]);
  }
}
