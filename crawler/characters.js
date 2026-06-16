/**
 * crawler/characters.js
 *
 * 이터널 리턴 실험체 목록 관리 파일입니다.
 *
 * name    : 화면에 표시할 한글 이름
 * slug    : 프로젝트 내부에서 사용할 고유 ID
 * aliases : 패치노트에서 검색할 이름들
 *
 * 아이콘 경로는 따로 저장하지 않습니다.
 * 프론트엔드에서 아래 규칙으로 자동 생성하면 됩니다.
 *
 * /characters/{slug}.webp
 *
 * 예:
 * 바냐 -> /characters/vanya.webp
 * 유키 -> /characters/yuki.webp
 */

const CHARACTERS = [
  { name: "가넷", slug: "garnet", aliases: ["가넷", "Garnet"] },
  { name: "나딘", slug: "nadine", aliases: ["나딘", "Nadine"] },
  { name: "나타폰", slug: "nathapon", aliases: ["나타폰", "Nathapon"] },
  { name: "니키", slug: "nicky", aliases: ["니키", "Nicky"] },
  { name: "다니엘", slug: "daniel", aliases: ["다니엘", "Daniel"] },
  { name: "다르코", slug: "darko", aliases: ["다르코", "Darko"] },
  { name: "데비&마를렌", slug: "debi-marlene", aliases: ["데비&마를렌", "Debi & Marlene"] },
  { name: "띠아", slug: "tia", aliases: ["띠아", "Tia"] },
  { name: "라우라", slug: "laura", aliases: ["라우라", "Laura"] },
  { name: "레니", slug: "leni", aliases: ["레니", "Leni"] },
  { name: "레녹스", slug: "lenox", aliases: ["레녹스", "Lenox"] },
  { name: "레온", slug: "leon", aliases: ["레온", "Leon"] },
  { name: "르노어", slug: "lenore", aliases: ["르노어", "Lenore"] },
  { name: "리다이린", slug: "li-dailin", aliases: ["리다이린", "Li Dailin"] },
  { name: "리오", slug: "rio", aliases: ["리오", "Rio"] },
  { name: "루크", slug: "luke", aliases: ["루크", "Luke"] },
  { name: "마르티나", slug: "martina", aliases: ["마르티나", "Martina"] },
  { name: "마이", slug: "mai", aliases: ["마이", "Mai"] },
  { name: "마커스", slug: "markus", aliases: ["마커스", "Markus"] },
  { name: "미르카", slug: "mirka", aliases: ["미르카", "Mirka"] },
  { name: "매그너스", slug: "magnus", aliases: ["매그너스", "Magnus"] },
  { name: "바냐", slug: "vanya", aliases: ["바냐", "Vanya"] },
  { name: "바바라", slug: "barbara", aliases: ["바바라", "Barbara"] },
  { name: "버니스", slug: "bernice", aliases: ["버니스", "Bernice"] },
  { name: "비앙카", slug: "bianca", aliases: ["비앙카", "Bianca"] },
  { name: "셀린", slug: "celine", aliases: ["셀린", "Celine"] },
  { name: "쇼이치", slug: "shoichi", aliases: ["쇼이치", "Shoichi"] },
  { name: "수아", slug: "sua", aliases: ["수아", "Sua"] },
  { name: "시셀라", slug: "sissela", aliases: ["시셀라", "Sissela"] },
  { name: "실비아", slug: "silvia", aliases: ["실비아", "Silvia"] },
  { name: "아델라", slug: "adela", aliases: ["아델라", "Adela"] },
  { name: "아드리아나", slug: "adriana", aliases: ["아드리아나", "Adriana"]},
  { name: "아디나", slug: "adina", aliases: ["아디나", "Adina"] },
  { name: "아르다", slug: "arda", aliases: ["아르다", "Arda"] },
  { name: "아비게일", slug: "abigail", aliases: ["아비게일", "Abigail"] },
  { name: "아이솔", slug: "isol", aliases: ["아이솔", "Isol"] },
  { name: "아이작", slug: "isaac", aliases: ["아이작", "Isaac"] },
  { name: "아야", slug: "aya", aliases: ["아야", "Aya"] },
  { name: "알렉스", slug: "alex", aliases: ["알렉스", "Alex"] },
  { name: "알론소", slug: "alonso", aliases: ["알론소", "Alonso"] },
  { name: "에스텔", slug: "estelle", aliases: ["에스텔", "Estelle"] },
  { name: "에이든", slug: "aiden", aliases: ["에이든", "Aiden"] },
  { name: "에키온", slug: "echion", aliases: ["에키온", "Echion"] },
  { name: "엠마", slug: "emma", aliases: ["엠마", "Emma"] },
  { name: "얀", slug: "jan", aliases: ["얀", "Jan"] },
  { name: "엘레나", slug: "elena", aliases: ["엘레나", "Elena"] },
  { name: "요한", slug: "johann", aliases: ["요한", "Johann"] },
  { name: "윌리엄", slug: "william", aliases: ["윌리엄", "William"] },
  { name: "유민", slug: "yumin", aliases: ["유민", "Yumin"] },
  { name: "유스티나", slug: "justyna", aliases: ["유스티나", "Justyna"] },
  { name: "유키", slug: "yuki", aliases: ["유키", "Yuki"] },
  { name: "이렘", slug: "irem", aliases: ["이렘", "Irem"] },
  { name: "이바", slug: "eva", aliases: ["이바", "Eva"] },
  { name: "이슈트반", slug: "istvan", aliases: ["이슈트반", "István", "Istvan"] },
  { name: "이안", slug: "ian", aliases: ["이안", "Ian"] },
  { name: "일레븐", slug: "eleven", aliases: ["일레븐", "Eleven"] },
  { name: "자히르", slug: "zahir", aliases: ["자히르", "Zahir"] },
  { name: "재키", slug: "jackie", aliases: ["재키", "Jackie"] },
  { name: "제니", slug: "jenny", aliases: ["제니", "Jenny"] },
  { name: "카밀로", slug: "camilo", aliases: ["카밀로", "Camilo"] },
  { name: "카티야", slug: "katja", aliases: ["카티야", "Katja"] },
  { name: "칼라", slug: "karla", aliases: ["칼라", "Karla"] },
  { name: "캐시", slug: "cathy", aliases: ["캐시", "Cathy"] },
  { name: "케네스", slug: "kenneth", aliases: ["케네스", "Kenneth"] },
  { name: "코렐라인", slug: "coraline", aliases: ["코렐라인", "Coraline"] },
  { name: "클로에", slug: "chloe", aliases: ["클로에", "Chloe"] },
  { name: "키아라", slug: "chiara", aliases: ["키아라", "Chiara"] },
  { name: "타지아", slug: "tazia", aliases: ["타지아", "Tazia"] },
  { name: "테오도르", slug: "theodore", aliases: ["테오도르", "Theodore"] },
  { name: "츠바메", slug: "tsubame", aliases: ["츠바메", "Tsubame"] },
  { name: "펜리르", slug: "fenrir", aliases: ["펜리르", "Fenrir"] },
  { name: "펠릭스", slug: "felix", aliases: ["펠릭스", "Felix"] },
  { name: "프리야", slug: "priya", aliases: ["프리야", "Priya"] },
  { name: "피오라", slug: "fiora", aliases: ["피오라", "Fiora"] },
  { name: "피올로", slug: "piolo", aliases: ["피올로", "Piolo"] },
  { name: "하트", slug: "hart", aliases: ["하트", "Hart"] },
  { name: "헤이즈", slug: "haze", aliases: ["헤이즈", "Haze"] },
  { name: "헨리", slug: "henry", aliases: ["헨리", "Henry"] },
  { name: "현우", slug: "hyunwoo", aliases: ["현우", "Hyunwoo"] },
  { name: "혜진", slug: "hyejin", aliases: ["혜진", "Hyejin"] },
  { name: "히스이", slug: "hisui", aliases: ["히스이", "Hisui"] },
];

/**
 * 혹시 중간에 순서가 섞여도 name 기준으로 자동 가나다 정렬합니다.
 */
CHARACTERS.sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));

module.exports = {
  CHARACTERS,
};