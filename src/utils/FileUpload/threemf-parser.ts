// src/utils/FileUpload/threemf-parser.ts
import JSZip from 'jszip';
// import type { FileMetadata } from '../../types/gcode';
import { FileProcessingError } from './errors';
import { validateGCodeFile } from './file-handlers';

export async function extract3MFFile(file: File): Promise<string> {
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      // Look for GCode file in the 3MF archive
      const gcodeFile = Object.values(contents.files).find(file => 
        file.name.toLowerCase().endsWith('.gcode')
      );
  
      if (!gcodeFile) {
        throw new FileProcessingError('No GCode file found in 3MF archive', file.name);
      }
  
      const content = await gcodeFile.async('string');
      if (!validateGCodeFile(content)) {
        throw new FileProcessingError('Invalid GCode file format in 3MF archive', file.name);
      }
  
      return content;
    } catch (error) {
      if (error instanceof FileProcessingError) {
        throw error;
      }
      throw new FileProcessingError(
        `Failed to extract 3MF file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        file.name
      );
    }
  }