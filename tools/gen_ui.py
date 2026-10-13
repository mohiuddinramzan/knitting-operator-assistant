import json
S="""
app.name|Knitting Operator Assistant|নিটিং অপারেটর অ্যাসিস্ট্যান্ট
app.updateReady|New version downloaded. Close and reopen the app to use it.|নতুন সংস্করণ নামানো হয়েছে। ব্যবহার করতে অ্যাপ বন্ধ করে আবার খুলুন।
nav.home|Home|হোম
nav.defects|Defects|ত্রুটি
nav.calc|Calculator|ক্যালকুলেটর
nav.shift|Shift Book|শিফট বুক
nav.more|More|আরও
common.search|Search|খুঁজুন
common.confirm|Confirm|নিশ্চিত করুন
common.cancel|Cancel|বাতিল
common.close|Close|বন্ধ করুন
common.unit|Unit|একক
common.all|All|সব
common.edit|Edit|সম্পাদনা
common.save|Save|সংরক্ষণ
common.saved|Saved|সংরক্ষিত হয়েছে
common.delete|Delete|মুছুন
common.deleted|Deleted|মুছে ফেলা হয়েছে
common.add|Add|যোগ করুন
common.back|Back|পেছনে
common.cannotUndo|This cannot be undone.|এটি আর ফেরানো যাবে না।
safety.label|Safety|নিরাপত্তা
err.notfound|Not found.|পাওয়া যায়নি।
err.generic|Something went wrong.|কিছু একটা সমস্যা হয়েছে।
err.storage|Storage is not available or failed. Your data may not be saved.|স্টোরেজ পাওয়া যাচ্ছে না বা ব্যর্থ হয়েছে। আপনার তথ্য সংরক্ষিত নাও হতে পারে।
err.storageBanner|Local storage is unavailable (private mode or blocked). You can read content, but nothing can be saved.|লোকাল স্টোরেজ পাওয়া যাচ্ছে না (প্রাইভেট মোড বা বন্ধ)। আপনি পড়তে পারবেন, কিন্তু কিছু সংরক্ষণ হবে না।
err.required|This field is required.|এই ঘরটি আবশ্যক।
err.invalid|Enter a valid number.|সঠিক সংখ্যা লিখুন।
err.negative|Must not be negative.|ঋণাত্মক হতে পারবে না।
err.zero|Must be greater than zero.|শূন্যের বেশি হতে হবে।
err.unit|Choose a valid unit.|সঠিক একক বেছে নিন।
err.range|Value is out of the allowed range.|মান অনুমোদিত সীমার বাইরে।
err.date|Enter a valid date.|সঠিক তারিখ দিন।
home.title|What do you need today?|আজ কী প্রয়োজন?
home.searchPh|Search defects, terms, lessons, notes…|ত্রুটি, শব্দ, পাঠ, নোট খুঁজুন…
home.defects|Fabric Defect Solver|কাপড়ের ত্রুটি সমাধান
home.setup|Machine Setup Guide|মেশিন সেটআপ গাইড
home.calc|Calculator Center|ক্যালকুলেটর সেন্টার
home.shift|Production & Shift Book|উৎপাদন ও শিফট বুক
home.maint|Maintenance Checklist|রক্ষণাবেক্ষণ চেকলিস্ট
home.learn|Learning Center|শেখার কেন্দ্র
home.dict|Dictionary|অভিধান
home.notebook|Machine Notebook|মেশিন নোটবুক
home.backup|Backup and Restore|ব্যাকআপ ও রিস্টোর
home.backupDue|You have saved data but no recent backup.|আপনার সংরক্ষিত তথ্য আছে কিন্তু সাম্প্রতিক ব্যাকআপ নেই।
home.backupNow|Back up now|এখনই ব্যাকআপ নিন
home.safetyFoot|Never touch moving parts. Stop and isolate the machine first. Follow factory SOP.|চলন্ত অংশ ধরবেন না। আগে মেশিন বন্ধ ও আইসোলেট করুন। কারখানার SOP মানুন।
search.none|No results.|কোনো ফলাফল নেই।
search.type.defect|Defect|ত্রুটি
search.type.guide|Machine guide|মেশিন গাইড
search.type.dict|Dictionary|অভিধান
search.type.lesson|Lesson|পাঠ
search.type.note|Note|নোট
search.type.machine|Machine|মেশিন
fabric.single-jersey|Single Jersey|সিঙ্গেল জার্সি
fabric.rib|Rib|রিব
fabric.interlock|Interlock|ইন্টারলক
fabric.fleece|Fleece|ফ্লিস
fabric.other|Other|অন্যান্য
def.searchPh|Search defects (English or বাংলা)…|ত্রুটি খুঁজুন (English বা বাংলা)…
def.custom|Custom|নিজের তৈরি
def.none|No defects match.|কোনো ত্রুটি মেলেনি।
def.bookmark|Bookmark|বুকমার্ক
def.bookmarked|Bookmarked|বুকমার্ক করা
def.add|Add custom defect|নিজের ত্রুটি যোগ করুন
def.recent|Recently viewed|সম্প্রতি দেখা
def.disclaimer|Causes listed are possible causes only. Confirm by inspection and follow your factory SOP. No fix works for every machine.|এখানের কারণগুলো শুধু সম্ভাব্য কারণ। পরীক্ষা করে নিশ্চিত হন এবং কারখানার SOP মানুন। কোনো সমাধান সব মেশিনে কাজ করে না।
def.deleteTitle|Delete this defect?|এই ত্রুটি মুছবেন?
def.deleteMsg|The custom defect entry will be removed.|আপনার তৈরি ত্রুটির এন্ট্রি মুছে যাবে।
def.symptoms|Observable symptoms|দৃশ্যমান লক্ষণ
def.causes|Possible causes|সম্ভাব্য কারণ
def.causesNote|These are possibilities, not confirmed causes.|এগুলো সম্ভাবনা, নিশ্চিত কারণ নয়।
def.diagnostic|Safe diagnostic checklist|নিরাপদ নির্ণয় চেকলিস্ট
def.inspection|Recommended inspection steps|পরিদর্শনের ধাপ
def.actions|Corrective actions|সংশোধনমূলক ব্যবস্থা
def.verify|Verification after correction|সংশোধনের পর যাচাই
def.related|Related defects|সম্পর্কিত ত্রুটি
def.notes|Personal notes|ব্যক্তিগত নোট
def.notesLabel|Your notes|আপনার নোট
def.confirmed|Confirmed cause (only if verified)|নিশ্চিত কারণ (শুধু যাচাই হলে)
def.confirmedHint|Write here only a cause you have actually confirmed on your machine.|শুধু আপনার মেশিনে যে কারণ সত্যিই নিশ্চিত হয়েছে তা লিখুন।
def.f.name|Defect name|ত্রুটির নাম
def.f.cat|Category|বিভাগ
def.f.oneLine|One item per line|প্রতি লাইনে একটি করে
def.f.fabrics|Fabric types|কাপড়ের ধরন
def.customSafety|Do not write instructions that require touching moving parts. Stop and isolate the machine first.|চলন্ত অংশ ধরার নির্দেশ লিখবেন না। আগে মেশিন বন্ধ ও আইসোলেট করুন।
mach.guides|Machine component guides|মেশিনের অংশ গাইড
mach.kind.component|Component|অংশ
mach.kind.fabric|Fabric setup|কাপড়ের সেটআপ
mach.safety|Educational content only. Stop and isolate the machine per approved procedure before any internal inspection. Follow the manufacturer's manual and factory SOP.|শুধু শিক্ষামূলক। অভ্যন্তরীণ পরিদর্শনের আগে অনুমোদিত নিয়মে মেশিন বন্ধ ও আইসোলেট করুন। প্রস্তুতকারকের ম্যানুয়াল ও কারখানার SOP মানুন।
mach.profiles|Machine profiles|মেশিন প্রোফাইল
mach.add|Add machine|মেশিন যোগ করুন
mach.edit|Edit machine|মেশিন সম্পাদনা
mach.none|No machines yet. Add your first machine profile.|এখনো মেশিন নেই। প্রথম মেশিন প্রোফাইল যোগ করুন।
mach.needlesShort|needles|সুই
mach.deleteTitle|Delete this machine?|এই মেশিন মুছবেন?
mach.deleteMsg|The profile is removed. Existing shift and maintenance records keep the machine ID text.|প্রোফাইল মুছে যাবে। আগের শিফট ও রক্ষণাবেক্ষণ রেকর্ডে মেশিন আইডি লেখা থাকবে।
mach.f.id|Machine ID|মেশিন আইডি
mach.f.fabric|Fabric type|কাপড়ের ধরন
mach.f.diameter|Diameter (inch)|ব্যাস (ইঞ্চি)
mach.f.gauge|Gauge (needles per inch)|গেজ (প্রতি ইঞ্চি সুই)
mach.f.needles|Needle count|সুইয়ের সংখ্যা
mach.f.feeders|Feeder count|ফিডার সংখ্যা
mach.f.notes|Notes|নোট
mach.dup|A machine with this ID already exists.|এই আইডির মেশিন আগে থেকেই আছে।
mach.renameNote|Old records keep the previous machine ID text.|পুরোনো রেকর্ডে আগের মেশিন আইডি লেখা থাকবে।
mach.logWork|Log maintenance|রক্ষণাবেক্ষণ লিখুন
mach.notesBtn|Notes ({n})|নোট ({n})
mach.history|Maintenance history|রক্ষণাবেক্ষণের ইতিহাস
mach.noHistory|No maintenance records for this machine.|এই মেশিনের কোনো রক্ষণাবেক্ষণ রেকর্ড নেই।
maint.safety|Stop the machine and apply approved isolation before internal checks. Use only the lubricant and amount approved by the manufacturer/factory.|ভেতরের পরীক্ষার আগে মেশিন বন্ধ করে অনুমোদিত আইসোলেশন করুন। শুধু প্রস্তুতকারক/কারখানা অনুমোদিত লুব্রিক্যান্ট ও পরিমাণ ব্যবহার করুন।
maint.tab.lists|Checklists|চেকলিস্ট
maint.tab.log|Log entry|এন্ট্রি লিখুন
maint.tab.history|History|ইতিহাস
maint.items|{n} items|{n}টি আইটেম
maint.run|Run checklist|চেকলিস্ট চালান
maint.editItems|Edit items|আইটেম সম্পাদনা
maint.machinePh|Machine ID|মেশিন আইডি
maint.saveRun|Save checklist run|চেকলিস্ট সংরক্ষণ
maint.newItem|Add your own item|নিজের আইটেম যোগ করুন
maint.newItemPh|New checklist item|নতুন চেকলিস্ট আইটেম
maint.markSafety|Mark as safety-critical|নিরাপত্তা-সংক্রান্ত হিসেবে চিহ্নিত করুন
maint.deleteItem|Remove this item?|এই আইটেম সরাবেন?
maint.deleteRec|Delete this record?|এই রেকর্ড মুছবেন?
maint.none|No records yet.|এখনো কোনো রেকর্ড নেই।
maint.pcs|pcs|টি
maint.f.type|Entry type|এন্ট্রির ধরন
maint.f.date|Date|তারিখ
maint.f.machine|Machine ID|মেশিন আইডি
maint.f.title|Issue / work done|সমস্যা / কাজ
maint.f.reason|Downtime reason|ডাউনটাইমের কারণ
maint.f.minutes|Downtime (minutes)|ডাউনটাইম (মিনিট)
maint.f.count|Needles/sinkers replaced|বদলানো সুই/সিঙ্কার
maint.f.countHint|Leave empty if none.|না থাকলে ফাঁকা রাখুন।
maint.f.position|Position / location|অবস্থান
maint.f.note|Notes|নোট
maint.type.issue|Issue|সমস্যা
maint.type.downtime|Downtime|ডাউনটাইম
maint.type.inspection|Needle/sinker inspection|সুই/সিঙ্কার পরিদর্শন
maint.type.lubrication|Lubrication|লুব্রিকেশন
maint.type.checklist|Checklist|চেকলিস্ট
calc.disclaimer|Results are calculations from your inputs. Estimates are not exact; check machine-specific data and factory standards.|ফলাফল আপনার দেওয়া তথ্যের হিসাব। অনুমান নিখুঁত নয়; মেশিনের নির্দিষ্ট তথ্য ও কারখানার মান দেখুন।
calc.steps|Steps|ধাপসমূহ
calc.save|Save to history|হিস্ট্রিতে সংরক্ষণ
calc.history|Saved calculations|সংরক্ষিত হিসাব
calc.reuse|Reuse|আবার ব্যবহার
calc.deleteTitle|Delete this saved calculation?|এই সংরক্ষিত হিসাব মুছবেন?
calc.noHistory|No saved calculations yet.|এখনো কোনো সংরক্ষিত হিসাব নেই।
calc.formula|Formula|সূত্র
calc.calculate|Calculate|হিসাব করুন
calc.example|Fill example|উদাহরণ দিন
calc.reset|Reset|রিসেট
calc.estimate|Estimate|অনুমান
calc.gsm|GSM Calculator|জিএসএম ক্যালকুলেটর
calc.gsm.mass|Sample mass|নমুনার ওজন
calc.gsm.area|Sample area|নমুনার ক্ষেত্রফল
calc.gsm.formula|GSM = mass (g) ÷ area (m²)|GSM = ওজন (g) ÷ ক্ষেত্রফল (m²)
calc.gsm.s1|Mass: {v} {u} = {g} g|ওজন: {v} {u} = {g} g
calc.gsm.s2|Area: {v} {u} = {m} m²|ক্ষেত্রফল: {v} {u} = {m} m²
calc.gsm.s3|GSM = {g} ÷ {m} = {r}|GSM = {g} ÷ {m} = {r}
calc.gsm.note|Measure the sample the way your factory requires (for example relaxed fabric) and compare with the style tolerance.|কারখানার নিয়ম অনুযায়ী (যেমন রিল্যাক্স করা কাপড়) নমুনা মাপুন এবং স্টাইলের সহনশীলতার সাথে তুলনা করুন।
calc.fabric|Fabric Weight Calculator|কাপড়ের ওজন ক্যালকুলেটর
calc.fabric.gsm|GSM|GSM
calc.fabric.length|Length|দৈর্ঘ্য
calc.fabric.width|Width|প্রস্থ
calc.fabric.formula|Mass = GSM × length (m) × width (m)|ওজন = GSM × দৈর্ঘ্য (m) × প্রস্থ (m)
calc.fabric.s1|Length {l} m × width {w} m = area {a} m²|দৈর্ঘ্য {l} m × প্রস্থ {w} m = ক্ষেত্রফল {a} m²
calc.fabric.s2|Mass = {g} g = {kg} kg|ওজন = {g} g = {kg} kg
calc.fabric.note|Uses the width you enter (for example open or tubular width as measured).|আপনার দেওয়া প্রস্থ ব্যবহার হয় (যেমন মাপা খোলা বা টিউবুলার প্রস্থ)।
calc.target|Target vs Actual|লক্ষ্য বনাম প্রকৃত
calc.target.target|Target production|লক্ষ্য উৎপাদন
calc.target.actual|Actual production|প্রকৃত উৎপাদন
calc.target.unit|Unit (kg, m, pcs…)|একক (kg, m, pcs…)
calc.target.unitHint|Target and actual must use the same unit.|লক্ষ্য ও প্রকৃত একই এককে দিন।
calc.target.formula|Achievement % = actual ÷ target × 100|অর্জন % = প্রকৃত ÷ লক্ষ্য × ১০০
calc.target.zero|n/a|প্রযোজ্য নয়
calc.target.zeroMsg|Target is zero, so achievement % is not calculated.|লক্ষ্য শূন্য, তাই অর্জন % হিসাব করা হয়নি।
calc.target.s1|{a} ÷ {t} × 100 = {p} %|{a} ÷ {t} × ১০০ = {p} %
calc.target.s2|Difference (actual − target): {d} {u}|পার্থক্য (প্রকৃত − লক্ষ্য): {d} {u}
calc.target.s3|Remaining target: {r} {u}|বাকি লক্ষ্য: {r} {u}
calc.target.s4|Above target by: {s} {u}|লক্ষ্যের চেয়ে বেশি: {s} {u}
calc.prod|RPM & Production Estimate|আরপিএম ও উৎপাদন অনুমান
calc.prod.rpm|Machine RPM|মেশিন RPM
calc.prod.feeders|Number of feeders|ফিডার সংখ্যা
calc.prod.needles|Total needles|মোট সুই
calc.prod.needlesHint|Needles knitting at the machine (cylinder + dial for rib/interlock).|মেশিনের মোট সুই (রিব/ইন্টারলকে সিলিন্ডার + ডায়াল)।
calc.prod.sl|Stitch length (mm)|স্টিচ লেংথ (মিমি)
calc.prod.slHint|Yarn length per loop, from your style record.|প্রতি লুপে সুতার দৈর্ঘ্য, স্টাইল রেকর্ড থেকে।
calc.prod.count|Yarn count|সুতার কাউন্ট
calc.prod.system|Count system|কাউন্ট পদ্ধতি
calc.prod.share|Needle share per feeder (%)|প্রতি ফিডারে সুইয়ের অংশ (%)
calc.prod.shareHint|100 if every needle knits at every feeder. Some structures use fewer; check the machine manual.|প্রতি ফিডারে সব সুই বুনলে ১০০। কিছু গঠনে কম হয়; ম্যানুয়াল দেখুন।
calc.prod.eff|Efficiency (%)|দক্ষতা (%)
calc.prod.effHint|Empty = 100 % (no losses assumed).|ফাঁকা = ১০০% (কোনো ক্ষতি ধরা হয়নি)।
calc.prod.hours|Hours|ঘণ্টা
calc.prod.hoursHint|Empty = 1 hour.|ফাঁকা = ১ ঘণ্টা।
calc.prod.cpc|Courses per cm (optional)|প্রতি সেমিতে কোর্স (ঐচ্ছিক)
calc.prod.cpcHint|Needed only for fabric length per hour.|শুধু ঘণ্টায় কাপড়ের দৈর্ঘ্যের জন্য লাগে।
calc.prod.formula|Yarn per revolution = feeders × needles × share × stitch length; kg/h = yarn length ÷ (metres per gram of the yarn) × RPM × 60 × efficiency|প্রতি ঘূর্ণনে সুতা = ফিডার × সুই × অংশ × স্টিচ লেংথ; kg/h = সুতার দৈর্ঘ্য ÷ (সুতার মিটার প্রতি গ্রাম) × RPM × ৬০ × দক্ষতা
calc.prod.s1|Yarn per revolution = {m} m|প্রতি ঘূর্ণনে সুতা = {m} মি
calc.prod.s2|Yarn per hour at {e} % efficiency = {m} m|{e} % দক্ষতায় প্রতি ঘণ্টায় সুতা = {m} মি
calc.prod.s3|≈ {kg} kg/h; for {h} h ≈ {t} kg|≈ {kg} kg/ঘণ্টা; {h} ঘণ্টায় ≈ {t} kg
calc.prod.noLen|Fabric length per hour not calculated (courses per cm not given).|ঘণ্টায় কাপড়ের দৈর্ঘ্য হিসাব হয়নি (প্রতি সেমিতে কোর্স দেওয়া হয়নি)।
calc.prod.s4|Fabric ≈ {m} m/h; for the period ≈ {t} m|কাপড় ≈ {m} মি/ঘণ্টা; পুরো সময়ে ≈ {t} মি
calc.prod.assume1|Estimate only: assumes each counted needle forms one loop at each feeder pass (no tuck or miss).|শুধু অনুমান: ধরা হয়েছে প্রতি ফিডারে গণনা করা প্রতিটি সুই একটি লুপ গড়ে (টাক বা মিস নেই)।
calc.prod.assume2|Lycra or other extra yarns are not included.|লাইক্রা বা অতিরিক্ত সুতা ধরা হয়নি।
calc.prod.assume3|Real output differs with machine design, stoppages and fabric structure. Not an exact result.|প্রকৃত উৎপাদন মেশিনের নকশা, বন্ধ থাকা ও কাপড়ের গঠনের উপর ভিন্ন হয়। এটি নিখুঁত ফলাফল নয়।
calc.yarn|Yarn Consumption|সুতা ব্যবহার
calc.yarn.fabric|Fabric weight (kg)|কাপড়ের ওজন (kg)
calc.yarn.yarn|Yarn used (kg)|ব্যবহৃত সুতা (kg)
calc.yarn.basis|Measurement basis|পরিমাপের ভিত্তি
calc.yarn.basisHint|Choose whether your numbers are measured or theoretical estimates.|আপনার সংখ্যা মাপা না তাত্ত্বিক অনুমান তা বেছে নিন।
calc.yarn.measured|Measured|মাপা
calc.yarn.theoretical|Theoretical estimate|তাত্ত্বিক অনুমান
calc.yarn.formula|Ratio = yarn ÷ fabric; difference = yarn − fabric|অনুপাত = সুতা ÷ কাপড়; পার্থক্য = সুতা − কাপড়
calc.yarn.s1|Ratio = {y} ÷ {f} = {r}|অনুপাত = {y} ÷ {f} = {r}
calc.yarn.s2|Difference = {d} kg ({pf} % of fabric, {py} % of yarn)|পার্থক্য = {d} kg (কাপড়ের {pf} %, সুতার {py} %)
calc.yarn.note|The result is labelled with the basis you chose. Theoretical values are not measured results.|ফলাফলে আপনার বেছে নেওয়া ভিত্তি লেখা থাকে। তাত্ত্বিক মান মাপা ফলাফল নয়।
calc.mach|Machine Reference|মেশিন রেফারেন্স
calc.mach.dia|Diameter (inch)|ব্যাস (ইঞ্চি)
calc.mach.gauge|Gauge (needles per inch)|গেজ (প্রতি ইঞ্চি সুই)
calc.mach.needles|Needle count (from machine plate)|সুইয়ের সংখ্যা (মেশিন প্লেট থেকে)
calc.mach.feeders|Feeders|ফিডার
calc.mach.rpm|RPM|RPM
calc.mach.formula|Needles ≈ π × diameter × gauge; surface speed = π × diameter × RPM|সুই ≈ π × ব্যাস × গেজ; পৃষ্ঠের গতি = π × ব্যাস × RPM
calc.mach.needlesUnit|needles|সুই
calc.mach.s1|Approximate needles from diameter and gauge: {n}|ব্যাস ও গেজ থেকে আনুমানিক সুই: {n}
calc.mach.s2|Entered count differs from the approximation by {p} %|দেওয়া সংখ্যা আনুমানিক মানের থেকে {p} % ভিন্ন
calc.mach.s3|Cylinder surface speed ≈ {v} m/min|সিলিন্ডারের পৃষ্ঠের গতি ≈ {v} মি/মিনিট
calc.mach.s4|Needle-feeder positions per revolution: {v}|প্রতি ঘূর্ণনে সুই-ফিডার অবস্থান: {v}
calc.mach.s5|Feeder passes per hour: {v}|প্রতি ঘণ্টায় ফিডার পাস: {v}
calc.mach.note|The needle estimate is a geometric approximation. Use the machine plate or manual for the true count.|সুইয়ের হিসাব জ্যামিতিক আনুমানিক। প্রকৃত সংখ্যার জন্য মেশিন প্লেট বা ম্যানুয়াল দেখুন।
shift.records|Records|রেকর্ড
shift.summary|Summaries|সারসংক্ষেপ
shift.handover|Handover|হ্যান্ডওভার
shift.new|New record|নতুন রেকর্ড
shift.edit|Edit record|রেকর্ড সম্পাদনা
shift.csv|Export CSV|CSV এক্সপোর্ট
shift.shiftWord|Shift|শিফট
shift.downtimeShort|down {m} min|বন্ধ {m} মিনিট
shift.noMatch|No records match the filters.|ফিল্টারে কোনো রেকর্ড মেলেনি।
shift.empty|No shift records yet. Add your first record.|এখনো শিফট রেকর্ড নেই। প্রথম রেকর্ড যোগ করুন।
shift.count|{n} records|{n}টি রেকর্ড
shift.nothingExport|Nothing to export.|এক্সপোর্ট করার কিছু নেই।
shift.deleteTitle|Delete this record?|এই রেকর্ড মুছবেন?
shift.deleteMsg|The shift record will be permanently removed.|শিফট রেকর্ডটি স্থায়ীভাবে মুছে যাবে।
shift.achieve|Achievement|অর্জন
shift.unitHint|Totals are kept separately for each unit.|প্রতিটি এককের মোট আলাদা রাখা হয়।
shift.unitsNote|Totals are never mixed across different units.|ভিন্ন এককের মোট কখনো মিশ্রিত হয় না।
shift.sum.daily|Daily summary|দৈনিক সারসংক্ষেপ
shift.sum.machine|Machine-wise summary|মেশিন অনুযায়ী সারসংক্ষেপ
shift.sum.downtime|Downtime by reason|কারণ অনুযায়ী ডাউনটাইম
shift.sum.noDowntime|No downtime recorded.|কোনো ডাউনটাইম লেখা নেই।
shift.sum.actualTarget|Actual / target|প্রকৃত / লক্ষ্য
shift.sum.achieve|Achieved|অর্জন
shift.f.date|Date|তারিখ
shift.f.from|From date|শুরুর তারিখ
shift.f.to|To date|শেষ তারিখ
shift.f.shift|Shift|শিফট
shift.f.operator|Operator / nickname|অপারেটর / ডাকনাম
shift.f.machine|Machine ID|মেশিন আইডি
shift.f.machineId|Machine|মেশিন
shift.f.fabric|Fabric|কাপড়
shift.f.fabricType|Fabric type|কাপড়ের ধরন
shift.f.style|Style / order reference|স্টাইল / অর্ডার রেফারেন্স
shift.f.target|Target production|লক্ষ্য উৎপাদন
shift.f.actual|Actual production|প্রকৃত উৎপাদন
shift.f.unit|Production unit|উৎপাদনের একক
shift.f.downtimeMin|Downtime (minutes)|ডাউনটাইম (মিনিট)
shift.f.downtime|Downtime|ডাউনটাইম
shift.f.reason|Downtime reason|ডাউনটাইমের কারণ
shift.f.defects|Defect observations|ত্রুটির পর্যবেক্ষণ
shift.f.action|Corrective action|সংশোধনমূলক ব্যবস্থা
shift.f.handover|Handover notes|হ্যান্ডওভার নোট
shift.f.q|Search text|লেখা খুঁজুন
learn.progress|Your progress|আপনার অগ্রগতি
learn.lessonsDone|Lessons done: {a} / {b}|সম্পন্ন পাঠ: {a} / {b}
learn.quizRight|Questions answered correctly: {a} / {b}|সঠিক উত্তর: {a} / {b}
learn.startQuiz|Start quiz|কুইজ শুরু করুন
learn.startExercises|Defect exercises|ত্রুটি অনুশীলন
learn.lessons|Beginner lessons|শিক্ষানবিশ পাঠ
learn.markDone|Mark lesson as done|পাঠ সম্পন্ন চিহ্নিত করুন
learn.doneAgain|Done (mark again)|সম্পন্ন (আবার চিহ্নিত)
learn.quiz|Quiz|কুইজ
learn.exercises|Defect identification exercises|ত্রুটি শনাক্তকরণ অনুশীলন
learn.qOf|Question {a} of {b}|প্রশ্ন {a} / {b}
learn.correct|Correct|সঠিক
learn.wrong|Not correct|সঠিক নয়
learn.next|Next|পরবর্তী
learn.finish|Finish|শেষ করুন
learn.score|Score: {a} / {b}|স্কোর: {a} / {b}
learn.again|Try again|আবার চেষ্টা
dict.searchPh|Search terms (English or বাংলা)…|শব্দ খুঁজুন (English বা বাংলা)…
notes.add|Add note|নোট যোগ করুন
notes.edit|Edit note|নোট সম্পাদনা
notes.text|Note|নোট
notes.none|No notes yet.|এখনো কোনো নোট নেই।
notes.deleteTitle|Delete this note?|এই নোট মুছবেন?
more.settings|Settings|সেটিংস
more.about|About & safety|পরিচিতি ও নিরাপত্তা
set.language|Language|ভাষা
set.theme|Theme|থিম
set.theme.auto|Automatic|স্বয়ংক্রিয়
set.theme.light|Light|হালকা
set.theme.dark|Dark|গাঢ়
set.units|Production units|উৎপাদনের একক
set.unitsHint|Comma separated, for example: kg, m, pcs, roll|কমা দিয়ে লিখুন, যেমন: kg, m, pcs, roll
about.safety|Never touch moving machine parts. Stop the machine and use approved isolation before any internal inspection. Follow the manufacturer's manual and your factory SOP. This app is a helper, not a replacement.|চলন্ত অংশ কখনো ধরবেন না। অভ্যন্তরীণ পরিদর্শনের আগে মেশিন বন্ধ করে অনুমোদিত আইসোলেশন করুন। প্রস্তুতকারকের ম্যানুয়াল ও কারখানার SOP মানুন। এই অ্যাপ সহায়ক, বিকল্প নয়।
about.offline|Works offline. No account, server, or internet is needed after installation.|অফলাইনে চলে। ইনস্টলের পর অ্যাকাউন্ট, সার্ভার বা ইন্টারনেট লাগে না।
about.storage|Data stays on this device. The web app and the Android app keep separate storage and do not sync. Move data with a backup file.|তথ্য এই ডিভাইসেই থাকে। ওয়েব অ্যাপ ও অ্যান্ড্রয়েড অ্যাপের স্টোরেজ আলাদা এবং সিঙ্ক হয় না। ব্যাকআপ ফাইল দিয়ে তথ্য সরান।
about.platform|Running as: {p}|চলছে: {p}
about.disclaimer|Defect causes and fixes are general guidance only and may not apply to every machine.|ত্রুটির কারণ ও সমাধান সাধারণ নির্দেশনা মাত্র; সব মেশিনে প্রযোজ্য নাও হতে পারে।
backup.storageNote|Browser or app data can be lost if you clear site/app data or uninstall. Back up regularly. Web and Android storage are separate.|সাইট/অ্যাপ ডেটা মুছলে বা আনইনস্টল করলে তথ্য হারাতে পারে। নিয়মিত ব্যাকআপ নিন। ওয়েব ও অ্যান্ড্রয়েড স্টোরেজ আলাদা।
backup.export|Export backup|ব্যাকআপ এক্সপোর্ট
backup.exportMsg|Saves all your machines, shift records, notes, calculations, bookmarks and progress to a JSON file.|আপনার সব মেশিন, শিফট রেকর্ড, নোট, হিসাব, বুকমার্ক ও অগ্রগতি একটি JSON ফাইলে সংরক্ষণ করে।
backup.exportBtn|Export JSON backup|JSON ব্যাকআপ এক্সপোর্ট
backup.import|Restore from backup|ব্যাকআপ থেকে রিস্টোর
backup.importMsg|Choose a backup file made by this app. You will be asked before anything is changed.|এই অ্যাপে তৈরি ব্যাকআপ ফাইল বেছে নিন। কিছু বদলানোর আগে নিশ্চিত করতে বলা হবে।
backup.choose|Choose backup file|ব্যাকআপ ফাইল বাছুন
backup.importBtn|Check and restore|যাচাই করে রিস্টোর
backup.noFile|Choose a backup file first.|আগে একটি ব্যাকআপ ফাইল বাছুন।
backup.readFail|The file could not be read.|ফাইলটি পড়া যায়নি।
backup.invalid|This backup cannot be used:|এই ব্যাকআপ ব্যবহার করা যাবে না:
backup.importTitle|Import backup|ব্যাকআপ ইমপোর্ট
backup.replaceMsg|Replace ALL current data with the backup ({n} records)? Current data will be lost.|বর্তমান সব তথ্য ব্যাকআপ ({n}টি রেকর্ড) দিয়ে বদলাবেন? বর্তমান তথ্য হারিয়ে যাবে।
backup.replace|Replace all data|সব তথ্য বদলান
backup.mergeMsg|Merge the backup ({n} records) into current data instead? Records with the same ID are overwritten.|বদলে ব্যাকআপ ({n}টি রেকর্ড) বর্তমান তথ্যের সাথে মেলাবেন? একই আইডির রেকর্ড নতুনটি দিয়ে বদলাবে।
backup.merge|Merge|মেলান
backup.restored|Restored {n} records.|{n}টি রেকর্ড রিস্টোর হয়েছে।
backup.move|Move data between installs|এক ইনস্টল থেকে অন্যটিতে তথ্য সরানো
backup.moveMsg|Export a backup on the old install, send the file to the new one (for example by messaging yourself), then restore it there. The web app and the APK do not share data automatically.|পুরোনো ইনস্টলে ব্যাকআপ এক্সপোর্ট করে ফাইলটি নতুনটিতে পাঠান (যেমন নিজেকে মেসেজ করে), তারপর সেখানে রিস্টোর করুন। ওয়েব অ্যাপ ও APK নিজে থেকে তথ্য ভাগ করে না।
backup.clear|Clear all data|সব তথ্য মুছুন
backup.clearHint|Back up first. This removes all machines, records, notes and progress from this install.|আগে ব্যাকআপ নিন। এতে এই ইনস্টল থেকে সব মেশিন, রেকর্ড, নোট ও অগ্রগতি মুছে যাবে।
backup.clearAll|Clear all data|সব তথ্য মুছুন
backup.clearTitle|Clear all data?|সব তথ্য মুছবেন?
backup.clearMsg|Everything you saved in this install will be deleted permanently. Export a backup first if you may need it.|এই ইনস্টলে আপনার সংরক্ষিত সব কিছু স্থায়ীভাবে মুছে যাবে। প্রয়োজন হতে পারে মনে হলে আগে ব্যাকআপ নিন।
backup.clearCheck|I understand this cannot be undone|আমি বুঝেছি এটি ফেরানো যাবে না
backup.cleared|All data cleared.|সব তথ্য মুছে ফেলা হয়েছে।
backup.result.saved|File saved or downloaded.|ফাইল সংরক্ষিত বা ডাউনলোড হয়েছে।
backup.result.shared|File ready: choose where to save or send it.|ফাইল তৈরি: কোথায় সংরক্ষণ বা পাঠাবেন বাছুন।
backup.result.copied|Could not save a file; the content was copied to the clipboard.|ফাইল সংরক্ষণ হয়নি; লেখাটি ক্লিপবোর্ডে কপি হয়েছে।
backup.result.failed|Could not save or share the file.|ফাইল সংরক্ষণ বা শেয়ার করা যায়নি।
backup.notObject|The file is not a valid backup.|ফাইলটি বৈধ ব্যাকআপ নয়।
backup.notJson|The file is not valid JSON.|ফাইলটি বৈধ JSON নয়।
backup.wrongApp|This file was not made by this app.|এই ফাইল এই অ্যাপে তৈরি নয়।
backup.badVersion|The schema version is missing or invalid.|স্কিমা সংস্করণ নেই বা ভুল।
backup.newerVersion|The backup is from a newer app version. Update the app first.|ব্যাকআপটি নতুন অ্যাপ সংস্করণের। আগে অ্যাপ আপডেট করুন।
backup.noData|The backup has no data section.|ব্যাকআপে ডেটা অংশ নেই।
backup.unknownStore|Unknown data group|অজানা তথ্য গ্রুপ
backup.badStore|A data group has the wrong format|একটি তথ্য গ্রুপের ফরম্যাট ভুল
backup.badRecord|A record is missing its ID|একটি রেকর্ডে আইডি নেই
backup.duplicate|Duplicate record ID|একই রেকর্ড আইডি দুইবার
"""
out={}
for line in S.strip().splitlines():
    k,en,bn=line.split("|")
    assert k not in out,k
    out[k]={"en":en,"bn":bn}
json.dump(out,open("src/data/ui.json","w",encoding="utf-8"),ensure_ascii=False,indent=0)
print(len(out))
