// constants/printer.ts
export type PresetSwapSystem = keyof typeof SWAP_SYSTEMS;
export const DEFAULT_SWAP_SYSTEM: PresetSwapSystem ='abpc';

export const SWAP_SYSTEMS = {
    none: {
      name: "No Swap System",
      gcode: ""
    },
    swapmod: {
      name: "SwapMod / Swap-Systems",
      gcode: `G0 X-10 F5000;  park extruder \n 
G0 Z175; move Z to the top \n 
G0 Y182 F10000; move plate to ejecting position \n

G0 Z180; prepare the lift\n  
G4 P1000; wait  \n 

G0 Z186 ; trigger lift \n 
G0 Y120 F500; lift the plate \n 
G0 Y-4 Z175 F5000; slide previous plate and hook new plate\n 
G0 Y145; pull and fix the new plate \n  
G0 Y115 F1000; jump over the hook \n 
G0 Y25 F500; slide down previous plate \n 
G0 Y85 F1000; gently push the old plate\n 
G0 Y180 F5000; pull the new plate \n 
G4 P500; wait  \n 
G0 Y186.5 F200;  fix the new plate and release previous plate \n 
G4 P500; wait  \n 
G0 Y3 F15000; prepare new plate to be snapped to the hetbed\n 
G0 Y-5 F200; snap the new plate on the front side \n
G4 P500; wait  \n 
G0 Y10 F1000; snap the new plate on the back side\n 
G0 Y20 F15000;  \n 
G0 Z150 ; \n
G4 P1000; wait  \n `
    },
    abpc: {
      name: "Auto Build Plate Changer",
      gcode: `; Auto Build Plate Changer sequence
G1 Z180 F3000
G1 Y186 F6000
G1 Z185 F3000
G1 Y-4  F6000
G1 Y186 F6000
G1 Y-4  F6000
G1 Y2.5 F6000
G1 Y-4  F6000`
    }
  } as const;
  
  export type SwapSystemType = keyof typeof SWAP_SYSTEMS | 'custom';

//   export type SwapSystem = typeof SWAP_SYSTEMS[SwapSystemType];