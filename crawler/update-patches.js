/**
 * crawler/update-patches.js
 *
 * 공식 이터널 리턴 패치노트에서 실험체별 변경사항을 추출하는 크롤러입니다.
 *
 * 기술 스택:
 * - Node.js
 * - axios
 * - cheerio
 *
 * 실행 예시:
 * npm run update-patches -- https://playeternalreturn.com/posts/news/3629
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

/**
 * 실험체 목록은 별도 파일에서 불러옵니다.
 *
 * 파일 위치:
 * crawler/characters.js
 *
 * characters.js 안에는 아래 형태의 배열이 있어야 합니다.
 *
 * const CHARACTERS = [
 *   { name: "바냐", slug: "vanya", aliases: ["바냐", "Vanya"] },
 *   { name: "유키", slug: "yuki", aliases: ["유키", "Yuki"] },
 * ];
 *
 * module.exports = { CHARACTERS };
 */
const { CHARACTERS } = require("./characters");

const ALL_CHARACTER_NAMES = CHARACTERS.flatMap((character) => character.aliases);

/**
 * patches.json 저장 위치입니다.
 */
const OUTPUT_PATH = path.join(__dirname, "../data/patches.json");

/**
 * 공식 패치노트 URL에서 글 번호를 추출합니다.
 *
 * 예:
 * https://playeternalreturn.com/posts/news/3629
 * -> 3629
 */
function getPatchIdFromUrl(url) {
  const match = url.match(/\/posts\/news\/(\d+)/);

  if (match) {
    return match[1];
  }

  /**
   * 혹시 URL에서 번호를 못 찾으면 임시 ID를 생성합니다.
   */
  return `patch-${Date.now()}`;
}

/**
 * 텍스트를 비교하기 쉽게 정리합니다.
 *
 * 패치노트에는 아래처럼 다양한 형태가 섞일 수 있습니다.
 * - "Vanya"
 * - " Vanya "
 * - "[Vanya]"
 * - "■ Vanya"
 *
 * 이런 차이를 줄이기 위해 특수문자와 공백을 정리합니다.
 */
function normalizeText(text) {
  return String(text)
    .replace(/[■◆▶▷●•·\[\](){}]/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 현재 줄이 우리가 찾는 실험체 이름인지 확인합니다.
 *
 * 예:
 * line = "Vanya"
 * character.aliases = ["바냐", "Vanya"]
 * -> true
 */
function findTargetCharacterByLine(line) {
  const normalized = normalizeText(line);

  return CHARACTERS.find((character) => {
    return character.aliases.some((alias) => {
      return normalized === normalizeText(alias);
    });
  });
}

/**
 * 현재 줄이 실험체 이름인지 확인합니다.
 *
 * 이 함수는 "현재 실험체 섹션을 끝낼지" 판단할 때 사용합니다.
 *
 * 예:
 * Yuki 변경사항을 읽고 있는데 다음 줄에 "István"이 나오면
 * "아, 이제 유키 섹션이 끝났구나"라고 판단합니다.
 */
function isAnyCharacterNameLine(line) {
  const normalized = normalizeText(line);

  return ALL_CHARACTER_NAMES.some((name) => {
    return normalized === normalizeText(name);
  });
}

/**
 * 패치노트 제목을 가져옵니다.
 */
function extractTitle($) {
  const h1 = $("h1").first().text().trim();

  if (h1) {
    return h1;
  }

  const title = $("title").text().trim();

  if (title) {
    return title;
  }

  return "제목 없음";
}

/**
 * 패치 날짜를 추출합니다.
 *
 * 영어 페이지:
 * PATCH NOTES 11.4 - JUNE 11TH, 2026
 *
 * 한국어 페이지:
 * 2026.06.11
 */
function extractDate(lines, title) {
  const text = [title, ...lines].join("\n");

  const englishDate = text.match(
    /(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+\d{1,2}(ST|ND|RD|TH)?,\s+20\d{2}/i
  );

  if (englishDate) {
    return englishDate[0];
  }

  const numericDate = text.match(/20\d{2}[.-]\d{1,2}[.-]\d{1,2}/);

  if (numericDate) {
    return numericDate[0].replaceAll(".", "-");
  }

  return null;
}

/**
 * 패치 타입을 추측합니다.
 */
function guessPatchType(lines, title) {
  const text = [title, ...lines].join("\n").toLowerCase();

  /**
   * 주의:
   * hotfix라는 단어가 본문 어딘가에 들어있을 수 있으므로
   * 제목 기준을 우선으로 판단합니다.
   */
  const titleText = String(title).toLowerCase();

  if (titleText.includes("hotfix") || titleText.includes("핫픽스")) {
    return "hotfix";
  }

  if (titleText.includes("patch notes") || titleText.includes("패치노트")) {
    return "patch";
  }

  if (titleText.includes("update") || titleText.includes("업데이트")) {
    return "update";
  }

  if (text.includes("patch notes") || text.includes("패치노트")) {
    return "patch";
  }

  if (text.includes("hotfix") || text.includes("핫픽스")) {
    return "hotfix";
  }

  return "unknown";
}

/**
 * 크롤링 결과에서 제외할 필요 없는 메뉴/푸터성 문구를 걸러냅니다.
 */
function shouldIgnoreLine(line) {
  const normalized = normalizeText(line);

  if (!normalized) {
    return true;
  }

  if (normalized.length <= 1) {
    return true;
  }

  const ignoredLines = [
    "Game",
    "News",
    "Event",
    "Community",
    "Social Media",
    "Probability",
    "Personal Store",
    "Random Vouchers",
    "Support",
    "Play now!",
    "Choose Your Platform",
    "Patch Notes",
    "PATCH NOTES",
    "Eternal Return",
  ];

  return ignoredLines.includes(normalized);
}

/**
 * HTML에서 줄 단위 텍스트를 추출합니다.
 *
 * 단순히 $("body").text()만 쓰면 <br>, <p>, <li> 같은 구분이 뭉개질 수 있습니다.
 * 그래서 닫는 태그를 줄바꿈으로 바꾼 뒤 텍스트를 추출합니다.
 */
function extractLinesFromHtml($) {
  $("script").remove();
  $("style").remove();
  $("noscript").remove();

  let html = $("body").html() || "";

  html = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/h1>/gi, "\n")
    .replace(/<\/h2>/gi, "\n")
    .replace(/<\/h3>/gi, "\n")
    .replace(/<\/h4>/gi, "\n")
    .replace(/<\/h5>/gi, "\n")
    .replace(/<\/div>/gi, "\n");

  const text = cheerio.load(html).text();

  return text
    .split("\n")
    .map((line) => normalizeText(line))
    .filter((line) => !shouldIgnoreLine(line));
}

/**
 * 실험체 변경사항이 끝나는 섹션인지 확인합니다.
 *
 * 예:
 * Yuki 변경사항 다음에 "Dual Swords"가 나오면
 * 그 아래는 유키 변경사항이 아니라 무기 변경사항입니다.
 */
function isStopSection(line) {
  const normalized = normalizeText(line);

  const stopSections = [
    /**
     * 큰 섹션
     */
    "Item Skill",
    "Weapon",
    "Weapons",
    "Armor",
    "Cobalt Protocol",
    "코발트 프로토콜",
    "Bug Fixes and Improvements",
    "Gameplay Improvements",
    "Lobby Improvements",
    "System",
    "Mode",
    "Items",
    "Special",
    "Rank",

    /**
     * 무기 섹션
     */
    "Glove",
    "Tonfa",
    "Bat",
    "Whip",
    "High Angle Fire",
    "Direct Fire",
    "Bow",
    "Crossbow",
    "Pistol",
    "Assault Rifle",
    "Sniper Rifle",
    "Rapier",
    "Spear",
    "Hammer",
    "Axe",
    "Dagger",
    "Two-handed Sword",
    "Dual Swords",
    "Nunchaku",
    "Guitar",
    "Camera",
    "Arcana",
    "VF Prosthetic",
    "Shuriken",
    "Throw",
  ];

  return stopSections.includes(normalized);
}

/**
 * 실험체별 변경사항을 추출합니다.
 *
 * 동작 방식:
 * 1. 줄을 위에서 아래로 읽습니다.
 * 2. "Vanya" 같은 실험체 이름을 만나면 현재 실험체를 바꿉니다.
 * 3. 그 아래 줄들을 해당 실험체 변경사항으로 저장합니다.
 * 4. 다른 실험체 이름이나 무기 섹션을 만나면 현재 실험체 저장을 종료합니다.
 */
function extractCharacterChanges(lines) {
  const result = {};

  for (const character of CHARACTERS) {
    result[character.slug] = {
      name: character.name,
      aliases: character.aliases,
      changes: [],
    };
  }

  let currentCharacter = null;

  for (const line of lines) {
    if (
      line.includes("코발트 프로토콜") ||
      line.includes("Cobalt Protocol")
    ) {
      break;
    }

    const foundCharacter = findTargetCharacterByLine(line);

    if (foundCharacter) {
      currentCharacter = foundCharacter;
      continue;
    }

    if (currentCharacter && isAnyCharacterNameLine(line)) {
      currentCharacter = null;
      continue;
    }

    if (currentCharacter && isStopSection(line)) {
      currentCharacter = null;
      continue;
    }

    if (!currentCharacter) {
      continue;
    }

    if (shouldIgnoreLine(line)) {
      continue;
    }

    result[currentCharacter.slug].changes.push(line);
  }

  const filtered = {};

  for (const slug of Object.keys(result)) {
    const changes = [...new Set(result[slug].changes)];

    if (changes.length > 0) {
      filtered[slug] = {
        ...result[slug],
        changes,
      };
    }
  }

  return filtered;
}
  

/**
 * 기존 patches.json 파일을 읽습니다.
 * 파일이 없으면 빈 배열을 반환합니다.
 */
function readExistingPatches() {
  if (!fs.existsSync(OUTPUT_PATH)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(OUTPUT_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    console.warn("기존 patches.json을 읽지 못했습니다. 새로 생성합니다.");
    return [];
  }
}

/**
 * patches.json 파일로 저장합니다.
 */
function savePatches(patches) {
  const dir = path.dirname(OUTPUT_PATH);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(patches, null, 2), "utf-8");
}

/**
 * 같은 URL의 패치가 있으면 덮어쓰고,
 * 없으면 새로 추가합니다.
 */
function upsertPatch(patches, newPatch) {
  const index = patches.findIndex((patch) => patch.url === newPatch.url);

  if (index >= 0) {
    patches[index] = newPatch;
    return patches;
  }

  return [newPatch, ...patches];
}
function withKoreanLocale(url) {
  const parsedUrl = new URL(url);

  parsedUrl.searchParams.set("hl", "ko-KR");

  return parsedUrl.toString();
}


/**
 * 메인 실행 함수입니다.
 */
async function main() {
  const inputUrl = process.argv[2];

  if (!inputUrl) {
    console.error("패치노트 URL을 입력해주세요.");
    process.exit(1);
  }

  const url = withKoreanLocale(inputUrl);

  console.log("크롤링 URL:", url);

  const response = await axios.get(url, {
    headers: {
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    },
  });

  const $ = cheerio.load(response.data);

  const lines = extractLinesFromHtml($);
  const title = extractTitle($);

  const patch = {
    id: getPatchIdFromUrl(url),
    title,
    url,
    date: extractDate(lines, title),
    type: guessPatchType(lines, title),
    characters: extractCharacterChanges(lines),
    createdAt: new Date().toISOString(),
  };

  const existingPatches = readExistingPatches();
  const updatedPatches = upsertPatch(existingPatches, patch);

  savePatches(updatedPatches);

  console.log("저장 완료:", OUTPUT_PATH);
  console.log("패치 제목:", patch.title);
  console.log("패치 날짜:", patch.date);
  console.log("패치 타입:", patch.type);
  console.log("추출된 실험체:");

  const characterSlugs = Object.keys(patch.characters);

  if (characterSlugs.length === 0) {
    console.log("- 추출된 실험체 없음");
  }

  for (const slug of characterSlugs) {
    const character = patch.characters[slug];
    console.log(`- ${character.name}: ${character.changes.length}개`);
  }
}

main().catch((error) => {
  console.error("크롤링 실패");
  console.error(error.message);
  process.exit(1);
});