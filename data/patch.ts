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
  const text = normalizeSpaces(line);

  return (
    text.includes("평균 이상의 지표") ||
    text.includes("위력을 견제") ||
    text.includes("조정합니다") ||
    text.includes("상향합니다") ||
    text.includes("하향합니다") ||
    text.includes("개선합니다") ||
    text.includes("보완합니다")
  );
}

function getCategoryFromChange(line: string, currentCategory: string) {
  const text = normalizeSpaces(line);

  if (
    text.includes("무기 숙련도") ||
    text.includes("숙련도 레벨") ||
    text.includes("기본 공격 증폭") ||
    text.includes("스킬 증폭")
  ) {
    return "무기 숙련도";
  }

  const baseStatKeywords = [
    "기본 공격력",
    "기본 방어력",
    "기본 체력",
    "레벨 당 공격력",
    "레벨 당 방어력",
    "레벨 당 체력",
    "레벨당 공격력",
    "레벨당 방어력",
    "레벨당 체력",
  ];

  if (baseStatKeywords.some((keyword) => text.includes(keyword))) {
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
    text.includes("시전 시간") ||
    text.includes("충전 시간") ||
    text.includes("캐스팅 시간")
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
    text.includes("범위") ||
    text.includes("공격 속도") ||
    text.includes("이동 속도") ||
    text.includes("지속 시간") ||
    text.includes("스킬 증폭") ||
    text.includes("기본 공격 증폭")
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

function guessChangeType(line: string): PatchType {
  const text = normalizeSpaces(line).toLowerCase();

  if (!hasArrow(text)) return "adjust";

  const numberChange = extractNumberChange(text);
  if (!numberChange) return "adjust";

  const { before, after } = numberChange;
  if (before === after) return "adjust";

  // 쿨다운 감소 수치: 높을수록 좋음
  if (text.includes("쿨다운 감소")) {
    return after > before ? "buff" : "nerf";
  }

  // 속박/기절/둔화 지속 시간: 기본적으로 길면 버프
  // 단, 알론소 E처럼 CC 시간이 줄어든 건 상대 입장 약화라 보통 너프
  if (
    text.includes("속박 지속 시간") ||
    text.includes("기절 지속 시간") ||
    text.includes("둔화 지속 시간")
  ) {
    return after > before ? "buff" : "nerf";
  }

  if (isLowerBetter(text)) {
    return after < before ? "buff" : "nerf";
  }

  if (isHigherBetter(text)) {
    return after > before ? "buff" : "nerf";
  }

  return "adjust";
}




function guessPatchType(changes: string[]): PatchType {
  let buffCount = 0;
  let nerfCount = 0;

  for (const change of changes) {
    const text = normalizeSpaces(change).toLowerCase();

    if (!hasArrow(text)) continue;

    const numberChange = extractNumberChange(text);
    if (!numberChange) continue;

    const { before, after } = numberChange;
    if (before === after) continue;

    let isBuff: boolean | null = null;

    if (isLowerBetter(text)) {
      isBuff = after < before;
    } else if (isHigherBetter(text)) {
      isBuff = after > before;
    }

    if (isBuff === null) continue;

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

function getCategoryFromTitle(line: string) {
  const text = normalizeSpaces(line);

  if (
    text.includes("무기 숙련도") ||
    text.includes("숙련도 레벨") ||
    text.includes("기본 공격 증폭") ||
    text.includes("스킬 증폭")
  ) {
    return "무기 숙련도";
  }

  if (
    text.includes("기본 공격력") ||
    text.includes("기본 방어력") ||
    text.includes("기본 체력") ||
    text.includes("레벨당") ||
    text.includes("레벨 당")
  ) {
    return "기본 능력치";
  }

  return text;
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

            currentCategory = getCategoryFromTitle(line);
            return [];
          }

          const category = getCategoryFromChange(line, currentCategory);

       return [
             {
                 id: id++,
                 category,
                type: guessChangeType(line),
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