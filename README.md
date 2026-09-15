# 五十音學習工具 / Learn Japanese Kana

零依賴、純瀏覽器的日文五十音（平假名・片假名）學習工具組。打開 HTML 就能用，不需安裝、不需連線、不需後端。

A dependency-free, browser-only toolkit for learning the Japanese kana (hiragana & katakana). Just open the HTML file — no install, no server, no network required.

## 線上使用 / Live demo

透過 GitHub Pages 直接開啟，不必下載：

- 首頁 / Home： https://AlanWang29.github.io/learn-japanese/
- 互動練習 / Trainer： https://AlanWang29.github.io/learn-japanese/kana-trainer.html
- 列印練習帳 / Printable： https://AlanWang29.github.io/learn-japanese/table.html

## 內容 / What's inside

| 檔案 | 說明 |
| --- | --- |
| [index.html](index.html) | 入口首頁，連到下列兩個工具 |
| [kana-trainer.html](kana-trainer.html) | 互動式練習測驗（螢幕上練） |
| [table.html](table.html) | 可列印的手寫練習帳（紙上練） |
| [kana-data.js](kana-data.js) | 假名資料，上面兩個工具共用 |
| [五十音練習帳.pdf](五十音練習帳.pdf) | 由 `table.html` 產生的練習帳 PDF，全 104 音共 7 頁，可直接列印 |

> 若要下載到本機使用，請把 `kana-data.js` 與 HTML 放在同一個資料夾 —— 兩個工具都需要它。

## 收錄範圍 / Coverage

共 104 音：清音 46、濁音 20、半濁音 5、拗音 33（含 ぎゃ・じゃ・びゃ・ぴゃ 等濁半濁拗音）。

兩個工具**預設都只開清音**，其餘音種在畫面上勾選後才會出現，所以初學者不會一進來就被 100 多個音淹沒。

## kana-trainer.html — 互動練習

一個網頁應用，進度自動存在瀏覽器 `localStorage`。

- **練習模式**：看假名打羅馬字（輸入題），或看羅馬字選假名（反向選擇題），反向題比例可調。
- **智慧出題**：依錯誤率、連錯次數與間隔做加權抽樣，弱字自動加碼複習；同一字連錯 2 次會降級成選擇題，連對 2 次再升回輸入題。
- **默寫模式**：一次出一批（1／5／10／20 題），在紙上寫完後公佈答案並逐題自評。
- **練習範圍**：依「清音／濁音／半濁音／拗音」分區，可逐行勾選，也可整區一鍵開關。
- **統計檢視**：累計正確率、平均反應時間、熟練度熱力圖（可切換字形與音種）、最弱 10 字排行。
- **語音發音**：可選用瀏覽器內建語音合成（Web Speech API）朗讀假名，需系統已安裝日文語音。
- **進度管理**：支援匯出／匯入 JSON 備份與一鍵重置。
- **鍵盤操作**：輸入題直接打字、選擇題按 `1`–`4`、`Enter` 進下一題、`Esc` 開設定。
- 深／淺色自動切換，手機與桌機皆適用。

### 用法

直接用瀏覽器打開 `kana-trainer.html` 即可（同目錄要有 `kana-data.js`）。

`ぢ` `づ` 與 `じ` `ず` 同音，主羅馬字同樣寫成 `ji` `zu`，題目會標上所屬行以便分辨（`ji・ざ` 對 `ji・だ`）；輸入時 `ji`/`di`、`zu`/`du` 都算對，選擇題也不會讓兩個同音字同時出現在選項裡。

## table.html — 列印練習帳

產生 A4 直向、含米字格輔助線的手寫練習帳，平假名與片假名並排，每頁 16 列並自動分頁（練習格不會被分頁切半）。頁首可勾選要印哪些音種（列印時不會印出這一列）：預設清音 3 頁，全部 104 音則是 7 頁。

### 用法

用瀏覽器打開 `table.html`，勾好音種後用瀏覽器的「列印」（`Ctrl/Cmd + P`）存成 PDF 或直接印出。倉庫中的 [五十音練習帳.pdf](五十音練習帳.pdf) 是四種音全開的現成輸出（7 頁）；只想印清音的話，在頁面上取消其他三個勾選再列印即可（3 頁）。

## 技術 / Tech

- 純 HTML + CSS + 原生 JavaScript，無任何框架與外部相依。
- 假名資料集中在 `kana-data.js`（classic script，`file://` 直接開也載得動），兩個工具共用同一份。
- 資料全部存在本機，不上傳任何內容。

## 授權 / License

MIT © 2026 Alan Wang — 詳見 [LICENSE](LICENSE)。
