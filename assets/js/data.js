/* =============================================================================
   G PEN UNIVERSITY — COURSE DATA
   -----------------------------------------------------------------------------
   One entry per product course. Content harvested from the G Pen asset portal,
   the gpen.com product/FAQ pages, and official manuals.

   To ADD a course: copy a { ... } block, change the fields, mind the commas.
   To EDIT copy/specs/FAQ/quiz: just edit the strings below — no code changes.

   Per course:
     slug        : URL id (kebab-case). Used in the address bar + progress store.
     name        : Product name (also the cert title)
     category    : short type label shown on the card + hero
     tagline     : one-line hook
     minutes     : approx. time to complete
     passPct     : score needed on the quiz to certify (default 80)
     msrp        : shown on the card + hero
     accent      : hex used for the card's colour pop
     cover       : product tile image (used on the dashboard card)
     heroImg     : big lifestyle photo for the course hero
     gallery     : [{ url, caption }] lifestyle / detail photos
     description : array of paragraphs (overview copy)
     highlights  : key selling points (bullets)
     specs       : [{ label, value }] tech-spec table (value may contain HTML)
     howToUse    : ordered steps (HTML allowed)
     howToClean  : ordered steps (HTML allowed)
     faq         : [{ q, a }] real FAQ from gpen.com
     sell        : "How to sell it" budtender talking points
     videos      : [{ title, thumb, youtube }]
     quiz        : [{ q, choices:[...], answer:<index>, why }]
   ========================================================================== */
var CDN = "https://cdn.shopify.com/s/files/1/0185/1576/files/";
// Real lifestyle photography served from the G Pen brand asset portal
// (assets.gpen.com). These are people actually using the products.
var LIFE = "https://assets.gpen.com/assets/synced/";

/* Curated lifestyle shots (people using G Pen products) — powers the landing
   marquee and lifestyle bands. Pulled from the "Lifestyle Photos" folders on
   assets.gpen.com. Swap/add URLs freely. */
window.GPEN_LIFESTYLE = [
  LIFE + "dash-ii/fa7d18dfeb95a3e64c1463c8b71f8a14fda9385f98cac0edf10939e3f33446c8.jpg",
  LIFE + "dash-plus/5e5f67089995d3cfba84f862caf73d287ae9bc1d86d05818dde9204e6fce4b74.jpg",
  LIFE + "hydout/ad92f94cf68885a5ecb0b673ca262349a3f7c0476bf1762cbb375d2289bf39b1.jpg",
  LIFE + "510-original/058259adc75c62d0fe69f23e94cbb694621854da02665759ab93ad284e329267.jpg",
  LIFE + "melt/b1cac7548cacc2f2b15e0b9385e6ff04e8a8168f7dbec9e1be8f8354dc506aea.jpg",
  LIFE + "connect/64d0823e8cfd2bd70ce65a49797bd15b1600b6486c328e37b2b859bc1fc06f56.jpg",
  LIFE + "dash-ii/4538295a5dae9dfa39f29ccada0ae6dedd2c45d9fe1a9e8fcef6ab3b7b7570a6.jpg",
  LIFE + "dash-plus/9dc58e5f7e4d991045bc18bff9179fc236a065ac824af2305d717be41d367790.jpg",
  LIFE + "hydout/9461955584aa93b073a67a8f9dde07d0a427700d00faf13fbdfe7db5648e8cd1.jpg",
  LIFE + "510-original/ecf9d3fb602da33111fb87463fad8857d7aa9eaace08bd93e248b10c217e2ee0.jpg",
  LIFE + "melt/d0eaa8ff099588adf44045dd3536650378e563dd37b87d7dc38f1a23599d6348.jpg",
  LIFE + "dash-plus/fb94c5767d3db271914d35e575d3a37b1b9ab906c6eb8bbf9cbf41fadd6f0888.jpg",
  LIFE + "dash-ii/42bb8f1cadd8dd7897be569375064bf7fabcb4e2907c2a6c288887d96646064e.jpg",
  LIFE + "510-original/b53dbd53f6f01d5adb30c5aa8f838d75521277101b5e30e2aa22b6978f7475b4.jpg",
  LIFE + "hydout/1235084c23990e71170a2a9dfdce5162d3d8d29eda6438f8a2a8ccc1b8019d31.jpg",
  LIFE + "510-original/5140f8a008fea5e68d07b87e404a1aa437e68bc7bba137187c2509450f3ce08c.jpg",
];

window.GPEN_COURSES = [
  /* ------------------------------------------------------------------ DASH II */
  {
    slug: "dash-ii",
    name: "Dash II",
    category: "Dry Herb Vaporizer",
    tagline: "The pocket-sized dry herb vape, upgraded across the board.",
    minutes: 9, passPct: 80, msrp: "$49.95", accent: "#FEC870",
    cover: CDN + "Dash2_thumb_01.png?v=1782936076",
    heroImg: LIFE + "dash-ii/f37d082035ae142949fa4dfe33aeebf6d9b556a2745187c26db91bc2ca08a020.jpg",
    productUrl: "https://www.gpen.com/products/g-pen-dash-ii-vaporizer",
    faqUrl: "https://www.gpen.com/pages/dash-ii-faq",
    gallery: [
      { url: CDN + "dash2_thumb_05.jpg?v=1772834595", caption: "Pocket-sized and pull-ready anywhere" },
      { url: CDN + "dash2_thumb_02.jpg?v=1772834595", caption: "OLED display — real-time temp & battery" },
      { url: CDN + "dash2_thumb_09.jpg?v=1772834595", caption: "Upgraded 0.4g ceramic chamber" },
      { url: CDN + "dash2_thumb_08.jpg?v=1772834595", caption: "USB-C pass-through charging" },
      { url: CDN + "dash2_thumb_011.jpg?v=1772834595", caption: "Silicone mouthpiece sleeve" },
    ],
    description: [
      "The next evolution of our best-selling Dash — upgraded across the board and now just $49.95.",
      "The G Pen Dash II is a pocket-sized <strong>dry herb vaporizer</strong> featuring precise temperature control, an OLED display, and an upgraded 0.4g ceramic chamber designed for improved performance and easier loading. Powered by a longer-lasting 1,100mAh battery, it delivers smooth, reliable sessions with a ~30-second heat-up and USB-C pass-through charging.",
      "More control. Easier loading. Better performance.",
    ],
    highlights: ["Pocket-sized dry herb vaporizer", "~30-second heat-up", "Precise adjustable temperature control", "OLED display", "Upgraded 0.4g ceramic chamber", "1,100mAh battery", "USB-C pass-through charging", "Built-in pick/loading tool"],
    specs: [
      { label: "Type", value: "Dry herb vaporizer (dry herb <strong>only</strong>)" },
      { label: "Heating", value: "Conduction, 0.4g ceramic chamber" },
      { label: "Heat-up time", value: "~30 seconds" },
      { label: "Battery", value: "1,100mAh" },
      { label: "Charging", value: "USB-C with pass-through (cable <strong>not</strong> included)" },
      { label: "Display", value: "OLED — real-time temperature & battery" },
      { label: "Temp control", value: "Precise, adjustable" },
      { label: "Dimensions / weight", value: "97 × 35 × 21 mm · 62 g" },
      { label: "Warranty", value: "6-month limited (1 year with registration)" },
      { label: "In the box", value: "Dash II, built-in loading tool, silicone mouthpiece sleeve" },
    ],
    howToUse: [
      "<strong>Charge</strong> with any USB-C charger.",
      "<strong>Load:</strong> remove the mouthpiece, fully load the chamber with ground dry herb, and pack lightly with the pick tool — <strong>do not overpack</strong>.",
      "<strong>Power on:</strong> hold the button for <strong>3 seconds</strong>.",
      "Use <strong>– / +</strong> to set your session temperature (watch the OLED display).",
      "<strong>Start a session:</strong> tap the button <strong>2× within 2 seconds</strong>. Tap 2× again to cancel.",
      "Take <strong>long, sustained draws</strong> for the best vapor.",
      "Tap the button <strong>5×</strong> to open the settings menu.",
    ],
    howToClean: [
      "Power off and let the device <strong>cool completely</strong>.",
      "Use the built-in pick tool to clear spent material from the ceramic chamber.",
      "Dampen a cotton swab with <strong>Isopropyl Alcohol</strong> (squeeze out excess) and wipe the chamber, mouthpiece, and silicone sleeve.",
      "For a deep clean, remove the mouthpiece insert and clean it with Isopropyl Alcohol.",
      "Let all parts <strong>air dry completely</strong> before reassembling.",
    ],
    faq: [
      { q: "What can the Dash II vaporize?", a: "Dry herb only — it is not compatible with concentrates, oils, or 510 carts." },
      { q: "How big is the chamber?", a: "An upgraded 0.4g ceramic chamber — larger than the original Dash and easier to load." },
      { q: "How does it charge?", a: "Via USB-C with pass-through, so you can use it while it's plugged in. A USB-C cable is not included." },
      { q: "Does it have temperature control?", a: "Yes — precise, adjustable temperature control with an OLED display showing real-time temp and battery." },
      { q: "How long does it take to heat up?", a: "About 30 seconds with its conduction heating system." },
      { q: "What's the warranty?", a: "A 6-month limited warranty; registering the device at gpen.com/register adds 6 more months for a full year." },
    ],
    sell: [
      "Lead with the price-to-performance story: adjustable temp + OLED display at just $49.95.",
      "It's the upgrade path for anyone who loved the original Dash — bigger chamber, bigger battery, USB-C.",
      "Great first \"real\" dry herb vape: simple button interface, pocketable, hard to mess up.",
      "Remind customers a USB-C cable isn't in the box, so add one to the sale.",
    ],
    videos: [
      { title: "How to Use: G Pen Dash II", thumb: "https://i.ytimg.com/vi/sqCdU8Kn5ek/hqdefault.jpg", youtube: "sqCdU8Kn5ek" },
      { title: "How to Clean: Dash II", thumb: "https://i.ytimg.com/vi/wBOzqPxDhd8/hqdefault.jpg", youtube: "wBOzqPxDhd8" },
    ],
    quiz: [
      { q: "What material is the G Pen Dash II designed to vaporize?", choices: ["Dry herb only", "Concentrates and oils", "510 cartridges", "Any of the above"], answer: 0, why: "The Dash II is a dry herb vaporizer only — not compatible with concentrates, oils, or 510 carts." },
      { q: "How large is the Dash II's heating chamber?", choices: ["0.2g", "0.4g ceramic", "1.0g", "It has no chamber"], answer: 1, why: "The Dash II has an upgraded 0.4g ceramic chamber — larger than the original Dash and easier to load." },
      { q: "What type of heating system does the Dash II use?", choices: ["Convection", "Conduction", "Induction", "Open flame"], answer: 1, why: "It uses a conduction heating system, with roughly a 30-second heat-up." },
      { q: "Approximately how long does the Dash II take to heat up?", choices: ["5 seconds", "30 seconds", "2 minutes", "5 minutes"], answer: 1, why: "Heat-up is approximately 30 seconds." },
      { q: "What is the Dash II's battery capacity?", choices: ["650mAh", "900mAh", "1,100mAh", "2,200mAh"], answer: 2, why: "The Dash II is powered by a 1,100mAh battery — an upgrade over the original Dash." },
      { q: "Which statement about charging the Dash II is TRUE?", choices: ["It uses Micro-USB", "It charges via USB-C and supports pass-through (use while plugged in)", "It charges wirelessly only", "It cannot be used while charging"], answer: 1, why: "The Dash II charges via USB-C and supports pass-through charging." },
      { q: "How do you power the Dash II on?", choices: ["Tap the button once", "Hold the button for 3 seconds", "Tap the button 5 times", "Slide the power switch"], answer: 1, why: "Hold the button for 3 seconds to power on." },
      { q: "After setting your temperature, how do you START a session?", choices: ["Tap the button 2× within 2 seconds", "Hold for 10 seconds", "Blow into the mouthpiece", "It starts automatically"], answer: 0, why: "Tap the button 2× within 2 seconds to start a session; tap 2× again to cancel." },
      { q: "For a DEEP clean, what should you use on the removed mouthpiece insert?", choices: ["Water and soap", "Isopropyl Alcohol", "Vinegar", "Just wipe it dry"], answer: 1, why: "Clean it with Isopropyl Alcohol, then let it dry completely before reassembling." },
      { q: "How does the Dash II's warranty work?", choices: ["No warranty", "Lifetime warranty", "6-month limited, extended to 1 year if you register the device", "30-day returns only"], answer: 2, why: "6-month limited; registering at gpen.com/register adds 6 more months for a full year." },
      { q: "What is the Dash II's MSRP?", choices: ["$29.95", "$49.95", "$79.95", "$99.95"], answer: 1, why: "The Dash II launched at a lower MSRP of $49.95." },
      { q: "Which item is NOT included in the box?", choices: ["The Dash II device", "Built-in pick/loading tool", "Silicone mouthpiece sleeve", "A USB-C charging cable"], answer: 3, why: "A USB-C charging cable is not included — any USB-C charger can be used." },
    ],
  },

  /* ------------------------------------------------------------------- DASH+ */
  {
    slug: "dash-plus",
    name: "Dash+",
    category: "Dry Herb Vaporizer",
    tagline: "Hybrid convection + conduction in a full titanium chamber.",
    minutes: 9, passPct: 80, msrp: "$99.95", accent: "#D75D43",
    cover: CDN + "dash__vape_thumb_5e14bcb4-a63a-4cc3-8078-e57fc572e4da.png?v=1729247649",
    heroImg: LIFE + "dash-plus/5e5f67089995d3cfba84f862caf73d287ae9bc1d86d05818dde9204e6fce4b74.jpg",
    productUrl: "https://www.gpen.com/products/g-pen-dash-plus-vaporizer",
    gallery: [
      { url: CDN + "dash__vape_thumb_2_455ab888-db45-48a5-8680-3f5c685cd05f.jpg?v=1729247650", caption: "Full-color LED display" },
      { url: CDN + "dash__vape_thumb_3_461b1dc3-9698-4b90-852b-130035e8252a.jpg?v=1729247646", caption: "Full titanium heating chamber" },
      { url: CDN + "dash__vape_thumb_4_43ebed07-78d2-4186-8c51-c36b11921f28.jpg?v=1729247643", caption: "Magnetic mouthpiece, ceramic air path" },
      { url: CDN + "dash__vape_thumb_6_2d2b66e0-28c5-4ab1-af46-f8f63d53227a.jpg?v=1729247640", caption: "USB-C fast charging" },
    ],
    description: [
      "Grenco Science introduces the next generation of portable dry herb vaporizers with the G Pen Dash+.",
      "The Dash+ features <strong>hybrid convection and conduction</strong> heating in a full <strong>titanium chamber</strong>, capable of reaching vaporization temperatures in as little as 20 seconds. Dual clean-air intake channels and a magnetic mouthpiece with a spiral ceramic air path deliver superior vapor production and flavor.",
      "With an easy 3-button interface, full-color LED display, and haptic feedback in a durable zinc-alloy body — powered by an 1,800mAh USB-C battery — the Dash+ is the evolution in portable dry herb vaporization.",
    ],
    highlights: ["Hybrid convection + conduction heating", "Full titanium heating chamber", "Heats up in ~20 seconds", "1,800mAh battery, USB-C fast charging", "Full-color LED display", "Haptic feedback, 3-button interface", "Zinc-alloy body", "USB-C cable included"],
    specs: [
      { label: "Type", value: "Dry herb vaporizer (dry herb <strong>only</strong>)" },
      { label: "Heating", value: "Hybrid convection + conduction, full titanium chamber (~0.3g)" },
      { label: "Heat-up time", value: "As little as 20 seconds" },
      { label: "Battery", value: "1,800mAh Li-ion (~40 min heating per charge)" },
      { label: "Charging", value: "USB-C fast charging (cable included)" },
      { label: "Display", value: "Full-color LED screen" },
      { label: "Controls", value: "3-button interface with haptic feedback" },
      { label: "Materials", value: "Titanium chamber, zinc-alloy casing, ceramic spiral air path" },
      { label: "Warranty", value: "2-year (extendable to 3 years with registration)" },
      { label: "In the box", value: "Dash+, silicone sleeve, loading tool w/ keychain, USB-C cable" },
    ],
    howToUse: [
      "<strong>Load:</strong> remove the mouthpiece, pack the titanium chamber with ~0.3g of ground dry herb, and re-attach the mouthpiece.",
      "<strong>Power on/off:</strong> press and hold the power button.",
      "<strong>Start a session:</strong> double-click (press <strong>2×</strong>) the power button rapidly to activate heating — it vibrates twice when ready.",
      "<strong>Adjust temperature</strong> with the – / + buttons.",
      "Open <strong>Settings</strong> by clicking the power button <strong>5×</strong> (timer, °F/°C, brightness, haptics).",
      "Take slow, steady draws; heating shuts off when the session timer ends.",
    ],
    howToClean: [
      "Power off and let the device <strong>cool down</strong>.",
      "Dampen a cotton swab with <strong>Isopropyl Alcohol</strong> and squeeze out excess.",
      "Clean the silicone insert, the screen area, above the chamber, and inside the chamber.",
      "For heavy buildup, remove components and soak separately in Isopropyl Alcohol.",
      "Wipe with a dry swab and <strong>air dry</strong> before reassembling.",
    ],
    faq: [
      { q: "What can the Dash+ be used with?", a: "Ground dry material only — it is not compatible with concentrates." },
      { q: "How do I improve weak vapor?", a: "Increase the temperature, let it fully heat up before drawing, and take long, sustained draws to maximize convection." },
      { q: "How fast does it heat up?", a: "The hybrid convection + conduction system reaches vaporization temperature in as little as 20 seconds." },
      { q: "How long does a charge last?", a: "The 1,800mAh battery gives roughly 40 minutes of heating per full charge and recharges over USB-C fast charging." },
      { q: "How do I check the battery?", a: "When powered on, a battery icon appears in the top corner of the screen; if depleted, the device won't begin heating." },
      { q: "What's the warranty?", a: "A 2-year warranty, extendable to three years by registering at gpen.com/register." },
    ],
    sell: [
      "This is the flavor-chaser's Dash: hybrid heating + titanium chamber means cleaner, tastier vapor.",
      "Step-up sell from the Dash II for customers who want more power, a bigger battery, and a color screen.",
      "Point out the ~20-second heat-up and haptic feedback — it feels premium in the hand.",
      "The USB-C cable IS included here (unlike the Dash II) — a nice value talking point.",
    ],
    videos: [
      { title: "How to Use: G Pen Dash+", thumb: "https://i.ytimg.com/vi/OzgMUHgEQao/hqdefault.jpg", youtube: "OzgMUHgEQao" },
      { title: "How to Clean: G Pen Dash+", thumb: "https://i.ytimg.com/vi/vSAc8WPkUpY/hqdefault.jpg", youtube: "vSAc8WPkUpY" },
    ],
    quiz: [
      { q: "What type of heating does the Dash+ use?", choices: ["Conduction only", "Hybrid convection + conduction", "Open flame", "Induction"], answer: 1, why: "The Dash+ uses hybrid convection + conduction heating for fast, even, flavorful sessions." },
      { q: "What is the Dash+'s heating chamber made of?", choices: ["Plastic", "Titanium", "Glass", "Stainless steel"], answer: 1, why: "It features a full titanium heating chamber." },
      { q: "About how long does the Dash+ take to reach temperature?", choices: ["20 seconds", "2 minutes", "5 seconds", "45 seconds"], answer: 0, why: "The Dash+ reaches vaporization temperature in as little as 20 seconds." },
      { q: "What is the Dash+'s battery capacity?", choices: ["650mAh", "1,100mAh", "1,800mAh", "3,000mAh"], answer: 2, why: "It's powered by an 1,800mAh rechargeable Li-ion battery." },
      { q: "About how much heating time does one full charge give?", choices: ["~10 minutes", "~40 minutes", "~3 hours", "Unlimited"], answer: 1, why: "The 1,800mAh battery gives roughly 40 minutes of heating per full charge." },
      { q: "After loading, how do you START a heating session?", choices: ["Double-click (press 2×) the power button", "Hold for 10 seconds", "Blow into it", "It starts on its own"], answer: 0, why: "Double-click the power button rapidly to activate heating; it vibrates twice when ready." },
      { q: "How do you open the Settings menu?", choices: ["Press the power button 5×", "Hold both side buttons", "Tap once", "Plug in USB-C"], answer: 0, why: "Press the power button 5× to enter Settings (timer, °F/°C, brightness, haptics)." },
      { q: "What kind of display does the Dash+ have?", choices: ["No display", "Monochrome OLED", "Full-color LED", "E-ink"], answer: 2, why: "The Dash+ has a full-color LED display." },
      { q: "What is the Dash+'s MSRP?", choices: ["$49.95", "$99.95", "$149.95", "$79.95"], answer: 1, why: "The Dash+ MSRP is $99.95." },
      { q: "What is the Dash+'s body made of?", choices: ["Zinc-alloy", "Silicone", "Wood", "Carbon fiber"], answer: 0, why: "The Dash+ has a durable zinc-alloy body." },
    ],
  },

  /* -------------------------------------------------------- MELT HOT KNIFE */
  {
    slug: "melt-hot-knife",
    name: "Melt Hot Knife",
    category: "Concentrate Tool",
    tagline: "The smallest hot knife on the market — zero-mess dabs.",
    minutes: 7, passPct: 80, msrp: "$24.95", accent: "#FEC870",
    cover: CDN + "Melt_thumbA.png?v=1772813232",
    heroImg: LIFE + "melt/b1cac7548cacc2f2b15e0b9385e6ff04e8a8168f7dbec9e1be8f8354dc506aea.jpg",
    productUrl: "https://www.gpen.com/products/g-pen-melt",
    gallery: [
      { url: CDN + "Melt_thumb_05.jpg?v=1772808678", caption: "Rapid-heat ceramic tip" },
      { url: CDN + "Melt_thumb_07.jpg?v=1772808678", caption: "Clean, controlled concentrate drops" },
      { url: CDN + "Melt_thumb_04.jpg?v=1772808678", caption: "The smallest hot knife on the market" },
      { url: CDN + "Melt_thumb_02.jpg?v=1772808678", caption: "USB-C pass-through charging" },
    ],
    description: [
      "Meet the all-new G Pen Melt Hot Knife — the <strong>smallest hot knife on the market</strong> and the fastest, cleanest way to prep your concentrates. At just 3.94 × 0.5 × 0.25 in, Melt is ultra-compact and built to disappear into any pocket or travel kit.",
      "Designed for <strong>zero-mess</strong> scooping and smooth, controlled drops, its rapid-heat ceramic tip warms up instantly for perfect transfers every time. No sticky tools, no reclaim disasters, no fumbling.",
      "With USB-C pass-through charging, a sleek aluminum body, and the signature G Pen silhouette, Melt is your everyday essential — whether loading a rig, refilling a Micro+, or prepping a Hyer.",
    ],
    highlights: ["Smallest hot knife on the market", "Rapid-heat ceramic tip (~150°C / 302°F)", "USB-C pass-through charging", "Sleek aluminum body", "Ultra-compact: 3.94 × 0.5 × 0.25 in", "Works with rigs, Micro+, Hyer, bangers & e-rigs"],
    specs: [
      { label: "Type", value: "Electric hot knife (dab tool) for concentrates" },
      { label: "Heating", value: "Instant-heat ceramic tip (~150°C / 302°F)" },
      { label: "Battery", value: "500mAh" },
      { label: "Charging", value: "USB-C pass-through (~1 hr; cable <strong>not</strong> included)" },
      { label: "Dimensions", value: "3.94 × 0.5 × 0.25 in" },
      { label: "Materials", value: "Aluminum body, ceramic heating tip" },
      { label: "Controls", value: "One-button operation (no variable heat)" },
      { label: "Compatibility", value: "Micro+, Connect, Hyer, bangers, e-rigs & e-nails" },
      { label: "Warranty", value: "90-day limited (electronics only)" },
      { label: "In the box", value: "Melt Hot Knife, protective travel cap" },
    ],
    howToUse: [
      "<strong>Power on:</strong> press the button <strong>5×</strong>.",
      "<strong>Heat:</strong> <strong>hold</strong> the button to start heating — it heats for a maximum of <strong>5 seconds</strong> per press.",
      "Use the hot ceramic tip to <strong>scoop or drop</strong> your concentrate into a rig, banger, or device.",
      "It can be operated <strong>while charging</strong> (USB-C pass-through).",
      "It powers off automatically after <strong>10 minutes</strong> of inactivity; the LED blinks <strong>8×</strong> when it needs a charge.",
    ],
    howToClean: [
      "Wipe the tip with an <strong>Isopropyl-Alcohol</strong>-soaked cotton swab while it's still warm.",
      "<strong>Do not soak or submerge</strong> the device in any liquid.",
      "Store it in the protective travel cap when not in use.",
    ],
    faq: [
      { q: "What is the G Pen Melt?", a: "Grenco's smallest electric hot knife — built for clean, mess-free dab prep. It heats fast and drops concentrates smoothly." },
      { q: "What is it compatible with?", a: "The Micro+, Connect, Hyer, traditional bangers, e-rigs and e-nails — and it pairs great with THCa dabs." },
      { q: "Does it have adjustable heat settings?", a: "No — it uses a precisely tuned heating element optimized for smooth, controlled melting without burning." },
      { q: "Can I use it while charging?", a: "Yes — USB-C pass-through lets you use it while it's plugged in. A USB-C cable is not included." },
      { q: "Is it travel-friendly?", a: "Yes — it's tiny, has a travel lock, and comes with a protective travel cap." },
      { q: "What's the warranty?", a: "A 90-day limited warranty covering the electronics (physical damage not covered)." },
    ],
    sell: [
      "Perfect impulse add-on — cheap, universal, and everyone who dabs needs one.",
      "Pitch it as \"no sticky tools, no reclaim disasters\" — it solves a real everyday annoyance.",
      "Cross-sell with rigs, the Micro+, and the Hyer — it pairs with all of them.",
      "A USB-C cable isn't included, so bundle one.",
    ],
    videos: [
      { title: "A Closer Look at the Melt", thumb: "https://i.ytimg.com/vi/nEDYSJqHk5o/hqdefault.jpg", youtube: "nEDYSJqHk5o" },
      { title: "Melt — The Judge's Favorite", thumb: "https://i.ytimg.com/vi/mgErvUJHYQU/hqdefault.jpg", youtube: "mgErvUJHYQU" },
    ],
    quiz: [
      { q: "What is the G Pen Melt?", choices: ["A dry herb vaporizer", "An electric hot knife (dab tool) for concentrates", "A 510 battery", "A water pipe"], answer: 1, why: "The Melt is an electric, ceramic-tipped hot knife for scooping and dropping concentrates." },
      { q: "The Melt is marketed as the smallest ___ on the market.", choices: ["vaporizer", "hot knife", "battery", "rig"], answer: 1, why: "It's the smallest hot knife on the market." },
      { q: "What is the Melt's heated tip made of?", choices: ["Ceramic", "Titanium", "Quartz", "Steel"], answer: 0, why: "The Melt has a rapid-heat ceramic tip." },
      { q: "How do you START heating the Melt?", choices: ["Tap once", "Hold the button", "Press 5×", "It heats automatically"], answer: 1, why: "After powering on, hold the button to start heating." },
      { q: "What is the maximum heat time per press?", choices: ["5 seconds", "30 seconds", "2 minutes", "10 seconds"], answer: 0, why: "The device heats for a maximum of 5 seconds per press." },
      { q: "Can the Melt be used while it's charging?", choices: ["No", "Yes — USB-C pass-through", "Only on a special dock", "Only when full"], answer: 1, why: "Yes — it supports USB-C pass-through and can be operated while charging." },
      { q: "How long until the Melt auto powers off from inactivity?", choices: ["1 minute", "10 minutes", "1 hour", "It never does"], answer: 1, why: "It powers off automatically after 10 minutes of inactivity." },
      { q: "How do you power the Melt on?", choices: ["Press the button 5×", "Hold for 3 seconds", "Tap once", "Twist the cap"], answer: 0, why: "Press the button 5× to turn the Melt on." },
      { q: "How does the Melt signal it needs a charge?", choices: ["It beeps", "The LED blinks 8 times", "It gets hot", "Nothing"], answer: 1, why: "The LED button blinks 8 times when it's time to charge." },
      { q: "What is the Melt's MSRP?", choices: ["$12.95", "$24.95", "$49.95", "$99.95"], answer: 1, why: "The Melt MSRP is $24.95." },
    ],
  },

  /* ------------------------------------------------------------------ HYDOUT */
  {
    slug: "hydout",
    name: "Hydout",
    category: "510 Cartridge Battery",
    tagline: "Discreet 510 battery with a hidden magnetic mouthpiece.",
    minutes: 8, passPct: 80, msrp: "$24.95", accent: "#D75D43",
    cover: CDN + "Hydout_vape_01.png?v=1762467078",
    heroImg: LIFE + "hydout/ad92f94cf68885a5ecb0b673ca262349a3f7c0476bf1762cbb375d2289bf39b1.jpg",
    productUrl: "https://www.gpen.com/products/g-pen-hydout",
    gallery: [
      { url: CDN + "Hydout_vape_thumb_07.jpg?v=1762461585", caption: "Low-key sessions, on the go" },
      { url: CDN + "Hydoutout_vape_015.jpg?v=1762461585", caption: "Hidden magnetic mouthpiece cover" },
      { url: CDN + "Hydout_vape_thumb_011.jpg?v=1762461585", caption: "5 voltage settings on the LED display" },
      { url: CDN + "Hydout_vape_thumb_03.jpg?v=1762461585", caption: "Preheat mode for thicker oils" },
    ],
    description: [
      "Looking for the best 510 cartridge battery for low-key sessions on the go? Meet the G Pen Hydout — a compact, <strong>concealed</strong> vape battery for 510 cartridges that delivers serious performance without blowing your cover.",
      "This pocket-sized powerhouse features a <strong>hidden magnetic mouthpiece cover</strong> to keep your cart discreet and protected from light (which helps preserve oil quality), a 400mAh battery, adjustable voltage, and a bright LED display for full control over every hit.",
      "Compatible with most 510-thread cartridges up to 2g, the Hydout is perfect for smooth, customizable sessions — wherever you are.",
    ],
    highlights: ["Hidden magnetic mouthpiece cover", "5 voltage settings (2.4V – 3.8V)", "1.8V preheat mode", "400mAh rechargeable battery", "Bright LED display", "USB-C charging", "Fits 510 carts up to 2g"],
    specs: [
      { label: "Type", value: "510 cartridge battery" },
      { label: "Battery", value: "400mAh rechargeable" },
      { label: "Voltage settings", value: "2.4V / 2.8V / 3.2V / 3.6V / 3.8V" },
      { label: "Preheat", value: "1.8V for 10 seconds" },
      { label: "Charging", value: "USB-C (cable <strong>not</strong> included)" },
      { label: "Compatibility", value: "Most 510-thread carts up to 2g" },
      { label: "Display", value: "Bright LED (battery + voltage)" },
      { label: "Design", value: "Hidden magnetic mouthpiece cover" },
      { label: "Dimensions", value: "90 × 37.5 × 18.5 mm" },
      { label: "Warranty", value: "90-day limited" },
      { label: "In the box", value: "Hydout battery + magnetic cover (cart & cable not included)" },
    ],
    howToUse: [
      "<strong>Load:</strong> remove the mouthpiece, screw in a 510 cartridge, and replace the mouthpiece.",
      "<strong>Power on/off:</strong> click the button <strong>5×</strong>.",
      "<strong>Adjust voltage:</strong> click <strong>3×</strong> to cycle the 5 heat settings on the LED.",
      "<strong>Preheat:</strong> click <strong>2×</strong> for a 10-second 1.8V preheat (great for thick oils).",
      "<strong>Draw:</strong> <strong>hold</strong> the button while inhaling.",
      "Auto shut-off after <strong>2 minutes</strong> of inactivity.",
    ],
    howToClean: [
      "Remove the cartridge and make sure the device is <strong>powered off</strong>.",
      "Use a cotton swab lightly dampened with <strong>Isopropyl Alcohol</strong> on the threads and contact points.",
      "Wipe the magnetic cover and outer surfaces with a soft cloth.",
      "<strong>Do not soak the battery</strong> or let moisture into the port / LED area.",
      "Let all parts dry completely before reassembling.",
    ],
    faq: [
      { q: "What cartridges work with it?", a: "Most standard 510-thread cartridges, including those up to 2g (ceramic or metal-tipped). Cartridges are sold separately." },
      { q: "What voltage settings does it have?", a: "Five: 2.4V, 2.8V, 3.2V, 3.6V and 3.8V, shown on the LED display." },
      { q: "What does preheat mode do?", a: "It warms your cartridge at 1.8V for 10 seconds to help unclog thick oils and prep it for use." },
      { q: "Why is my cart producing little vapor?", a: "Make sure it's powered on, the cart is screwed in fully, and the battery is charged. Try preheat mode, or test a different cartridge." },
      { q: "How does it stay discreet?", a: "A hidden magnetic mouthpiece cover conceals the cartridge and protects it from light, helping preserve oil quality." },
      { q: "What's the warranty?", a: "A 90-day limited warranty." },
    ],
    sell: [
      "The discretion angle sells itself: the magnetic cover hides the cartridge and protects the oil from light.",
      "Great for cart customers who want more control — 5 voltage settings + preheat for thicker oils.",
      "Fits carts up to 2g, so it works with almost anything on your shelf.",
      "Affordable everyday battery at $24.95 — an easy attachment sale with any cartridge.",
    ],
    videos: [
      { title: "How to Use: G Pen Hydout", thumb: "https://i.ytimg.com/vi/WK3EXouKwGs/hqdefault.jpg", youtube: "WK3EXouKwGs" },
      { title: "How to Clean: G Pen Hydout", thumb: "https://i.ytimg.com/vi/e9oEXqNajh4/hqdefault.jpg", youtube: "e9oEXqNajh4" },
    ],
    quiz: [
      { q: "What is the G Pen Hydout?", choices: ["A dry herb vaporizer", "A 510 cartridge battery", "A hot knife", "A gravity infuser"], answer: 1, why: "The Hydout is a discreet 510 cartridge battery." },
      { q: "What is the Hydout's signature discreet feature?", choices: ["A hidden magnetic mouthpiece cover", "A folding screen", "A silent motor", "A camo wrap"], answer: 0, why: "It has a hidden magnetic mouthpiece cover for a discreet look." },
      { q: "How many voltage settings does the Hydout have?", choices: ["1 fixed voltage", "3 settings", "5 settings (2.4V–3.8V)", "10 settings"], answer: 2, why: "The Hydout offers 5 voltage settings from 2.4V to 3.8V." },
      { q: "What is the Hydout's battery capacity?", choices: ["200mAh", "400mAh", "900mAh", "1,800mAh"], answer: 1, why: "It has a 400mAh rechargeable battery." },
      { q: "How do you power the Hydout on or off?", choices: ["Click the button 5×", "Hold for 3 seconds", "Click 2×", "Breathe in"], answer: 0, why: "Click the button 5× to turn the Hydout on or off." },
      { q: "How do you change the voltage?", choices: ["Click 3×", "Click 5×", "Hold the button", "Twist the mouthpiece"], answer: 0, why: "Click the button 3× to cycle through the heat settings." },
      { q: "How do you take a draw on the Hydout?", choices: ["Just inhale", "Hold the button while drawing", "Click 2×", "Press and release"], answer: 1, why: "Hold the button to activate and draw." },
      { q: "What does clicking the button 2× do?", choices: ["Turns it off", "Starts a 10-second 1.8V preheat", "Locks it", "Nothing"], answer: 1, why: "Clicking 2× starts a 10-second 1.8V preheat, great for thick oils." },
      { q: "What size 510 cartridges does it fit?", choices: ["Up to 0.3g only", "Up to 2g", "Only G Pen carts", "Any size, any thread"], answer: 1, why: "It fits most standard 510-thread cartridges up to 2g." },
      { q: "What is the correct way to clean the Hydout?", choices: ["Soak the whole battery in alcohol", "Cotton swab + Isopropyl Alcohol on the connection — do NOT soak the battery", "Rinse under water", "It never needs cleaning"], answer: 1, why: "Use a swab with Isopropyl Alcohol on the connection points; never soak the battery." },
    ],
  },

  /* ------------------------------------------------------------- 510 ORIGINAL */
  {
    slug: "510-original",
    name: "510 Original",
    category: "510 Cartridge Battery",
    tagline: "The smallest, most affordable G Pen battery ever.",
    minutes: 7, passPct: 80, msrp: "$12.95", accent: "#FEC870",
    cover: CDN + "510_on_white_01.png?v=1767045174",
    heroImg: LIFE + "510-original/058259adc75c62d0fe69f23e94cbb694621854da02665759ab93ad284e329267.jpg",
    productUrl: "https://www.gpen.com/products/g-pen-510-original",
    gallery: [
      { url: CDN + "510_thumb_06_b4bfbf97-a651-4032-9723-ecc13f5493cf.jpg?v=1767045041", caption: "Ultra-portable, effortless to use" },
      { url: CDN + "510_thumb_010_7a9d38b8-860e-41f6-8936-8731df1fef28.jpg?v=1767045147", caption: "Fits standard 510 cartridges" },
      { url: CDN + "510_thumb_01_10b544e9-9c4f-4b13-ae5f-69482331740d.png?v=1767045132", caption: "Three preset voltages on the digital display" },
      { url: CDN + "510_thumb_04_f7997520-6f48-4d8b-8ef1-95b24ee3af36.jpg?v=1767045073", caption: "Available in six colorways" },
    ],
    description: [
      "Back to where it all started — with upgrades.",
      "The G Pen 510 Original brings it full circle, taking inspiration from our very first battery in 2012 and reworking it for today. This is the <strong>smallest G Pen battery ever made</strong> (24 × 21.1 × 56.7 mm), built ultra-portable and effortless to use, without cutting corners on performance.",
      "Designed with <strong>breath activation</strong>, the 510 Original makes sessions effortless — just inhale and go. The single-button interface cycles three preset voltages (3.2 / 3.6 / 3.8V), a 1.8V 10-second pre-heat, and a digital display. At just <strong>$12.95</strong>, it's also the most affordable G Pen battery ever.",
    ],
    highlights: ["Smallest G Pen battery ever", "Breath activation — just inhale and go", "Three preset voltages (3.2 / 3.6 / 3.8V)", "1.8V 10-second pre-heat mode", "400mAh battery", "USB-C pass-through charging", "Digital display", "10-minute auto shut-off"],
    specs: [
      { label: "Type", value: "510 cartridge battery" },
      { label: "Dimensions", value: "24 × 21.1 × 56.7 mm (smallest G Pen battery ever)" },
      { label: "Battery", value: "400mAh" },
      { label: "Activation", value: "Breath / draw-activated (manual button optional)" },
      { label: "Voltage settings", value: "3.2V / 3.6V / 3.8V (preset)" },
      { label: "Preheat", value: "1.8V for 10 seconds" },
      { label: "Charging", value: "USB-C pass-through (cable <strong>not</strong> included)" },
      { label: "Display", value: "Digital (voltage, battery, charging status)" },
      { label: "Auto shut-off", value: "10 minutes" },
      { label: "Colors", value: "Neon Green, Red, Blue, Pink, Purple, Black" },
      { label: "In the box", value: "510 Original battery (cart & cable not included)" },
    ],
    howToUse: [
      "<strong>Load:</strong> screw a 510 cartridge into the top until snug — <strong>do not over-tighten</strong>.",
      "<strong>Power on/off:</strong> click the button <strong>5×</strong>.",
      "<strong>Adjust voltage:</strong> click <strong>3×</strong> to cycle 3.2 / 3.6 / 3.8V.",
      "<strong>Preheat:</strong> click <strong>2×</strong> for a 10-second 1.8V preheat.",
      "<strong>Draw:</strong> simply <strong>breathe in</strong> (breath-activated) — or hold the button while inhaling.",
      "Auto shut-off after <strong>10 minutes</strong> of inactivity.",
    ],
    howToClean: [
      "Power off and remove the cartridge.",
      "Use a cotton swab lightly dampened with <strong>Isopropyl Alcohol</strong> on the cartridge connection point.",
      "<strong>Do not soak the battery</strong> in alcohol or any liquid.",
      "Let it dry fully before reattaching a cartridge.",
    ],
    faq: [
      { q: "How does draw activation work?", a: "It fires automatically when you inhale — or you can press and hold the button while inhaling for manual activation." },
      { q: "What cartridges are compatible?", a: "Standard 510-thread cartridges. Cartridges are sold separately." },
      { q: "What voltage settings are available?", a: "Three presets: 3.2V, 3.6V and 3.8V. Press the button 3× to cycle through them." },
      { q: "What does pre-heat do?", a: "Pressing the button twice starts a 10-second 1.8V pre-heat to warm thicker oils and improve flow." },
      { q: "How do I read the charging display?", a: "While charging, the battery bars blink; once fully charged, the bars stay solid." },
      { q: "Is it good for beginners?", a: "Yes — simple controls, breath activation, and a clear digital display make it ideal for new and experienced users." },
    ],
    sell: [
      "The unbeatable price point ($12.95) makes this the easiest yes at the counter — add it to any cart sale.",
      "Breath activation = no buttons to fumble with; ideal for first-time cart users.",
      "Lean into the heritage story: it's a modern remake of G Pen's original 2012 battery.",
      "Still has real features — 3 voltages, preheat, USB-C pass-through, digital display — despite the price.",
    ],
    videos: [
      { title: "How to Use: G Pen 510 Original", thumb: "https://i.ytimg.com/vi/_SF_4zkbZdI/hqdefault.jpg", youtube: "_SF_4zkbZdI" },
      { title: "How to Clean: G Pen 510 Original", thumb: "https://i.ytimg.com/vi/4aMKTqSw0bQ/hqdefault.jpg", youtube: "4aMKTqSw0bQ" },
    ],
    quiz: [
      { q: "What is notable about the 510 Original?", choices: ["It's the largest G Pen battery", "It's the smallest and most affordable G Pen battery ever (a remake of the 2012 original)", "It's a dry herb vaporizer", "It only works with G Pen carts"], answer: 1, why: "It's the smallest, most affordable G Pen battery ever — a modern remake of Grenco's first 2012 battery." },
      { q: "How do you activate a draw on the 510 Original?", choices: ["Breathe in (it's breath-activated) — or hold the button", "Click 5×", "It won't draw without a screen tap", "Twist the cartridge"], answer: 0, why: "The 510 Original is breath-activated — just inhale, or hold the button." },
      { q: "What are the three preset voltages?", choices: ["2.4 / 3.0 / 3.6V", "3.2 / 3.6 / 3.8V", "1.8 / 2.4 / 3.0V", "3.8 / 4.2 / 4.8V"], answer: 1, why: "It has three preset voltages: 3.2, 3.6, and 3.8V." },
      { q: "What is the 510 Original's battery capacity?", choices: ["150mAh", "400mAh", "900mAh", "1,100mAh"], answer: 1, why: "It has a 400mAh battery with USB-C pass-through charging." },
      { q: "How do you power the 510 Original on or off?", choices: ["Click the button 5×", "Hold for 3 seconds", "Click 3×", "Breathe out"], answer: 0, why: "Click the button 5× to turn it on or off." },
      { q: "How do you change the voltage?", choices: ["Click 3×", "Click 5×", "Hold the button", "Screw the cart tighter"], answer: 0, why: "Click the button 3× to cycle through 3.2 / 3.6 / 3.8V." },
      { q: "What does clicking 2× do?", choices: ["Turns it off", "Starts a 10-second 1.8V preheat", "Locks the battery", "Nothing"], answer: 1, why: "Clicking 2× starts a 10-second 1.8V preheat." },
      { q: "How long until the 510 Original auto shuts off?", choices: ["2 minutes", "10 minutes", "30 seconds", "1 hour"], answer: 1, why: "It auto shuts off after 10 minutes of inactivity." },
      { q: "How does the 510 Original charge?", choices: ["Micro-USB", "USB-C pass-through", "Wireless only", "Replaceable batteries"], answer: 1, why: "It charges via USB-C and supports pass-through charging." },
      { q: "What is the 510 Original's MSRP?", choices: ["$12.95", "$24.95", "$49.95", "$9.95"], answer: 0, why: "At $12.95, it's the most affordable G Pen battery ever." },
    ],
  },
];

/* =============================================================================
   ABOUT G PEN — brand story shown on the "#/about" page. Edit freely.
   ========================================================================== */
window.GPEN_ABOUT = {
  intro: "G Pen is the flagship vaporizer brand of Grenco Science — one of the original pioneers of portable cannabis vaporization and a design leader trusted by consumers and culture worldwide.",
  foundingStory: [
    "Grenco Science was founded in 2012 with a simple mission: engineer the most advanced, user-friendly portable vaporizers and deliver a pure, uncompromising experience.",
    "Launching publicly at the 2012 Cypress Hill Smoke Out, G Pen is widely credited as one of the first to bring the personal portable vaporizer to the masses — and it's been pushing the category forward ever since.",
  ],
  stats: [
    { number: "2012", label: "Founded" },
    { number: "15+", label: "Years leading the industry" },
    { number: "7+", label: "Major artist & brand collaborations" },
    { number: "Global", label: "Sold worldwide (US · Canada · EU)" },
  ],
  milestones: [
    { year: "2012", text: "Grenco Science is founded and debuts the original G Pen at the Cypress Hill Smoke Out." },
    { year: "2013", text: "Announces its first major celebrity partnership with Snoop Dogg — the \"Double G\" series." },
    { year: "2014", text: "Partners with Wiz Khalifa's Taylor Gang and even sends a vaporizer to the edge of space." },
    { year: "2019", text: "Expands the Collaboration Series with lifestyle & cannabis brands, including Cookies x G Pen." },
    { year: "2020", text: "Drives category innovation with devices like the Connect, Roam, Dash, and Micro+." },
    { year: "2023", text: "Teams up with Mike Tyson's TYSON 2.0 for the TYSON 2.0 x G Pen Dash and Hyer." },
    { year: "Today", text: "A broad lineup of award-winning devices and licensed collaborations, sold across the US, Canada, and the EU." },
  ],
  collaborations: ["Snoop Dogg", "Dr. Greenthumb's (B-Real)", "Cookies (Berner)", "Lemonnade", "Grateful Dead", "TYSON 2.0 (Mike Tyson)", "Wiz Khalifa / Taylor Gang"],
  globalReach: "G Pen is a global brand sold worldwide, with dedicated storefronts for the United States, Canada, and the European Union, plus a network of authorized distributors and retail partners around the world.",
  // Social presence. `stat` numbers are approximate — update anytime (they're
  // just for display). `featured` is a highlighted post/handle to point staff to.
  social: [
    { network: "Instagram", handle: "@gpen", stat: "296K", label: "followers", url: "https://www.instagram.com/gpen/" },
    { network: "YouTube", handle: "Grenco Science", stat: "50K+", label: "subscribers", url: "https://www.youtube.com/user/GrencoScience" },
    { network: "X / Twitter", handle: "@gpen", stat: "40K+", label: "followers", url: "https://x.com/gpen" },
    { network: "Facebook", handle: "Grenco Science", stat: "1M+", label: "likes", url: "https://www.facebook.com/GrencoScience1" },
  ],
  socialPitch: "G Pen has one of the biggest, most engaged communities in the space — nearly 300K on Instagram alone. Tag @gpen and use #GPen in your store content, and follow along for drops, collabs, and how-tos you can share with customers.",
  closing: "When you sell a G Pen, you're sharing more than a device — you're handing customers a piece of vaporization history built by one of the originals. Know the story, and every conversation becomes an easy, confident sale.",
};
