import { Patch } from "@/types/patch";
import patchesJson from "./patches.json";

type PatchType = "buff" | "nerf" | "adjust";

type CrawledPatch = {
  id: string;
  title: string;
  url: string;
  date: string | null;
  type: string;
  characters: Record<
    string,
    {
      name: string;
      aliases?: string[];
      changes: string[];
    }
  >;
  createdAt: string;
};

const SKILL_CATEGORY_MAP: Record<string, string> = {
  "Yearning E": "E 스킬 - Yearning(E)",
  "Dashing Gentleman E": "E 스킬 - Dashing Gentleman(E)",
};

const TRANSLATE_WORDS: Record<string, string> = {
  "Outer Area Damage": "외곽 지역 피해량",
  "Inner Area Damage": "내부 지역 피해량",
  "Attack Speed Reduction Duration": "공격 속도 감소 지속 시간",
  "Skill Amplification": "스킬 증폭",
  "Defense per level": "레벨당 방어력",
  "Attack Speed": "공격 속도",
  "Movement Speed": "이동 속도",
  "Cooldown": "쿨다운",
  "Base Defense": "기본 방어력",
  "Damage": "피해량",
  "Duration": "지속 시간",
  "Base Damage": "기본 피해량",
  "Skill Damage": "스킬 피해량",
  "Enhanced Basic Attack Damage": "강화 기본 공격 피해량",
  "Basic Attack Damage": "기본 공격 피해량",
  "Additional Damage": "추가 피해량",
  "Final Damage": "최종 피해량",
  "Damage Taken": "받는 피해량",
  "Damage Dealt": "주는 피해량",
  "Attack Power": "공격력",
  "Attack Power per level": "레벨당 공격력",
  "Defense per Level": "레벨당 방어력",
  "Max HP per level": "레벨당 최대 체력",
  "Movement Speed Increase": "이동 속도 증가",
  "Movement Speed Reduction": "이동 속도 감소",
  "Cooldown Reduction": "쿨다운 감소",
  "Stamina Cost": "스태미나 소모량",
  "SP Cost": "스태미나 소모량",
  "Range": "사거리",
  "Radius": "범위",
  "Width": "너비",
  "Slow Duration": "둔화 지속 시간",
  "Slow": "이동 속도 감소",
  "Stun Duration": "기절 지속 시간",
  "Root Duration": "속박 지속 시간",
  "Shield Amount": "보호막량",
  "Shield": "보호막",
  "Heal Amount": "회복량",
  "Healing": "회복",
  "Heal": "회복",
  "Recovery" :"회복량",
  "Charging Time": "충전 시간",
  "Charge Time": "충전 시간",
  "Cast Time": "시전 시간",
  "Delay": "딜레이",
  "Center Hit": "중앙 범위 적중 시",
  "Min": "최소",
  "Max": "최대",
  "Blue Viper Grounded": "푸른뱀 고정 피해량",
  "2 Hits": "2회 적중 시",
  "Basic Attack Amplification per Camera Mastery level": "카메라 무기 숙련도 레벨 당 기본 공격 증폭",
  "Skill Amp per Arcana Mastery Level": "아르카나 무기 숙련도 레벨 당 스킬 증폭",
  "Skill Amp per Throw Mastery Level": "투척 무기 숙련도 레벨 당 스킬 증폭",
  "Basic Attack Amplification per Rapier Mastery level":"레이피어 무기 숙련도 레벨 당 기본 공격 증폭",
  "Base HP": "기본 체력",
  "Extra": "추가",
  "HP": "체력",
  "Target's": "적",
  "Rooted": "속박",
  "Double Shot and Steady Shot": "2연발과 고정사격",
  "Alonso": "알론소",
  "Level": "레벨",
  "Ally": "아군",
  "Target’s Max HP": "대상 최대 체력의",
  "Target's Current Max HP": "대상 현재 체력의",
  "Target’s Current HP": "대상 현재 체력의",
  "Increase": "증가",
  "Enhanced Impulse Gauge": "리펄스 게이지",
  "Mirror Projectile": "거울 투사체 발사 ",
  "VF Absorption": "VF 흡수",
};

function normalizeSpaces(text: string) {
  return String(text).replace(/\s+/g, " ").trim();
}

function getVersion(title: string) {
  const match = title.match(/PATCH NOTES\s+([\d.]+)/i);
  return match ? match[1] : "unknown";
}

function hasArrow(text: string) {
  return text.includes("→");
}

function isDescriptionLine(line: string) {
  return (
    line.includes("We are") ||
    line.includes("continues to") ||
    line.includes("slightly") ||
    line.includes("Additionally") ||
    line.length > 80
  );
}

function getCategoryFromChange(line: string, currentCategory: string) {
  if (line.includes("Defense per level")) return "기본 능력치";
  if (line.includes("Attack Speed Reduction Duration")) return currentCategory;
  if (line.includes("Outer Area Damage")) return currentCategory;
  if (line.includes("Damage")) return currentCategory;
  return currentCategory;
}

function translateCategory(line: string) {
  const normalized = normalizeSpaces(line);
  return SKILL_CATEGORY_MAP[normalized] ?? normalized;
}

function translateLine(line: string) {
  let translated = normalizeSpaces(line);

  const entries = Object.entries(TRANSLATE_WORDS).sort(
    ([a], [b]) => b.length - a.length
  );

  for (const [english, korean] of entries) {
    translated = translated.replaceAll(english, korean);
  }

  return translated
    .replaceAll("+", " + ")
    .replace(/\s+/g, " ")
    .replace(/\s*→\s*/g, " → ")
    .trim();
}

function extractNumberChange(text: string) {
  const parts = text.split("→");
  if (parts.length !== 2) return null;

  const beforeNumbers = parts[0].match(/\d+(\.\d+)?/g);
  const afterNumbers = parts[1].match(/\d+(\.\d+)?/g);

  if (!beforeNumbers || !afterNumbers) return null;

  const beforeSum = beforeNumbers.reduce((sum, value) => sum + Number(value), 0);
  const afterSum = afterNumbers.reduce((sum, value) => sum + Number(value), 0);

  return { before: beforeSum, after: afterSum };
}

function guessPatchType(changes: string[]): PatchType {
  let buffCount = 0;
  let nerfCount = 0;

  for (const change of changes) {
    const text = change.toLowerCase();
    const numberChange = extractNumberChange(text);

    if (!numberChange) continue;

    const { before, after } = numberChange;

    if (
      text.includes("cooldown") ||
      text.includes("cost") ||
      text.includes("delay")
    ) {
      if (after < before) buffCount++;
      if (after > before) nerfCount++;
      continue;
    }

    if (
      text.includes("damage") ||
      text.includes("defense") ||
      text.includes("duration") ||
      text.includes("attack speed")
    ) {
      if (after > before) buffCount++;
      if (after < before) nerfCount++;
    }
  }

  if (buffCount > 0 && nerfCount === 0) return "buff";
  if (nerfCount > 0 && buffCount === 0) return "nerf";
  if (buffCount > 0 && nerfCount > 0) return "adjust";

  return "adjust";
}

function convertPatchData(crawledPatches: CrawledPatch[]) {
  const result: Record<string, Patch[]> = {};

  for (const patch of crawledPatches) {
    const version = getVersion(patch.title);
    const date = patch.date ?? "날짜 없음";

    for (const character of Object.values(patch.characters)) {
      if (!result[character.name]) {
        result[character.name] = [];
      }

      let currentCategory = "기타";
      let id = 1;

      const changes = character.changes
        .map((line) => normalizeSpaces(line))
        .filter(Boolean)
        .flatMap((line) => {
          if (!hasArrow(line)) {
            if (isDescriptionLine(line)) return [];

            currentCategory = translateCategory(line);
            return [];
          }

          const category = getCategoryFromChange(line, currentCategory);

          return [
            {
              id: id++,
              category,
              original: line,
              translated: translateLine(line),
            },
          ];
        });

      result[character.name].push({
        version,
        date,
        type: guessPatchType(character.changes),
        changes,
      });
    }
  }

  return result;
}

const crawledPatches = Array.isArray(patchesJson)
  ? patchesJson
  : [patchesJson];

export const patches: Record<string, Patch[]> = convertPatchData(
  crawledPatches as CrawledPatch[]
);