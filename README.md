# Chord Lab

給迷幻、瞪鞋、後搖吉他手的和弦語彙練習站。從封閉和弦出發,用八週學會 CAGED、三和弦轉位、色彩和弦與空弦持續音。

純靜態網站,繁體中文介面,手機與電腦都能用。

## 功能

- **四個單元**:CAGED 系統、上三弦三和弦與轉位、add9/sus2/sus4/maj7/m7 小型和弦、空弦持續音
- **和弦圖**:指法、琴格號碼、每個音的音名,根音用粉紅色;可切換成級數(R、3、5、9)
- **指板總覽**:任選根音看 CAGED 五個指型、三和弦三個轉位
- **譜例**:五線譜加六線譜,可播放、調速、循環
- **和弦表**:選根音與類型,或輸入和弦名稱,查各把位的指法
- **配樂**:鼓、貝斯、鋪底循環播放,顯示目前與下一個和弦
- **Drone**:選一條空弦持續響,並在指板上標出可用的音階音
- **節拍器**:可調 BPM、拍號(4/4、3/4、6/8)、點擊測速
- **測驗**:隨機出音名或和弦內音,在指板上點出位置
- **練習紀錄**:八週課表打勾,存在瀏覽器的 localStorage,可匯出與匯入

## 修改教材內容

所有內容都在 [`src/data/chords.js`](src/data/chords.js) 的 `CHORD_LAB` 物件裡,檔案開頭有格式說明。

加一個和弦只需要三個欄位,音名與級數會自動算出來:

```js
{ id: 'my-chord', name: 'Dadd9', frets: 'xx0252', fingers: 'xx0141', root: 'D' }
```

- `frets`、`fingers` 都是由第 6 弦寫到第 1 弦,`x` 是不彈,`0` 是空弦
- 有 10 格以上時用空白分隔:`'x x 10 12 13 12'`
- 譜例用 [alphaTex](https://alphatab.net/docs/alphatex/introduction) 語法,寫法是「琴格.弦」
- 配樂的 `bars` 每一格是一個小節,填和弦的 `id`
- 課表在同一個檔案的 `plan`

## 本機開發

需要 Node.js 20 以上。

```bash
npm install
```

```bash
npm run dev
```

產出靜態檔(輸出到 `dist/`):

```bash
npm run build
```

## 部署到 GitHub Pages

repo 已附 `.github/workflows/deploy.yml`,推到 `main` 就會自動建置並部署。第一次需要到 repo 的 **Settings → Pages**,把 **Source** 設成 **GitHub Actions**。

`vite.config.js` 的 `base` 是相對路徑,repo 改名或換網域都不用調整。

## 使用的套件

| 用途 | 套件 |
|---|---|
| 和弦圖 | [svguitar](https://github.com/omnibrain/svguitar) |
| 指板 | [fretboard.js](https://github.com/moonwave99/fretboard.js) |
| 五線譜、六線譜與譜例播放 | [alphaTab](https://alphatab.net) |
| 和弦資料庫 | [chords-db](https://github.com/tombatossals/chords-db) |
| 樂理計算 | [tonal](https://github.com/tonaljs/tonal) |
| 時脈、合成音、效果 | [Tone.js](https://tonejs.github.io) |
| 取樣音色(吉他、貝斯、鼓) | [smplr](https://github.com/danigb/smplr) |
| 介面與建置 | React、Vite |

## 聲音的注意事項

- 取樣音色第一次使用時會從網路下載(吉他約數 MB),之後由瀏覽器快取。下載失敗或離線時會自動改用內建的合成音。
- iPhone 沒有聲音時,請確認側邊的靜音開關沒有開啟。
- 練習紀錄不會跨裝置同步,換裝置時請用首頁的「匯出紀錄/匯入紀錄」。
