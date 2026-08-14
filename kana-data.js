/* =======================================================================
   假名資料：kana-trainer.html 與 table.html 共用的單一來源。
   刻意寫成 classic script（非 ES module），module 在 file:// 下會被
   CORS 擋掉，而本專案主打「直接打開 HTML 就能用」。

   每筆欄位：
     h / k  平假名 / 片假名字形
     r      羅馬字，r[0] 為主寫法（顯示用），其餘為可接受的異寫
     row    所屬行，對應 ROWS，用於練習範圍過濾與誘答項挑選
     col    段（0=あ 1=い 2=う 3=え 4=お），用於五十音圖排版與誘答項挑選
     id     選用。統計 key 與身分識別，省略時等同 r[0]。
            只有主羅馬字會與別的字撞號時才需要指定（ぢ づ）
     hom    選用。同音組代號，同組的字不會互相成為選擇題的誘答項
   ======================================================================= */
(function (global) {
"use strict";

const KANA = [
  /* ---------------- 清音 ---------------- */
  {h:'あ',k:'ア',r:['a'],   row:'a', col:0},
  {h:'い',k:'イ',r:['i'],   row:'a', col:1},
  {h:'う',k:'ウ',r:['u'],   row:'a', col:2},
  {h:'え',k:'エ',r:['e'],   row:'a', col:3},
  {h:'お',k:'オ',r:['o'],   row:'a', col:4},

  {h:'か',k:'カ',r:['ka'],  row:'ka', col:0},
  {h:'き',k:'キ',r:['ki'],  row:'ka', col:1},
  {h:'く',k:'ク',r:['ku'],  row:'ka', col:2},
  {h:'け',k:'ケ',r:['ke'],  row:'ka', col:3},
  {h:'こ',k:'コ',r:['ko'],  row:'ka', col:4},

  {h:'さ',k:'サ',r:['sa'],        row:'sa', col:0},
  {h:'し',k:'シ',r:['shi','si'],  row:'sa', col:1},
  {h:'す',k:'ス',r:['su'],        row:'sa', col:2},
  {h:'せ',k:'セ',r:['se'],        row:'sa', col:3},
  {h:'そ',k:'ソ',r:['so'],        row:'sa', col:4},

  {h:'た',k:'タ',r:['ta'],        row:'ta', col:0},
  {h:'ち',k:'チ',r:['chi','ti'],  row:'ta', col:1},
  {h:'つ',k:'ツ',r:['tsu','tu'],  row:'ta', col:2},
  {h:'て',k:'テ',r:['te'],        row:'ta', col:3},
  {h:'と',k:'ト',r:['to'],        row:'ta', col:4},

  {h:'な',k:'ナ',r:['na'],  row:'na', col:0},
  {h:'に',k:'ニ',r:['ni'],  row:'na', col:1},
  {h:'ぬ',k:'ヌ',r:['nu'],  row:'na', col:2},
  {h:'ね',k:'ネ',r:['ne'],  row:'na', col:3},
  {h:'の',k:'ノ',r:['no'],  row:'na', col:4},

  {h:'は',k:'ハ',r:['ha'],       row:'ha', col:0},
  {h:'ひ',k:'ヒ',r:['hi'],       row:'ha', col:1},
  {h:'ふ',k:'フ',r:['fu','hu'],  row:'ha', col:2},
  {h:'へ',k:'ヘ',r:['he'],       row:'ha', col:3},
  {h:'ほ',k:'ホ',r:['ho'],       row:'ha', col:4},

  {h:'ま',k:'マ',r:['ma'],  row:'ma', col:0},
  {h:'み',k:'ミ',r:['mi'],  row:'ma', col:1},
  {h:'む',k:'ム',r:['mu'],  row:'ma', col:2},
  {h:'め',k:'メ',r:['me'],  row:'ma', col:3},
  {h:'も',k:'モ',r:['mo'],  row:'ma', col:4},

  {h:'や',k:'ヤ',r:['ya'],  row:'ya', col:0},
  {h:'ゆ',k:'ユ',r:['yu'],  row:'ya', col:2},
  {h:'よ',k:'ヨ',r:['yo'],  row:'ya', col:4},

  {h:'ら',k:'ラ',r:['ra'],  row:'ra', col:0},
  {h:'り',k:'リ',r:['ri'],  row:'ra', col:1},
  {h:'る',k:'ル',r:['ru'],  row:'ra', col:2},
  {h:'れ',k:'レ',r:['re'],  row:'ra', col:3},
  {h:'ろ',k:'ロ',r:['ro'],  row:'ra', col:4},

  {h:'わ',k:'ワ',r:['wa'],  row:'wa', col:0},
  // を 只收 wo：若同時接受 o 會與お撞號，反向題會出現兩個正確答案
  {h:'を',k:'ヲ',r:['wo'],  row:'wa', col:4},

  {h:'ん',k:'ン',r:['n','nn'],  row:'n', col:0},

  /* ---------------- 濁音 ---------------- */
  {h:'が',k:'ガ',r:['ga'],  row:'ga', col:0},
  {h:'ぎ',k:'ギ',r:['gi'],  row:'ga', col:1},
  {h:'ぐ',k:'グ',r:['gu'],  row:'ga', col:2},
  {h:'げ',k:'ゲ',r:['ge'],  row:'ga', col:3},
  {h:'ご',k:'ゴ',r:['go'],  row:'ga', col:4},

  {h:'ざ',k:'ザ',r:['za'],        row:'za', col:0},
  {h:'じ',k:'ジ',r:['ji','zi'],   row:'za', col:1, hom:'ji'},
  {h:'ず',k:'ズ',r:['zu'],        row:'za', col:2, hom:'zu'},
  {h:'ぜ',k:'ゼ',r:['ze'],        row:'za', col:3},
  {h:'ぞ',k:'ゾ',r:['zo'],        row:'za', col:4},

  {h:'だ',k:'ダ',r:['da'],        row:'da', col:0},
  // ぢ づ 與 じ ず 同音：主寫法沿用標準的 ji / zu，另以 id 分家避免統計撞號，
  // 並靠 hom 讓兩者不會出現在同一組選項裡
  {h:'ぢ',k:'ヂ',r:['ji','di'],   row:'da', col:1, hom:'ji', id:'di'},
  {h:'づ',k:'ヅ',r:['zu','du'],   row:'da', col:2, hom:'zu', id:'du'},
  {h:'で',k:'デ',r:['de'],        row:'da', col:3},
  {h:'ど',k:'ド',r:['do'],        row:'da', col:4},

  {h:'ば',k:'バ',r:['ba'],  row:'ba', col:0},
  {h:'び',k:'ビ',r:['bi'],  row:'ba', col:1},
  {h:'ぶ',k:'ブ',r:['bu'],  row:'ba', col:2},
  {h:'べ',k:'ベ',r:['be'],  row:'ba', col:3},
  {h:'ぼ',k:'ボ',r:['bo'],  row:'ba', col:4},

  /* ---------------- 半濁音 ---------------- */
  {h:'ぱ',k:'パ',r:['pa'],  row:'pa', col:0},
  {h:'ぴ',k:'ピ',r:['pi'],  row:'pa', col:1},
  {h:'ぷ',k:'プ',r:['pu'],  row:'pa', col:2},
  {h:'ぺ',k:'ペ',r:['pe'],  row:'pa', col:3},
  {h:'ぽ',k:'ポ',r:['po'],  row:'pa', col:4},

  /* ---------------- 拗音 ----------------
     col 沿用や行的 0 / 2 / 4：きゃ・きゅ・きょ 的母音正是 あ・う・お 段，
     熱力圖因此可以繼續用同一套 5 欄網格，不必為拗音開特例。            */
  {h:'きゃ',k:'キャ',r:['kya'],  row:'kya', col:0},
  {h:'きゅ',k:'キュ',r:['kyu'],  row:'kya', col:2},
  {h:'きょ',k:'キョ',r:['kyo'],  row:'kya', col:4},

  {h:'しゃ',k:'シャ',r:['sha','sya'],  row:'sha', col:0},
  {h:'しゅ',k:'シュ',r:['shu','syu'],  row:'sha', col:2},
  {h:'しょ',k:'ショ',r:['sho','syo'],  row:'sha', col:4},

  {h:'ちゃ',k:'チャ',r:['cha','tya','cya'],  row:'cha', col:0},
  {h:'ちゅ',k:'チュ',r:['chu','tyu','cyu'],  row:'cha', col:2},
  {h:'ちょ',k:'チョ',r:['cho','tyo','cyo'],  row:'cha', col:4},

  {h:'にゃ',k:'ニャ',r:['nya'],  row:'nya', col:0},
  {h:'にゅ',k:'ニュ',r:['nyu'],  row:'nya', col:2},
  {h:'にょ',k:'ニョ',r:['nyo'],  row:'nya', col:4},

  {h:'ひゃ',k:'ヒャ',r:['hya'],  row:'hya', col:0},
  {h:'ひゅ',k:'ヒュ',r:['hyu'],  row:'hya', col:2},
  {h:'ひょ',k:'ヒョ',r:['hyo'],  row:'hya', col:4},

  {h:'みゃ',k:'ミャ',r:['mya'],  row:'mya', col:0},
  {h:'みゅ',k:'ミュ',r:['myu'],  row:'mya', col:2},
  {h:'みょ',k:'ミョ',r:['myo'],  row:'mya', col:4},

  {h:'りゃ',k:'リャ',r:['rya'],  row:'rya', col:0},
  {h:'りゅ',k:'リュ',r:['ryu'],  row:'rya', col:2},
  {h:'りょ',k:'リョ',r:['ryo'],  row:'rya', col:4},

  {h:'ぎゃ',k:'ギャ',r:['gya'],  row:'gya', col:0},
  {h:'ぎゅ',k:'ギュ',r:['gyu'],  row:'gya', col:2},
  {h:'ぎょ',k:'ギョ',r:['gyo'],  row:'gya', col:4},

  {h:'じゃ',k:'ジャ',r:['ja','zya','jya'],  row:'ja', col:0},
  {h:'じゅ',k:'ジュ',r:['ju','zyu','jyu'],  row:'ja', col:2},
  {h:'じょ',k:'ジョ',r:['jo','zyo','jyo'],  row:'ja', col:4},

  {h:'びゃ',k:'ビャ',r:['bya'],  row:'bya', col:0},
  {h:'びゅ',k:'ビュ',r:['byu'],  row:'bya', col:2},
  {h:'びょ',k:'ビョ',r:['byo'],  row:'bya', col:4},

  {h:'ぴゃ',k:'ピャ',r:['pya'],  row:'pya', col:0},
  {h:'ぴゅ',k:'ピュ',r:['pyu'],  row:'pya', col:2},
  {h:'ぴょ',k:'ピョ',r:['pyo'],  row:'pya', col:4},
];

// id 省略時等於 r[0]。既有 46 清音全部落在這條預設上，
// 因此舊版存下的 localStorage 統計 key 一個都不會失效。
KANA.forEach(k => { if (!k.id) k.id = k.r[0]; });

const GROUPS = [
  {id:'sei',     label:'清音'},
  {id:'daku',    label:'濁音'},
  {id:'handaku', label:'半濁音'},
  {id:'yo',      label:'拗音'},
];

const ROWS = [
  {id:'a',  label:'あ行', g:'sei'}, {id:'ka', label:'か行', g:'sei'},
  {id:'sa', label:'さ行', g:'sei'}, {id:'ta', label:'た行', g:'sei'},
  {id:'na', label:'な行', g:'sei'}, {id:'ha', label:'は行', g:'sei'},
  {id:'ma', label:'ま行', g:'sei'}, {id:'ya', label:'や行', g:'sei'},
  {id:'ra', label:'ら行', g:'sei'}, {id:'wa', label:'わ行', g:'sei'},
  {id:'n',  label:'ん',   g:'sei'},

  {id:'ga', label:'が行', g:'daku'}, {id:'za', label:'ざ行', g:'daku'},
  {id:'da', label:'だ行', g:'daku'}, {id:'ba', label:'ば行', g:'daku'},

  {id:'pa', label:'ぱ行', g:'handaku'},

  {id:'kya', label:'きゃ行', g:'yo'}, {id:'sha', label:'しゃ行', g:'yo'},
  {id:'cha', label:'ちゃ行', g:'yo'}, {id:'nya', label:'にゃ行', g:'yo'},
  {id:'hya', label:'ひゃ行', g:'yo'}, {id:'mya', label:'みゃ行', g:'yo'},
  {id:'rya', label:'りゃ行', g:'yo'}, {id:'gya', label:'ぎゃ行', g:'yo'},
  {id:'ja',  label:'じゃ行', g:'yo'}, {id:'bya', label:'びゃ行', g:'yo'},
  {id:'pya', label:'ぴゃ行', g:'yo'},
];

// 每行的第一個假名（ざ行 → ざ），供同音字的區別提示使用
const rowHead = new Map();
for (const k of KANA) if (!rowHead.has(k.row)) rowHead.set(k.row, k.h);

/**
 * 顯示用羅馬字。同音字（じ/ぢ、ず/づ）主寫法相同，光看 "ji" 無從分辨要寫哪個，
 * 因此補上所屬行的行首假名 → "ji・ざ" / "ji・だ"。
 * 不用第二羅馬字當提示，因為 ず 根本沒有第二寫法。
 */
function romajiLabel(k) {
  return k.hom ? k.r[0] + '・' + rowHead.get(k.row) : k.r[0];
}

global.KANA_DATA = { KANA, ROWS, GROUPS, romajiLabel };

})(window);
