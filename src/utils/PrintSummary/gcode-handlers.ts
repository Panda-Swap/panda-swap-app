import type { GCodeFile } from '../../types/gcode';
import { getSettings } from '../../store/settings-store';
import JSZip from 'jszip';

// New interfaces for export options
export interface ExportOptions {
  customName?: string;
  thumbnailImage?: File;
}

export interface Thumbnail {
  data: Uint8Array;
  width: number;
  height: number;
}

const PRINTER_FINISH_SOUND_MARKER = '; FEATURE: Custom';

function generatePlaceholderPNG(width: number = 512, height: number = 512): Uint8Array {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#4f46e5');  // indigo-600
  gradient.addColorStop(1, '#7c3aed');  // violet-600
  
  // Fill background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add some pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  for (let i = 0; i < width; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  for (let i = 0; i < height; i += 20) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }

  // Add text
  const text = 'No Image';
  ctx.font = `${Math.floor(width/10)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add white shadow for better visibility
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText(text, width/2 + 2, height/2 + 2);
  
  // Add main text
  ctx.fillStyle = 'white';
  ctx.fillText(text, width/2, height/2);

  // Convert to PNG bytes
  const pngData = canvas.toDataURL('image/png');
  const binaryString = atob(pngData.split(',')[1]);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

async function getDefaultPlaceholder(): Promise<Uint8Array> {
  try {
    const response = await fetch('/images/placeholder-512.png');
    if (!response.ok) {
      throw new Error('Failed to load placeholder image');
    }
    const blob = await response.blob();
    const file = new File([blob], "placeholder.png", { type: "image/png" });
    return await convertImageToPNG(file);
  } catch (error) {
    console.error('Error loading placeholder image:', error);
    return generatePlaceholderPNG(512, 512);
  }
}

async function convertImageToPNG(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
          img.src = e.target?.result as string;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');
        
        // Draw white background first (for images with transparency)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Convert to PNG bytes
        const pngData = canvas.toDataURL('image/png');
        const binaryString = atob(pngData.split(',')[1]);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        resolve(bytes);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function processImageForThumbnails(file?: File): Promise<Thumbnail[]> {
  try {
    // Get source image - either from file or default placeholder
    const sourceImage = file ? 
      await convertImageToPNG(file) : 
      await getDefaultPlaceholder();

    // Create both sizes from the source image
    const sizes = [
      { width: 512, height: 512 },  // plate_1.png
      { width: 128, height: 128 }   // plate_1_small.png
    ];

    const thumbnails = await Promise.all(sizes.map(async size => {
      const canvas = document.createElement('canvas');
      canvas.width = size.width;
      canvas.height = size.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      
      // Create temporary image from source PNG
      const img = new Image();
      const loadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });
      
      // Convert Uint8Array to Base64 in chunks to avoid "too many arguments" error
      const chunks = [];
      const chunkSize = 0xffff;
      for (let i = 0; i < sourceImage.length; i += chunkSize) {
        chunks.push(String.fromCharCode.apply(null, sourceImage.slice(i, i + chunkSize)));
      }
      const b64 = btoa(chunks.join(''));
      img.src = `data:image/png;base64,${b64}`;
      await loadPromise;

      // Calculate scaling to maintain aspect ratio
      const scale = Math.min(size.width / img.width, size.height / img.height);
      const x = (size.width - img.width * scale) / 2;
      const y = (size.height - img.height * scale) / 2;
      
      // Draw white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size.width, size.height);
      
      // Draw resized image
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      // Convert to PNG bytes
      const pngData = canvas.toDataURL('image/png');
      const binaryString = atob(pngData.split(',')[1]);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      return {
        data: bytes,
        width: size.width,
        height: size.height
      };
    }));

    console.log('Successfully processed thumbnails');
    return thumbnails;
  } catch (error) {
    console.error('Error in processImageForThumbnails:', error);
    return [
      { data: generatePlaceholderPNG(512, 512), width: 512, height: 512 },
      { data: generatePlaceholderPNG(128, 128), width: 128, height: 128 }
    ];
  }
}

export function compileGCode(files: readonly GCodeFile[]): string {
  const settings = getSettings();
  let compiledGCode = '; Compiled GCode File\n';
  compiledGCode += `; Total Files: ${files.length}\n`;
  
  // Add printer model info
  const printerModels = Array.from(new Set(files.map(f => f.metadata.printerModel))).filter(Boolean);
  if (printerModels.length > 0) {
    compiledGCode += `; Printer Model(s): ${printerModels.join(', ')}\n`;
  }
  
  // Add timestamp
  compiledGCode += `; Generated: ${new Date().toISOString()}\n\n`;

  // Process each file
  files.forEach((file, fileIndex) => {
    for (let i = 0; i < file.quantity; i++) {
      // Add header comments
      compiledGCode += `\n; Start of ${file.metadata.plateName} (Copy ${i + 1}/${file.quantity})\n`;
      compiledGCode += `; Original File: ${file.metadata.plateName}\n`;
      compiledGCode += `; Printer Model: ${file.metadata.printerModel || 'Unknown'}\n`;
      compiledGCode += `; Estimated Time: ${Math.floor(file.metadata.estimatedTime / 60)}h ${Math.round(file.metadata.estimatedTime % 60)}m\n`;
      
      // Add the file content
      compiledGCode += file.content;
      
      // Add end marker
      compiledGCode += `\n; End of ${file.metadata.plateName}\n`;

      // Add build plate swap G-code if:
      // 1. It's not the last copy of the last file
      // 2. Build plate swap G-code is defined in settings
      const isLastCopy = i === file.quantity - 1;
      const isLastFile = fileIndex === files.length - 1;
      
      if (settings.gcode.buildPlateSwap && (!isLastCopy || !isLastFile)) {
        compiledGCode += '\n; Build Plate Swap\n';
        compiledGCode += settings.gcode.buildPlateSwap;
        compiledGCode += '\n';
      }
    }
  });

  return compiledGCode;
}

export async function compile3MF(gcode: string, options?: ExportOptions): Promise<Blob> {
  const zip = new JSZip();
  
  // Process thumbnail - now handles format conversion and default placeholder
  let thumbnails: Thumbnail[] = [];
  try {
    thumbnails = await processImageForThumbnails(options?.thumbnailImage);
  } catch (error) {
    console.error('Failed to process thumbnail image:', error);
    thumbnails = [
      { data: generatePlaceholderPNG(512, 512), width: 512, height: 512 },
      { data: generatePlaceholderPNG(128, 128), width: 128, height: 128 }
    ];
  }

  // Add the thumbnails
  zip.file("Metadata/plate_1.png", thumbnails[0].data);
  zip.file("Metadata/plate_1_small.png", thumbnails[1].data);
  
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
 <Relationship Target="/3D/3dmodel.model" Id="rel-1" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
 <Relationship Target="/Metadata/plate_1.png" Id="rel-2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/thumbnail"/>
 <Relationship Target="/Metadata/plate_1.png" Id="rel-4" Type="http://schemas.bambulab.com/package/2021/cover-thumbnail-middle"/>
 <Relationship Target="/Metadata/plate_1_small.png" Id="rel-5" Type="http://schemas.bambulab.com/package/2021/cover-thumbnail-small"/>
</Relationships>`);

  const currentDate = new Date().toISOString().slice(0, 10);
  zip.file("3D/3dmodel.model", `<?xml version="1.0" encoding="UTF-8"?>
  <model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:BambuStudio="http://schemas.bambulab.com/package/2021" xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06" requiredextensions="p">
  <metadata name="Application">BambuStudio-2.0.0</metadata>
  <metadata name="BambuStudio:3mfVersion">1</metadata>
  <metadata name="Copyright"></metadata>
  <metadata name="CreationDate">${currentDate}</metadata>
  <metadata name="Description"></metadata>
  <metadata name="Designer"></metadata>
  <metadata name="DesignerCover"></metadata>
  <metadata name="DesignerUserId">testing</metadata>
  <metadata name="License"></metadata>
  <metadata name="ModificationDate">${currentDate}</metadata>
  <metadata name="Origin"></metadata>
  <metadata name="Title"></metadata>
  <resources>
  </resources>
  <build/>
  </model>`);

  zip.file("Metadata/plate_1.gcode.md5", await generateMD5(gcode));

  zip.file("Metadata/_rels/model_settings.config.rels", `<?xml version="1.0" encoding="UTF-8"?>
  <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/Metadata/plate_1.gcode" Id="rel-1" Type="http://schemas.bambulab.com/package/2021/gcode"/>
  </Relationships>`);

  zip.file("Metadata/model_settings.config", `<?xml version="1.0" encoding="UTF-8"?>
  <config>
    <plate>
      <metadata key="plater_id" value="1"/>
      <metadata key="plater_name" value="${options?.customName || ''}"/>
      <metadata key="locked" value="false"/>
      <metadata key="gcode_file" value="Metadata/plate_1.gcode"/>
      <metadata key="thumbnail_file" value="Metadata/plate_1.png"/>
      <metadata key="top_file" value="Metadata/top_1.png"/>
      <metadata key="pick_file" value="Metadata/pick_1.png"/>
      <metadata key="pattern_bbox_file" value="Metadata/plate_1.json"/>
    </plate>
  </config>
  `);

  zip.file("Metadata/pick_1.png", thumbnails[0].data);
  zip.file("Metadata/plate_1.json", JSON.stringify({
    plate_index: 1,
    thumbnail: "plate_1.png",
    small_thumbnail: "plate_1_small.png",
    top_thumbnail: "top_1.png",
    pick_thumbnail: "pick_1.png"
  }));
  zip.file("Metadata/project_settings.config", JSON.stringify({
    version: "1.0.0",
    project: {
      name: options?.customName || "Compiled Print Job",
      created_at: new Date().toISOString()
    }
  }));
  
  zip.file("Metadata/slice_info.config", JSON.stringify({
    version: "1.0.0",
    plate_info: [{
      plate_index: 1,
      gcode_file: "plate_1.gcode"
    }]
  }));
  
  zip.file("Metadata/top_1.png", thumbnails[0].data);
  
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
 <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
 <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
 <Default Extension="png" ContentType="image/png"/>
 <Default Extension="gcode" ContentType="text/x.gcode"/>
</Types>`);

  // Add the gcode file
  zip.file("Metadata/plate_1.gcode", gcode);

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE"
  }).then(blob => {
    console.log('Zip generated successfully');
    return blob;
  }).catch(error => {
    console.error('Error generating zip:', error);
    throw error;
  });
}

function generateMD5(content: string): Promise<string> {
  // Simple hash function for demo purposes
  // In production, you might want to use a proper MD5 implementation
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Promise.resolve(hash.toString(16));
}

export function download3MF(blob: Blob, options?: ExportOptions): void {
  console.log('Starting download3MF');
  console.log('Blob size:', blob.size);
  const url = URL.createObjectURL(blob);
  console.log('Created URL:', url);
  const a = document.createElement('a');
  a.href = url;
  
  const timestamp = new Date().toISOString().slice(0,10);
  const filename = options?.customName 
    ? `${options.customName.replace(/[^a-zA-Z0-9-_]/g, '_')}.3mf`
    : `print_job_${timestamp}.3mf`;
    
  a.download = filename;
  console.log('Download filename:', a.download);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadGCode(content: string, options?: ExportOptions): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  const timestamp = new Date().toISOString().slice(0,10);
  const filename = options?.customName 
    ? `${options.customName.replace(/[^a-zA-Z0-9-_]/g, '_')}.gcode`
    : `compiled_print_job_${timestamp}.gcode`;
    
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function calculatePrinterModels(files: readonly GCodeFile[]): string[] {
  return Array.from(new Set(
    files.map(file => file.metadata.printerModel)
  )).filter(Boolean);
}

export function calculateTotalTime(files: readonly GCodeFile[]): number {
  return files.reduce((total, file) =>
    total + (file.metadata.estimatedTime * file.quantity), 0);
}
