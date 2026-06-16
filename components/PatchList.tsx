import Image from "next/image";
import { Character } from "@/types/character";
import { Patch } from "@/types/patch";

type Props = {
  character: Character;
  patches: Patch[];
};

type PatchType = "buff" | "nerf" | "adjust";

function getPatchTypeLabel(type: PatchType) {
  if (type === "buff") return "버프";
  if (type === "nerf") return "너프";
  return "조정";
}

function getPatchTypeClass(type: PatchType) {
  if (type === "buff") return "bg-green-500";
  if (type === "nerf") return "bg-red-500";
  return "bg-gray-500";
}

/**
 * 숫자가 내려가면 버프인 항목들
 * 예: Cooldown 14s → 12s 는 쿨타임 감소라서 버프
 */
const BUFF_WHEN_LOWER_KEYWORDS = [
  "cooldown",
  "sp cost",
  "stamina cost",
  "cost",
  "delay",
  "cast time",
];

/**
 * 숫자가 올라가면 버프인 항목들
 * 예: Damage 90 → 100 은 피해량 증가라서 버프
 */
const BUFF_WHEN_HIGHER_KEYWORDS = [
  "damage",
  "defense",
  "attack speed",
  "movement speed",
  "range",
  "duration",
  "shield",
  "heal",
];

/**
 * 변경 문장에서 숫자 변화를 추출합니다.
 *
 * 예:
 * Damage 90/125/160/195/230 +Skill Amplification 80%
 * →
 * Damage 90/125/160/195/230 +Skill Amplification 90%
 *
 * 위처럼 숫자가 여러 개 있어도 전체 합으로 비교합니다.
 */
function extractNumberChange(text: string) {
  const parts = text.split("→");

  if (parts.length !== 2) {
    return null;
  }

  const beforeNumbers = parts[0].match(/\d+(\.\d+)?/g);
  const afterNumbers = parts[1].match(/\d+(\.\d+)?/g);

  if (!beforeNumbers || !afterNumbers) {
    return null;
  }

  if (beforeNumbers.length === 0 || afterNumbers.length === 0) {
    return null;
  }

  const beforeSum = beforeNumbers.reduce(
    (sum, value) => sum + Number(value),
    0
  );

  const afterSum = afterNumbers.reduce(
    (sum, value) => sum + Number(value),
    0
  );

  return {
    before: beforeSum,
    after: afterSum,
  };
}

/**
 * 패치 내용을 보고 화면에 표시할 타입을 다시 판단합니다.
 *
 * patch.type이 adjust로 들어와도,
 * 실제 변경사항이 전부 버프면 화면에서는 버프로 보여줍니다.
 */
function inferPatchType(patch: Patch): PatchType {
  let buffCount = 0;
  let nerfCount = 0;

  for (const change of patch.changes) {
    const text = `${change.category} ${change.original} ${change.translated}`.toLowerCase();
    const numberChange = extractNumberChange(text);

    if (!numberChange) {
      continue;
    }

    const { before, after } = numberChange;

    const isLowerBuff = BUFF_WHEN_LOWER_KEYWORDS.some((keyword) =>
      text.includes(keyword)
    );

    const isHigherBuff = BUFF_WHEN_HIGHER_KEYWORDS.some((keyword) =>
      text.includes(keyword)
    );

    if (isLowerBuff) {
      if (after < before) buffCount++;
      if (after > before) nerfCount++;
      continue;
    }

    if (isHigherBuff) {
      if (after > before) buffCount++;
      if (after < before) nerfCount++;
      continue;
    }
  }

  if (buffCount > 0 && nerfCount === 0) return "buff";
  if (nerfCount > 0 && buffCount === 0) return "nerf";
  if (buffCount > 0 && nerfCount > 0) return "adjust";

  return patch.type;
}

export default function PatchList({ character, patches }: Props) {
  const latestPatchType = patches.length > 0 ? inferPatchType(patches[0]) : null;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-md">
      {/* 실험체 정보 */}
      <div className="mb-6 flex items-center gap-5">
        <Image
          src={character.image}
          alt={character.name}
          width={80}
          height={80}
        />

        <div>
          <h2 className="text-3xl font-bold">{character.name}</h2>
        </div>
      </div>

      <hr className="mb-6" />

      {/* 최신 패치 */}
      {patches.length > 0 && latestPatchType && (
        <div className="mb-6 rounded-lg border bg-slate-50 p-4">
          <p className="text-sm text-gray-500">최신 패치</p>

          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">Version {patches[0].version}</p>

              <p className="text-gray-500">{patches[0].date}</p>
            </div>

            <span
              className={`rounded px-3 py-1 text-sm font-bold text-white ${getPatchTypeClass(
                latestPatchType
              )}`}
            >
              {getPatchTypeLabel(latestPatchType)}
            </span>
          </div>
        </div>
      )}

      <h3 className="mb-5 text-2xl font-bold">Patch History</h3>

      {patches.length === 0 ? (
        <p>패치 정보가 없습니다.</p>
      ) : (
        patches.map((patch) => {
          const displayType = inferPatchType(patch);

          return (
            <div
              key={`${patch.version}-${patch.date}`}
              className="mb-5 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold">Version {patch.version}</h4>

                <span
                  className={`rounded px-3 py-1 text-sm font-bold text-white ${getPatchTypeClass(
                    displayType
                  )}`}
                >
                  {getPatchTypeLabel(displayType)}
                </span>
              </div>

              <p className="mb-3 mt-2 text-gray-500">{patch.date}</p>

              <ul className="space-y-3">
                {patch.changes.map((change, index) => (
                  <li
                    key={`${change.category}-${index}`}
                    className="overflow-hidden rounded-md border-l-4 border-blue-500 bg-gray-50 p-3"
                  >
                    {/* 카테고리 */}
                    <div className="font-semibold text-blue-600">
                      {change.category}
                    </div>

                    {/* 현재는 잘리지 않는 original을 메인으로 표시 */}
                    <div className="mt-1 whitespace-pre-wrap break-words text-gray-900">
                      {change.translated}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
}