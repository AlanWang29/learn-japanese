#!/bin/sh
# Cloudflare Pages 的 build 指令（Build command: sh build.sh，Build output directory: dist）
#
# 1. 只把網站需要的檔案複製到 dist/：README、LICENSE、PDF、.git 等不會被公開部署。
# 2. 把 sw.js 的版本號換成網站內容的雜湊：內容有變才會觸發使用者端更新，
#    只改 README 之類的 commit 不會讓使用者看到「有新版本」。
set -eu

FILES="index.html kana-trainer.html table.html kana-data.js pwa.js sw.js manifest.webmanifest
icon-192.png icon-512.png icon-maskable-512.png apple-touch-icon.png _headers"

rm -rf dist
mkdir dist
cp $FILES dist/

VERSION=$(cd dist && cat $FILES | sha256sum | cut -c1-12)
sed -i "s/__VERSION__/$VERSION/" dist/sw.js
echo "built dist/ (version $VERSION)"
