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

export default function PatchList({ character, patches }: Props) {
  const latestPatchType = patches.length > 0 ? patches[0].type : null;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-md">
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
          const displayType = patch.type;

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
                    <div className="flex items-center gap-2 font-semibold text-blue-600">
                      <span>{change.category}</span>

                      {change.type && (
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-bold text-white ${getPatchTypeClass(
                            change.type
                          )}`}
                        >
                          {getPatchTypeLabel(change.type)}
                        </span>
                      )}
                    </div>

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