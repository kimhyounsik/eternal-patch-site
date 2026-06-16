const axios = require("axios");
const cheerio = require("cheerio");

const fs = require("fs");
const target = "Yuki";

async function main() {
  const response = await axios.get(
    "https://playeternalreturn.com/posts/news/3629"
  );

  const $ = cheerio.load(response.data);

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();

  const startIndex = bodyText.indexOf(target);

  if (startIndex === -1) {
    console.log(`${target}를 찾을 수 없습니다.`);
    return;
  }

  const nextCharacterNames = [
    "Jackie",
    "Aya",
    "Hyunwoo",
    "Magnus",
    "Fiora",
    "Nadine",
    "Zahir",
    "Hart",
    "Isol",
    "Li Dailin",
    "Yuki",
    "Hyejin",
    "Xiukai",
    "Chiara",
    "Sissela",
    "Silvia",
    "Adriana",
    "Shoichi",
    "Emma",
    "Lenox",
    "Rozzi",
    "Luke",
    "Cathy",
    "Adela",
    "Bernice",
    "Barbara",
    "Alex",
    "Sua",
    "Leon",
    "Eleven",
    "Rio",
    "William",
    "Nicky",
    "Nathapon",
    "Jan",
    "Eva",
    "Daniel",
    "Jenny",
    "Camilo",
    "Chloe",
    "Johann",
    "Bianca",
    "Celine",
    "Echion",
    "Mai",
    "Aiden",
    "Laura",
    "Tia",
    "Felix",
    "Elena",
    "Priya",
    "Adina",
    "Markus",
    "Karla",
    "Estelle",
    "Piolo",
    "Martina",
    "Haze",
    "Isaac",
    "Tazia",
    "Irem",
    "Theodore",
    "Ly Anh",
    "Vanya",
    "Debi & Marlene",
    "Arda",
    "Abigail",
    "Alonso",
    "Leni",
    "Tsubame",
    "Kenneth",
    "Katja",
    "Charlotte",
    "Darko",
    "Lenore",
    "Garnet",
    "Isolde",
    "Yu Min",
    "Hudson",
    "Craver",
  ];

  let endIndex = bodyText.length;

  for (const name of nextCharacterNames) {
    if (name === target) continue;

    const index = bodyText.indexOf(name, startIndex + target.length);

    if (index !== -1 && index < endIndex) {
      endIndex = index;
    }
  }

  const section = bodyText.slice(startIndex, endIndex).trim();

const patchData = {
  character: "유키",
  version: "11.4",
  date: "2026-06-11",
  type: "buff",
  changes: [section],
};

fs.writeFileSync(
  "crawler/output.json",
  JSON.stringify(patchData, null, 2),
  "utf-8"
);

console.log("저장 완료: crawler/output.json");
}

main();