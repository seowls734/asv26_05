#!/usr/bin/env bash
# 안드로이드 앱(APK) 만들기 — Gradle 없이 SDK 도구만 사용
# 필요: JDK, Android SDK(platforms;android-34, build-tools;34.0.0)
# 사용: bash android/build.sh   (결과: android/out/pk-knight.apk)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/.." && pwd)"
SDK="${ANDROID_HOME:-$HOME/android-sdk}"
BT="$SDK/build-tools/34.0.0"; JAR="$SDK/platforms/android-34/android.jar"
KS="${PK_KEYSTORE:-$HOME/.android/pk-knight.jks}"; KPASS="${PK_KEYPASS:-pkknight}"
EXE=""; [ -f "$BT/aapt2.exe" ] && EXE=".exe"
OUT="$HERE/out"; rm -rf "$OUT"; mkdir -p "$OUT/assets" "$OUT/classes" "$OUT/dex"

# 1) 게임 파일을 assets로 (aapt2가 한글 파일 이름을 못 읽어서 아르리스는 arris.html로 넣는다 — season3.js가 앱 안에서는 이 이름을 연다)
cp "$ROOT/index.html" "$OUT/assets/"
cp "$ROOT/거석상 아르리스.html" "$OUT/assets/arris.html"
cp -r "$ROOT/css" "$ROOT/js" "$OUT/assets/"

# 2) 리소스 컴파일 + 링크
"$BT/aapt2$EXE" compile --dir "$HERE/res" -o "$OUT/res.zip"
"$BT/aapt2$EXE" link -o "$OUT/base.apk" -I "$JAR" --manifest "$HERE/AndroidManifest.xml" "$OUT/res.zip"

# 3) 자바 → dex
javac -source 11 -target 11 -nowarn -Xlint:-options -cp "$JAR" -d "$OUT/classes" "$HERE/src/com/pk/knight/MainActivity.java"
"$BT/d8.bat" --release --lib "$JAR" --min-api 24 --output "$OUT/dex" $(find "$OUT/classes" -name "*.class") 2>/dev/null || \
  "$BT/d8" --release --lib "$JAR" --min-api 24 --output "$OUT/dex" $(find "$OUT/classes" -name "*.class")
# assets와 dex를 APK에 넣는다 (윈도우 aapt2 -A는 경로에 \ 를 써서 폰에서 못 찾으므로 직접 / 경로로 넣는다)
PY="$(command -v python3 || command -v python)"
"$PY" - "$OUT" <<'PYZ'
import sys,os,zipfile
out=sys.argv[1]
with zipfile.ZipFile(os.path.join(out,'base.apk'),'a',zipfile.ZIP_DEFLATED) as z:
    z.write(os.path.join(out,'dex','classes.dex'),'classes.dex')
    root=os.path.join(out,'assets')
    for d,_,fs in os.walk(root):
        for f in fs:
            full=os.path.join(d,f);z.write(full,'assets/'+os.path.relpath(full,root).replace(os.sep,'/'))
PYZ

# 4) 정렬 + 서명 (서명 키가 없으면 처음 한 번 만든다 — 앱을 업데이트하려면 같은 키가 필요)
"$BT/zipalign$EXE" -p -f 4 "$OUT/base.apk" "$OUT/aligned.apk"
if [ ! -f "$KS" ]; then mkdir -p "$(dirname "$KS")"
  keytool -genkeypair -keystore "$KS" -storepass "$KPASS" -keypass "$KPASS" -alias pk -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=PK Knight" >/dev/null; fi
APKSIGNER="$BT/apksigner.bat"; [ -f "$APKSIGNER" ] || APKSIGNER="$BT/apksigner"
"$APKSIGNER" sign --ks "$KS" --ks-pass "pass:$KPASS" --out "$OUT/pk-knight.apk" "$OUT/aligned.apk"
"$APKSIGNER" verify "$OUT/pk-knight.apk" && echo "완료: $OUT/pk-knight.apk"
