import type { GCodeFile } from '../../types/gcode';
import { getSettings } from '../../store/settings-store';
import JSZip from 'jszip';
console.log('JSZip:', JSZip)

const PRINTER_FINISH_SOUND_MARKER = '; FEATURE: Custom';

export function compileGCode(files: readonly GCodeFile[]): string {
  const settings = getSettings();
  let compiledGCode = '; Compiled GCode File\n';
  compiledGCode += `; Total Files: ${files.length}\n`;
  
  const printerModels = Array.from(new Set(files.map(f => f.metadata.printerModel))).filter(Boolean);
  if (printerModels.length > 0) {
    compiledGCode += `; Printer Model(s): ${printerModels.join(', ')}\n`;
  }
  compiledGCode += `; Generated: ${new Date().toISOString()}\n\n`;

  files.forEach((file, fileIndex) => {
    for (let i = 0; i < file.quantity; i++) {
      compiledGCode += `\n; Start of ${file.metadata.plateName} (Copy ${i + 1}/${file.quantity})\n`;
      compiledGCode += `; Original File: ${file.metadata.plateName}\n`;
      compiledGCode += `; Printer Model: ${file.metadata.printerModel || 'Unknown'}\n`;
      compiledGCode += `; Estimated Time: ${Math.floor(file.metadata.estimatedTime / 60)}h ${Math.round(file.metadata.estimatedTime % 60)}m\n`;

      const needsBuildPlateSwap = settings.gcode?.buildPlateSwap;
      const parts = file.content.split(PRINTER_FINISH_SOUND_MARKER);
      
      if (parts.length >= 2) {
        compiledGCode += parts[0];
        compiledGCode += PRINTER_FINISH_SOUND_MARKER;
        compiledGCode += parts[1];
        compiledGCode += PRINTER_FINISH_SOUND_MARKER;
        
        if (needsBuildPlateSwap) {
          compiledGCode += '\n\n; Build Plate Swap\n';
          compiledGCode += settings.gcode.buildPlateSwap;
          compiledGCode += '\n';
        }
        
        if (parts[2]) {
          compiledGCode += parts[2];
        }
      } else {
        compiledGCode += file.content;
        if (needsBuildPlateSwap) {
          compiledGCode += '\n; Build Plate Swap\n';
          compiledGCode += settings.gcode.buildPlateSwap;
          compiledGCode += '\n';
        }
      }
      compiledGCode += `\n; End of ${file.metadata.plateName}\n`;
    }
  });
  return compiledGCode;
}

export async function compile3MF(gcode: string): Promise<Blob> {
  console.log('JSZip available:', typeof JSZip);
  const zip = new JSZip();
  
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
      <metadata key="plater_name" value=""/>
      <metadata key="locked" value="false"/>
      <metadata key="gcode_file" value="Metadata/plate_1.gcode"/>
      <metadata key="thumbnail_file" value="Metadata/plate_1.png"/>
      <metadata key="top_file" value="Metadata/top_1.png"/>
      <metadata key="pick_file" value="Metadata/pick_1.png"/>
      <metadata key="pattern_bbox_file" value="Metadata/plate_1.json"/>
    </plate>
  </config>
  `);

  zip.file("Metadata/pick_1.png", generatePlaceholderPNG());
  zip.file("Metadata/plate_1_small.png", generatePlaceholderPNG());
  zip.file("Metadata/plate_1.gcode", gcode);
  zip.file("Metadata/plate_1.json", JSON.stringify({
    plate_index: 1,
    thumbnail: "plate_1.png",
    small_thumbnail: "plate_1_small.png",
    top_thumbnail: "top_1.png",
    pick_thumbnail: "pick_1.png"
  }));
  zip.file("Metadata/plate_1.png", generatePlaceholderPNG());
  
  zip.file("Metadata/project_settings.config", JSON.stringify({
    version: "1.0.0",
    project: {
      name: "Compiled Print Job",
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
  
  zip.file("Metadata/top_1.png", generatePlaceholderPNG());
  
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
 <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
 <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
 <Default Extension="png" ContentType="image/png"/>
 <Default Extension="gcode" ContentType="text/x.gcode"/>
</Types>`);

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

function generateMD5(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function generatePlaceholderPNG(): Uint8Array {
  return new Uint8Array([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x00, 0x00, 0x02,
    0x00, 0x01, 0xE5, 0x27, 0xDE, 0xFC, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
    0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
}

export function download3MF(blob: Blob): void {
  console.log('Starting download3MF');
  console.log('Blob size:', blob.size);
  const url = URL.createObjectURL(blob);
  console.log('Created URL:', url);
  const a = document.createElement('a');
  a.href = url;
  a.download = `print_job_${new Date().toISOString().slice(0,10)}.3mf`;
  console.log('Download filename:', a.download);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadGCode(content: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `compiled_print_job_${new Date().toISOString().slice(0,10)}.gcode`;
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