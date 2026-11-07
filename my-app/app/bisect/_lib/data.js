// All demo content for BISECT: topics, questions, lessons, UI text, teacher data.
// Your JSON-logic teammate can replace this with the real data later. Keep the same shape.

export const LANGS = ["en", "fr", "zh"];
export const LANG_NAMES = { en: "English", fr: "Français", zh: "中文" };
export const HTML_LANG = { en: "en", fr: "fr", zh: "zh-Hans" };
export const SPEECH_LANG = { en: "en-US", fr: "fr-FR", zh: "zh-CN" };

// Top = the topic the student started on. Each topic depends on the one below it.
export const CHAIN = ["twos_complement", "bit_flip", "place_value", "powers_of_two"];

export const TOPICS = {
  twos_complement: { en: "Two's complement", fr: "Complément à deux", zh: "补码" },
  bit_flip: { en: "Bit flipping", fr: "Inversion des bits", zh: "按位取反" },
  place_value: { en: "Binary place value", fr: "Valeur de position binaire", zh: "二进制位值" },
  powers_of_two: { en: "Powers of two", fr: "Puissances de deux", zh: "2 的幂" },
};

// Two questions per topic: [main question, confirmation question].
// `answer` is compared after normalising (spaces removed). `binary` = read digit by digit.
export const QUESTIONS = {
  twos_complement: [
    {
      id: "tc1",
      prompt: {
        en: "What is the 4-bit two's complement of 5? (How is −5 written?)",
        fr: "Quel est le complément à deux sur 4 bits de 5 ? (Comment s'écrit −5 ?)",
        zh: "5 的 4 位补码是什么？（也就是 −5 怎么表示？）",
      },
      choices: ["1011", "1010", "0101", "1101"],
      answer: "1011",
      binary: true,
      feedback: {
        "1010": {
          en: "You picked 1010. That flips the bits of 0101 but forgets to add 1.",
          fr: "Vous avez choisi 1010. Cela inverse les bits de 0101 mais oublie d'ajouter 1.",
          zh: "你选了 1010。这是把 0101 取反了，但忘了加 1。",
        },
        "0101": {
          en: "You picked 0101. That's +5, not −5.",
          fr: "Vous avez choisi 0101. C'est +5, pas −5.",
          zh: "你选了 0101。这是 +5，不是 −5。",
        },
        "1101": {
          en: "You picked 1101. That only sets the top bit (sign-magnitude), which isn't two's complement.",
          fr: "Vous avez choisi 1101. Cela met seulement le bit de signe à 1 (signe-valeur absolue), ce n'est pas le complément à deux.",
          zh: "你选了 1101。这只是把最高位设为 1（原码），不是补码。",
        },
      },
    },
    {
      id: "tc2",
      prompt: {
        en: "In 4-bit two's complement, what decimal value is 1111?",
        fr: "En complément à deux sur 4 bits, quelle valeur décimale représente 1111 ?",
        zh: "在 4 位补码中，1111 表示的十进制数是多少？",
      },
      choices: ["-1", "15", "-7", "-8"],
      answer: "-1",
      binary: false,
      feedback: {},
    },
  ],
  bit_flip: [
    {
      id: "bf1",
      prompt: {
        en: "Flip every bit of 0101. What do you get?",
        fr: "Inversez chaque bit de 0101. Qu'obtenez-vous ?",
        zh: "把 0101 的每一位取反，结果是什么？",
      },
      choices: ["1010", "0101", "1011", "0110"],
      answer: "1010",
      binary: true,
      feedback: {
        "1011": {
          en: "You picked 1011. You flipped and then added 1. That's two's complement, not just flipping.",
          fr: "Vous avez choisi 1011. Vous avez inversé puis ajouté 1 : c'est le complément à deux, pas une simple inversion.",
          zh: "你选了 1011。你取反后又加了 1，这是补码，不只是取反。",
        },
        "0110": {
          en: "You picked 0110. Each bit flips on its own: 0 becomes 1 and 1 becomes 0.",
          fr: "Vous avez choisi 0110. Chaque bit s'inverse séparément : 0 devient 1 et 1 devient 0.",
          zh: "你选了 0110。每一位单独取反：0 变 1，1 变 0。",
        },
      },
    },
    {
      id: "bf2",
      prompt: {
        en: "Flip every bit of 0011. What do you get?",
        fr: "Inversez chaque bit de 0011. Qu'obtenez-vous ?",
        zh: "把 0011 的每一位取反，结果是什么？",
      },
      choices: ["1100", "0011", "1101", "0100"],
      answer: "1100",
      binary: true,
      feedback: {},
    },
  ],
  place_value: [
    {
      id: "pv1",
      prompt: {
        en: "What is the binary number 1011 in decimal?",
        fr: "Que vaut le nombre binaire 1011 en décimal ?",
        zh: "二进制数 1011 等于十进制的多少？",
      },
      choices: ["3", "8", "11", "13"],
      answer: "11",
      binary: false,
      feedback: {
        "3": {
          en: "You answered 3. You added the digits 1 + 0 + 1 + 1, as if every digit were worth the same.",
          fr: "Vous avez répondu 3. Vous avez additionné les chiffres 1 + 0 + 1 + 1, comme si chaque chiffre valait pareil.",
          zh: "你答了 3。你把各位数字 1 + 0 + 1 + 1 直接相加，好像每一位的值都一样。",
        },
        "8": {
          en: "You answered 8. You only counted the leftmost 1.",
          fr: "Vous avez répondu 8. Vous n'avez compté que le 1 le plus à gauche.",
          zh: "你答了 8。你只算了最左边的 1。",
        },
        "13": {
          en: "You answered 13. You read the weights left to right as 1, 2, 4, 8. The rightmost digit is worth 1.",
          fr: "Vous avez répondu 13. Vous avez lu les poids de gauche à droite (1, 2, 4, 8). Le chiffre le plus à droite vaut 1.",
          zh: "你答了 13。你把权重从左往右读成了 1、2、4、8。最右边的一位才是 1。",
        },
      },
    },
    {
      id: "pv2",
      prompt: {
        en: "What is 0110 in decimal?",
        fr: "Que vaut 0110 en décimal ?",
        zh: "0110 等于十进制的多少？",
      },
      choices: ["6", "2", "110", "3"],
      answer: "6",
      binary: false,
      feedback: {},
    },
  ],
  powers_of_two: [
    {
      id: "p21",
      prompt: {
        en: "What is 2³ (2 to the power of 3)?",
        fr: "Que vaut 2³ (2 à la puissance 3) ?",
        zh: "2³（2 的 3 次方）等于多少？",
      },
      choices: ["6", "8", "9", "16"],
      answer: "8",
      binary: false,
      feedback: {
        "6": {
          en: "You answered 6. That's 2 × 3. A power means multiplying 2 by itself 3 times.",
          fr: "Vous avez répondu 6. C'est 2 × 3. Une puissance veut dire multiplier 2 par lui-même 3 fois.",
          zh: "你答了 6。这是 2 × 3。幂的意思是把 2 自乘 3 次。",
        },
      },
    },
    {
      id: "p22",
      prompt: { en: "What is 2⁴?", fr: "Que vaut 2⁴ ?", zh: "2⁴ 等于多少？" },
      choices: ["8", "16", "32", "24"],
      answer: "16",
      binary: false,
      feedback: {},
    },
  ],
};

// Short lessons (in a real build the backend/AI writes these, aimed at the student's answer).
export const LESSONS = {
  place_value: {
    body: {
      en: "Reading right to left, each position is worth double the one before it: 1, 2, 4, 8. Multiply each digit by its weight, then add.",
      fr: "De droite à gauche, chaque position vaut le double de la précédente : 1, 2, 4, 8. Multipliez chaque chiffre par son poids, puis additionnez.",
      zh: "从右往左，每一位的权重是前一位的两倍：1、2、4、8。把每一位数字乘以它的权重，再相加。",
    },
    table: { digits: ["1", "0", "1", "1"], weights: ["8", "4", "2", "1"], result: "8 + 0 + 2 + 1 = 11" },
  },
  powers_of_two: {
    body: {
      en: "2ⁿ means multiplying 2 by itself n times. Each power is double the one before: 1, 2, 4, 8, 16.",
      fr: "2ⁿ signifie multiplier 2 par lui-même n fois. Chaque puissance est le double de la précédente : 1, 2, 4, 8, 16.",
      zh: "2ⁿ 表示把 2 自乘 n 次。每个幂都是前一个的两倍：1、2、4、8、16。",
    },
    example: "2³ = 2 × 2 × 2 = 8",
  },
  bit_flip: {
    body: {
      en: "Flipping (inverting) means every 0 becomes 1 and every 1 becomes 0, one bit at a time. Nothing is added.",
      fr: "Inverser signifie que chaque 0 devient 1 et chaque 1 devient 0, bit par bit. On n'ajoute rien.",
      zh: "取反就是把每个 0 变成 1、每个 1 变成 0，逐位进行，不做加法。",
    },
    example: "0101 → 1010",
  },
  twos_complement: {
    body: {
      en: "To write −x in two's complement: write x in binary, flip every bit, then add 1.",
      fr: "Pour écrire −x en complément à deux : écrivez x en binaire, inversez chaque bit, puis ajoutez 1.",
      zh: "用补码表示 −x：先写出 x 的二进制，把每一位取反，再加 1。",
    },
    example: "5 = 0101 → 1010 → +1 → 1011 = −5",
  },
};

// Extra exam vocabulary shown on the language-gap card.
export const VOCAB_EXTRA = [
  { en: "bit flipping", zh: "按位取反", fr: "inversion des bits" },
  { en: "signed", zh: "有符号", fr: "signé" },
  { en: "most significant bit", zh: "最高位", fr: "bit de poids fort" },
];

export const TAGS = [
  { id: "terms", en: "English terms are hard", fr: "Les termes anglais sont difficiles", zh: "英文术语很难" },
  { id: "exam", en: "Worried about the exam", fr: "Inquiet pour l'examen", zh: "担心考试" },
  { id: "time", en: "I need more time", fr: "J'ai besoin de plus de temps", zh: "我需要更多时间" },
  { id: "examples", en: "More examples, please", fr: "Plus d'exemples, svp", zh: "请多给些例题" },
  { id: "behind", en: "I'm falling behind", fr: "Je prends du retard", zh: "我跟不上了" },
  { id: "practice", en: "Need more practice", fr: "Besoin de plus de pratique", zh: "需要更多练习" },
];

// Sample class data for the teacher dashboard (always shown in the course language).
export const CLASS_DATA = {
  diagnosed: 32,
  conceptGaps: 24,
  languageGaps: 8,
  rootGaps: [
    { topic: "place_value", pct: 62 },
    { topic: "powers_of_two", pct: 18 },
    { topic: "bit_flip", pct: 12 },
    { topic: "twos_complement", pct: 8 },
  ],
  themes: { exam: 5, terms: 4, examples: 2 },
};

// UI text. Add a key here once, in all three languages.
export const UI = {
  courseLanguage: { en: "Course language", fr: "Langue du cours", zh: "课程语言" },
  myLanguage: { en: "My language", fr: "Ma langue", zh: "我的语言" },
  readAloud: { en: "Read aloud", fr: "Lire à voix haute", zh: "朗读" },
  checking: { en: "Checking foundations… question {n} of {t}", fr: "Vérification des bases… question {n} sur {t}", zh: "正在检查基础… 第 {n} 题，共 {t} 题" },
  starting: { en: "Let's start with a question on two's complement", fr: "Commençons par une question sur le complément à deux", zh: "先来一道补码题" },
  retesting: { en: "Retesting: {topic}", fr: "Nouveau test : {topic}", zh: "重新测试：{topic}" },
  noTimer: { en: "No timer. Take your time.", fr: "Pas de chrono. Prenez votre temps.", zh: "不计时，慢慢来。" },
  howAnswer: { en: "How do you want to answer?", fr: "Comment voulez-vous répondre ?", zh: "你想怎么回答？" },
  choose: { en: "Choose", fr: "Choisir", zh: "选择" },
  type: { en: "Type", fr: "Écrire", zh: "输入" },
  speak: { en: "Speak", fr: "Parler", zh: "说" },
  yourAnswer: { en: "Your answer", fr: "Votre réponse", zh: "你的答案" },
  typeHere: { en: "Type your answer", fr: "Tapez votre réponse", zh: "输入你的答案" },
  howGotIt: { en: "How did you get it?", fr: "Comment avez-vous trouvé ?", zh: "你是怎么想的？" },
  howGotItHint: { en: "(optional, helps pick the right lesson)", fr: "(facultatif, aide à choisir la bonne leçon)", zh: "（可选，帮助选择合适的课程）" },
  explainPlaceholder: { en: "Explain in your own words, in any language", fr: "Expliquez avec vos mots, dans n'importe quelle langue", zh: "用你自己的话解释，任何语言都可以" },
  explainByVoice: { en: "Explain by voice", fr: "Expliquer à voix haute", zh: "用语音解释" },
  tapToSpeak: { en: "Tap to speak your answer", fr: "Touchez pour dire votre réponse", zh: "点击说出你的答案" },
  listening: { en: "Listening…", fr: "J'écoute…", zh: "正在听…" },
  iHeard: { en: "I heard:", fr: "J'ai entendu :", zh: "我听到：" },
  answerIs: { en: "Answer:", fr: "Réponse :", zh: "答案：" },
  yesRight: { en: "Yes, that's right", fr: "Oui, c'est ça", zh: "对，没错" },
  tryAgain: { en: "Try again", fr: "Réessayer", zh: "再试一次" },
  noNumber: { en: "I couldn't find an answer in that. Try again or type it.", fr: "Je n'ai pas trouvé de réponse. Réessayez ou tapez-la.", zh: "没听出答案，请再试一次或直接输入。" },
  noSpeech: { en: "Voice input needs Chrome. You can type instead.", fr: "La saisie vocale nécessite Chrome. Vous pouvez écrire à la place.", zh: "语音输入需要 Chrome 浏览器，你也可以直接输入。" },
  showIn: { en: "Show in {lang}", fr: "Afficher en {lang}", zh: "用{lang}显示" },
  examLanguage: { en: "Exam language", fr: "Langue de l'examen", zh: "考试语言" },
  checkAnswer: { en: "Check answer", fr: "Vérifier", zh: "检查答案" },
  secondCheck: { en: "One wrong answer isn't a gap. BISECT always asks a second check question first.", fr: "Une seule erreur n'est pas une lacune. BISECT pose toujours une question de confirmation.", zh: "答错一次不算缺口——还会再问一道确认题。" },
  confirmQ: { en: "Quick check: one more on this topic", fr: "Vérification : encore une sur ce sujet", zh: "确认一下：这个知识点再来一题" },
  topicMap: { en: "Your topic map", fr: "Votre carte des notions", zh: "你的知识地图" },
  mapView: { en: "Map", fr: "Carte", zh: "地图" },
  listView: { en: "List", fr: "Liste", zh: "列表" },
  mastered: { en: "Mastered", fr: "Maîtrisé", zh: "已掌握" },
  gap: { en: "Gap", fr: "Lacune", zh: "有缺口" },
  untested: { en: "Not tested", fr: "Non testé", zh: "未测试" },
  rootCause: { en: "Root cause", fr: "Cause profonde", zh: "根本原因" },
  diagnosis: { en: "Diagnosis", fr: "Diagnostic", zh: "诊断结果" },
  gapIsnt: { en: "Your gap isn't {start}. It's {root}.", fr: "Votre lacune n'est pas {start}. C'est {root}.", zh: "你的缺口不是{start}，而是{root}。" },
  gapIs: { en: "Your gap is {root} itself.", fr: "Votre lacune est {root} elle-même.", zh: "你的缺口就是{root}本身。" },
  startLesson: { en: "Start 2-minute lesson", fr: "Commencer la leçon de 2 minutes", zh: "开始 2 分钟课程" },
  continueRetest: { en: "Next: retest {topic}", fr: "Suite : retester {topic}", zh: "下一步：重新测试{topic}" },
  climbHint: { en: "After the lesson, the map turns green from the bottom up as you retest each topic.", fr: "Après la leçon, la carte devient verte de bas en haut à chaque nouveau test réussi.", zh: "课程结束后，每通过一次重测，地图会从下往上变绿。" },
  fixedAll: { en: "You fixed {n} gap(s) and mastered {topic}!", fr: "Vous avez comblé {n} lacune(s) et maîtrisé {topic} !", zh: "你修补了 {n} 个缺口，掌握了{topic}！" },
  alreadyMastered: { en: "Correct! You've already mastered {topic}.", fr: "Correct ! Vous maîtrisez déjà {topic}.", zh: "答对了！你已经掌握了{topic}。" },
  lessonLabel: { en: "Lesson · about 2 minutes", fr: "Leçon · environ 2 minutes", zh: "课程 · 约 2 分钟" },
  aboutAnswer: { en: "About your answer", fr: "À propos de votre réponse", zh: "关于你的答案" },
  genericWrong: { en: "Not quite. Let's look at how this works.", fr: "Pas tout à fait. Voyons comment ça marche.", zh: "不太对。我们来看看原理。" },
  weight: { en: "Weight", fr: "Poids", zh: "权重" },
  digit: { en: "Digit", fr: "Chiffre", zh: "数字" },
  example: { en: "Example", fr: "Exemple", zh: "例子" },
  explainBack: { en: "Explain it back", fr: "Réexpliquez", zh: "复述一遍" },
  explainBackHint: { en: "(say or type it in your own words, any language)", fr: "(dites-le ou écrivez-le avec vos mots)", zh: "（用自己的话说或写下来，任何语言都可以）" },
  retest: { en: "Retest {topic}", fr: "Retester {topic}", zh: "重新测试{topic}" },
  keyTerms: { en: "Key terms", fr: "Termes clés", zh: "关键术语" },
  sayIn: { en: "Say in {lang}", fr: "Dire en {lang}", zh: "用{lang}朗读" },
  languageGap: { en: "Language gap", fr: "Lacune de langue", zh: "语言缺口" },
  langGapTitle: { en: "You understand {topic}. You're missing the {course} words for it.", fr: "Vous comprenez {topic}. Il vous manque les mots en {course}.", zh: "你懂{topic}，缺的是{course}术语。" },
  askedIn: { en: "Asked in {lang}", fr: "Posée en {lang}", zh: "用{lang}提问" },
  correct: { en: "Correct", fr: "Correct", zh: "正确" },
  wrong: { en: "Wrong", fr: "Faux", zh: "错误" },
  vocabCard: { en: "Vocabulary card", fr: "Carte de vocabulaire", zh: "术语卡" },
  alsoWatch: { en: "Also watch for:", fr: "À surveiller aussi :", zh: "还要注意：" },
  practiceQ: { en: "Quick practice: what's the {course} term for {term}?", fr: "Exercice : quel est le terme en {course} pour {term} ?", zh: "小练习：{term}的{course}术语是什么？" },
  sayOrType: { en: "Say it or type it", fr: "Dites-le ou tapez-le", zh: "说出来或输入" },
  check: { en: "Check", fr: "Vérifier", zh: "检查" },
  niceTerm: { en: "Exactly right.", fr: "Exactement.", zh: "完全正确。" },
  notTerm: { en: "Not quite. Look at the card and try again.", fr: "Pas tout à fait. Regardez la carte et réessayez.", zh: "不太对，看看卡片再试一次。" },
  retryIn: { en: "Retry in {lang}", fr: "Réessayer en {lang}", zh: "用{lang}再试一次" },
  slowingDown: { en: "Anything slowing you down?", fr: "Quelque chose vous freine ?", zh: "有什么让你卡住吗？" },
  slowingHint: { en: "Optional, one tap. Your teacher only sees these as anonymous class trends.", fr: "Facultatif, en un clic. Votre enseignant ne voit que des tendances anonymes.", zh: "可选，一键即可。老师只会看到匿名的班级趋势。" },
  shareAnon: { en: "Share anonymously", fr: "Partager anonymement", zh: "匿名分享" },
  shared: { en: "Shared. Thanks!", fr: "Partagé. Merci !", zh: "已分享，谢谢！" },
  teacherView: { en: "Teacher view", fr: "Vue enseignant", zh: "教师视图" },
  studentView: { en: "Student view", fr: "Vue étudiant", zh: "学生视图" },
  restart: { en: "Restart demo", fr: "Recommencer", zh: "重新开始" },
};

export function t(key, lang, vars = {}) {
  const entry = UI[key];
  let s = (entry && (entry[lang] || entry.en)) || key;
  for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}
