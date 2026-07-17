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
    differentiator: "The pocket one. Simple, cheap, sells itself.",
    featured: "Start here",
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
    howToSell: {
      upsellFrom: "Flower",
      cue: "🌿",
      pairsWith: ["dash-plus"],
      vital: "Flower only does its job heated clean — a joint torches half the terpenes. The Dash II is how a flower customer actually tastes what they paid for.",
      aov: "Every eighth that leaves is a $49.95 Dash II that could've gone with it. It turns a one-time flower sale into a customer who comes back to you for flower.",
      keyFacts: ["Pocket dry-herb vape", "~30-sec heat-up · 0.4g oven", "$49.95 — the easy first yes"],
      talkTrack: { say: "You're grabbing flower anyway — the Dash II heats it clean instead of burning it, so that eighth lasts longer and actually tastes like the strain. Fifty bucks, fits your pocket." },
      whichClose: "For your flower, want the pocket Dash II or the bigger-oven Dash+?",
      objections: [
        { says: "I'll just roll it.", say: "Totally — and you still can. But rolling burns off the flavor and half goes up in smoke. The Dash II heats the same flower low and slow, so a gram goes further and you taste the strain. Want to see how small it is?", why: "Don't fight the joint — reframe around waste and flavor." },
        { says: "Is fifty bucks worth it?", say: "For a real temp-control vape with a screen, fifty's about as low as it gets — and it pays for itself in the flower you're not burning. Grab a USB-C cable with it and you're set.", why: "Price-anchor, then attach the cable — it's not in the box." },
        { says: "I've never used a dry-herb vape.", say: "That's the best part: grind, pack, hold the button three seconds, done. It's the hard-to-mess-up one — that's why everyone starts here." },
      ],
    },
    videos: [
      { title: "How to Use: G Pen Dash II", thumb: "https://i.ytimg.com/vi/sqCdU8Kn5ek/hqdefault.jpg", youtube: "sqCdU8Kn5ek" },
      { title: "How to Clean: Dash II", thumb: "https://i.ytimg.com/vi/wBOzqPxDhd8/hqdefault.jpg", youtube: "wBOzqPxDhd8" },
    ],
    quiz: [
      { q: "A customer is buying FLOWER. Which G Pen do you attach?", choices: ["A 510 battery", "The Melt Hot Knife", "The Dash II or Dash+", "Nothing — flower needs no device"], answer: 2, why: "Flower buyers pair with a dry-herb vape — Dash II (entry) or Dash+ (the flavor upgrade)." },
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
    differentiator: "Bigger oven, titanium, hybrid heat. The upgrade sell.",
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
    howToSell: {
      upsellFrom: "Flower",
      cue: "🌿",
      pairsWith: ["dash-ii"],
      vital: "Same flower, more of it unlocked. The titanium hybrid oven pulls flavor and vapor a pocket vape can't — it's the device for the flower buyer who cares how it tastes.",
      aov: "Your middle-tier flower upsell. Anchor the Dash II as the starter and the Dash+ becomes the sensible 'get the good one' at $99.95 — nearly double the ticket on the same flower sale.",
      keyFacts: ["Titanium oven + hybrid heat", "~20-sec heat-up · color screen", "The flower-flavor upgrade ($99.95)"],
      talkTrack: { say: "If you care how your flower tastes, this is the one. Titanium oven, hybrid heat, ready in twenty seconds — flavor a little pocket vape can't touch. And the charging cable's in the box." },
      whichClose: "Everyday Dash II, or the flavor-chaser Dash+ with the titanium oven?",
      objections: [
        { says: "Why is this double the Dash II?", say: "Titanium chamber and true convection — that's what you're paying for. It's the difference between 'it works' and 'wow, I taste the strain.' If flavor's your thing, worth the jump.", why: "Justify the price with the flavor mechanism, not a spec sheet." },
        { says: "Looks complicated.", say: "Three buttons, and it buzzes when it's ready. Load, double-click, draw. The color screen means you're never guessing your temp." },
        { says: "I already have a pocket vape.", say: "Then you get it — this is the upgrade. Bigger oven, titanium, cleaner flavor. Hold it and feel the difference.", why: "Position as the step-up, not a replacement." },
      ],
    },
    videos: [
      { title: "How to Use: G Pen Dash+", thumb: "https://i.ytimg.com/vi/OzgMUHgEQao/hqdefault.jpg", youtube: "OzgMUHgEQao" },
      { title: "How to Clean: G Pen Dash+", thumb: "https://i.ytimg.com/vi/vSAc8WPkUpY/hqdefault.jpg", youtube: "vSAc8WPkUpY" },
    ],
    quiz: [
      { q: "A flower customer wants the best possible flavor. Where do you steer them?", choices: ["The 510 Original", "The Dash+", "The Melt Hot Knife", "The Hydout"], answer: 1, why: "The Dash+'s titanium oven and hybrid heat make it the flavor upgrade for flower buyers." },
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
    differentiator: "Electric hot knife. No torch, no mess.",
    minutes: 7, passPct: 80, msrp: "$24.95", accent: "#E8833A",
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
    howToSell: {
      upsellFrom: "Dabs / concentrate",
      cue: "🍯",
      pairsWith: [],
      vital: "You can't handle a dab with your fingers — it needs heat and a tool. The Melt is the no-torch way to load the concentrate they're buying.",
      aov: "Cheap, universal impulse add. Everyone buying concentrate is fighting sticky tools and torches — a $24.95 Melt rides along with every gram of wax, rosin, or THCa.",
      keyFacts: ["Electric hot knife — no torch", "Rapid-heat ceramic tip · pocket-size", "Clean, no-mess dabs ($24.95)"],
      talkTrack: { say: "Grabbing concentrate? The Melt's how you handle it without a torch — hot ceramic tip, scoop and drop, no sticky mess. Tiny, twenty-five bucks, works with any rig or banger." },
      whichClose: "Loading a rig or a banger? Either way the Melt's your no-torch tool — want one with that wax?",
      objections: [
        { says: "I've got a dab tool already.", say: "A cold tool is where the mess and the string-cheese pull come from. The Melt heats the tip, so the concentrate releases clean every time — no torch, no reclaim disaster.", why: "Reframe: a cold tool is the problem, not the solution." },
        { says: "Do I need a torch?", say: "Nope — that's the whole point. Electric, USB-C, heats in seconds. No butane to buy or carry." },
        { says: "Twenty-five for a tool?", say: "Smallest hot knife made, and it replaces a torch and a tool. If you dab, it pays for itself the first sticky mess it saves. Grab a USB-C cable and you're set.", why: "The USB-C cable isn't in the box — attach it." },
      ],
    },
    videos: [
      { title: "A Closer Look at the Melt", thumb: "https://i.ytimg.com/vi/nEDYSJqHk5o/hqdefault.jpg", youtube: "nEDYSJqHk5o" },
      { title: "Melt — The Judge's Favorite", thumb: "https://i.ytimg.com/vi/mgErvUJHYQU/hqdefault.jpg", youtube: "mgErvUJHYQU" },
    ],
    quiz: [
      { q: "A customer is buying DABS or concentrate. What do you attach?", choices: ["A 510 Original battery", "The Melt Hot Knife", "The Dash II", "The Hydout"], answer: 1, why: "Concentrate needs heat and a tool to handle it — the Melt is the no-torch way to load a dab." },
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
    differentiator: "510 battery with the mouthpiece hidden inside.",
    minutes: 8, passPct: 80, msrp: "$24.95", accent: "#7E8AA2",
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
    howToSell: {
      upsellFrom: "510 cartridge",
      cue: "🛢",
      pairsWith: ["510-original"],
      vital: "Same job as any battery — but the hidden mouthpiece keeps the cart discreet and out of the light, which actually protects the oil they just paid for.",
      aov: "Your step-up cart battery. If they hesitate on the $12.95, the Hydout at $24.95 with discretion + 5 voltages is the 'get the nice one' — doubles the battery attach ticket.",
      keyFacts: ["Mouthpiece hidden inside", "5 voltages + preheat for thick oil", "Discreet, protects the oil ($24.95)"],
      talkTrack: { say: "For your carts, the Hydout hides the whole mouthpiece inside — pocket it and no one knows. Five heat settings to dial in any oil. Twenty-five bucks, and it shields your cart from light too." },
      whichClose: "Everyday 510 Original, or the discreet Hydout for those carts?",
      objections: [
        { says: "Why pay more than the 510?", say: "Discretion and control. Hides the mouthpiece so it's low-key in your pocket, and five voltages mean thick oils hit right. If you're out a lot, it's the one.", why: "Sell the two upgrades: discretion + voltage control." },
        { says: "Will it fit my cart?", say: "Fits most standard 510s up to 2g — basically anything on our shelf. Screw it in and go." },
        { says: "My oil clogs or won't hit.", say: "That's what preheat's for — double-click, it warms the oil ten seconds so it flows. This battery's built for thicker stuff." },
      ],
    },
    videos: [
      { title: "How to Use: G Pen Hydout", thumb: "https://i.ytimg.com/vi/WK3EXouKwGs/hqdefault.jpg", youtube: "WK3EXouKwGs" },
      { title: "How to Clean: G Pen Hydout", thumb: "https://i.ytimg.com/vi/e9oEXqNajh4/hqdefault.jpg", youtube: "e9oEXqNajh4" },
    ],
    quiz: [
      { q: "A customer is buying a 510 CARTRIDGE. Which do you attach?", choices: ["The Dash+", "The Melt Hot Knife", "The 510 Original or Hydout", "Nothing — carts work alone"], answer: 2, why: "A cart is just glass and oil until it has a battery — attach the 510 Original (entry) or the discreet Hydout." },
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
    differentiator: "The smallest, cheapest 510 battery we make.",
    minutes: 7, passPct: 80, msrp: "$12.95", accent: "#A9A296",
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
    howToSell: {
      upsellFrom: "510 cartridge",
      cue: "🛢",
      pairsWith: ["hydout"],
      vital: "A cart is glass and oil until it has a battery. No battery, no session — the 510 Original is the cheapest way to make the cart they're buying actually work.",
      aov: "At $12.95 it's the easiest attach in the store. Nobody walks out with a cart and no way to hit it — near-automatic on every cart sale.",
      keyFacts: ["Smallest/cheapest G Pen battery ($12.95)", "Breath-activated — just inhale", "Fits any standard 510 cart"],
      talkTrack: { say: "That cart needs a battery to hit — you got one? The 510 Original's thirteen bucks, breath-activated, fits any cart. Just inhale and go." },
      whichClose: "For your carts, the simple 510 Original or the Hydout with the hidden mouthpiece?",
      objections: [
        { says: "I've got an old battery at home.", say: "If it still hits, great — but a random one can burn the cart or leak. Thirteen bucks gets one that fires clean and fits everything. Cheap insurance on a forty-dollar cart.", why: "Dependency framing — protect the cart they already bought." },
        { says: "Do I really need it?", say: "You need something to hit the cart with — 510 Original or the Hydout? Either way you're covered.", why: "Assumptive close — skip the yes/no, ask which one." },
        { says: "What's the difference from the Hydout?", say: "Price and discretion. The 510's the small, simple, cheap one. The Hydout hides the mouthpiece and gives you five voltages. Both fit your cart." },
      ],
    },
    videos: [
      { title: "How to Use: G Pen 510 Original", thumb: "https://i.ytimg.com/vi/_SF_4zkbZdI/hqdefault.jpg", youtube: "_SF_4zkbZdI" },
      { title: "How to Clean: G Pen 510 Original", thumb: "https://i.ytimg.com/vi/4aMKTqSw0bQ/hqdefault.jpg", youtube: "4aMKTqSw0bQ" },
    ],
    quiz: [
      { q: "Which G Pen makes a 510 cartridge actually work?", choices: ["The Dash II", "A 510 battery — 510 Original or Hydout", "The Melt Hot Knife", "It doesn't need anything"], answer: 1, why: "No battery, no session. The 510 Original is the cheapest battery that fits any standard cart." },
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
   HIDDEN TRIVIA EASTER EGGS
   -----------------------------------------------------------------------------
   One hidden trivia orb per page. Find + answer them ALL correctly, and certify
   on every course (80%+), to unlock the secret 40% reward code.

   `on` tells the app which page the orb hides on:
     "home" | "about" | "course:<course-slug>"
   Add/remove eggs freely — the "find them all" count updates automatically.
   ========================================================================== */
window.GPEN_EGGS = [
  {
    id: "egg-420", on: "home",
    slot: "courses", align: "left",
    emoji: "🕓", hint: "Psst… what time is it?",
    q: "Where does “420” actually come from?",
    choices: [
      "A police radio code for cannabis",
      "A group of ’70s California high schoolers who met at 4:20 p.m.",
      "The number of compounds in cannabis",
      "The date of the first legalization vote",
    ],
    answer: 1,
    fact: "In 1971, a group of San Rafael High students called “the Waldos” met at 4:20 p.m. to hunt for a rumored hidden crop. The time became their code word — and eventually the whole culture's.",
  },
  {
    id: "egg-snoop", on: "about",
    slot: "collabs", align: "right",
    emoji: "🎤", hint: "Drop the mic?",
    q: "Which legend teamed up with G Pen for the original “Double G” series?",
    choices: ["Wiz Khalifa", "B-Real", "Snoop Dogg", "Berner"],
    answer: 2,
    fact: "Snoop Dogg announced his official partnership with Grenco Science in 2013 — the “Double G” series put G Pen on the map.",
  },
  {
    id: "egg-trichomes", on: "course:dash-ii",
    slot: "overview", align: "right",
    emoji: "❄️", hint: "Why so frosty?",
    q: "What are the frosty, crystal-like resin glands on cannabis flower called?",
    choices: ["Pistils", "Trichomes", "Stamens", "Nodes"],
    answer: 1,
    fact: "Trichomes are the tiny resin glands that hold most of the cannabinoids and terpenes — that “frost” is where the good stuff lives.",
  },
  {
    id: "egg-combustion", on: "course:dash-plus",
    slot: "specs", align: "left",
    emoji: "🔥", hint: "Don't get burned",
    q: "The whole point of a vaporizer is to heat material just below the point of…",
    choices: ["Evaporation", "Combustion", "Condensation", "Sublimation"],
    answer: 1,
    fact: "Vaporizers heat material hot enough to release vapor but below combustion (~450°F/232°C), so you get vapor instead of smoke.",
  },
  {
    id: "egg-terpenes", on: "course:melt-hot-knife",
    slot: "clean", align: "right",
    emoji: "👃", hint: "Take a whiff",
    q: "Which compounds give each strain its distinct smell and flavor?",
    choices: ["Flavonoids", "Chlorophyll", "Terpenes", "Cannabinoids"],
    answer: 2,
    fact: "Terpenes are the aromatic oils behind citrus, pine, and diesel notes. They're also delicate — which is exactly why lower-temp vaping preserves flavor.",
  },
  {
    id: "egg-cbd", on: "course:hydout",
    slot: "faq", align: "left",
    emoji: "🌱", hint: "Grow your knowledge",
    q: "Which well-known cannabinoid is non-intoxicating?",
    choices: ["THC", "CBD", "THCa converted with heat", "Delta-8"],
    answer: 1,
    fact: "CBD won't get you high — it's the non-intoxicating cannabinoid most associated with wellness use.",
  },
  {
    id: "egg-munchies", on: "home",
    slot: "rewards", align: "right",
    emoji: "🍕", hint: "Hungry?",
    q: "Why do the munchies happen?",
    choices: [
      "Cannabis empties your stomach faster",
      "THC activates receptors that heighten smell, taste, and hunger signals",
      "It lowers your blood sugar",
      "It's purely psychological",
    ],
    answer: 1,
    fact: "THC binds to CB1 receptors in the brain — including the olfactory bulb and hypothalamus — which sharpens smell and taste and ramps up ghrelin, the hormone that tells you you're hungry.",
  },
  {
    id: "egg-global", on: "about",
    slot: "social", align: "left",
    emoji: "🌍", hint: "Think globally",
    q: "Uruguay legalized nationwide adult-use cannabis first. Which country was second?",
    choices: ["The Netherlands", "Portugal", "Canada", "Thailand"],
    answer: 2,
    fact: "Canada legalized nationwide adult-use cannabis in October 2018, five years after Uruguay became the first country in the world to do it.",
  },
  {
    id: "egg-binder", on: "collection",
    slot: "binder", align: "center",
    emoji: "🃏", hint: "One more for the set…",
    q: "Cannabis sativa and Cannabis indica were first named by botanists in which century?",
    choices: ["The 1500s", "The 1700s", "The 1800s", "The 1900s"],
    answer: 1,
    fact: "Carl Linnaeus named Cannabis sativa in 1753, and Jean-Baptiste Lamarck named Cannabis indica in 1785 — both in the 18th century, long before anyone argued about them on a dispensary menu.",
  },
  {
    id: "egg-entourage", on: "course:510-original",
    slot: "videos", align: "center",
    emoji: "🤝", hint: "Better together",
    q: "What's the term for cannabinoids and terpenes working better together than alone?",
    choices: ["The entourage effect", "The halo effect", "Synergy bloom", "The full-spectrum rule"],
    answer: 0,
    fact: "The “entourage effect” is the theory that the full mix of cannabinoids and terpenes produces a richer experience than any isolated compound.",
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

/* =============================================================================
   FUN LAYER — ranks, quips & trivia. All editable, none of it affects scoring.
   ========================================================================== */

/* Class ranks — you move up the ladder as you certify on courses.
   `at` = number of courses passed needed to hold this rank. */
window.GPEN_RANKS = [
  { at: 0, emoji: "🌱", name: "Freshman",   blurb: "Just got your syllabus." },
  { at: 1, emoji: "🍃", name: "Sophomore",  blurb: "One course down. Momentum." },
  { at: 2, emoji: "💨", name: "Junior",     blurb: "You're starting to talk like a pro." },
  { at: 3, emoji: "🔥", name: "Senior",     blurb: "Customers trust you now." },
  { at: 4, emoji: "🎓", name: "Dean's List", blurb: "One away from glory." },
  { at: 5, emoji: "👑", name: "Certified G", blurb: "Fully trained. Fully loaded." },
];

/* Randomized feedback copy — keeps quizzes from feeling like a compliance module. */
window.GPEN_QUIPS = {
  correct: [
    "Correct!", "Certified genius.", "Big brain energy.", "That's the good stuff.",
    "Chef's kiss.", "You ate that.", "Textbook. Literally.", "Dialed in.",
  ],
  wrong: [
    "Not quite — try again.", "Close, but no rolling paper.", "Mmm… nope.",
    "Take another pass at it.", "So close. Circle back.", "Swing and a miss.",
  ],
  fail: [
    "So close!", "Almost had it.", "Take a breath and run it back.", "Not this time — but soon.",
  ],
  pass: [
    "You passed!", "Certified.", "Nailed it.", "Straight A's over here.",
  ],
};

/* Rotating "Did you know?" cards — light trivia, no quiz, no points. Pure vibes. */
window.GPEN_FACTS = [
  { emoji: "🕓", text: "\"420\" started with five San Rafael high-schoolers — the Waldos — who met at 4:20pm by a Louis Pasteur statue in 1971." },
  { emoji: "❄️", text: "Those frosty crystals on good flower are trichomes — the resin glands where nearly all the cannabinoids and terpenes actually live." },
  { emoji: "👃", text: "Terpenes are why one strain smells like diesel and another like mango. Limonene, myrcene, pinene — they're in your citrus peel too." },
  { emoji: "🌡️", text: "Vaporizers heat below the combustion point (~450°F / 232°C), which is exactly why vapor isn't smoke." },
  { emoji: "🎤", text: "Snoop Dogg partnered with G Pen in 2014 — one of the first true celebrity collaborations in the vaporizer world." },
  { emoji: "🍫", text: "Anandamide, one of your body's own cannabinoids, is named after the Sanskrit word for \"bliss.\" It's also found in chocolate." },
  { emoji: "🌿", text: "Hemp is one of the oldest cultivated crops on Earth — woven fabric samples date back roughly 10,000 years." },
  { emoji: "🫙", text: "Light and heat degrade cannabinoids faster than anything else. Cool, dark, airtight — that's the whole storage lecture." },
  { emoji: "⚡", text: "A dirty chamber is the #1 cause of \"my vape stopped hitting.\" Nine times out of ten it's a cleaning issue, not a defect." },
  { emoji: "🤝", text: "The \"entourage effect\" is the theory that cannabinoids and terpenes work better together than any one compound alone." },
  { emoji: "🧊", text: "Water filtration doesn't reduce potency much — it mostly cools the vapor. That's the entire pitch for the Hydout." },
  { emoji: "🏭", text: "Grenco Science shipped its first G Pen in 2012, back when \"vape pen\" wasn't even a phrase people used." },
];

/* =============================================================================
   THE COLLECTION — trading-card metadata
   -----------------------------------------------------------------------------
   Every course is a collectible card. Pass its quiz at 80%+ and you "pull" it.
   Collect the 5-card Base Set to reveal the Certified G secret rare; find all
   the hidden trivia eggs to upgrade that card to full gold.

   Per card:
     no        : card number in the set (printed bottom-right as "N/6")
     rarity    : "common" | "uncommon" | "rare"   (drives the symbol + foil)
     element   : key into GPEN_ELEMENTS below
     code      : course code, university-catalog style (printed on the card)
     power     : the "HP" analog — battery capacity
     moves     : [{ name, cost, dmg, text }] — real specs dressed up as attacks
     statsRow  : the weakness/resistance/retreat row, repurposed for real specs
   ========================================================================== */
window.GPEN_ELEMENTS = {
  herb: { emoji: "🌿", label: "Dry Herb", tint: "#2f8f5b" },
  conc: { emoji: "🔥", label: "Concentrate", tint: "#D75D43" },
  cart: { emoji: "🔋", label: "Cartridge", tint: "#3f6fb5" },
  gold: { emoji: "👑", label: "Certified", tint: "#c8952f" },
};

window.GPEN_RARITY = {
  common:   { sym: "●",   label: "Common" },
  uncommon: { sym: "◆",   label: "Uncommon" },
  rare:     { sym: "★",   label: "Rare Holo" },
  secret:   { sym: "★★★", label: "Secret Rare" },
};

window.GPEN_SET = { name: "Base Set", total: 6, illus: "Illus. Grenco Science" };

window.GPEN_CARDS = {
  "dash-ii": {
    no: 1, rarity: "uncommon", element: "herb", code: "VAPE 101",
    power: "1,100", powerUnit: "mAh",
    moves: [
      { name: "Quick Draw", cost: 1, dmg: "30s", text: "The 0.4g ceramic chamber is session-ready in about 30 seconds." },
      { name: "Dial It In", cost: 2, dmg: "±1°", text: "Precise temperature control with a live OLED readout." },
    ],
    statsRow: [{ k: "Heat-up", v: "~30s" }, { k: "Warranty", v: "6 mo" }, { k: "Charge", v: "USB-C" }],
  },
  "dash-plus": {
    no: 2, rarity: "rare", element: "herb", code: "VAPE 201",
    power: "1,800", powerUnit: "mAh",
    moves: [
      { name: "Hybrid Heat", cost: 2, dmg: "20s", text: "Convection and conduction together, through a full titanium chamber." },
      { name: "Long Session", cost: 3, dmg: "40m", text: "1,800mAh delivers roughly 40 minutes of heating per charge." },
    ],
    statsRow: [{ k: "Heat-up", v: "~20s" }, { k: "Warranty", v: "2 yr" }, { k: "Charge", v: "USB-C" }],
  },
  "melt-hot-knife": {
    no: 3, rarity: "common", element: "conc", code: "CONC 210",
    power: "500", powerUnit: "mAh",
    moves: [
      { name: "Hot Knife", cost: 1, dmg: "302°F", text: "Ceramic tip hits ~150°C for clean, torch-free dabs." },
      { name: "Pocket Carry", cost: 1, dmg: "—", text: "The smallest hot knife on the market. It goes everywhere you do." },
    ],
    statsRow: [{ k: "Tip temp", v: "150°C" }, { k: "Warranty", v: "90 d" }, { k: "Charge", v: "USB-C" }],
  },
  "hydout": {
    no: 4, rarity: "uncommon", element: "cart", code: "CART 110",
    power: "400", powerUnit: "mAh",
    moves: [
      { name: "Stealth Mode", cost: 1, dmg: "—", text: "A hidden magnetic mouthpiece cover keeps the cart out of sight." },
      { name: "Fine Tune", cost: 2, dmg: "3.8V", text: "Five voltage settings from 2.4V to 3.8V, plus a 1.8V preheat." },
    ],
    statsRow: [{ k: "Voltages", v: "5" }, { k: "Warranty", v: "90 d" }, { k: "Charge", v: "USB-C" }],
  },
  "510-original": {
    no: 5, rarity: "common", element: "cart", code: "CART 101",
    power: "400", powerUnit: "mAh",
    moves: [
      { name: "Breath Activated", cost: 1, dmg: "—", text: "No buttons, no menus. Inhale and it fires." },
      { name: "Three Presets", cost: 1, dmg: "3.8V", text: "Cycle 3.2V / 3.6V / 3.8V to match any cartridge." },
    ],
    statsRow: [{ k: "Presets", v: "3" }, { k: "Warranty", v: "90 d" }, { k: "Charge", v: "USB-C" }],
  },
};

/* The 6th card. Two states: Holo (collect the Base Set) and Gold (also find
   every hidden trivia egg). The gold face carries the program's top reward. */
window.GPEN_SECRET_CARD = {
  no: 6, rarity: "secret", element: "gold", code: "G 420",
  name: "Certified G", power: "∞", powerUnit: "",
  moves: [
    { name: "Total Recall", cost: 3, dmg: "5/5", text: "Knows every G Pen product cold — specs, cleaning, objections, all of it." },
    { name: "House Discount", cost: 2, dmg: "40%", text: "The highest reward in the program. Nobody else on the floor has this card." },
  ],
  statsRow: [{ k: "Base Set", v: "5/5" }, { k: "Trainers", v: "10/10" }, { k: "Rank", v: "👑" }],
  flavor: "Fully trained. Fully loaded. A G Pen Product Specialist in every sense.",
};

/* Trainer & Energy cards — one for every hidden trivia egg you solve.
   `egg` must match an id in GPEN_EGGS. Order here = card number. */
window.GPEN_TRAINERS = [
  { egg: "egg-420",        no: 1,  kind: "Supporter", name: "The Waldos",       text: "Five San Rafael teenagers, one 4:20pm meet-up, and a code word that outlived them all." },
  { egg: "egg-snoop",      no: 2,  kind: "Supporter", name: "The Collab",       text: "When the culture's biggest name puts his name on your pen, the whole category moves." },
  { egg: "egg-trichomes",  no: 3,  kind: "Energy",    name: "Trichome Frost",   text: "The frost is the point. Nearly every cannabinoid and terpene lives in those resin glands." },
  { egg: "egg-combustion", no: 4,  kind: "Item",      name: "Low & Slow",       text: "Stay under the combustion point and vapor stays vapor. That's the whole product category." },
  { egg: "egg-terpenes",   no: 5,  kind: "Energy",    name: "Terp Profile",     text: "Diesel, citrus, pine. Terpenes are why no two strains ever smell the same." },
  { egg: "egg-cbd",        no: 6,  kind: "Energy",    name: "Full Spectrum",    text: "The whole plant, not just the headline compound." },
  { egg: "egg-entourage",  no: 7,  kind: "Stadium",   name: "Entourage Effect", text: "Cannabinoids and terpenes, working the room together." },
  { egg: "egg-munchies",   no: 8,  kind: "Item",      name: "The Munchies",     text: "Your own receptors turning the volume up on smell, taste, and hunger." },
  { egg: "egg-global",     no: 9,  kind: "Stadium",   name: "Global Reach",     text: "From a Los Angeles garage in 2012 to shelves on nearly every continent." },
  { egg: "egg-binder",     no: 10, kind: "Item",      name: "The Binder",       text: "Every collector needs somewhere to keep the set." },
];

/* =============================================================================
   PROFESSOR O.G. — the mascot (Original G, tenured owl, Dean of G Pen U)
   -----------------------------------------------------------------------------
   Voice: playful and clever. He drops real knowledge, hypes your pulls, and
   never, ever sounds like a compliance module. Edit the lines freely.
   ========================================================================== */
window.GPEN_MASCOT = {
  name: "Professor O.G.",
  short: "Prof. O.G.",
  title: "Dean of G Pen University",
  // home greeting, by how far along they are
  welcome: [
    "Welcome to G Pen U. I&rsquo;m Professor O.G. &mdash; Original G, tenured, and yes, the chain is real.",
    "Class is in session. Pick any product, watch the tape, then show me you actually know it.",
  ],
  started: [
    "Good pull. The set isn&rsquo;t gonna collect itself, though.",
    "You&rsquo;re building a rep out there. Keep it rolling.",
  ],
  almost: [
    "One card left. Don&rsquo;t leave me hanging here.",
    "So close I can taste it. Finish the set.",
  ],
  done: [
    "Certified G. You&rsquo;ve officially out-studied the faculty.",
    "Gold chain, gold card. Go run the floor.",
  ],
  // quiz reactions
  correct: [
    "That&rsquo;s the one. Textbook.",
    "Ayy &mdash; big brain.",
    "You&rsquo;ve been reading. Respect.",
    "Smooth. Like a 20-second heat-up.",
  ],
  wrong: [
    "Not quite &mdash; even I misplace my glasses.",
    "Nah. Circle back, you&rsquo;ve got it.",
    "Close, but the syllabus disagrees.",
  ],
  // card pull
  pull: [
    "Ooh &mdash; fresh out the pack. Sleeve it up.",
    "That&rsquo;s a clean pull. Straight to the binder.",
    "Certified. Add it to the collection.",
  ],
  perfect: ["Perfect score?! Save some knowledge for the rest of us."],
  // tap him for a random one of these
  idle: [
    "Terpenes are why one jar smells like diesel and the next like mango. Same plant. Wild.",
    "Pop quiz: a customer says their vape &ldquo;died.&rdquo; Nine times out of ten? It&rsquo;s just dirty. Clean the chamber.",
    "The trick to selling isn&rsquo;t talking more. It&rsquo;s knowing the answer before they finish asking.",
    "Vapor isn&rsquo;t smoke. Stay under the combustion point and you&rsquo;ve got a whole different product category.",
    "I&rsquo;ve been tenured since 2012. That&rsquo;s a whole degree in staying calm.",
    "Yes, the chain is real. No, you cannot borrow it.",
    "Grind it, don&rsquo;t pack it. Airflow is the whole ballgame.",
    "Hoo. Sorry &mdash; occupational hazard.",
  ],
  // his line on the binder page, by how full it is
  binder: [
    "That&rsquo;s a clean collection you&rsquo;ve got there. Tap a card to really look at it.",
    "Sleeves on, corners sharp. This is how you treat a set.",
  ],
  binderFull: [
    "Every slot filled. I&rsquo;d frame it, but you already sleeved it.",
  ],
  // right before the quiz on a course page
  quizIntro: [
    "Alright. Show me what you picked up. 80% and the card&rsquo;s yours.",
    "No pressure. Well &mdash; a little. There&rsquo;s a card on the line.",
    "You&rsquo;ve read the material. Now go earn the sleeve.",
  ],
};
