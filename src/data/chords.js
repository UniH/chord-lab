/* ════════════════════════════════════════════════════════════════════════════
 *  CHORD LAB 教材資料 —— 整個網站的內容都在下面這一個物件裡,改這裡就好。
 *
 *  ▸ 和弦寫法
 *      frets   : 由第 6 弦(最粗)寫到第 1 弦。x = 不彈,0 = 空弦。
 *                都是個位數時可連寫 'x32010';有 10 格以上請用空白分隔 'x x 10 12 13 12'
 *      fingers : 同樣由第 6 弦到第 1 弦。1 食指 2 中指 3 無名指 4 小指,0 或 x = 不按
 *                同一根手指按同一格的多條弦,會自動畫成封閉(橫按)
 *      root    : 根音音名(C、F#、Bb…)。音名與級數會由程式自動算出,不用自己填
 *      bass    : (選填)配樂時貝斯要彈的音,不寫就彈 root
 *      tip     : (選填)顯示在和弦圖下方的小提示
 *
 *  ▸ 譜例寫法(score.tex)使用 alphaTex:「琴格.弦.時值」
 *      3.5.4      = 第 5 弦第 3 格、四分音符
 *      :8         = 之後的音都是八分音符
 *      (3.5 0.1)  = 同時彈(和弦)   r = 休止符   | = 小節線
 *      {ch "C"}   = 在該拍上方標和弦名
 *      文件:https://alphatab.net/docs/alphatex/introduction
 *
 *  ▸ 配樂(progressions)的 bars 每一格是一個小節,填和弦的 id
 *      常見和弦放在 library(id 就是和弦名,例如 'Am'、'F#m7'),直接拿來用
 *  ▸ 鼓的節奏(drumPatterns)每個字元是一個 16 分音符,x = 打,. = 不打
 * ════════════════════════════════════════════════════════════════════════════ */
export const CHORD_LAB = {
  // 調弦:第 6 弦 → 第 1 弦
  tuning: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],

  /* ──────────────────────────── 四個學習單元 ──────────────────────────── */
  units: [
    /* ═══════════ 單元 1:CAGED ═══════════ */
    {
      id: 'caged',
      no: '01',
      title: 'CAGED 系統',
      subtitle: '把整條指板串起來的五個指型',
      intro: [
        '你已經會的封閉和弦,其實就是把開放和弦 E 和 A「整個往上搬」。CAGED 只是把這件事做完:C、A、G、E、D 五個開放指型都可以往上搬,而且它們會依照 C→A→G→E→D 的順序首尾相接,鋪滿整條指板。',
        '重點不是把五個大指型都按滿(G 型和 C 型的完整封閉很難按,也很少人真的這樣彈),而是記住「每個指型的根音在哪條弦」。之後的三和弦、色彩和弦,全部都是從這五個指型裡拆出來的小片段。',
      ],
      sections: [
        {
          id: 'caged-open',
          title: '五個開放指型',
          text: '先確認這五個開放和弦,並留意粉紅色的根音分別落在哪幾條弦上:C 型與 A 型的最低根音在第 5 弦,G 型與 E 型在第 6 弦,D 型在第 4 弦。',
          chords: [
            { id: 'open-C', name: 'C', label: 'C 型', frets: 'x32010', fingers: 'x32010', root: 'C' },
            { id: 'open-A', name: 'A', label: 'A 型', frets: 'x02220', fingers: 'x01230', root: 'A' },
            { id: 'open-G', name: 'G', label: 'G 型', frets: '320003', fingers: '210003', root: 'G' },
            { id: 'open-E', name: 'E', label: 'E 型', frets: '022100', fingers: '023100', root: 'E' },
            { id: 'open-D', name: 'D', label: 'D 型', frets: 'xx0232', fingers: 'xx0132', root: 'D' },
          ],
        },
        {
          id: 'caged-c',
          title: '同一個 C 和弦的五個位置',
          text: '同樣是 C 和弦,從低把位到高把位依序用 C 型→A 型→G 型→E 型→D 型。相鄰兩個指型會共用根音:前一個指型的最高格,就是下一個指型的起點。',
          chords: [
            { id: 'C-c', name: 'C', label: 'C 型', frets: 'x32010', fingers: 'x32010', root: 'C' },
            { id: 'C-a', name: 'C', label: 'A 型', frets: 'x35553', fingers: 'x13331', root: 'C', tip: '你已經會的 5 弦根音封閉和弦' },
            { id: 'C-g', name: 'C', label: 'G 型(實用片段)', frets: 'x7555x', fingers: 'x3111x', root: 'C', bass: 'E', tip: '完整的 G 型是 8-7-5-5-5-8,實際上多半只用中間這四條弦' },
            { id: 'C-e', name: 'C', label: 'E 型', frets: '8 10 10 9 8 8', fingers: '134211', root: 'C', tip: '你已經會的 6 弦根音封閉和弦' },
            { id: 'C-d', name: 'C', label: 'D 型', frets: 'x x 10 12 13 12', fingers: 'xx1342', root: 'C', tip: '根音在第 4 弦,上面三條弦就是單元 2 的三和弦' },
          ],
          score: {
            title: '譜例 1-1|C 和弦的五個位置',
            tex: `\\tempo 60
.
\\track "Guitar" \\staff{score tabs} \\tuning E4 B3 G3 D3 A2 E2
:1 (3.5 2.4 0.3 1.2 0.1){ch "C 型"} | (3.5 5.4 5.3 5.2 3.1){ch "A 型"} | (7.5 5.4 5.3 5.2){ch "G 型"} | (8.6 10.5 10.4 9.3 8.2 8.1){ch "E 型"} | (10.4 12.3 13.2 12.1){ch "D 型"}`,
          },
        },
        {
          id: 'caged-explorer',
          title: '指板總覽:換個根音看看',
          text: '選一個根音,看五個指型怎麼鋪在指板上。按上方的指型按鈕可以單獨看某一個指型,再按一次回到全部。',
          widget: 'caged',
        },
        {
          id: 'caged-minor',
          title: '小和弦:三個實用指型',
          text: '小和弦同樣有五個指型,但實際好按的是 Em 型、Am 型、Dm 型這三個,Cm 型通常只按中間四條弦。以 Am 為例:',
          chords: [
            { id: 'Am-a', name: 'Am', label: 'Am 型', frets: 'x02210', fingers: 'x02310', root: 'A' },
            { id: 'Am-e', name: 'Am', label: 'Em 型', frets: '577555', fingers: '134111', root: 'A' },
            { id: 'Am-d', name: 'Am', label: 'Dm 型', frets: 'x x 7 9 10 8', fingers: 'xx1342', root: 'A' },
            { id: 'Am-c', name: 'Am', label: 'Cm 型(片段)', frets: 'x 12 10 9 10 x', fingers: 'x4213x', root: 'A' },
          ],
        },
      ],
    },

    /* ═══════════ 單元 2:三和弦與轉位 ═══════════ */
    {
      id: 'triads',
      no: '02',
      title: '三和弦與轉位',
      subtitle: '上方三條弦的大、小三和弦',
      intro: [
        '三和弦只有三個音:根音(R)、三度(3)、五度(5)。把這三個音放在相鄰的三條弦上,依照「哪個音在最低」分成三種排列:根音位置(R-3-5)、第一轉位(3-5-R)、第二轉位(5-R-3)。',
        '在瞪鞋與後搖裡,另一把吉他或貝斯通常已經負責低音,所以你只需要在高音弦上彈這三個音。音少,加上殘響和延遲之後反而更清楚、更有空間。每個指型都是從 CAGED 拆下來的:根音位置來自 A 型,第一轉位來自 E 型,第二轉位來自 D 型。',
      ],
      sections: [
        {
          id: 'tri-major',
          title: '大三和弦(1-2-3 弦)',
          text: '以 C 為例。三個指型沿著指板往上,音都一樣是 C、E、G,只是最低音不同。',
          chords: [
            { id: 'tri-C-root', name: 'C', label: '根音位置 R-3-5', frets: 'xxx553', fingers: 'xxx341', root: 'C', tip: '來自 A 型封閉和弦的上三弦' },
            { id: 'tri-C-1st', name: 'C/E', label: '第一轉位 3-5-R', frets: 'xxx988', fingers: 'xxx211', root: 'C', bass: 'C', tip: '來自 E 型封閉和弦的上三弦' },
            { id: 'tri-C-2nd', name: 'C/G', label: '第二轉位 5-R-3', frets: 'x x x 12 13 12', fingers: 'xxx132', root: 'C', bass: 'C', tip: '就是開放 D 和弦的指型' },
          ],
        },
        {
          id: 'tri-minor',
          title: '小三和弦(1-2-3 弦)',
          text: '把大三和弦的三度降半音就是小三和弦。對照上面的 C,看看每個指型裡是哪一個音往下移了一格。',
          chords: [
            { id: 'tri-Cm-root', name: 'Cm', label: '根音位置 R-♭3-5', frets: 'xxx543', fingers: 'xxx321', root: 'C' },
            { id: 'tri-Cm-1st', name: 'Cm/E♭', label: '第一轉位 ♭3-5-R', frets: 'xxx888', fingers: 'xxx111', root: 'C', bass: 'C' },
            { id: 'tri-Cm-2nd', name: 'Cm/G', label: '第二轉位 5-R-♭3', frets: 'x x x 12 13 11', fingers: 'xxx231', root: 'C', bass: 'C' },
          ],
          score: {
            title: '譜例 2-1|C 大三和弦的三個轉位',
            tex: `\\tempo 72
.
\\track "Guitar" \\staff{score tabs} \\tuning E4 B3 G3 D3 A2 E2
:8 5.3{ch "根音位置"} 5.2 3.1 5.2 5.3 5.2 3.1 5.2 | 9.3{ch "第一轉位"} 8.2 8.1 8.2 9.3 8.2 8.1 8.2 | 12.3{ch "第二轉位"} 13.2 12.1 13.2 12.3 13.2 12.1 13.2 | (12.3 13.2 12.1).1`,
          },
        },
        {
          id: 'tri-explorer',
          title: '指板總覽:任何調的三個轉位',
          text: '選根音、大小調與弦組,看三個轉位在指板上的位置。點下方的轉位名稱可以試聽。',
          widget: 'triads',
        },
        {
          id: 'tri-234',
          title: '2-3-4 弦組',
          text: '同樣的三種排列搬到第 2、3、4 弦上,聲音比較厚,和空弦持續音(單元 4)特別合。',
          chords: [
            { id: 'tri234-C-1st', name: 'C/E', label: '第一轉位', frets: 'xx201x', fingers: 'xx201x', root: 'C', bass: 'C' },
            { id: 'tri234-C-2nd', name: 'C/G', label: '第二轉位', frets: 'xx555x', fingers: 'xx111x', root: 'C', bass: 'C' },
            { id: 'tri234-C-root', name: 'C', label: '根音位置', frets: 'x x 10 9 8 x', fingers: 'xx321x', root: 'C' },
            { id: 'tri234-Cm-1st', name: 'Cm/E♭', label: '第一轉位', frets: 'xx101x', fingers: 'xx102x', root: 'C', bass: 'C' },
            { id: 'tri234-Cm-2nd', name: 'Cm/G', label: '第二轉位', frets: 'xx554x', fingers: 'xx231x', root: 'C', bass: 'C' },
            { id: 'tri234-Cm-root', name: 'Cm', label: '根音位置', frets: 'x x 10 8 8 x', fingers: 'xx311x', root: 'C' },
          ],
        },
        {
          id: 'tri-voice-leading',
          title: '最近轉位連接:C – Am – F – G',
          text: '換和弦時不要跳把位,而是找「離現在最近」的那個轉位。這四個和弦全部落在第 5 到 8 格之間,手幾乎不用移動,聲音也最連貫。',
          chords: [
            { id: 'vl-C', name: 'C', label: '根音位置', frets: 'xxx553', fingers: 'xxx341', root: 'C' },
            { id: 'vl-Am', name: 'Am', label: '第一轉位', frets: 'xxx555', fingers: 'xxx111', root: 'A' },
            { id: 'vl-F', name: 'F', label: '第二轉位', frets: 'xxx565', fingers: 'xxx121', root: 'F' },
            { id: 'vl-G', name: 'G', label: '第二轉位', frets: 'xxx787', fingers: 'xxx121', root: 'G' },
          ],
          score: {
            title: '譜例 2-2|C – Am – F – G 最近轉位',
            tex: `\\tempo 84
.
\\track "Guitar" \\staff{score tabs} \\tuning E4 B3 G3 D3 A2 E2
:8 5.3{ch "C"} 5.2 3.1 5.2 5.3 5.2 3.1 5.2 | 5.3{ch "Am"} 5.2 5.1 5.2 5.3 5.2 5.1 5.2 | 5.3{ch "F"} 6.2 5.1 6.2 5.3 6.2 5.1 6.2 | 7.3{ch "G"} 8.2 7.1 8.2 7.3 8.2 7.1 8.2`,
          },
        },
      ],
    },

    /* ═══════════ 單元 3:色彩和弦 ═══════════ */
    {
      id: 'colors',
      no: '03',
      title: '色彩和弦',
      subtitle: 'add9、sus2、sus4、maj7、m7 的小型和弦',
      intro: [
        '這五種和弦是瞪鞋與夢幻流行最常聽到的顏色。sus2 與 sus4 把三度換成二度或四度,聽起來懸浮、不分大小調;add9 在大三和弦上多加一個九度,明亮又帶一點擁擠;maj7 柔軟朦朧;m7 比小三和弦溫和。',
        '看級數會比背指型更快:切到「級數」標示,你會發現每個和弦都只是把某一根手指移動一格。',
      ],
      sections: [
        {
          id: 'col-open',
          title: '開放把位的經典指型',
          text: '這些指型帶有空弦,延音最長,加上殘響後效果最好。先從 D 與 A 兩組開始:手指只動一格,就在 sus2、大三和弦、sus4 之間切換。',
          chords: [
            { id: 'open-Dsus2', name: 'Dsus2', frets: 'xx0230', fingers: 'xx0130', root: 'D' },
            { id: 'open-D2', name: 'D', frets: 'xx0232', fingers: 'xx0132', root: 'D' },
            { id: 'open-Dsus4', name: 'Dsus4', frets: 'xx0233', fingers: 'xx0134', root: 'D' },
            { id: 'open-Dmaj7', name: 'Dmaj7', frets: 'xx0222', fingers: 'xx0111', root: 'D' },
            { id: 'open-Asus2', name: 'Asus2', frets: 'x02200', fingers: 'x01200', root: 'A' },
            { id: 'open-Asus4', name: 'Asus4', frets: 'x02230', fingers: 'x01240', root: 'A' },
            { id: 'open-Aadd9', name: 'Aadd9', frets: 'x02420', fingers: 'x01310', root: 'A', tip: '食指橫按第 2 格,無名指伸到第 4 格' },
            { id: 'open-Am7', name: 'Am7', frets: 'x02010', fingers: 'x02010', root: 'A' },
            { id: 'open-Cadd9', name: 'Cadd9', frets: 'x32030', fingers: 'x21030', root: 'C' },
            { id: 'open-Cmaj7', name: 'Cmaj7', frets: 'x32000', fingers: 'x32000', root: 'C' },
            { id: 'open-Fmaj7', name: 'Fmaj7', frets: 'xx3210', fingers: 'xx3210', root: 'F' },
            { id: 'open-Esus4', name: 'Esus4', frets: '022200', fingers: '023400', root: 'E' },
            { id: 'open-Eadd9', name: 'Eadd9', frets: '024100', fingers: '024100', root: 'E', tip: '小指要伸到第 4 弦第 4 格' },
            { id: 'open-Em7', name: 'Em7', frets: '022030', fingers: '012030', root: 'E' },
          ],
          score: {
            title: '譜例 3-1|Cadd9 – Cmaj7 – Am7 – Fmaj7',
            tex: `\\tempo 76
.
\\track "Guitar" \\staff{score tabs} \\tuning E4 B3 G3 D3 A2 E2
:8 3.5{ch "Cadd9"} 2.4 0.3 3.2 0.1 3.2 0.3 2.4 | 3.5{ch "Cmaj7"} 2.4 0.3 0.2 0.1 0.2 0.3 2.4 | 0.5{ch "Am7"} 2.4 0.3 1.2 0.1 1.2 0.3 2.4 | 3.4{ch "Fmaj7"} 2.3 1.2 0.1 1.2 2.3 3.4 2.3`,
          },
        },
        {
          id: 'col-5th',
          title: '第 5 弦根音(可移動)',
          text: '從你會的 A 型封閉和弦出發,每次只改一個音。以 C(第 3 格)為例,整個指型可以平移到任何調。',
          chords: [
            { id: 'a5-Csus2', name: 'Csus2', frets: 'x35533', fingers: 'x13411', root: 'C' },
            { id: 'a5-Csus4', name: 'Csus4', frets: 'x35563', fingers: 'x13341', root: 'C' },
            { id: 'a5-Cmaj7', name: 'Cmaj7', frets: 'x35453', fingers: 'x13241', root: 'C' },
            { id: 'a5-Cm7', name: 'Cm7', frets: 'x35343', fingers: 'x13121', root: 'C' },
          ],
        },
        {
          id: 'col-4th',
          title: '第 4 弦根音的四弦小型和弦(可移動)',
          text: '只用上面四條弦,不需要大封閉。以 F(第 4 弦第 3 格)為例。這組最適合疊在貝斯或另一把吉他上面。',
          chords: [
            { id: 'd4-Fsus2', name: 'Fsus2', frets: 'xx3563', fingers: 'xx1341', root: 'F' },
            { id: 'd4-Fsus4', name: 'Fsus4', frets: 'xx3566', fingers: 'xx1344', root: 'F' },
            { id: 'd4-Fmaj7', name: 'Fmaj7', frets: 'xx3555', fingers: 'xx1333', root: 'F' },
            { id: 'd4-Fm7', name: 'Fm7', frets: 'xx3544', fingers: 'xx1322', root: 'F' },
            { id: 'd4-Fadd9', name: 'Fadd9', frets: 'xx3213', fingers: 'xx3214', root: 'F', tip: '2-3-4 弦的根音位置三和弦,再用小指加上九度' },
          ],
        },
        {
          id: 'col-top3',
          title: '上三弦的三音版本',
          text: '直接從單元 2 的 C 根音位置三和弦(xxx553)改一個音。maj7 與 m7 的三音版本不彈根音,把根音留給貝斯,這是讓和弦聽起來「飄」的常用手法。',
          chords: [
            { id: 't3-Csus2', name: 'Csus2', frets: 'xxx533', fingers: 'xxx311', root: 'C' },
            { id: 't3-C', name: 'C', frets: 'xxx553', fingers: 'xxx341', root: 'C' },
            { id: 't3-Csus4', name: 'Csus4', frets: 'xxx563', fingers: 'xxx341', root: 'C' },
            { id: 't3-Cadd9', name: 'Cadd9', label: '3-5-9', frets: 'x x x 9 8 10', fingers: 'xxx214', root: 'C' },
            { id: 't3-Cmaj7', name: 'Cmaj7', label: '無根音 7-3-5', frets: 'xxx453', fingers: 'xxx231', root: 'C' },
            { id: 't3-Cm7', name: 'Cm7', label: '無根音 ♭3-5-♭7', frets: 'xxx886', fingers: 'xxx341', root: 'C' },
          ],
        },
      ],
    },

    /* ═══════════ 單元 4:空弦持續音 ═══════════ */
    {
      id: 'drones',
      no: '04',
      title: '空弦持續音',
      subtitle: '讓空弦一直響,只移動其他的音',
      intro: [
        '這是最有這類曲風聲響的技巧:讓一兩條空弦從頭到尾持續響著,左手只移動其餘的音。空弦不變、和弦在變,兩者之間的距離一直改變,就會產生一連串你很難用一般指型按出來的和聲。',
        '練習時不用急著記和弦名稱。先讓空弦確實響滿,再去聽每一個位置的顏色。到「Drone」頁面開一個持續音,一邊聽一邊彈會更有感覺。',
      ],
      sections: [
        {
          id: 'dr-e-slide',
          title: 'E 型往上滑,第 1、2 弦保持空弦',
          text: '按 E 和弦時只留下第 6、5、4、3 弦的手指,整個指型往上滑,第 1、2 弦(E 與 B)永遠空弦。同一個手型,六個位置就是六個不同的和弦,而且全部都在 E 大調裡。',
          chords: [
            { id: 'es-E', name: 'E', frets: '022100', fingers: '023100', root: 'E' },
            { id: 'es-F#m11', name: 'F♯m11', frets: '244200', fingers: '134100', root: 'F#' },
            { id: 'es-G#m', name: 'Emaj7/G♯', frets: '466400', fingers: '134100', root: 'E', bass: 'G#' },
            { id: 'es-Aadd9', name: 'Aadd9', frets: '577600', fingers: '134200', root: 'A' },
            { id: 'es-Badd11', name: 'Badd11', frets: '799800', fingers: '134200', root: 'B' },
            { id: 'es-C#m7', name: 'C♯m7', frets: '9 11 11 9 0 0', fingers: '134100', root: 'C#' },
          ],
          score: {
            title: '譜例 4-1|E – F♯m11 – Aadd9 – Badd11',
            tex: `\\tempo 92
.
\\track "Guitar" \\staff{score tabs} \\tuning E4 B3 G3 D3 A2 E2
:8 0.6{ch "E"} 2.5 2.4 1.3 0.2 0.1 0.2 1.3 | 2.6{ch "F♯m11"} 4.5 4.4 2.3 0.2 0.1 0.2 2.3 | 5.6{ch "Aadd9"} 7.5 7.4 6.3 0.2 0.1 0.2 6.3 | 7.6{ch "Badd11"} 9.5 9.4 8.3 0.2 0.1 0.2 8.3`,
          },
        },
        {
          id: 'dr-a-slide',
          title: '兩根手指往上滑,第 1、2 弦保持空弦',
          text: '更簡單的版本:只按第 4、3 弦同一格,第 5 弦跟著移動當低音。兩根手指就能彈出一整段進行。',
          chords: [
            { id: 'as-Asus2', name: 'Asus2', frets: 'x02200', fingers: 'x01200', root: 'A' },
            { id: 'as-Bsus4', name: 'Bsus4', frets: 'x24400', fingers: 'x13400', root: 'B' },
            { id: 'as-C#m7', name: 'C♯m7', frets: 'x46600', fingers: 'x13400', root: 'C#' },
            { id: 'as-D6sus2', name: 'D6sus2', frets: 'x57700', fingers: 'x13400', root: 'D' },
            { id: 'as-E5', name: 'E5', frets: 'x79900', fingers: 'x13400', root: 'E' },
            { id: 'as-F#7sus4', name: 'F♯7sus4', frets: 'x 9 11 11 0 0', fingers: 'x13400', root: 'F#' },
          ],
        },
        {
          id: 'dr-d-thirds',
          title: '空 D 弦 + 移動的三度音程',
          text: '第 4 弦空弦(D)當持續音,第 3、2 弦彈 D 大調的三度雙音,沿著指板上下移動。這是後搖常見的寫法:低音不動,上面兩個音像旋律一樣走。',
          chords: [
            { id: 'dd-1', name: 'D(A–C♯)', frets: 'xx022x', fingers: 'xx011x', root: 'D' },
            { id: 'dd-2', name: 'D(B–D)', frets: 'xx043x', fingers: 'xx021x', root: 'D' },
            { id: 'dd-3', name: 'D(C♯–E)', frets: 'xx065x', fingers: 'xx021x', root: 'D' },
            { id: 'dd-4', name: 'D(D–F♯)', frets: 'xx077x', fingers: 'xx011x', root: 'D' },
            { id: 'dd-5', name: 'D(E–G)', frets: 'xx098x', fingers: 'xx021x', root: 'D' },
            { id: 'dd-6', name: 'D(F♯–A)', frets: 'x x 0 11 10 x', fingers: 'xx021x', root: 'D' },
          ],
          score: {
            title: '譜例 4-2|空 D 弦上的三度音程',
            tex: `\\tempo 100
.
\\track "Guitar" \\staff{score tabs} \\tuning E4 B3 G3 D3 A2 E2
:8 0.4 (2.3 2.2) 0.4 (2.3 2.2) 0.4 (4.3 3.2) 0.4 (4.3 3.2) | 0.4 (6.3 5.2) 0.4 (6.3 5.2) 0.4 (7.3 7.2) 0.4 (7.3 7.2) | 0.4 (9.3 8.2) 0.4 (9.3 8.2) 0.4 (7.3 7.2) 0.4 (7.3 7.2) | 0.4 (6.3 5.2) 0.4 (4.3 3.2) (0.4 2.3 2.2).2`,
          },
        },
        {
          id: 'dr-top-pedal',
          title: '反過來:上方兩個音固定,下面移動',
          text: '無名指與小指固定按住第 2、1 弦的第 3 格(D 與 G),只換下面的音。上方兩個音在每個和弦裡扮演不同角色,整段進行聽起來像一片連續的音牆。',
          chords: [
            { id: 'tp-G', name: 'G', frets: '320033', fingers: '210034', root: 'G' },
            { id: 'tp-Cadd9', name: 'Cadd9', frets: 'x32033', fingers: 'x21034', root: 'C' },
            { id: 'tp-Em7', name: 'Em7', frets: '022033', fingers: '012034', root: 'E' },
            { id: 'tp-Dsus4', name: 'Dsus4', frets: 'xx0233', fingers: 'xx0134', root: 'D' },
            { id: 'tp-A7sus4', name: 'A7sus4', frets: 'x02033', fingers: 'x01034', root: 'A' },
          ],
        },
      ],
    },
  ],

  /* ──────────────── CAGED 指型範本(指板總覽用) ────────────────
   * frets  : 相對於「基準格」的格數,第 6 弦 → 第 1 弦,x = 不彈
   * rootOn : 最低根音所在的弦   rootAt : 該根音相對於基準格的格數 */
  cagedShapes: {
    major: [
      { shape: 'C', frets: 'x32010', rootOn: 5, rootAt: 3 },
      { shape: 'A', frets: 'x02220', rootOn: 5, rootAt: 0 },
      { shape: 'G', frets: '320003', rootOn: 6, rootAt: 3 },
      { shape: 'E', frets: '022100', rootOn: 6, rootAt: 0 },
      { shape: 'D', frets: 'xx0232', rootOn: 4, rootAt: 0 },
    ],
    minor: [
      { shape: 'C', frets: 'x3101x', rootOn: 5, rootAt: 3 },
      { shape: 'A', frets: 'x02210', rootOn: 5, rootAt: 0 },
      { shape: 'G', frets: '310033', rootOn: 6, rootAt: 3 },
      { shape: 'E', frets: '022000', rootOn: 6, rootAt: 0 },
      { shape: 'D', frets: 'xx0231', rootOn: 4, rootAt: 0 },
    ],
  },

  /* ──────────────────────────── 配樂用的和弦庫 ────────────────────────────
   * 配樂裡會用到、但四個單元沒有教的常見和弦。id 就是和弦名稱,
   * 同一個和弦有第二個把位時寫成「名稱@琴格」(例如 Dm7@5 是第 5 格的 Dm7)。 */
  library: [
    // 大三和弦
    { id: 'C', name: 'C', frets: 'x32010', fingers: 'x32010', root: 'C' },
    { id: 'D', name: 'D', frets: 'xx0232', fingers: 'xx0132', root: 'D' },
    { id: 'E', name: 'E', frets: '022100', fingers: '023100', root: 'E' },
    { id: 'F', name: 'F', frets: '133211', fingers: '134211', root: 'F' },
    { id: 'G', name: 'G', frets: '320003', fingers: '210003', root: 'G' },
    { id: 'A', name: 'A', frets: 'x02220', fingers: 'x01230', root: 'A' },
    { id: 'B', name: 'B', frets: 'x24442', fingers: 'x13331', root: 'B' },
    { id: 'Bb', name: 'B♭', frets: 'x13331', fingers: 'x13331', root: 'Bb' },
    { id: 'Bb@6', name: 'B♭', frets: '688766', fingers: '134211', root: 'Bb' },
    { id: 'Eb', name: 'E♭', frets: 'x68886', fingers: 'x13331', root: 'Eb' },
    { id: 'Ab', name: 'A♭', frets: '466544', fingers: '134211', root: 'Ab' },
    // 小三和弦
    { id: 'Am', name: 'Am', frets: 'x02210', fingers: 'x02310', root: 'A' },
    { id: 'Em', name: 'Em', frets: '022000', fingers: '023000', root: 'E' },
    { id: 'Dm', name: 'Dm', frets: 'xx0231', fingers: 'xx0231', root: 'D' },
    { id: 'Bm', name: 'Bm', frets: 'x24432', fingers: 'x13421', root: 'B' },
    { id: 'F#m', name: 'F♯m', frets: '244222', fingers: '134111', root: 'F#' },
    { id: 'C#m', name: 'C♯m', frets: 'x46654', fingers: 'x13421', root: 'C#' },
    { id: 'G#m', name: 'G♯m', frets: '466444', fingers: '134111', root: 'G#' },
    { id: 'Cm', name: 'Cm', frets: 'x35543', fingers: 'x13421', root: 'C' },
    { id: 'Fm', name: 'Fm', frets: '133111', fingers: '134111', root: 'F' },
    // 屬七
    { id: 'A7', name: 'A7', frets: 'x02020', fingers: 'x02030', root: 'A' },
    { id: 'B7', name: 'B7', frets: 'x21202', fingers: 'x21304', root: 'B' },
    { id: 'C7', name: 'C7', frets: 'x32310', fingers: 'x32410', root: 'C' },
    { id: 'D7', name: 'D7', frets: 'xx0212', fingers: 'xx0213', root: 'D' },
    { id: 'E7', name: 'E7', frets: '020100', fingers: '020100', root: 'E' },
    { id: 'G7', name: 'G7', frets: '320001', fingers: '320001', root: 'G' },
    { id: 'F7', name: 'F7', frets: '131211', fingers: '131211', root: 'F' },
    { id: 'Bb7', name: 'B♭7', frets: 'x13131', fingers: 'x13141', root: 'Bb' },
    { id: 'D7@5', name: 'D7', frets: 'x57575', fingers: 'x13141', root: 'D' },
    { id: 'G7@3', name: 'G7', frets: '353433', fingers: '131211', root: 'G' },
    // 大七
    { id: 'Cmaj7', name: 'Cmaj7', frets: 'x32000', fingers: 'x32000', root: 'C' },
    { id: 'Cmaj7@3', name: 'Cmaj7', frets: 'x35453', fingers: 'x13241', root: 'C' },
    { id: 'Dmaj7', name: 'Dmaj7', frets: 'xx0222', fingers: 'xx0111', root: 'D' },
    { id: 'Dmaj7@5', name: 'Dmaj7', frets: 'x57675', fingers: 'x13241', root: 'D' },
    { id: 'Emaj7', name: 'Emaj7', frets: '021100', fingers: '031200', root: 'E' },
    { id: 'Fmaj7', name: 'Fmaj7', frets: 'xx3210', fingers: 'xx3210', root: 'F' },
    { id: 'Gmaj7', name: 'Gmaj7', frets: '320002', fingers: '210003', root: 'G' },
    { id: 'Amaj7', name: 'Amaj7', frets: 'x02120', fingers: 'x02130', root: 'A' },
    // 小七
    { id: 'Am7', name: 'Am7', frets: 'x02010', fingers: 'x02010', root: 'A' },
    { id: 'Am7@5', name: 'Am7', frets: '575555', fingers: '131111', root: 'A' },
    { id: 'Em7', name: 'Em7', frets: '022030', fingers: '012030', root: 'E' },
    { id: 'Dm7', name: 'Dm7', frets: 'xx0211', fingers: 'xx0211', root: 'D' },
    { id: 'Dm7@5', name: 'Dm7', frets: 'x57565', fingers: 'x13121', root: 'D' },
    { id: 'Bm7', name: 'Bm7', frets: 'x24232', fingers: 'x13121', root: 'B' },
    { id: 'C#m7', name: 'C♯m7', frets: 'x46454', fingers: 'x13121', root: 'C#' },
    { id: 'Gm7', name: 'Gm7', frets: '353333', fingers: '131111', root: 'G' },
    // 其他色彩
    { id: 'Dsus2', name: 'Dsus2', frets: 'xx0230', fingers: 'xx0130', root: 'D' },
    { id: 'Dsus4', name: 'Dsus4', frets: 'xx0233', fingers: 'xx0134', root: 'D' },
    { id: 'Asus2', name: 'Asus2', frets: 'x02200', fingers: 'x01200', root: 'A' },
    { id: 'Asus4', name: 'Asus4', frets: 'x02230', fingers: 'x01240', root: 'A' },
    { id: 'Emadd9', name: 'Emadd9', frets: '024000', fingers: '013000', root: 'E' },
    { id: 'AmMaj7', name: 'Am(maj7)', frets: 'x02110', fingers: 'x03120', root: 'A' },
    { id: 'Am6', name: 'Am6', frets: 'x02212', fingers: 'x02314', root: 'A' },
    { id: 'Bm7b5', name: 'Bm7♭5', frets: 'x2323x', fingers: 'x1324x', root: 'B' },
    { id: 'F#m7b5', name: 'F♯m7♭5', frets: '2x221x', fingers: '2x341x', root: 'F#' },
    { id: 'E9', name: 'E9', frets: 'x7677x', fingers: 'x2134x', root: 'E' },
    { id: 'D9', name: 'D9', frets: 'x5455x', fingers: 'x2134x', root: 'D' },
    { id: 'E7#9', name: 'E7♯9', frets: 'x7678x', fingers: 'x2134x', root: 'E' },
    // 強力和弦
    { id: 'E5', name: 'E5', frets: '022xxx', fingers: '011xxx', root: 'E' },
    { id: 'A5', name: 'A5', frets: 'x022xx', fingers: 'x011xx', root: 'A' },
    { id: 'D5', name: 'D5', frets: 'x577xx', fingers: 'x134xx', root: 'D' },
    { id: 'G5', name: 'G5', frets: '355xxx', fingers: '134xxx', root: 'G' },
    { id: 'F5', name: 'F5', frets: '133xxx', fingers: '134xxx', root: 'F' },
    { id: 'Bb5', name: 'B♭5', frets: 'x133xx', fingers: 'x134xx', root: 'Bb' },
    { id: 'Ab5', name: 'A♭5', frets: '466xxx', fingers: '134xxx', root: 'Ab' },
    { id: 'Db5', name: 'D♭5', frets: 'x466xx', fingers: 'x134xx', root: 'Db' },
  ],

  /* ──────────────────────────── 配樂 ────────────────────────────
   * bars  : 每一格是一個小節,填任何一個和弦的 id(各單元的和弦,或上面 library 的和弦)
   * style : 對應下面 drumPatterns 的名稱
   * cat   : 分類,對應 progressionCats 的 id */
  progressionCats: [
    { id: 'lesson', name: '單元練習' },
    { id: 'pop', name: '流行經典' },
    { id: 'gaze', name: '瞪鞋・夢幻' },
    { id: 'post', name: '後搖' },
    { id: 'psych', name: '迷幻・調式' },
    { id: 'indie', name: '獨立・民謠' },
    { id: 'rock', name: '搖滾' },
    { id: 'minor', name: '小調' },
    { id: 'groove', name: '藍調・放克・雷鬼' },
    { id: 'jazz', name: '爵士・Neo Soul' },
  ],
  progressions: [
    {
      id: 'bt-pedal',
      name: 'G – Cadd9 – Em7 – Dsus4',
      desc: '上方固定音的音牆進行。先跟著刷和弦,再試著只彈上三弦。',
      unit: 'drones',
      cat: 'lesson',
      bpm: 96,
      style: 'shoegaze',
      bars: ['tp-G', 'tp-G', 'tp-Cadd9', 'tp-Cadd9', 'tp-Em7', 'tp-Em7', 'tp-Dsus4', 'tp-Dsus4'],
    },
    {
      id: 'bt-eslide',
      name: 'E – Aadd9 – F♯m11 – Badd11',
      desc: 'E 型往上滑,第 1、2 弦保持空弦。',
      unit: 'drones',
      cat: 'lesson',
      bpm: 118,
      style: 'motorik',
      bars: ['es-E', 'es-E', 'es-Aadd9', 'es-Aadd9', 'es-F#m11', 'es-F#m11', 'es-Badd11', 'es-Badd11'],
    },
    {
      id: 'bt-colors',
      name: 'Cadd9 – Cmaj7 – Am7 – Fmaj7',
      desc: '開放把位的色彩和弦,慢速半拍感,適合練分解和弦。',
      unit: 'colors',
      cat: 'lesson',
      bpm: 76,
      style: 'halftime',
      bars: ['open-Cadd9', 'open-Cmaj7', 'open-Am7', 'open-Fmaj7'],
    },
    {
      id: 'bt-triads',
      name: 'C – Am – F – G(上三弦)',
      desc: '用最近轉位連接,手留在第 5 到 8 格。',
      unit: 'triads',
      cat: 'lesson',
      bpm: 104,
      style: 'shoegaze',
      bars: ['vl-C', 'vl-C', 'vl-Am', 'vl-Am', 'vl-F', 'vl-F', 'vl-G', 'vl-G'],
    },
    {
      id: 'bt-aslide',
      name: 'Asus2 – C♯m7 – D6sus2 – E5',
      desc: '6/8 拍的後搖進行,兩根手指往上滑,慢慢堆疊。',
      unit: 'drones',
      cat: 'lesson',
      bpm: 132,
      style: 'postrock68',
      bars: ['as-Asus2', 'as-Asus2', 'as-C#m7', 'as-C#m7', 'as-D6sus2', 'as-D6sus2', 'as-E5', 'as-E5'],
    },
    {
      id: 'bt-caged',
      name: 'C 的五個位置',
      desc: '每兩小節換一個指型:C 型→A 型→G 型→E 型→D 型。',
      unit: 'caged',
      cat: 'lesson',
      bpm: 80,
      style: 'halftime',
      bars: ['C-c', 'C-c', 'C-a', 'C-a', 'C-g', 'C-g', 'C-e', 'C-e', 'C-d', 'C-d'],
    },
    {
      id: 'bt-d-drone',
      name: 'D 持續音(自由練習)',
      desc: '只有 D 的鋪底與鼓。在上面彈空 D 弦加三度音程,或任何 D 大調的音。',
      unit: 'drones',
      cat: 'lesson',
      bpm: 100,
      style: 'halftime',
      bars: ['dd-4', 'dd-4', 'dd-4', 'dd-4'],
    },

    /* ── 以下是依風格分類的常用進行,和弦來自上面的 library 或各單元 ── */
    { id: 'pop-1564-g', name: 'G – D – Em – C', desc: '流行歌最常聽到的四個和弦(I–V–vi–IV)。', cat: 'pop', bpm: 104, style: 'pop8', bars: ['G', 'D', 'Em', 'C'] },
    { id: 'pop-6415', name: 'Am – F – C – G', desc: '同樣四個和弦從小調開始(vi–IV–I–V),情緒比較濃。', cat: 'pop', bpm: 92, style: 'ballad', bars: ['Am', 'F', 'C', 'G'] },
    { id: 'pop-1645', name: 'C – Am – F – G', desc: '五〇年代的老歌進行(I–vi–IV–V)。', cat: 'pop', bpm: 112, style: 'pop8', bars: ['C', 'Am', 'F', 'G'] },
    { id: 'pop-1465', name: 'G – C – Em – D', desc: 'I–IV–vi–V,副歌很常見的寫法。', cat: 'pop', bpm: 108, style: 'pop8', bars: ['G', 'C', 'Em', 'D'] },
    { id: 'pop-canon', name: 'D – A – Bm – F♯m – G – D – G – A', desc: '卡農進行,八小節一輪。練 Bm 與 F♯m 兩個封閉和弦。', cat: 'pop', bpm: 84, style: 'ballad', bars: ['D', 'A', 'Bm', 'F#m', 'G', 'D', 'G', 'A'] },
    { id: 'pop-4536', name: 'F – G – Em – Am', desc: '日系流行的「王道進行」(IV–V–iii–vi)。', cat: 'pop', bpm: 96, style: 'pop8', bars: ['F', 'G', 'Em', 'Am'] },
    { id: 'pop-6451', name: 'Am – F – G – C', desc: 'vi–IV–V–I,配四拍踩大鼓的舞曲感。', cat: 'pop', bpm: 126, style: 'fourfloor', bars: ['Am', 'F', 'G', 'C'] },
    { id: 'pop-1625', name: 'G – Em – Am – D', desc: 'I–vi–ii–V 循環,每個和弦都往下一個推。', cat: 'pop', bpm: 100, style: 'pop8', bars: ['G', 'Em', 'Am', 'D'] },
    { id: 'pop-1345', name: 'C – Em – F – G', desc: 'I–iii–IV–V,一路往上走的抒情進行。', cat: 'pop', bpm: 84, style: 'ballad', bars: ['C', 'Em', 'F', 'G'] },
    { id: 'pop-cliche', name: 'D – Dmaj7 – D7 – G', desc: '大調的線條下行:最高音 D→C♯→C→B,其他手指不動。', cat: 'pop', bpm: 96, style: 'pop8', bars: ['D', 'Dmaj7', 'D7', 'G'] },
    { id: 'pop-creep', name: 'G – B – C – Cm', desc: 'I–III–IV–iv。大和弦 B 與小和弦 Cm 是這段進行的味道所在。', cat: 'pop', bpm: 92, style: 'ballad', bars: ['G', 'B', 'C', 'Cm'] },
    { id: 'pop-e', name: 'E – B – C♯m – A', desc: 'E 大調的 I–V–vi–IV,練第 5 弦根音的封閉和弦。', cat: 'pop', bpm: 120, style: 'pop8', bars: ['E', 'B', 'C#m', 'A'] },
    { id: 'gz-maj7-e', name: 'Emaj7 – Amaj7', desc: '兩個 maj7 來回,夢幻流行的基本款。每個和弦兩小節。', cat: 'gaze', bpm: 84, style: 'dreampop', bars: ['Emaj7', 'Emaj7', 'Amaj7', 'Amaj7'] },
    { id: 'gz-maj7-d', name: 'Dmaj7 – Gmaj7', desc: 'D 大調的 I–IV,都加上大七度,適合慢慢分解。', cat: 'gaze', bpm: 78, style: 'halftime', bars: ['Dmaj7', 'Dmaj7', 'Gmaj7', 'Gmaj7'] },
    { id: 'gz-fcae', name: 'Fmaj7 – Cmaj7 – Am7 – Em7', desc: '全部是七和弦的開放把位進行,聲音很柔。', cat: 'gaze', bpm: 88, style: 'dreampop', bars: ['Fmaj7', 'Cmaj7', 'Am7', 'Em7'] },
    { id: 'gz-iv-minor', name: 'C – Em – F – Fm', desc: '最後的 Fm(小四級)是夢幻感的來源。', cat: 'gaze', bpm: 76, style: 'halftime', bars: ['C', 'Em', 'F', 'Fm'] },
    { id: 'gz-wall-a', name: 'F♯m – D – A – E', desc: '快速的音牆進行,全部用力刷滿八分音符。', cat: 'gaze', bpm: 138, style: 'wall16', bars: ['F#m', 'D', 'A', 'E'] },
    { id: 'gz-wall-e', name: 'E – G♯m – A – B', desc: 'E 大調的 I–iii–IV–V,十六分 hi-hat 推著走。', cat: 'gaze', bpm: 132, style: 'wall16', bars: ['E', 'G#m', 'A', 'B'] },
    { id: 'gz-add9', name: 'Aadd9 – Eadd9 – Dsus2', desc: '三個開放的色彩和弦,空弦一直在共鳴。', cat: 'gaze', bpm: 92, style: 'dreampop', bars: ['open-Aadd9', 'open-Eadd9', 'open-Dsus2', 'open-Dsus2'] },
    { id: 'gz-em9', name: 'Em(add9) – Cmaj7 – G – Dsus4', desc: '小調開頭的音牆,Em 加上九度更飄。', cat: 'gaze', bpm: 100, style: 'shoegaze', bars: ['Emadd9', 'Cmaj7', 'G', 'Dsus4'] },
    { id: 'gz-dmaj7', name: 'Dmaj7 – Bm7 – Gmaj7 – A', desc: 'D 大調 I–vi–IV–V,前三個都是七和弦。', cat: 'gaze', bpm: 96, style: 'dreampop', bars: ['Dmaj7', 'Bm7', 'Gmaj7', 'A'] },
    { id: 'gz-eslide2', name: 'E – C♯m7 – Aadd9 – Badd11', desc: 'E 型往上滑的 I–vi–IV–V,第 1、2 弦保持空弦。', cat: 'gaze', bpm: 104, style: 'shoegaze', bars: ['es-E', 'es-C#m7', 'es-Aadd9', 'es-Badd11'] },
    { id: 'gz-aslide2', name: 'Asus2 – F♯7sus4 – D6sus2 – E5', desc: '兩根手指在第 5、4 弦上滑動,上面兩條空弦不變。', cat: 'gaze', bpm: 120, style: 'motorik', bars: ['as-Asus2', 'as-F#7sus4', 'as-D6sus2', 'as-E5'] },
    { id: 'gz-cf', name: 'Cmaj7 – Fmaj7', desc: '慢速的兩和弦來回,練分解與泛音都適合。', cat: 'gaze', bpm: 70, style: 'triphop', bars: ['open-Cmaj7', 'open-Cmaj7', 'open-Fmaj7', 'open-Fmaj7'] },
    { id: 'gz-bm', name: 'Bm – G – D – A', desc: 'D 大調從六級開始(vi–IV–I–V),暗一點的音牆。', cat: 'gaze', bpm: 112, style: 'shoegaze', bars: ['Bm', 'G', 'D', 'A'] },
    { id: 'pr-em68', name: 'Em – C – G – D(6/8)', desc: '6/8 拍慢慢堆疊,每個和弦兩小節。', cat: 'post', bpm: 138, style: 'postrock68', bars: ['Em', 'Em', 'C', 'C', 'G', 'G', 'D', 'D'] },
    { id: 'pr-march', name: 'D – Bm – G – A', desc: '小鼓進行曲節奏,越彈越大聲。', cat: 'post', bpm: 120, style: 'march', bars: ['D', 'D', 'Bm', 'Bm', 'G', 'G', 'A', 'A'] },
    { id: 'pr-amem', name: 'Am – Em – F – C', desc: 'vi–iii–IV–I,進行曲小鼓推著往前。', cat: 'post', bpm: 104, style: 'march', bars: ['Am', 'Em', 'F', 'C'] },
    { id: 'pr-slow', name: 'F – C – G – Am', desc: '很慢的 IV–I–V–vi,留很多空間給延遲與殘響。', cat: 'post', bpm: 66, style: 'halftime', bars: ['F', 'F', 'C', 'C', 'G', 'G', 'Am', 'Am'] },
    { id: 'pr-dm68', name: 'Dm – B♭ – F – C(6/8)', desc: 'F 大調的 vi–IV–I–V,6/8 拍。練 B♭ 封閉和弦。', cat: 'post', bpm: 126, style: 'postrock68', bars: ['Dm', 'Dm', 'Bb', 'Bb', 'F', 'F', 'C', 'C'] },
    { id: 'pr-bm', name: 'Bm – D – A – G', desc: '小調的 i–III–VII–VI,適合用上三弦的三和弦彈高音旋律。', cat: 'post', bpm: 132, style: 'march', bars: ['Bm', 'Bm', 'D', 'D', 'A', 'A', 'G', 'G'] },
    { id: 'pr-waltz', name: 'C – Am – F – G(3/4)', desc: '三拍子的慢板,每小節只刷第一拍也很好聽。', cat: 'post', bpm: 96, style: 'waltz', bars: ['C', 'C', 'Am', 'Am', 'F', 'F', 'G', 'G'] },
    { id: 'pr-ae', name: 'A – E – F♯m – D(6/8)', desc: 'A 大調的 I–V–vi–IV,6/8 拍堆疊到最後一輪全力刷。', cat: 'post', bpm: 144, style: 'postrock68', bars: ['A', 'A', 'E', 'E', 'F#m', 'F#m', 'D', 'D'] },
    { id: 'ps-mixo-a', name: 'A – G – D – A', desc: 'Mixolydian 的 I–♭VII–IV,迷幻搖滾的招牌聲音。', cat: 'psych', bpm: 112, style: 'motorik', bars: ['A', 'G', 'D', 'A'] },
    { id: 'ps-mixo-e', name: 'E – D – A', desc: 'E Mixolydian,配上不停往前的 Motorik 鼓。', cat: 'psych', bpm: 120, style: 'motorik', bars: ['E', 'E', 'D', 'A'] },
    { id: 'ps-dorian', name: 'Em – A', desc: 'Dorian 的兩個和弦來回(i–IV),可以一直彈下去。', cat: 'psych', bpm: 104, style: 'motorik', bars: ['Em', 'Em', 'A', 'A'] },
    { id: 'ps-phrygian', name: 'Em – F', desc: 'Phrygian 的半音關係,帶一點陰暗與東方味。', cat: 'psych', bpm: 92, style: 'triphop', bars: ['Em', 'Em', 'F', 'F'] },
    { id: 'ps-lydian', name: 'Fmaj7 – G', desc: 'Lydian 的兩個和弦(I–II),漂浮、不落地的感覺。', cat: 'psych', bpm: 100, style: 'dreampop', bars: ['Fmaj7', 'Fmaj7', 'G', 'G'] },
    { id: 'ps-parallel', name: 'E – G – A – C', desc: '四個平行的大和弦,六〇年代車庫迷幻的寫法。', cat: 'psych', bpm: 126, style: 'motorik', bars: ['E', 'G', 'A', 'C'] },
    { id: 'ps-7sharp9', name: 'E7♯9 – G – A', desc: 'E7♯9 是同時有大三度與小三度的「迷幻和弦」。', cat: 'psych', bpm: 108, style: 'rock', bars: ['E7#9', 'E7#9', 'G', 'A'] },
    { id: 'ps-e-drone', name: 'E 持續音(自由練習)', desc: '只有 E 的鋪底,沒有鼓。試 E 大調、E Mixolydian 或 E Dorian。', cat: 'psych', bpm: 90, style: 'none', bars: ['es-E', 'es-E', 'es-E', 'es-E'] },
    { id: 'ps-a-drone', name: 'A 持續音(自由練習)', desc: '空 A 弦當低音,在第 3、4 弦上滑動任何 A 大調的音。', cat: 'psych', bpm: 80, style: 'halftime', bars: ['as-Asus2', 'as-Asus2', 'as-Asus2', 'as-Asus2'] },
    { id: 'ps-em7', name: 'Em7 單和弦(練獨奏)', desc: '一個和弦彈到底,拿來練 E 小調五聲音階。', cat: 'psych', bpm: 96, style: 'funk', bars: ['Em7', 'Em7', 'Em7', 'Em7'] },
    { id: 'in-dorian', name: 'Em – G – D – A', desc: 'i–III–VII–IV,小調開頭但結尾的 A 大和弦讓它亮起來。', cat: 'indie', bpm: 88, style: 'ballad', bars: ['Em', 'G', 'D', 'A'] },
    { id: 'in-rising', name: 'Am – C – D – F(6/8)', desc: '6/8 拍的民謠分解和弦進行,十六小節一輪。', cat: 'indie', bpm: 132, style: 'postrock68', bars: ['Am', 'C', 'D', 'F', 'Am', 'C', 'E', 'E', 'Am', 'C', 'D', 'F', 'Am', 'E', 'Am', 'E'] },
    { id: 'in-7sus4', name: 'Em7 – G – Dsus4 – A7sus4', desc: '第 1、2 弦的第 3 格一直按著不動,只換低音的手指。', cat: 'indie', bpm: 88, style: 'pop8', bars: ['tp-Em7', 'tp-G', 'tp-Dsus4', 'tp-A7sus4'] },
    { id: 'in-d', name: 'D – A – Bm – G', desc: 'D 大調的 I–V–vi–IV,快速刷弦。', cat: 'indie', bpm: 132, style: 'punk', bars: ['D', 'A', 'Bm', 'G'] },
    { id: 'in-folk-d', name: 'D – G – A', desc: '三個和弦的民謠(I–IV–V)。', cat: 'indie', bpm: 120, style: 'pop8', bars: ['D', 'D', 'G', 'A'] },
    { id: 'in-waltz', name: 'G – C – D(3/4)', desc: '三拍子的民謠,碰-恰-恰。', cat: 'indie', bpm: 126, style: 'waltz', bars: ['G', 'G', 'C', 'G', 'D', 'D', 'G', 'G'] },
    { id: 'in-amcgd', name: 'Am – C – G – D', desc: 'i–III–VII–IV 的 A 小調版本。', cat: 'indie', bpm: 124, style: 'pop8', bars: ['Am', 'C', 'G', 'D'] },
    { id: 'in-acde', name: 'A – C♯m – D – E', desc: 'A 大調的 I–iii–IV–V。', cat: 'indie', bpm: 100, style: 'pop8', bars: ['A', 'C#m', 'D', 'E'] },
    { id: 'in-sus', name: 'Dsus2 – D – Dsus4 – D', desc: '一個和弦的三種顏色,每小節換一次。', cat: 'indie', bpm: 100, style: 'pop8', bars: ['Dsus2', 'D', 'Dsus4', 'D'] },
    { id: 'in-asus', name: 'Asus2 – A – Asus4 – A', desc: '同樣的練習換到 A。', cat: 'indie', bpm: 100, style: 'pop8', bars: ['Asus2', 'A', 'Asus4', 'A'] },
    { id: 'rk-145', name: 'A – D – E – D', desc: '三個和弦的搖滾(I–IV–V–IV)。', cat: 'rock', bpm: 126, style: 'rock', bars: ['A', 'D', 'E', 'D'] },
    { id: 'rk-mixo-d', name: 'D – C – G', desc: 'I–♭VII–IV,經典搖滾的三和弦。', cat: 'rock', bpm: 112, style: 'rock', bars: ['D', 'C', 'G', 'G'] },
    { id: 'rk-emdc', name: 'Em – D – C – D', desc: '小調搖滾的 i–VII–VI–VII。', cat: 'rock', bpm: 120, style: 'rock', bars: ['Em', 'D', 'C', 'D'] },
    { id: 'rk-punk', name: 'C – G – Am – F', desc: '龐克速度的四和弦,右手全部下刷。', cat: 'rock', bpm: 164, style: 'punk', bars: ['C', 'G', 'Am', 'F'] },
    { id: 'rk-power', name: 'E5 – G5 – D5 – A5', desc: '強力和弦:只有根音與五度,開破音也不會糊。', cat: 'rock', bpm: 116, style: 'rock', bars: ['E5', 'G5', 'D5', 'A5'] },
    { id: 'rk-grunge', name: 'F5 – B♭5 – A♭5 – D♭5', desc: '四度跳進的強力和弦,九〇年代的油漬搖滾。', cat: 'rock', bpm: 116, style: 'rock', bars: ['F5', 'Bb5', 'Ab5', 'Db5'] },
    { id: 'rk-barre', name: 'Cm – A♭ – E♭ – B♭', desc: '降記號調的 i–VI–III–VII,四個都是封閉和弦。', cat: 'rock', bpm: 96, style: 'ballad', bars: ['Cm', 'Ab', 'Eb', 'Bb@6'] },
    { id: 'rk-eab', name: 'E – A – B7', desc: '搖滾樂的 I–IV–V7。', cat: 'rock', bpm: 138, style: 'rock', bars: ['E', 'E', 'A', 'B7'] },
    { id: 'mn-andalusian', name: 'Am – G – F – E', desc: '安達魯西亞終止式,一路往下走到大和弦 E。', cat: 'minor', bpm: 112, style: 'pop8', bars: ['Am', 'G', 'F', 'E'] },
    { id: 'mn-emcgd', name: 'Em – C – G – D', desc: '小調的 i–VI–III–VII。', cat: 'minor', bpm: 100, style: 'ballad', bars: ['Em', 'C', 'G', 'D'] },
    { id: 'mn-amgfg', name: 'Am – G – F – G', desc: 'i–VII–VI–VII,在三個和弦之間上下。', cat: 'minor', bpm: 120, style: 'rock', bars: ['Am', 'G', 'F', 'G'] },
    { id: 'mn-circle', name: 'Am – Dm – G – C – F – Dm – E', desc: '五度圈下行,八小節一輪,配迪斯可的四拍踩。', cat: 'minor', bpm: 116, style: 'fourfloor', bars: ['Am', 'Dm', 'G', 'C', 'F', 'Dm', 'E', 'E'] },
    { id: 'mn-harmonic', name: 'Em – Am – B7', desc: '和聲小調的 i–iv–V7,B7 把耳朵拉回 Em。', cat: 'minor', bpm: 96, style: 'bossa', bars: ['Em', 'Am', 'B7', 'Em'] },
    { id: 'mn-cliche', name: 'Am – Am(maj7) – Am7 – Am6', desc: '小調的線條下行:第 3 弦上 A→G♯→G→F♯。', cat: 'minor', bpm: 84, style: 'ballad', bars: ['Am', 'AmMaj7', 'Am7', 'Am6'] },
    { id: 'mn-amdmem', name: 'Am – Dm – Em', desc: '自然小調的 i–iv–v。', cat: 'minor', bpm: 100, style: 'triphop', bars: ['Am', 'Am', 'Dm', 'Em'] },
    { id: 'mn-fm', name: 'F♯m – Bm – C♯m', desc: 'F♯ 小調的 i–iv–v,三個都是封閉和弦。', cat: 'minor', bpm: 92, style: 'ballad', bars: ['F#m', 'F#m', 'Bm', 'C#m'] },
    { id: 'bl-a', name: '12 小節藍調(A)', desc: 'A7、D7、E7 三個屬七和弦,Shuffle 節奏。', cat: 'groove', bpm: 96, style: 'shuffle', bars: ['A7', 'A7', 'A7', 'A7', 'D7', 'D7', 'A7', 'A7', 'E7', 'D7', 'A7', 'E7'] },
    { id: 'bl-e', name: '12 小節藍調(E)', desc: '第二小節就換到 A7 的「快換」版本。', cat: 'groove', bpm: 112, style: 'shuffle', bars: ['E7', 'A7', 'E7', 'E7', 'A7', 'A7', 'E7', 'E7', 'B7', 'A7', 'E7', 'B7'] },
    { id: 'bl-minor', name: '小調藍調(Am)', desc: 'Am7 與 Dm7 為主,第 9 小節的 F7 是亮點。', cat: 'groove', bpm: 84, style: 'ballad', bars: ['Am7', 'Am7', 'Am7', 'Am7', 'Dm7', 'Dm7', 'Am7', 'Am7', 'F7', 'E7', 'Am7', 'E7'] },
    { id: 'fk-e9', name: 'E9 單和弦放克', desc: '一個 E9 彈到底,練右手十六分音符的悶音刷弦。', cat: 'groove', bpm: 100, style: 'funk', bars: ['E9', 'E9', 'E9', 'E9'] },
    { id: 'fk-dorian', name: 'Am7 – D9', desc: 'Dorian 放克的兩個和弦,都在第 5 格附近。', cat: 'groove', bpm: 104, style: 'funk', bars: ['Am7@5', 'Am7@5', 'D9', 'D9'] },
    { id: 'fk-disco', name: 'Am7 – Dm7 – G7 – Cmaj7', desc: '四拍踩大鼓加八度貝斯,切分刷弦。', cat: 'groove', bpm: 118, style: 'fourfloor', bars: ['Am7', 'Dm7', 'G7', 'Cmaj7'] },
    { id: 'rg-ade', name: 'A – D – A – E', desc: '雷鬼 One Drop:只在反拍上短短地刷。', cat: 'groove', bpm: 76, style: 'reggae', bars: ['A', 'D', 'A', 'E'] },
    { id: 'rg-minor', name: 'Am – Dm', desc: '小調雷鬼的兩和弦來回。', cat: 'groove', bpm: 72, style: 'reggae', bars: ['Am', 'Am', 'Dm', 'Dm'] },
    { id: 'jz-251', name: 'Dm7 – G7 – Cmaj7', desc: '爵士最基本的 ii–V–I,都在第 3 到 5 格。', cat: 'jazz', bpm: 120, style: 'swing', bars: ['Dm7@5', 'G7@3', 'Cmaj7@3', 'Cmaj7@3'] },
    { id: 'jz-1625', name: 'Cmaj7 – Am7 – Dm7 – G7', desc: 'I–vi–ii–V 循環(Turnaround)。', cat: 'jazz', bpm: 132, style: 'swing', bars: ['Cmaj7@3', 'Am7@5', 'Dm7@5', 'G7@3'] },
    { id: 'jz-minor251', name: 'Bm7♭5 – E7 – Am7', desc: '小調的 ii–V–i,配 Bossa Nova。', cat: 'jazz', bpm: 108, style: 'bossa', bars: ['Bm7b5', 'E7', 'Am7', 'Am7'] },
    { id: 'jz-leaves', name: 'Am7 – D7 – Gmaj7 – Cmaj7 – F♯m7♭5 – B7 – Em', desc: '大調 ii–V–I 接小調 ii–V–i,八小節一輪。', cat: 'jazz', bpm: 116, style: 'swing', bars: ['Am7', 'D7', 'Gmaj7', 'Cmaj7', 'F#m7b5', 'B7', 'Em', 'Em'] },
    { id: 'jz-bossa', name: 'Cmaj7 – A7 – Dm7 – G7', desc: 'Bossa Nova 的 I–VI7–ii–V,全部用開放把位。', cat: 'jazz', bpm: 124, style: 'bossa', bars: ['Cmaj7', 'A7', 'Dm7', 'G7'] },
    { id: 'jz-d251', name: 'Em7 – A7 – Dmaj7 – Bm7', desc: 'D 大調的 ii–V–I–vi。', cat: 'jazz', bpm: 126, style: 'swing', bars: ['Em7', 'A7', 'Dmaj7', 'Bm7'] },
    { id: 'jz-blues-f', name: '爵士藍調(F)', desc: '12 小節,比一般藍調多了 D7 與 Gm7–C7。', cat: 'jazz', bpm: 120, style: 'swing', bars: ['F7', 'Bb7', 'F7', 'F7', 'Bb7', 'Bb7', 'F7', 'D7@5', 'Gm7', 'C7', 'F7', 'C7'] },
    { id: 'ns-descend', name: 'Fmaj7 – Em7 – Dm7 – Cmaj7', desc: '七和弦一級一級往下走,Neo Soul 的慢拍。', cat: 'jazz', bpm: 82, style: 'triphop', bars: ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7'] },
    { id: 'ns-4321', name: 'Dmaj7 – C♯m7 – Bm7 – E9', desc: 'A 大調的 IV–iii–ii–V,全部是第 5 弦根音的指型。', cat: 'jazz', bpm: 88, style: 'triphop', bars: ['Dmaj7@5', 'C#m7', 'Bm7', 'E9'] },
    { id: 'ns-step', name: 'Am7 – Bm7 – Cmaj7 – Bm7', desc: '相鄰的七和弦上上下下,適合練滑音與搥勾弦裝飾。', cat: 'jazz', bpm: 92, style: 'dreampop', bars: ['Am7', 'Bm7', 'Cmaj7@3', 'Bm7'] },
  ],

  /* ──────────────────────────── 鼓的節奏型 ────────────────────────────
   * 每個字元是一個 16 分音符。4/4 拍一小節 16 個字元,6/8 與 3/4 拍一小節 12 個字元。
   * kick / snare / hat:x = 打,X = 重音,o = 輕輕打,. = 不打
   * bass:x = 根音,o = 高八度根音,5 = 五度,3 = 三度,7 = 七度(和弦沒有七度時彈高八度根音)
   *       . = 延續前一個音,- = 休止
   * swing:(選填)把反拍的八分音符往後推,0.67 是三連音的搖擺感 */
  drumPatterns: {
    shoegaze: {
      name: '瞪鞋直拍',
      timeSig: '4/4',
      kick:  'x.......x.x.....',
      snare: '....x.......x...',
      hat:   'x.x.x.x.x.x.x.x.',
      bass:  'x.x.x.x.x.x.x.x.',
    },
    wall16: {
      name: '音牆 16 分',
      timeSig: '4/4',
      kick:  'x.....x.x.....x.',
      snare: '....x.......x...',
      hat:   'XxxxXxxxXxxxXxxx',
      bass:  'x.x.x.x.x.x.x.x.',
    },
    dreampop: {
      name: '夢幻流行',
      timeSig: '4/4',
      kick:  'x.....x...x.....',
      snare: '....x.......x...',
      hat:   'X.xxX.xxX.xxX.xx',
      bass:  'x.......x.....x.',
    },
    halftime: {
      name: '夢幻半拍',
      timeSig: '4/4',
      kick:  'x.........x.....',
      snare: '........x.......',
      hat:   'x.x.x.x.x.x.x.x.',
      bass:  'x.........x...5.',
    },
    motorik: {
      name: '迷幻 Motorik',
      timeSig: '4/4',
      kick:  'x...x.x.x...x.x.',
      snare: '....x.......x...',
      hat:   'x.x.x.x.x.x.x.x.',
      bass:  'x.x.x.x.x.x.o.x.',
    },
    postrock68: {
      name: '後搖 6/8',
      timeSig: '6/8',
      kick:  'x.........x.',
      snare: '......x.....',
      hat:   'x.x.x.x.x.x.',
      bass:  'x.....x...5.',
    },
    march: {
      name: '後搖進行曲',
      timeSig: '4/4',
      kick:  'x...x...x...x...',
      snare: 'X.ooX.ooX.ooX.oo',
      hat:   '................',
      bass:  'x.x.x.x.x.x.x.x.',
    },
    pop8: {
      name: '流行八分',
      timeSig: '4/4',
      kick:  'x.....x.x.......',
      snare: '....x.......x...',
      hat:   'X.x.X.x.X.x.X.x.',
      bass:  'x.....x.x.....5.',
    },
    ballad: {
      name: '抒情慢板',
      timeSig: '4/4',
      kick:  'x.......x.....x.',
      snare: '....x.......x...',
      hat:   'x.x.x.x.x.x.x.x.',
      bass:  'x.......x.....5.',
    },
    rock: {
      name: '搖滾直拍',
      timeSig: '4/4',
      kick:  'x.....x.x.x.....',
      snare: '....X.......X...',
      hat:   'X.x.X.x.X.x.X.x.',
      bass:  'x.x.x.x.x.x.x.x.',
    },
    punk: {
      name: '龐克快拍',
      timeSig: '4/4',
      kick:  'x.x.....x.x.....',
      snare: '....X.......X...',
      hat:   'x.x.x.x.x.x.x.x.',
      bass:  'x.x.x.x.x.x.x.x.',
    },
    fourfloor: {
      name: '四拍踩(Disco)',
      timeSig: '4/4',
      kick:  'x...x...x...x...',
      snare: '....x.......x...',
      hat:   '..X...X...X...X.',
      bass:  'x.o.x.o.x.o.x.o.',
    },
    funk: {
      name: '放克 16 分',
      timeSig: '4/4',
      kick:  'x..x..x...x..x..',
      snare: '....X..o.o..X..o',
      hat:   'XxxxXxxxXxxxXxxx',
      bass:  'x..x-.x-..o-x-5-',
    },
    triphop: {
      name: 'Lo-fi/Trip-hop',
      timeSig: '4/4',
      kick:  'x......x..x.....',
      snare: '....x.......x...',
      hat:   'x.x.x.x.x.x.x.x.',
      bass:  'x......x..x.....',
    },
    shuffle: {
      name: '藍調 Shuffle',
      timeSig: '4/4',
      swing: 0.67,
      kick:  'x.......x.......',
      snare: '....x.......x...',
      hat:   'X.x.X.x.X.x.X.x.',
      bass:  'x.x.3.3.5.5.3.3.',
    },
    swing: {
      name: '爵士 Swing',
      timeSig: '4/4',
      swing: 0.67,
      kick:  'o.......o.......',
      snare: '....o.......o...',
      hat:   'X...x.x.X...x.x.',
      bass:  'x...3...5...7...',
    },
    bossa: {
      name: 'Bossa Nova',
      timeSig: '4/4',
      kick:  'x.....x.x.....x.',
      snare: 'o..o..o...o..o..',
      hat:   'x.x.x.x.x.x.x.x.',
      bass:  'x.....5.5.....x.',
    },
    reggae: {
      name: '雷鬼 One Drop',
      timeSig: '4/4',
      kick:  '........x.......',
      snare: '........x.......',
      hat:   'x.X.x.X.x.X.x.X.',
      bass:  'x.x.-...5.5.x.-.',
    },
    waltz: {
      name: '三拍子 3/4',
      timeSig: '3/4',
      kick:  'x...........',
      snare: '....o...o...',
      hat:   'x.x.x.x.x.x.',
      bass:  'x.......5...',
    },
    none: {
      name: '無鼓(只有鋪底)',
      timeSig: '4/4',
      kick:  '................',
      snare: '................',
      hat:   '................',
      bass:  'x...............',
    },
  },

  /* ──────────────────────────── 8 週課表 ────────────────────────────
   * 每個 item 的 id 是打勾紀錄的鍵值,改文字沒關係,但 id 改了舊紀錄會對不上
   * to : 點項目旁的連結會跳到哪一頁(unit/單元id、drone、backing、quiz) */
  plan: [
    {
      week: 1,
      title: 'CAGED(一):五個指型與根音',
      goal: '能說出每個指型的根音在哪條弦,並把 C 和弦的五個位置連起來。',
      items: [
        { id: 'w1-1', text: '彈五個開放指型,每個都唸出根音所在的弦', to: 'unit/caged' },
        { id: 'w1-2', text: 'C 和弦五個位置,節拍器 60,每個位置停四拍', to: 'unit/caged' },
        { id: 'w1-3', text: '測驗:在第 6 弦與第 5 弦上找音名,連續答對 15 題', to: 'quiz' },
        { id: 'w1-4', text: '用指板總覽看 G、D、A 的五個指型,各彈一次', to: 'unit/caged' },
        { id: 'w1-5', text: '跟著配樂「C 的五個位置」彈完三輪', to: 'backing' },
      ],
    },
    {
      week: 2,
      title: 'CAGED(二):換調與小和弦',
      goal: '任選一個大和弦,能在指板上找到至少三個位置。',
      items: [
        { id: 'w2-1', text: 'E、A、D、G 四個和弦,各找出 E 型、A 型、D 型三個位置', to: 'unit/caged' },
        { id: 'w2-2', text: 'Am 的三個實用指型(Am 型、Em 型、Dm 型)連接', to: 'unit/caged' },
        { id: 'w2-3', text: '測驗:在第 4 弦上找音名,連續答對 15 題', to: 'quiz' },
        { id: 'w2-4', text: '用同一個把位(第 5–8 格)彈 C、F、G,不移動手的位置', to: 'unit/caged' },
      ],
    },
    {
      week: 3,
      title: '上三弦大三和弦',
      goal: '任一個大三和弦,能在上三弦彈出三個轉位。',
      items: [
        { id: 'w3-1', text: 'C 大三和弦三個轉位上行、下行,節拍器 70', to: 'unit/triads' },
        { id: 'w3-2', text: '同樣的練習換成 G、D、F', to: 'unit/triads' },
        { id: 'w3-3', text: '彈譜例 2-1,每個音都要響滿', to: 'unit/triads' },
        { id: 'w3-4', text: '測驗:找出和弦的三音與五音,連續答對 10 題', to: 'quiz' },
        { id: 'w3-5', text: '開 E 或 A 的 Drone,在上面彈 E、A、B 的三和弦轉位', to: 'drone' },
      ],
    },
    {
      week: 4,
      title: '小三和弦與最近轉位連接',
      goal: '換和弦時不跳把位,用最近的轉位接過去。',
      items: [
        { id: 'w4-1', text: 'Cm 三個轉位,並與 C 大三和弦逐一對照', to: 'unit/triads' },
        { id: 'w4-2', text: '2-3-4 弦組的 C 與 Cm 各三個轉位', to: 'unit/triads' },
        { id: 'w4-3', text: '彈譜例 2-2(C–Am–F–G 最近轉位)', to: 'unit/triads' },
        { id: 'w4-4', text: '跟著配樂「C – Am – F – G(上三弦)」彈五輪', to: 'backing' },
        { id: 'w4-5', text: '自己找出 G–Em–C–D 的最近轉位連接', to: 'unit/triads' },
      ],
    },
    {
      week: 5,
      title: '色彩和弦(一):sus 與 add9',
      goal: '能在大三和弦、sus2、sus4 之間自由切換。',
      items: [
        { id: 'w5-1', text: 'Dsus2 – D – Dsus4 – D,每個和弦一拍,節拍器 80', to: 'unit/colors' },
        { id: 'w5-2', text: 'Asus2、Asus4、Aadd9 與 Esus4、Eadd9', to: 'unit/colors' },
        { id: 'w5-3', text: '第 5 弦根音的 sus2 與 sus4,移到 D、E、G 三個調', to: 'unit/colors' },
        { id: 'w5-4', text: '上三弦:Csus2 – C – Csus4 – C', to: 'unit/colors' },
        { id: 'w5-5', text: '把標示切到「級數」,說出每個和弦是哪個音變了', to: 'unit/colors' },
      ],
    },
    {
      week: 6,
      title: '色彩和弦(二):maj7 與 m7',
      goal: '能用小型和弦彈完一段四個和弦的進行。',
      items: [
        { id: 'w6-1', text: '開放把位的 Cmaj7、Fmaj7、Dmaj7、Am7、Em7', to: 'unit/colors' },
        { id: 'w6-2', text: '第 4 弦根音的四弦小型和弦,五個都彈過', to: 'unit/colors' },
        { id: 'w6-3', text: '彈譜例 3-1(Cadd9–Cmaj7–Am7–Fmaj7)', to: 'unit/colors' },
        { id: 'w6-4', text: '跟著配樂「Cadd9 – Cmaj7 – Am7 – Fmaj7」彈五輪', to: 'backing' },
        { id: 'w6-5', text: '上三弦的無根音 maj7 與 m7,配樂有貝斯時試試看', to: 'unit/colors' },
      ],
    },
    {
      week: 7,
      title: '空弦持續音(一):滑動指型',
      goal: '一個手型加上空弦,彈出一整段進行。',
      items: [
        { id: 'w7-1', text: 'E 型往上滑的六個位置,確認第 1、2 弦一直在響', to: 'unit/drones' },
        { id: 'w7-2', text: '彈譜例 4-1', to: 'unit/drones' },
        { id: 'w7-3', text: '兩根手指往上滑的六個位置', to: 'unit/drones' },
        { id: 'w7-4', text: '跟著配樂「E – Aadd9 – F♯m11 – Badd11」彈五輪', to: 'backing' },
        { id: 'w7-5', text: '跟著配樂「Asus2 – C♯m7 – D6sus2 – E5」感受 6/8 拍', to: 'backing' },
      ],
    },
    {
      week: 8,
      title: '空弦持續音(二):移動音程與總複習',
      goal: '用這八週學到的東西,寫出一段自己的進行。',
      items: [
        { id: 'w8-1', text: '空 D 弦加三度音程的六個位置,彈譜例 4-2', to: 'unit/drones' },
        { id: 'w8-2', text: '上方固定音的五個和弦,跟著配樂「G – Cadd9 – Em7 – Dsus4」', to: 'backing' },
        { id: 'w8-3', text: '開 D 的 Drone,用「D 持續音」配樂自由彈五分鐘', to: 'drone' },
        { id: 'w8-4', text: '測驗:全指板找音名,正確率 90% 以上', to: 'quiz' },
        { id: 'w8-5', text: '寫一段四到八小節的進行,至少用到一個轉位、一個色彩和弦、一條空弦', to: 'backing' },
      ],
    },
  ],
};
