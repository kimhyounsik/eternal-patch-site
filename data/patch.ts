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

function normalizeSpaces(text: string) {
  return String(text).replace(/\s+/g, " ").trim();
}

function getVersion(title: string) {
  const koreanMatch = title.match(/-\s*([\d.]+)\s*패치노트/);

  if (koreanMatch) return koreanMatch[1];

  const englishMatch = title.match(/PATCH NOTES\s+([\d.]+)/i);

  if (englishMatch) return englishMatch[1];

  return "unknown";
}

function hasArrow(text: string) {
  return text.includes("→");
}

function isDescriptionLine(line: string) {
  return (
    line.includes("조정합니다") ||
    line.includes("상향합니다") ||
    line.includes("하향합니다") ||
    line.includes("보완합니다") ||
    line.includes("개선합니다") ||
    line.length > 100
  );
}

function getCategoryFromChange(line: string, currentCategory: string) {
  if (
    line.includes("공격력") ||
    line.includes("방어력") ||
    line.includes("체력") ||
    line.includes("스태미나") ||
    line.includes("이동 속도")
  ) {
    return "기본 능력치";
  }

  return currentCategory;
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

function isLowerBetter(text: string) {
  return (
    text.includes("쿨다운") ||
    text.includes("재사용") ||
    text.includes("소모") ||
    text.includes("딜레이") ||
    text.includes("충전 시간") ||
    text.includes("시전 시간")
  );
}

function isHigherBetter(text: string) {
  return (
    text.includes("피해") ||
    text.includes("공격력") ||
    text.includes("방어력") ||
    text.includes("체력") ||
    text.includes("회복") ||
    text.includes("보호막") ||
    text.includes("사거리") ||
    text.includes("공격 속도") ||
    text.includes("이동 속도") ||
    text.includes("지속 시간")
  );
}

function isReverseMeaning(text: string) {
  return (
    text.includes("받는 피해") ||
    text.includes("피해량 감소") ||
    text.includes("이동 속도 감소") ||
    text.includes("공격 속도 감소") ||
    text.includes("방어력 감소") ||
    text.includes("둔화") ||
    text.includes("기절") ||
    text.includes("속박")
  );
}

function guessPatchType(changes: string[]): PatchType {
  let buffCount = 0;
  let nerfCount = 0;

  for (const change of changes) {
    const text = normalizeSpaces(change).toLowerCase();
    const numberChange = extractNumberChange(text);

    if (!numberChange) continue;

    const { before, after } = numberChange;

    if (before === after) continue;

    let isBuff = false;

    if (isLowerBetter(text)) {
      isBuff = after < before;
    } else if (isHigherBetter(text)) {
      isBuff = after > before;
    } else {
      continue;
    }

    if (isReverseMeaning(text)) {
      isBuff = !isBuff;
    }

    if (isBuff) {
      buffCount++;
    } else {
      nerfCount++;
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

            currentCategory = line;
            return [];
          }

          const category = getCategoryFromChange(line, currentCategory);

          return [
            {
              id: id++,
              category,
              original: line,
              translated: line,
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