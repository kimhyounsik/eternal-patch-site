export interface PatchChange {
  id: number;
  category: string;
  type?: "buff" | "nerf" | "adjust"; // ✅ 각 변경사항의 버프/너프
  original: string;
  translated: string;
}

export interface Patch {
  version: string;
  date: string;
  type: "buff" | "nerf" | "adjust"; // ✅ 캐릭터 전체 패치 결과
  changes: PatchChange[];
}