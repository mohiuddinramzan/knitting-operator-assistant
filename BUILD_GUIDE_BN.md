# নিটিং অপারেটর অ্যাসিস্ট্যান্ট — বিল্ড গাইড (বাংলা)

এই গাইডে পিসি লাগে না। শুধু অ্যান্ড্রয়েড ফোন, Termux এবং GitHub অ্যাকাউন্ট লাগবে।

> **নিরাপত্তা:** অ্যাপে দেওয়া তথ্য সাধারণ নির্দেশনা। চলন্ত মেশিনের অংশ কখনো ধরবেন না। আগে মেশিন বন্ধ ও আইসোলেট করুন এবং কারখানার SOP ও প্রস্তুতকারকের ম্যানুয়াল মানুন।

## ১. ZIP ফাইল Termux-এ খোলা

1. ZIP ফাইল (`knitting-operator-assistant-v1.zip`) ফোনের **Download** ফোল্ডারে রাখুন।
2. Termux খুলে একবার স্টোরেজের অনুমতি দিন:
   ```bash
   termux-setup-storage
   ```
   (অনুমতির পপ-আপে **Allow** চাপুন।)
3. ZIP খুলুন:
   ```bash
   cd ~
   unzip ~/storage/downloads/knitting-operator-assistant-v1.zip
   cd knitting-operator-assistant
   ```
   যদি ফোল্ডারের নাম ভিন্ন হয়, `ls` দিয়ে দেখে নিন।

## ২. Node.js ও প্যাকেজ ইনস্টল

```bash
pkg update -y
pkg install -y nodejs-lts git unzip
node -v        # v18 বা তার বেশি হতে হবে
npm install    # ইন্টারনেট লাগবে; package-lock.json তৈরি হবে
```
`npm install` শেষ হলে যে `package-lock.json` তৈরি হয় সেটি GitHub-এ রাখবেন (নিচে দেখুন)।

## ৩. লোকালি চালানো ও পরীক্ষা

```bash
npm run validate    # চেক + টেস্ট + বিল্ড + বিল্ড যাচাই
npm run dev         # ওয়েব অ্যাপ চালু হবে
```
ফোনের Chrome-এ খুলুন: `http://127.0.0.1:8080`  
বন্ধ করতে Termux-এ **CTRL + C** চাপুন।

প্রোডাকশন বিল্ড দেখতে: `npm run build` তারপর `npm run serve:dist`।

অফলাইন পরীক্ষা: একবার অ্যাপ খুলুন, তারপর ফোনের Airplane mode চালু করে পেজ রিলোড করুন — অ্যাপ চলবে। বিস্তারিত: `docs/MANUAL_TEST_GUIDE.md`।

## ৪. GitHub রিপোজিটরি তৈরি ও আপলোড

1. ফোনের ব্রাউজারে github.com এ লগইন করুন → **New repository** → নাম দিন `knitting-operator-assistant` → **Create repository** (README যোগ করবেন না)।
2. **Personal access token** তৈরি করুন: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → **repo** এবং **workflow** টিক দিন → কপি করে নিরাপদ জায়গায় রাখুন। (টোকেন কাউকে দেবেন না, প্রজেক্টে লিখবেন না।)
3. Termux-এ প্রজেক্ট ফোল্ডারে:
   ```bash
   git config --global user.name "আপনার নাম"
   git config --global user.email "you@example.com"
   git init -b main
   git add .
   git commit -m "Knitting Operator Assistant V1"
   git remote add origin https://github.com/আপনার-ইউজারনেম/knitting-operator-assistant.git
   git push -u origin main
   ```
   পাসওয়ার্ড চাইলে **টোকেনটি** পেস্ট করুন। ইউজারনেম চাইলে আপনার GitHub ইউজারনেম দিন।
4. `package-lock.json` যেন কমিটে থাকে (`git status` দিয়ে দেখুন)। `android/`, `dist/`, `node_modules/` ইচ্ছাকৃতভাবে `.gitignore`-এ আছে।

## ৫. GitHub Actions চালানো

- **push করলেই** `Validate web app` ওয়ার্কফ্লো চলে (চেক, টেস্ট, বিল্ড)।
- APK বানাতে: রিপোজিটরির **Actions** ট্যাব → বাম পাশে **Build Android debug APK** → **Run workflow** → **Run workflow**।
- 5–15 মিনিট লাগতে পারে। সবুজ টিক এলে সফল। লাল ✗ হলে ওয়ার্কফ্লো খুলে ব্যর্থ ধাপে ক্লিক করে লগ দেখুন।

## ৬. APK ডাউনলোড ও ইনস্টল

1. সফল রানের পেজের নিচে **Artifacts** অংশে `knitting-operator-assistant-debug-apk` চাপুন (ডাউনলোড হবে, এটি একটি ZIP)।
2. ফোনের ফাইল ম্যানেজারে ZIP খুলুন (বা Termux-এ `unzip`) → `app-debug.apk` পাবেন।
3. APK চাপুন → প্রয়োজনে **Install unknown apps / অজানা উৎস থেকে ইনস্টল** অনুমতি দিন → **Install**।

⚠️ এটি **ডিবাগ APK**, সাইন করা প্রোডাকশন রিলিজ নয়। Play Store-এর জন্য আলাদা রিলিজ সাইনিং লাগবে (এই প্রজেক্টে কোনো কী বা পাসওয়ার্ড রাখা হয়নি)।

## ৭. ডেটা ব্যাকআপ ও রিস্টোর

- **More → ব্যাকআপ ও রিস্টোর → JSON ব্যাকআপ এক্সপোর্ট**। শেয়ার মেনু এলে Drive/ফাইলে সংরক্ষণ করুন বা নিজেকে পাঠান।
- নতুন ফোন বা নতুন ইনস্টলে: **ব্যাকআপ ফাইল বাছুন → যাচাই করে রিস্টোর** → "সব তথ্য বদলান" বা "মেলান" বেছে নিন।
- ⚠️ **ওয়েব অ্যাপ (Chrome) এবং APK-এর তথ্য আলাদা**, নিজে থেকে সিঙ্ক হয় না। এক জায়গা থেকে অন্য জায়গায় নিতে ব্যাকআপ ফাইল ব্যবহার করুন।
- ব্রাউজারের "Clear site data" বা অ্যাপ আনইনস্টল করলে তথ্য মুছে যায় — আগে ব্যাকআপ নিন।
- শিফট রেকর্ড স্প্রেডশিটে নিতে: **শিফট বুক → CSV এক্সপোর্ট**।

## ৮. সাধারণ সমস্যা ও সমাধান

| সমস্যা | সমাধান |
|---|---|
| `unzip: command not found` | `pkg install unzip` |
| `cannot open ~/storage/downloads` | `termux-setup-storage` আবার চালিয়ে অনুমতি দিন |
| `npm ERR! network` / `ENOTFOUND` | ইন্টারনেট চালু আছে কি দেখুন, তারপর `npm install` আবার চালান |
| `npm run validate` এ "missing i18n key" | `src/data/ui.json`-এ কী যোগ করুন (en ও bn দুটোই) |
| `git push` এ "Authentication failed" | পাসওয়ার্ডের জায়গায় টোকেন দিন; টোকেনে **repo** ও **workflow** অনুমতি আছে কি দেখুন |
| Actions এ লাল ✗: `Gradle`/`SDK` ত্রুটি | ব্যর্থ ধাপের লগ দেখুন; **Re-run all jobs** চেষ্টা করুন; Capacitor ভার্সন `package.json`-এ বদলালে `npm install` চালিয়ে নতুন lockfile কমিট করুন |
| Actions এ `package-lock.json missing` সতর্কতা | লোকালি `npm install` চালিয়ে `package-lock.json` কমিট ও পুশ করুন |
| APK ইনস্টলে "App not installed" | আগের একই অ্যাপ আনইনস্টল করে আবার চেষ্টা করুন (আগে ব্যাকআপ নিন) |
| অ্যাপে "স্টোরেজ পাওয়া যাচ্ছে না" | প্রাইভেট/ইনকগনিটো মোড বন্ধ করুন; ব্রাউজারের সাইট ডেটা অনুমতি দিন |
| CSV-তে বাংলা ভাঙা দেখায় | ফাইল UTF-8 (BOM সহ) তৈরি হয়; স্প্রেডশিট অ্যাপে UTF-8 হিসেবে খুলুন |
| ওয়েবে নতুন সংস্করণ দেখা যাচ্ছে না | অ্যাপ/ট্যাব পুরোপুরি বন্ধ করে আবার খুলুন (সার্ভিস ওয়ার্কার আপডেট পরের লঞ্চে চালু হয়) |

## ৯. লোকালি APK বানানো (ঐচ্ছিক, উন্নত)
Termux-এ সম্পূর্ণ Android SDK/Gradle সেটআপ কঠিন। তাই GitHub Actions ব্যবহার করাই সহজ ও সুপারিশকৃত।
