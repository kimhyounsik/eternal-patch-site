const fs = require("fs");

const patchData = JSON.parse(
  fs.readFileSync("crawler/output.json", "utf-8")
);

const tsContent = `import { Patch } from "@/types/patch";

export const patches: Record<string, Patch[]> = {
  바냐: [],
  수아: [],

  유키: [
    {
      version: "${patchData.version}",
      date: "${patchData.date}",
      type: "${patchData.type}",
      changes: ${JSON.stringify(patchData.changes, null, 6)},
    },
  ],

  띠아: [],
};
`;

fs.writeFileSync("data/patch.ts", tsContent, "utf-8");

console.log("생성 완료: data/patch.ts");