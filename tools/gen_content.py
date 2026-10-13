import json
def P(en,bn): return {"en":en,"bn":bn}
SAFE_G=P("Educational overview only. Always follow the machine manufacturer's manual and your factory SOP. Stop and isolate the machine before touching any internal part.","এটি শুধু শিক্ষামূলক ধারণা। সবসময় মেশিন প্রস্তুতকারকের ম্যানুয়াল ও কারখানার SOP মানুন। কোনো অভ্যন্তরীণ অংশ ছোঁয়ার আগে মেশিন বন্ধ ও আইসোলেট করুন।")
G=[]
def g(i,kind,en,bn,pen,pbn): G.append({"id":i,"kind":kind,"title":P(en,bn),"body":P(pen,pbn),"safety":SAFE_G})
g("needles","component","Needles","সুই (নিডল)",["The needle forms the loop: its hook catches yarn, the latch opens and closes, and the butt follows the cam track that moves it up and down.","Needle type and gauge must match the machine and the style card. Bent hooks, sticking latches or worn butts commonly cause lines, holes and drop stitches.","Replace needles only with the correct type, following factory SOP, with the machine stopped and isolated."],["সুই লুপ তৈরি করে: হুক সুতা ধরে, ল্যাচ খোলে ও বন্ধ হয়, আর বাট ক্যামের পথ ধরে সুইকে উপরে-নিচে নেয়।","সুইয়ের ধরন ও গেজ মেশিন ও স্টাইল কার্ডের সাথে মিলতে হবে। বাঁকা হুক, আটকানো ল্যাচ বা ক্ষয়া বাট প্রায়ই লাইন, ছিদ্র ও ড্রপ স্টিচের কারণ হয়।","শুধু কারখানার SOP মেনে, মেশিন বন্ধ ও আইসোলেট রেখে সঠিক ধরনের সুই বদলান।"])
g("sinkers","component","Sinkers","সিঙ্কার",["Sinkers sit between needles on single-jersey and fleece machines. They hold the old loop down while the needle rises and help with loop control and fabric take-down.","Worn or wrong sinkers can cause sinker marks and uneven stitches."],["সিঙ্গেল জার্সি ও ফ্লিস মেশিনে সিঙ্কার সুইয়ের মাঝে থাকে। সুই উঠলে এটি পুরোনো লুপ চেপে রাখে এবং লুপ নিয়ন্ত্রণে সাহায্য করে।","ক্ষয়া বা ভুল সিঙ্কারে সিঙ্কার মার্ক ও অসম স্টিচ হতে পারে।"])
g("cams","component","Cams","ক্যাম",["Cams are shaped tracks that move the needle butts up and down to knit, tuck or miss. Their settings decide loop size and timing.","Cam settings are for the authorised mechanic. Operators should not change them."],["ক্যাম হলো আকৃতিযুক্ত পথ যা সুইয়ের বাটকে উপরে-নিচে সরিয়ে নিট, টাক বা মিস করায়। এর সেটিং লুপের আকার ও টাইমিং ঠিক করে।","ক্যাম সেটিং অনুমোদিত মেকানিকের কাজ। অপারেটর বদলাবেন না।"])
g("feeders","component","Feeders","ফিডার",["A feeder is a yarn feeding point around the cylinder where yarn is delivered to the needles. More feeders generally means more courses per revolution.","Feeder position and yarn tension affect stitch quality."],["ফিডার হলো সিলিন্ডারের চারপাশে সুতা সরবরাহের স্থান যেখানে সুই সুতা পায়। বেশি ফিডার মানে সাধারণত প্রতি ঘূর্ণনে বেশি কোর্স।","ফিডারের অবস্থান ও সুতার টেনশন স্টিচের মানে প্রভাব ফেলে।"])
g("yarn-guides","component","Yarn guides","ইয়ার্ন গাইড",["Yarn guides, eyelets and tensioners control the yarn path from cone to feeder. Rough or worn guides cause breakage and tension variation.","Keep guides clean. Report worn guides to the mechanic."],["ইয়ার্ন গাইড, আইলেট ও টেনশনার কোন থেকে ফিডার পর্যন্ত সুতার পথ নিয়ন্ত্রণ করে। খসখসে বা ক্ষয়া গাইডে সুতা ছেঁড়ে ও টেনশন অসম হয়।","গাইড পরিষ্কার রাখুন। ক্ষয়া গাইড মেকানিককে জানান।"])
g("gauge","component","Gauge","গেজ",["Gauge is the number of needles per inch along the cylinder circumference (e.g. 24G = 24 needles per inch). Higher gauge means finer needles and finer fabric.","Choose yarn count to suit the gauge; follow the style card."],["গেজ হলো সিলিন্ডারের পরিধি বরাবর প্রতি ইঞ্চিতে সুইয়ের সংখ্যা (যেমন 24G = প্রতি ইঞ্চিতে ২৪টি সুই)। বেশি গেজ মানে সরু সুই ও সূক্ষ্ম কাপড়।","গেজ অনুযায়ী সুতার কাউন্ট বেছে নিন; স্টাইল কার্ড অনুসরণ করুন।"])
g("diameter","component","Machine diameter","মেশিনের ব্যাস",["Diameter is the cylinder diameter in inches (e.g. 30 inch). With gauge it roughly fixes the needle count and the open fabric width.","The Machine Reference calculator shows the approximate relation: needles ≈ π × diameter × gauge. The maker's real needle count may differ."],["ব্যাস হলো সিলিন্ডারের ব্যাস ইঞ্চিতে (যেমন ৩০ ইঞ্চি)। গেজের সাথে এটি মোটামুটি সুইয়ের সংখ্যা ও খোলা কাপড়ের প্রস্থ ঠিক করে।","মেশিন রেফারেন্স ক্যালকুলেটর আনুমানিক সম্পর্ক দেখায়: সুই ≈ π × ব্যাস × গেজ। প্রস্তুতকারকের প্রকৃত সুইয়ের সংখ্যা ভিন্ন হতে পারে।"])
g("needle-count","component","Needle count","সুইয়ের সংখ্যা",["Needle count is the total number of needles in the cylinder (and dial for rib/interlock machines). It is given in the machine specification.","Use the number from the machine plate or manual rather than an estimate."],["সুইয়ের সংখ্যা হলো সিলিন্ডারে (এবং রিব/ইন্টারলকে ডায়ালে) মোট সুই। এটি মেশিনের স্পেসিফিকেশনে দেওয়া থাকে।","আন্দাজের বদলে মেশিন প্লেট বা ম্যানুয়ালের সংখ্যা ব্যবহার করুন।"])
g("single-jersey","fabric","Single Jersey setup","সিঙ্গেল জার্সি সেটআপ",["Single jersey is knitted on one needle bed (cylinder) with sinkers. One face shows knit loops, the other shows purl-like back loops.","Check before start: needle and sinker condition, yarn path, take-down, lint. Follow the pre-start checklist."],["সিঙ্গেল জার্সি এক সুই বেডে (সিলিন্ডার) সিঙ্কারসহ বোনা হয়। এক পিঠে নিট লুপ, অন্য পিঠে পার্ল-সদৃশ লুপ থাকে।","শুরুর আগে দেখুন: সুই ও সিঙ্কারের অবস্থা, সুতার পথ, টেক-ডাউন, লিন্ট। প্রি-স্টার্ট চেকলিস্ট অনুসরণ করুন।"])
g("rib","fabric","Rib setup","রিব সেটআপ",["Rib uses a cylinder and a dial so needles knit on both faces, giving a stretchy, ribbed fabric (e.g. 1x1).","Dial and cylinder relationship is set by the mechanic. Report any unusual noise or needle damage at once."],["রিব সিলিন্ডার ও ডায়াল ব্যবহার করে উভয় পিঠে সুই বুনে, ফলে স্থিতিস্থাপক রিবযুক্ত কাপড় হয় (যেমন ১x১)।","ডায়াল ও সিলিন্ডারের সম্পর্ক মেকানিক ঠিক করেন। অস্বাভাবিক শব্দ বা সুই ক্ষতি হলে সঙ্গে সঙ্গে জানান।"])
g("interlock","fabric","Interlock setup","ইন্টারলক সেটআপ",["Interlock is a double-faced structure knitted on cylinder and dial where feeders work in pairs, so both faces look alike. It is firmer and smoother than rib.","Feeder pairing and needle timing need correct setup by the mechanic."],["ইন্টারলক সিলিন্ডার ও ডায়ালে বোনা দ্বি-পিঠের কাঠামো যেখানে ফিডার জোড়ায় কাজ করে, তাই দুই পিঠ একই দেখায়। এটি রিবের চেয়ে শক্ত ও মসৃণ।","ফিডারের জোড়া ও সুইয়ের টাইমিং মেকানিকের সঠিক সেটআপ প্রয়োজন।"])
g("fleece","fabric","Fleece setup","ফ্লিস সেটআপ",["Fleece is typically single-jersey based with an extra yarn forming loops on the back, which can later be brushed. Back-loop evenness depends on yarn feed and tension.","Check pile yarn lots and back loops regularly."],["ফ্লিস সাধারণত সিঙ্গেল জার্সি ভিত্তিক, পেছনে অতিরিক্ত সুতায় লুপ তৈরি হয় যা পরে ব্রাশ করা যায়। পেছনের লুপের সমতা সুতার ফিড ও টেনশনের উপর নির্ভর করে।","পাইল সুতার লট ও পেছনের লুপ নিয়মিত দেখুন।"])
json.dump(G,open("src/data/guides.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)

T=[("needle","সুই (নিডল)","Hooked metal part that forms loops.","লুপ গঠনকারী হুকযুক্ত ধাতব অংশ।","নিডল"),
("sinker","সিঙ্কার","Part between needles that holds loops down.","সুইয়ের মাঝে থাকা অংশ যা লুপ চেপে রাখে।",""),
("cam","ক্যাম","Track that moves needle butts up and down.","যে পথ সুইয়ের বাটকে উপরে-নিচে নেয়।",""),
("cylinder","সিলিন্ডার","Round bed holding the needles.","সুই ধরে রাখা গোলাকার বেড।",""),
("dial","ডায়াল","Horizontal needle bed used for rib and interlock.","রিব ও ইন্টারলকে ব্যবহৃত আনুভূমিক সুই বেড।",""),
("feeder","ফিডার","Yarn feeding point.","সুতা সরবরাহের স্থান।",""),
("gauge","গেজ","Needles per inch.","প্রতি ইঞ্চিতে সুইয়ের সংখ্যা।",""),
("gsm","জিএসএম","Grams per square metre of fabric.","কাপড়ের প্রতি বর্গমিটারের ওজন (গ্রাম)।","ওজন"),
("stitch length","স্টিচ লেংথ","Yarn length used to form one loop.","একটি লুপ গঠনে ব্যবহৃত সুতার দৈর্ঘ্য।",""),
("loop","লুপ","Basic unit of knitted fabric.","নিট কাপড়ের মৌলিক একক।",""),
("wale","ওয়েল","Column of loops along the fabric length.","কাপড়ের দৈর্ঘ্য বরাবর লুপের সারি।",""),
("course","কোর্স","Row of loops across the fabric width.","কাপড়ের প্রস্থ বরাবর লুপের সারি।",""),
("yarn count","সুতার কাউন্ট","Measure of yarn fineness (Ne, tex, denier).","সুতার সূক্ষ্মতার মাপ (Ne, টেক্স, ডেনিয়ার)।","কাউন্ট"),
("lycra","লাইক্রা","Elastic yarn (spandex/elastane) for stretch.","স্থিতিস্থাপক সুতা (স্প্যানডেক্স/ইলাস্টেন)।","spandex elastane স্প্যানডেক্স"),
("greige fabric","গ্রে ফ্যাব্রিক","Knitted fabric before dyeing and finishing.","রঙ ও ফিনিশিংয়ের আগের বোনা কাপড়।","grey fabric"),
("take-down","টেক-ডাউন","System that pulls fabric down and winds it.","কাপড় নিচে টানা ও জড়ানোর ব্যবস্থা।",""),
("creel","ক্রিল","Rack that holds yarn cones.","সুতার কোন রাখার র‍্যাক।",""),
("tension","টেনশন","Pulling force on the yarn.","সুতার উপর টানের বল।",""),
("slub","স্লাব","Thick place in yarn.","সুতার মোটা অংশ।",""),
("tuck","টাক","Loop held without knitting off, forming a tuck stitch.","লুপ বুনে না ফেলে ধরে রাখা, টাক স্টিচ তৈরি করে।",""),
("miss","মিস (ফ্লোট)","Needle skipped so yarn floats behind.","সুই বাদ পড়ায় সুতা পেছনে ভাসে।","float"),
("rpm","আরপিএম","Revolutions per minute of the cylinder.","সিলিন্ডারের প্রতি মিনিটে ঘূর্ণন।",""),
("efficiency","দক্ষতা (এফিসিয়েন্সি)","Share of time the machine is productive.","মেশিন কতটা সময় উৎপাদনে থাকে তার অনুপাত।",""),
("downtime","ডাউনটাইম","Time the machine is stopped.","মেশিন বন্ধ থাকার সময়।","stoppage"),
("single jersey","সিঙ্গেল জার্সি","Plain knit on one needle bed.","এক সুই বেডে সাধারণ নিট।",""),
("rib","রিব","Fabric with vertical ribs, knitted with cylinder and dial.","উল্লম্ব রিবযুক্ত কাপড়, সিলিন্ডার ও ডায়ালে বোনা।",""),
("interlock","ইন্টারলক","Double-faced firm structure.","দ্বি-পিঠের শক্ত কাঠামো।",""),
("fleece","ফ্লিস","Fabric with back loops, often brushed.","পেছনে লুপযুক্ত কাপড়, প্রায়ই ব্রাশ করা।",""),
("drop stitch","ড্রপ স্টিচ","A missing loop in the fabric.","কাপড়ে একটি লুপ না থাকা।",""),
("needle line","নিডল লাইন","Line along the length caused by a needle fault.","সুইয়ের ত্রুটিতে দৈর্ঘ্য বরাবর লাইন।","সুই লাইন"),
("barre","বারে","Horizontal band or stripe defect.","আড়াআড়ি ব্যান্ড বা ডোরার ত্রুটি।","stripe ডোরা"),
("spirality","স্পাইরালিটি","Slant of wales in the fabric.","কাপড়ে ওয়েলের বাঁকা অবস্থা।","skew"),
("selvedge","সেলভেজ","Finished edge of fabric.","কাপড়ের প্রান্ত।",""),
("lint","লিন্ট","Loose fibre dust.","আলগা আঁশের ধুলো।","fly ফ্লাই"),
("lubrication","লুব্রিকেশন","Applying approved lubricant to moving parts.","চলন্ত অংশে অনুমোদিত লুব্রিক্যান্ট দেওয়া।","oiling"),
("lock-out","লক-আউট","Isolating energy so the machine cannot start during work.","কাজের সময় মেশিন চালু হওয়া ঠেকাতে শক্তি আলাদা করা।","isolation আইসোলেশন"),
("SOP","এসওপি","Standard operating procedure.","স্ট্যান্ডার্ড অপারেটিং প্রসিডিউর।",""),
("style change","স্টাইল চেঞ্জ","Changing the machine for a new product.","নতুন পণ্যের জন্য মেশিন পরিবর্তন।","")]
D=[{"id":t[0].replace(" ","-").lower(),"en":t[0],"bn":t[1],"def":P(t[2],t[3]),"aliases":t[4]} for t in T]
json.dump(D,open("src/data/dictionary.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)

A=[["needle line","সুই লাইন","নিডল লাইন","vertical line","লম্বা দাগ","line defect"],
["drop stitch","ড্রপ স্টিচ","missing loop","ladder","লুপ নেই"],
["hole","ছিদ্র","ফুটো","broken stitch","ছেঁড়া স্টিচ"],
["oil mark","তেলের দাগ","oil stain","grease","তেল"],
["barre","বারে","stripe","ডোরা","horizontal band","আড়াআড়ি দাগ"],
["lycra","লাইক্রা","spandex","elastane","স্প্যানডেক্স"],
["yarn breakage","সুতা ছিঁড়ে","সুতা ছেঁড়া","yarn break","stop motion"],
["crease","ভাঁজ","fold mark","fold","ভাঁজ দাগ"],
["gsm","জিএসএম","weight","ওজন","grammage"],
["sinker","সিঙ্কার","sinker mark"],
["needle","সুই","নিডল"],
["fleece","ফ্লিস","pile","brushing"],
["spirality","স্পাইরালিটি","skew","twist","বাঁকা"],
["downtime","ডাউনটাইম","stoppage","machine stop","মেশিন বন্ধ"],
["maintenance","রক্ষণাবেক্ষণ","মেইনটেন্যান্স","service"],
["lubrication","লুব্রিকেশন","oiling","তেল দেওয়া"],
["cylinder","সিলিন্ডার","dial","ডায়াল"],
["yarn count","কাউন্ট","সুতার কাউন্ট","ne","tex"],
["stitch length","স্টিচ লেংথ","সেলাইয়ের দৈর্ঘ্য","sl"],
["thick-thin","মোটা-চিকন","slub","স্লাব"]]
json.dump(A,open("src/data/aliases.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)

def it(en,bn,safety=False): return {"en":en,"bn":bn,"safety":safety}
C=[
{"id":"prestart","title":P("Pre-start inspection","চালুর আগের পরিদর্শন"),"items":[
 it("Confirm the machine is stopped and isolated per SOP before opening any guard","কোনো গার্ড খোলার আগে SOP অনুযায়ী মেশিন বন্ধ ও আইসোলেট নিশ্চিত করুন",True),
 it("Check guards and safety covers are closed and secured before restart","পুনরায় চালুর আগে গার্ড ও সেফটি কভার বন্ধ ও আটকানো আছে কি না দেখুন",True),
 it("Check needles and sinkers visually for damage or missing parts","সুই ও সিঙ্কারে ক্ষতি বা হারানো অংশ আছে কি না দেখুন"),
 it("Check yarn cones, creel and yarn path against the style card","কোন, ক্রিল ও সুতার পথ স্টাইল কার্ডের সাথে মিলান"),
 it("Check lint and remove it from feeders and the needle area per cleaning SOP","ফিডার ও সুই এলাকা থেকে SOP অনুযায়ী লিন্ট পরিষ্কার করুন"),
 it("Check take-down and fabric roll condition","টেক-ডাউন ও কাপড়ের রোলের অবস্থা দেখুন"),
 it("Confirm no tools or loose items remain on the machine","মেশিনে কোনো যন্ত্র বা আলগা জিনিস নেই নিশ্চিত করুন",True)]},
{"id":"stylechange","title":P("Style-change checklist","স্টাইল-চেঞ্জ চেকলিস্ট"),"items":[
 it("Stop and isolate the machine per SOP before any change","যেকোনো পরিবর্তনের আগে SOP অনুযায়ী মেশিন বন্ধ ও আইসোলেট করুন",True),
 it("Confirm new style card, yarn count and lot","নতুন স্টাইল কার্ড, সুতার কাউন্ট ও লট নিশ্চিত করুন"),
 it("Clear old yarn from creel, guides and feeders","ক্রিল, গাইড ও ফিডার থেকে পুরোনো সুতা সরান"),
 it("Mechanic changes settings per the approved setting sheet","অনুমোদিত সেটিং শিট অনুযায়ী মেকানিক সেটিং বদলান"),
 it("Run a sample and compare with the approved sample","নমুনা চালিয়ে অনুমোদিত নমুনার সাথে তুলনা করুন"),
 it("Record style change time and downtime","স্টাইল বদলের সময় ও ডাউনটাইম লিখুন")]},
{"id":"cleaning","title":P("Routine cleaning","নিয়মিত পরিষ্কার"),"items":[
 it("Stop and isolate the machine before cleaning near needles or cams","সুই বা ক্যামের কাছে পরিষ্কারের আগে মেশিন বন্ধ ও আইসোলেট করুন",True),
 it("Remove lint from feeders, guides and the needle area using approved tools","অনুমোদিত সরঞ্জামে ফিডার, গাইড ও সুই এলাকার লিন্ট সরান"),
 it("Clean creel and floor area around the machine","মেশিনের আশপাশের ক্রিল ও মেঝে পরিষ্কার করুন"),
 it("Wipe oil spills and report leaks","তেল পড়লে মুছুন এবং লিক জানান"),
 it("Never use compressed air toward people or into open mechanisms unless your SOP allows","SOP অনুমতি না দিলে মানুষের দিকে বা খোলা কলকবজায় কম্প্রেসড এয়ার ব্যবহার করবেন না",True)]},
{"id":"lubrication","title":P("Approved lubrication reminders","অনুমোদিত লুব্রিকেশন স্মরণিকা"),"items":[
 it("Use only the lubricant and quantity approved in the manufacturer's manual/factory SOP","শুধু প্রস্তুতকারকের ম্যানুয়াল/কারখানার SOP-তে অনুমোদিত লুব্রিক্যান্ট ও পরিমাণ ব্যবহার করুন",True),
 it("Lubricate only when the machine is stopped and isolated, unless an automatic system is fitted","স্বয়ংক্রিয় সিস্টেম না থাকলে শুধু মেশিন বন্ধ ও আইসোলেট অবস্থায় লুব্রিকেট করুন",True),
 it("Check the automatic lubrication level and lines for leaks","স্বয়ংক্রিয় লুব্রিকেশনের লেভেল ও লাইনে লিক দেখুন"),
 it("Wipe excess oil to prevent oil marks on fabric","কাপড়ে তেলের দাগ ঠেকাতে বাড়তি তেল মুছুন"),
 it("Record the lubrication date and who did it","লুব্রিকেশনের তারিখ ও কে করেছেন লিখুন")]},
{"id":"needleinspect","title":P("Needle & sinker inspection","সুই ও সিঙ্কার পরিদর্শন"),"items":[
 it("Stop and isolate the machine before inspection","পরিদর্শনের আগে মেশিন বন্ধ ও আইসোলেট করুন",True),
 it("Check for bent hooks, sticking latches and worn butts","বাঁকা হুক, আটকানো ল্যাচ ও ক্ষয়া বাট দেখুন"),
 it("Check sinkers for wear, bends and burrs","সিঙ্কারে ক্ষয়, বাঁক ও বার দেখুন"),
 it("Replace damaged parts with the correct type and record the position","ক্ষতিগ্রস্ত অংশ সঠিক ধরনের দিয়ে বদলান এবং অবস্থান লিখুন"),
 it("Count and record replaced needles","বদলানো সুই গুনে লিখুন")]}]
json.dump(C,open("src/data/checklists.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)

def lesson(i,en,bn,pen,pbn): return {"id":i,"title":P(en,bn),"body":P(pen,pbn)}
L=[lesson("how-fabric-forms","How knitted fabric forms","নিট কাপড় কীভাবে তৈরি হয়",["Knitted fabric is made of interlocking loops. A course is a row of loops across the fabric; a wale is a column of loops along it.","On a circular machine, needles move in tracks formed by cams. At each feeder the needle takes yarn, pulls it through the old loop and forms a new one.","Yarn length used per loop is the stitch length. It strongly affects GSM, width and feel."],["নিট কাপড় একে অপরের সাথে জড়ানো লুপ দিয়ে তৈরি। কোর্স হলো প্রস্থ বরাবর লুপের সারি; ওয়েল হলো দৈর্ঘ্য বরাবর লুপের সারি।","বৃত্তাকার মেশিনে সুই ক্যামের পথে চলে। প্রতিটি ফিডারে সুই সুতা নিয়ে পুরোনো লুপের ভেতর দিয়ে টেনে নতুন লুপ গড়ে।","একটি লুপে ব্যবহৃত সুতার দৈর্ঘ্য হলো স্টিচ লেংথ। এটি GSM, প্রস্থ ও অনুভূতিতে বড় প্রভাব ফেলে।"]),
lesson("safety-first","Machine safety basics","মেশিন নিরাপত্তার মূল কথা",["Never touch moving parts. Stop the machine and apply your factory's isolation (lock-out) procedure before opening guards or reaching near needles.","Keep guards in place. Report damaged guards, loose parts and unusual noise at once.","Follow the manufacturer's manual and factory SOP; this app is a helper, not a replacement."],["চলন্ত অংশ কখনো ধরবেন না। গার্ড খোলা বা সুইয়ের কাছে হাত দেওয়ার আগে মেশিন বন্ধ করে কারখানার আইসোলেশন (লক-আউট) নিয়ম মানুন।","গার্ড জায়গায় রাখুন। ক্ষতিগ্রস্ত গার্ড, আলগা অংশ ও অস্বাভাবিক শব্দ সঙ্গে সঙ্গে জানান।","প্রস্তুতকারকের ম্যানুয়াল ও কারখানার SOP মানুন; এই অ্যাপ সহায়ক, বিকল্প নয়।"]),
lesson("main-parts","Main machine parts","মেশিনের প্রধান অংশ",["Cylinder holds needles; sinkers sit between needles on single jersey; cams move needles; feeders deliver yarn; the creel holds cones; the take-down pulls and rolls the fabric.","Rib and interlock machines add a dial with needles on a horizontal bed."],["সিলিন্ডার সুই ধরে; সিঙ্গেল জার্সিতে সিঙ্কার সুইয়ের মাঝে থাকে; ক্যাম সুই সরায়; ফিডার সুতা দেয়; ক্রিল কোন ধরে; টেক-ডাউন কাপড় টানে ও রোল করে।","রিব ও ইন্টারলকে অতিরিক্ত ডায়াল থাকে যেখানে আনুভূমিক বেডে সুই থাকে।"]),
lesson("fabric-types","Single jersey, rib, interlock, fleece","সিঙ্গেল জার্সি, রিব, ইন্টারলক, ফ্লিস",["Single jersey: one needle bed, light and stretchy across width. Rib: cylinder + dial, vertical ribs, good stretch. Interlock: double-faced, firmer and smoother. Fleece: loops on the back, often brushed later."],["সিঙ্গেল জার্সি: এক সুই বেড, প্রস্থে হালকা ও স্থিতিস্থাপক। রিব: সিলিন্ডার + ডায়াল, উল্লম্ব রিব, ভালো স্থিতিস্থাপকতা। ইন্টারলক: দ্বি-পিঠ, শক্ত ও মসৃণ। ফ্লিস: পেছনে লুপ, পরে প্রায়ই ব্রাশ করা হয়।"]),
lesson("yarn-basics","Yarn count and tension","সুতার কাউন্ট ও টেনশন",["Yarn count tells how fine the yarn is. Ne: higher number = finer. Tex: higher number = thicker. Denier: higher number = thicker.","Even yarn tension through guides gives an even fabric. Rough guides or lint disturb it."],["সুতার কাউন্ট সুতা কত সূক্ষ্ম তা বলে। Ne: সংখ্যা বেশি = সরু। টেক্স: সংখ্যা বেশি = মোটা। ডেনিয়ার: সংখ্যা বেশি = মোটা।","গাইডে সমান টেনশন সমান কাপড় দেয়। খসখসে গাইড বা লিন্ট তা নষ্ট করে।"]),
lesson("gsm-basics","Measuring GSM","GSM মাপা",["GSM is grams per square metre. Cut a known area (for example 100 cm²), weigh it in grams and use the GSM calculator. Measure relaxed fabric as your factory requires and compare with the style card tolerance."],["GSM হলো প্রতি বর্গমিটারে গ্রাম। নির্দিষ্ট ক্ষেত্রফল (যেমন ১০০ সেমি²) কেটে গ্রামে ওজন করে GSM ক্যালকুলেটর ব্যবহার করুন। কারখানার নিয়ম অনুযায়ী রিল্যাক্স করা কাপড় মাপুন এবং স্টাইল কার্ডের সহনশীলতার সাথে মিলান।"]),
lesson("shift-handover","Good shift handover","ভালো শিফট হ্যান্ডওভার",["Write the machine state, open defects, yarn lots running, downtime reasons and anything the next operator must watch. Use the Shift Book handover view."],["মেশিনের অবস্থা, চলমান ত্রুটি, চলমান সুতার লট, ডাউনটাইমের কারণ ও পরের অপারেটরের নজর রাখার বিষয় লিখুন। শিফট বুকের হ্যান্ডওভার ভিউ ব্যবহার করুন।"])]
json.dump(L,open("src/data/lessons.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)

def q(i,kind,en,bn,oen,obn,a,xen,xbn): return {"id":i,"kind":kind,"q":P(en,bn),"options":{"en":oen,"bn":obn},"answer":a,"explain":P(xen,xbn)}
Q=[q("q1","quiz","What does a vertical line along the fabric length most often point to?","কাপড়ের দৈর্ঘ্য বরাবর লম্বা লাইন সাধারণত কীসের ইঙ্গিত দেয়?",["A needle-related fault (possible cause)","A change in room temperature","The creel colour"],["সুই-সংক্রান্ত ত্রুটি (সম্ভাব্য কারণ)","ঘরের তাপমাত্রার পরিবর্তন","ক্রিলের রং"],0,"A needle line is commonly linked to a damaged or dirty needle or trick, but confirm by inspection.","নিডল লাইন সাধারণত ক্ষতিগ্রস্ত বা নোংরা সুই বা ট্রিকের সাথে যুক্ত, তবে পরীক্ষা করে নিশ্চিত করুন।"),
q("q2","quiz","Before opening a guard near the needles you must:","সুইয়ের কাছে গার্ড খোলার আগে আপনাকে অবশ্যই:",["Slow the machine","Stop and isolate the machine per SOP","Wear gloves and reach in"],["মেশিন ধীর করতে হবে","SOP অনুযায়ী মেশিন বন্ধ ও আইসোলেট করতে হবে","গ্লাভস পরে হাত ঢোকাতে হবে"],1,"Never touch moving parts. Stop and isolate first.","চলন্ত অংশ কখনো ধরবেন না। আগে বন্ধ ও আইসোলেট করুন।"),
q("q3","quiz","GSM is:","GSM হলো:",["Grams per square metre","Gauge per square millimetre","Gram stitches per metre"],["প্রতি বর্গমিটারে গ্রাম","প্রতি বর্গমিলিমিটারে গেজ","প্রতি মিটারে গ্রাম স্টিচ"],0,"GSM = mass in grams ÷ area in square metres.","GSM = গ্রামে ওজন ÷ বর্গমিটারে ক্ষেত্রফল।"),
q("q4","quiz","A 100 cm² sample weighs 1.8 g. What is the GSM?","১০০ সেমি² নমুনার ওজন ১.৮ গ্রাম। GSM কত?",["18","180","1800"],["১৮","১৮০","১৮০০"],1,"100 cm² = 0.01 m². 1.8 ÷ 0.01 = 180 GSM.","১০০ সেমি² = ০.০১ মি²। ১.৮ ÷ ০.০১ = ১৮০ GSM।"),
q("q5","quiz","Gauge means:","গেজ মানে:",["Number of feeders","Needles per inch","Machine speed"],["ফিডারের সংখ্যা","প্রতি ইঞ্চিতে সুই","মেশিনের গতি"],1,"24G = 24 needles per inch.","24G = প্রতি ইঞ্চিতে ২৪ সুই।"),
q("q6","quiz","Which fabric typically uses a dial as well as a cylinder?","কোন কাপড়ে সাধারণত সিলিন্ডারের সাথে ডায়াল লাগে?",["Rib / Interlock","Single jersey","Neither"],["রিব / ইন্টারলক","সিঙ্গেল জার্সি","কোনোটিতেই না"],0,"Rib and interlock use cylinder and dial.","রিব ও ইন্টারলকে সিলিন্ডার ও ডায়াল থাকে।"),
q("q7","quiz","Horizontal bands repeating across the fabric are called:","কাপড়ে আড়াআড়ি পুনরাবৃত্ত ব্যান্ডকে বলে:",["Barré","Needle line","Hole"],["বারে","নিডল লাইন","ছিদ্র"],0,"Barré is a horizontal stripe defect often linked to yarn or feeder differences.","বারে আড়াআড়ি ডোরার ত্রুটি, প্রায়ই সুতা বা ফিডারের পার্থক্যের সাথে যুক্ত।"),
q("q8","quiz","If a GSM result is out of tolerance, the best first step is:","GSM সহনশীলতার বাইরে হলে প্রথম ধাপ:",["Change several settings quickly","Re-measure and report to the supervisor","Ignore it"],["দ্রুত কয়েকটি সেটিং বদলানো","আবার মেপে সুপারভাইজারকে জানানো","উপেক্ষা করা"],1,"Re-check the measurement, then follow the approved procedure; change one thing at a time.","মাপ আবার দেখে অনুমোদিত পদ্ধতি মানুন; একবারে একটি জিনিস বদলান।"),
q("q9","quiz","Two units cannot be added together in a production total. Example:","উৎপাদনের মোট হিসাবে দুটি ভিন্ন একক যোগ করা যায় না। উদাহরণ:",["kg + metres","kg + kg","metres + metres"],["কেজি + মিটার","কেজি + কেজি","মিটার + মিটার"],0,"Totals must be kept per unit.","মোট হিসাব প্রতিটি এককে আলাদা রাখতে হবে।"),
q("q10","quiz","Oil marks are best prevented by:","তেলের দাগ প্রতিরোধে সবচেয়ে ভালো:",["Using approved lubricant in approved quantity and wiping excess","Adding extra oil","Never cleaning"],["অনুমোদিত লুব্রিক্যান্ট অনুমোদিত পরিমাণে ও বাড়তি তেল মোছা","বেশি তেল দেওয়া","কখনো পরিষ্কার না করা"],0,"Excess oil can drip onto fabric.","বাড়তি তেল কাপড়ে পড়তে পারে।"),
q("d1","exercise","Defect exercise: A repeating small gap appears at the same wale after a needle change. Most likely area to inspect first?","ত্রুটি অনুশীলন: সুই বদলের পর একই ওয়েলে ছোট ফাঁক বারবার হচ্ছে। প্রথমে কোথায় দেখবেন?",["The needle/trick at that position","The dye house","The fabric roll label"],["ওই অবস্থানের সুই/ট্রিক","ডাইং হাউস","কাপড়ের রোল লেবেল"],0,"A fault tied to a position and a recent needle change points first to that needle and trick; confirm by inspection.","নির্দিষ্ট অবস্থান ও সদ্য সুই বদলের সাথে যুক্ত ত্রুটিতে আগে ওই সুই ও ট্রিক দেখুন; পরীক্ষা করে নিশ্চিত করুন।"),
q("d2","exercise","Defect exercise: Bands repeat every 12 feeders and cones come from two lots. What is a sensible first action?","ত্রুটি অনুশীলন: প্রতি ১২ ফিডারে ব্যান্ড পুনরাবৃত্ত হচ্ছে এবং কোন দুই লটের। প্রথম বুদ্ধিমান পদক্ষেপ কী?",["Check and unify yarn lots; report","Increase RPM","Remove the guards"],["সুতার লট মিলিয়ে একীভূত করে জানানো","RPM বাড়ানো","গার্ড খুলে ফেলা"],0,"Mixed lots are a possible cause of barré.","মিশ্র লট বারের সম্ভাব্য কারণ।"),
q("d3","exercise","Defect exercise: Greasy dark line along fabric. What do you check?","ত্রুটি অনুশীলন: কাপড়ে তেলতেলে গাঢ় লাইন। কী দেখবেন?",["Oil traces on guides/feeders and lubrication practice","Cone colour","Shift name"],["গাইড/ফিডারে তেলের চিহ্ন ও লুব্রিকেশন পদ্ধতি","কোনের রং","শিফটের নাম"],0,"Find the oil source and fix it before running on.","তেলের উৎস খুঁজে ঠিক করে তারপর চালান।")]
json.dump(Q,open("src/data/quizzes.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)
