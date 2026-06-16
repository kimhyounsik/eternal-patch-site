export interface PatchChange {
  id: number;
  category: string;
  original: string;
  translated: string;
}

export interface Patch {
  version: string;
  date: string;
  type: "buff" | "nerf" | "adjust";
  changes: PatchChange[];
}