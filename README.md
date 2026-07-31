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
| [五十音練習帳.pdf](五十音練習帳.pdf) | 由 `table.html` 產生的練習帳 PDF，可直接列印 |

## kana-trainer.html — 互動練習

一個單檔網頁應用，涵蓋 46 個清音，進度自動存在瀏覽器 `localStorage`。

- **練習模式**：看假名打羅馬字（輸入題），或看羅馬字選假名（反向選擇題），反向題比例可調。
- **智慧出題**：依錯誤率、連錯次數與間隔做加權抽樣，弱字自動加碼複習；同一字連錯 2 次會降級成選擇題，連對 2 次再升回輸入題。
- **默寫模式**：一次出一批（1／5／10／20 題），在紙上寫完後公佈答案並逐題自評。
- **統計檢視**：累計正確率、平均反應時間、五十音熟練度熱力圖、最弱 10 字排行。
- **語音發音**：可選用瀏覽器內建語音合成（Web Speech API）朗讀假名，需系統已安裝日文語音。
- **進度管理**：支援匯出／匯入 JSON 備份與一鍵重置。
- **鍵盤操作**：輸入題直接打字、選擇題按 `1`–`4`、`Enter` 進下一題、`Esc` 開設定。
- 深／淺色自動切換，手機與桌機皆適用。

### 用法

直接用瀏覽器打開 `kana-trainer.html` 即可。

## table.html — 列印練習帳

產生 A4 直向、含米字格輔助線的手寫練習帳，平假名與片假名並排，每頁 15 列並自動分頁（練習格不會被分頁切半）。

### 用法

用瀏覽器打開 `table.html`，再用瀏覽器的「列印」（`Ctrl/Cmd + P`）存成 PDF 或直接印出。倉庫中的 [五十音練習帳.pdf](五十音練習帳.pdf) 即為現成輸出。

## 技術 / Tech

- 純 HTML + CSS + 原生 JavaScript，無任何框架與外部相依。
- 資料全部存在本機，不上傳任何內容。

## 授權 / License

MIT
