/* =============================================================================
   G PEN TRAINING PORTAL — COURSE DATA
   -----------------------------------------------------------------------------
   One entry per product course. Content harvested from the G Pen asset portal
   (PRODUCT_INFO / PRODUCT_VIDEOS / PORTAL_TRAINING) and the official manuals.

   To ADD a course: copy a { ... } block, change the fields, mind the commas.
   To EDIT copy/quiz: just edit the strings below — no code changes needed.

   Per course:
     slug        : URL id (kebab-case). Used in the address bar + progress store.
     name        : Product name (also the cert title)
     category    : short type label shown on the card
     tagline     : one-line hook on the course card + hero
     minutes     : approx. time to complete (shown as a badge)
     passPct     : score needed on the quiz to certify (default 80)
     msrp        : shown on the card
     cover       : product tile image URL
     accent      : hex used for the card's colour pop (kept subtle / on-brand)
     description : short overview paragraph
     highlights  : key selling points (bullets)
     sell        : "How to sell it" budtender talking points (bullets)
     videos      : [{ title, thumb, youtube?, mp4?, embed? }]
     modules     : [{ title, points:[html...] }]   (the "Learn" lessons)
     quiz        : [{ q, choices:[...], answer:<index>, why }]
   ========================================================================== */
window.GPEN_COURSES = [
  /* ------------------------------------------------------------------ DASH II */
  {
    slug: "dash-ii",
    name: "Dash II",
    category: "Dry Herb Vaporizer",
    tagline: "The pocket-sized dry herb vape, upgraded across the board.",
    minutes: 8, passPct: 80, msrp: "$49.95", accent: "#FEC870",
    cover: "https://cdn.shopify.com/s/files/1/0185/1576/files/Dash2_thumb_01.png?v=1782934099",
    productUrl: "https://www.gpen.com/products/g-pen-dash-ii-vaporizer",
    description: "The next evolution of the best-selling Dash — a pocket-sized dry herb vaporizer upgraded across the board with faster heat-up, improved airflow, and refined temperature control.",
    highlights: ["Pocket-sized dry herb vaporizer", "~30-second heat-up", "Precise temperature control", "OLED display", "Upgraded 0.4g ceramic chamber (easier loading)", "1,100mAh battery", "USB-C pass-through charging"],
    sell: [
      "Lead with the price-to-performance story: adjustable temp + OLED display at just $49.95.",
      "It's an upgrade path for anyone who loved the original Dash — bigger chamber, bigger battery, USB-C.",
      "Great first \"real\" dry herb vape: simple button interface, pocketable, hard to mess up.",
      "Remind customers a USB-C cable isn't in the box, so add one to the sale.",
    ],
    videos: [
      { title: "How to Use: G Pen Dash II", thumb: "https://i.ytimg.com/vi/sqCdU8Kn5ek/hqdefault.jpg", youtube: "sqCdU8Kn5ek" },
      { title: "How to Clean: Dash II", thumb: "https://i.ytimg.com/vi/wBOzqPxDhd8/hqdefault.jpg", youtube: "wBOzqPxDhd8" },
    ],
    modules: [
      { title: "Product Overview", points: [
        "The Dash II is a pocket-sized <strong>dry herb vaporizer</strong> — the next evolution of the best-selling G Pen Dash.",
        "It is for <strong>dry herb only</strong> — not compatible with concentrates, oils, or 510 carts.",
        "Uses a <strong>conduction</strong> heating system for reliable vapor and ~30-second heat-up.",
        "MSRP <strong>$49.95</strong>.",
      ] },
      { title: "Key Specs", points: [
        "<strong>0.4g ceramic</strong> heating chamber — larger than the original Dash and easier to load.",
        "<strong>1,100mAh</strong> battery.",
        "<strong>USB-C</strong> charging with <strong>pass-through charging</strong> — it can be used while plugged in.",
        "<strong>OLED display</strong> shows real-time temperature and battery level.",
        "Precise <strong>adjustable temperature control</strong>.",
        "Dimensions <strong>97 × 35 × 21 mm</strong>, weight <strong>62 g</strong>.",
        "Built-in <strong>pick tool</strong> for loading and cleaning.",
      ] },
      { title: "How to Use", points: [
        "<strong>Charge</strong> with any USB-C charger.",
        "<strong>Load:</strong> remove the mouthpiece, fully load the chamber with dry material, and pack lightly with the pick tool — <strong>do not overpack</strong>.",
        "<strong>Power on:</strong> hold the button for <strong>3 seconds</strong>.",
        "Use <strong>– / +</strong> to adjust the session temperature.",
        "<strong>Start a session:</strong> tap the button <strong>2× (within 2 seconds)</strong>. Tap <strong>2×</strong> again to cancel anytime.",
        "Draw from the mouthpiece — <strong>long, sustained draws</strong> give the best results.",
        "Tap the button <strong>5×</strong> to open the device settings menu.",
      ] },
      { title: "How to Clean & Maintain", points: [
        "<strong>After every use:</strong> clean the mouthpiece filter screen and bowl with the included pick tool.",
        "<strong>Deep clean:</strong> remove the mouthpiece insert and clean with <strong>Isopropyl Alcohol</strong>.",
        "Always let all parts <strong>dry completely</strong> before reassembling.",
      ] },
      { title: "Warranty & What's In the Box", points: [
        "Backed by a <strong>6-month</strong> limited warranty.",
        "Registering the device at <strong>gpen.com/register</strong> adds another 6 months — a full <strong>1-year</strong> limited warranty.",
        "<strong>In the box:</strong> Dash II device, built-in loading (pick) tool, silicone mouthpiece sleeve. <strong>A USB-C charging cable is NOT included.</strong>",
      ] },
      { title: "Upgrades vs. the Original Dash", points: [
        "Lower MSRP ($49.95), adjustable <strong>temperature control</strong>, and an <strong>OLED display</strong>.",
        "Larger <strong>0.4g</strong> chamber and a bigger <strong>1,100mAh</strong> battery.",
        "Modern <strong>USB-C</strong> charging with pass-through, and an updated chamber design.",
      ] },
    ],
    quiz: [
      { q: "What material is the G Pen Dash II designed to vaporize?", choices: ["Dry herb only", "Concentrates and oils", "510 cartridges", "Any of the above"], answer: 0, why: "The Dash II is a dry herb vaporizer only — it is not compatible with concentrates, oils, or 510 carts." },
      { q: "How large is the Dash II's heating chamber?", choices: ["0.2g", "0.4g ceramic", "1.0g", "It has no chamber"], answer: 1, why: "The Dash II has an upgraded 0.4g ceramic chamber — larger than the original Dash and easier to load." },
      { q: "What type of heating system does the Dash II use?", choices: ["Convection", "Conduction", "Induction", "Open flame"], answer: 1, why: "It uses a conduction heating system, with roughly a 30-second heat-up." },
      { q: "Approximately how long does the Dash II take to heat up?", choices: ["5 seconds", "30 seconds", "2 minutes", "5 minutes"], answer: 1, why: "Heat-up is approximately 30 seconds." },
      { q: "What is the Dash II's battery capacity?", choices: ["650mAh", "900mAh", "1,100mAh", "2,200mAh"], answer: 2, why: "The Dash II is powered by a 1,100mAh battery — an upgrade over the original Dash." },
      { q: "Which statement about charging the Dash II is TRUE?", choices: ["It uses Micro-USB", "It charges via USB-C and supports pass-through (use while plugged in)", "It charges wirelessly only", "It cannot be used while charging"], answer: 1, why: "The Dash II charges via USB-C and supports pass-through charging, so it can be used while plugged in." },
      { q: "How do you power the Dash II on?", choices: ["Tap the button once", "Hold the button for 3 seconds", "Tap the button 5 times", "Slide the power switch"], answer: 1, why: "Hold the button for 3 seconds to power on." },
      { q: "After setting your temperature, how do you START a session?", choices: ["Tap the button 2× within 2 seconds", "Hold for 10 seconds", "Blow into the mouthpiece", "It starts automatically"], answer: 0, why: "Tap the button 2× (within 2 seconds) to start a session; tap 2× again to cancel." },
      { q: "For a DEEP clean, what should you use on the removed mouthpiece insert?", choices: ["Water and soap", "Isopropyl Alcohol", "Vinegar", "Just wipe it dry"], answer: 1, why: "For a deep clean, remove the mouthpiece insert and clean it with Isopropyl Alcohol, then let it dry completely before reassembling." },
      { q: "How does the Dash II's warranty work?", choices: ["No warranty", "Lifetime warranty", "6-month limited, extended to 1 year if you register the device", "30-day returns only"], answer: 2, why: "It's a 6-month limited warranty; registering at gpen.com/register adds 6 more months for a full year." },
      { q: "What is the Dash II's MSRP?", choices: ["$29.95", "$49.95", "$79.95", "$99.95"], answer: 1, why: "The Dash II launched at a lower MSRP of $49.95." },
      { q: "Which item is NOT included in the box?", choices: ["The Dash II device", "Built-in pick/loading tool", "Silicone mouthpiece sleeve", "A USB-C charging cable"], answer: 3, why: "A USB-C charging cable is not included — any USB-C charger can be used." },
    ],
  },

  /* ------------------------------------------------------------------- DASH+ */
  {
    slug: "dash-plus",
    name: "Dash+",
    category: "Dry Herb Vaporizer",
    tagline: "Hybrid convection + conduction in a titanium chamber.",
    minutes: 8, passPct: 80, msrp: "$99.95", accent: "#D75D43",
    cover: "https://cdn.shopify.com/s/files/1/0185/1576/files/dash__vape_thumb_5e14bcb4-a63a-4cc3-8078-e57fc572e4da.png?v=1729247649",
    productUrl: "https://www.gpen.com/products/g-pen-dash-plus-vaporizer",
    description: "A next-generation portable dry herb vaporizer using hybrid convection-conduction heating in a titanium chamber to reach vaporization temperatures in about 20 seconds.",
    highlights: ["Hybrid convection + conduction heating", "Titanium heating chamber", "Heats up in ~20 seconds", "1,800mAh rechargeable Li-ion battery", "USB-C charging", "Full-color LED display", "Haptic feedback, 3-button interface", "Zinc-alloy casing"],
    sell: [
      "This is the flavor-chaser's Dash: hybrid heating + titanium chamber means cleaner, tastier vapor.",
      "Step-up sell from the Dash II for customers who want more power, a bigger battery, and a color screen.",
      "Point out the ~20-second heat-up and haptic feedback — it feels premium in the hand.",
      "USB-C cable IS included here (unlike the Dash II), which is a nice value talking point.",
    ],
    videos: [
      { title: "How to Use: G Pen Dash+", thumb: "https://i.ytimg.com/vi/OzgMUHgEQao/hqdefault.jpg", youtube: "OzgMUHgEQao" },
      { title: "How to Clean: G Pen Dash+", thumb: "https://i.ytimg.com/vi/vSAc8WPkUpY/hqdefault.jpg", youtube: "vSAc8WPkUpY" },
    ],
    modules: [
      { title: "Product Overview", points: [
        "The Dash+ is a compact, portable <strong>dry herb vaporizer</strong> — the plus-sized evolution of the best-selling G Pen Dash.",
        "It uses <strong>hybrid convection + conduction</strong> heating for fast, flavorful, even sessions.",
        "For <strong>dry herb only</strong>. MSRP <strong>$99.95</strong>.",
      ] },
      { title: "Key Specs", points: [
        "Full <strong>titanium</strong> heating chamber.",
        "Reaches vaporization temperature in as little as <strong>20 seconds</strong>.",
        "<strong>1,800mAh</strong> rechargeable Li-ion battery with <strong>USB-C</strong> charging.",
        "<strong>Full-color LED display</strong> with precise temperature control.",
        "<strong>Haptic feedback</strong> and an intuitive <strong>3-button</strong> interface.",
        "Durable <strong>zinc-alloy</strong> body.",
      ] },
      { title: "How to Use", points: [
        "<strong>Load:</strong> remove the mouthpiece, load the chamber with ground dry herb, and re-attach the mouthpiece.",
        "<strong>Power on/off:</strong> hold the power button for <strong>3 seconds</strong>.",
        "<strong>Adjust temperature</strong> with the left (–) and right (+) buttons.",
        "<strong>Start or cancel a session:</strong> press the power button <strong>2× within 2 seconds</strong>. It vibrates and the session timer begins once the temperature is reached.",
        "When the session timer ends, heating shuts off automatically; the device powers off after about 1 minute of standby inactivity.",
        "Press the power button <strong>5×</strong> to open the Settings menu (session timer, °F/°C, brightness, haptics).",
      ] },
      { title: "What's In the Box", points: [
        "G Pen Dash+ vaporizer, mouthpiece silicone sleeve, loading tool with keychain, and a <strong>USB-C charging cable</strong> (included).",
        "Register your device at <strong>gpen.com/register</strong>.",
      ] },
    ],
    quiz: [
      { q: "What type of heating does the Dash+ use?", choices: ["Conduction only", "Hybrid convection + conduction", "Open flame", "Induction"], answer: 1, why: "The Dash+ uses hybrid convection + conduction heating for fast, even, flavorful sessions." },
      { q: "What is the Dash+'s heating chamber made of?", choices: ["Plastic", "Titanium", "Glass", "Stainless steel"], answer: 1, why: "It features a full titanium heating chamber." },
      { q: "About how long does the Dash+ take to reach temperature?", choices: ["20 seconds", "2 minutes", "5 seconds", "45 seconds"], answer: 0, why: "The Dash+ reaches vaporization temperature in as little as 20 seconds." },
      { q: "What is the Dash+'s battery capacity?", choices: ["650mAh", "1,100mAh", "1,800mAh", "3,000mAh"], answer: 2, why: "It's powered by an 1,800mAh rechargeable Li-ion battery." },
      { q: "How do you power the Dash+ on?", choices: ["Tap once", "Hold the power button for 3 seconds", "Tap 5 times", "Shake it"], answer: 1, why: "Hold the power button for 3 seconds to power on or off." },
      { q: "After setting temperature, how do you START a session?", choices: ["Press the power button 2× within 2 seconds", "Hold for 10 seconds", "Blow into it", "It starts on its own"], answer: 0, why: "Press the power button 2× within 2 seconds to start (or cancel) a session." },
      { q: "How do you open the Settings menu?", choices: ["Press the power button 5×", "Hold both side buttons", "Tap once", "Plug in USB-C"], answer: 0, why: "Press the power button 5× to enter the Settings menu (timer, °F/°C, brightness, haptics)." },
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
    minutes: 6, passPct: 80, msrp: "$24.95", accent: "#FEC870",
    cover: "https://cdn.shopify.com/s/files/1/0185/1576/files/Melt_thumbA.png?v=1772813232",
    productUrl: "https://www.gpen.com/products/g-pen-melt",
    description: "The smallest hot knife on the market — a compact, ceramic-tipped dab tool for fast, clean, zero-mess concentrate scooping and drops.",
    highlights: ["Smallest hot knife on the market", "Rapid-heat ceramic tip", "USB-C pass-through charging", "Sleek aluminum body", "Ultra-compact: 3.94 × 0.5 × 0.25 in", "Zero-mess scooping and drops", "Works with rigs, Micro+, Hyer"],
    sell: [
      "Perfect impulse add-on / attachment sale — cheap, universal, and everyone dabbing needs one.",
      "Pitch it as \"no sticky tools, no reclaim disasters\" — it solves a real everyday annoyance.",
      "Cross-sell with rigs, the Micro+, and the Hyer — it pairs with all of them.",
      "USB-C cable isn't included, so bundle one.",
    ],
    videos: [
      { title: "A Closer Look at the Melt", thumb: "https://i.ytimg.com/vi/nEDYSJqHk5o/hqdefault.jpg", youtube: "nEDYSJqHk5o" },
      { title: "Melt — The Judge's Favorite", thumb: "https://i.ytimg.com/vi/mgErvUJHYQU/hqdefault.jpg", youtube: "mgErvUJHYQU" },
    ],
    modules: [
      { title: "Product Overview", points: [
        "The Melt is the <strong>smallest hot knife on the market</strong> — an electric, ceramic-tipped <strong>dab tool</strong> for concentrates.",
        "Designed for fast, clean, <strong>zero-mess</strong> scooping and drops.",
        "MSRP <strong>$24.95</strong>.",
      ] },
      { title: "Key Specs", points: [
        "<strong>Rapid-heat ceramic tip</strong>.",
        "<strong>USB-C pass-through charging</strong> — it can be used while charging.",
        "Sleek <strong>aluminum</strong> body.",
        "Ultra-compact: <strong>3.94 × 0.5 × 0.25 in</strong>, pocket &amp; travel-kit friendly.",
        "Pairs with rigs and the G Pen Micro+ / Hyer.",
      ] },
      { title: "How to Use", points: [
        "<strong>Power on:</strong> press the button <strong>5×</strong>.",
        "<strong>Heat:</strong> <strong>hold</strong> the button to start heating — it heats for a maximum of <strong>5 seconds</strong> per press.",
        "Use the hot ceramic tip to scoop or drop your concentrate.",
        "It can be operated <strong>while charging</strong> (always ready).",
        "The device powers off automatically after <strong>10 minutes</strong> of inactivity; the LED blinks <strong>8 times</strong> when it needs a charge.",
      ] },
      { title: "What's In the Box", points: [
        "G Pen Melt Hot Knife and a protective travel cap.",
        "<strong>A USB-C charging cable is NOT included</strong> — any USB-C charger works.",
      ] },
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
    minutes: 7, passPct: 80, msrp: "$24.95", accent: "#D75D43",
    cover: "https://cdn.shopify.com/s/files/1/0185/1576/files/Hydout_vape_01.png?v=1762467078",
    productUrl: "https://www.gpen.com/products/g-pen-hydout",
    description: "A compact, discreet 510 cartridge battery with a hidden magnetic mouthpiece cover, adjustable voltage, and LED display for smooth, customizable low-key sessions.",
    highlights: ["Hidden magnetic mouthpiece cover", "5 heat settings (2.4V – 3.8V)", "1.8V preheat mode", "400mAh rechargeable battery", "Bright LED display", "USB-C charging", "Fits 510 carts up to 2g"],
    sell: [
      "The discretion angle sells itself: the magnetic cover hides the cartridge and protects the oil from light.",
      "Great for cart customers who want more control — 5 voltage settings + preheat for thicker oils.",
      "Fits carts up to 2g, so it works with almost anything on your shelf.",
      "Affordable everyday battery at $24.95 — easy attachment sale with any cartridge.",
    ],
    videos: [
      { title: "How to Use: G Pen Hydout", thumb: "https://i.ytimg.com/vi/WK3EXouKwGs/hqdefault.jpg", youtube: "WK3EXouKwGs" },
      { title: "How to Clean: G Pen Hydout", thumb: "https://i.ytimg.com/vi/e9oEXqNajh4/hqdefault.jpg", youtube: "e9oEXqNajh4" },
    ],
    modules: [
      { title: "Product Overview", points: [
        "The Hydout is a compact, <strong>discreet 510 cartridge battery</strong> with a <strong>hidden magnetic mouthpiece cover</strong>.",
        "Adjustable voltage plus an LED display for smooth, customizable, low-key sessions.",
        "MSRP <strong>$24.95</strong>.",
      ] },
      { title: "Key Specs", points: [
        "<strong>5 heat settings</strong> from <strong>2.4V to 3.8V</strong>.",
        "<strong>1.8V</strong> 10-second preheat mode.",
        "<strong>400mAh</strong> rechargeable battery, <strong>USB-C</strong> charging.",
        "Bright <strong>LED display</strong>.",
        "Fits <strong>510 cartridges up to 2g</strong>.",
        "Dimensions: <strong>90 × 37.5 × 18.5 mm</strong>.",
      ] },
      { title: "How to Use", points: [
        "<strong>Load:</strong> remove the mouthpiece, screw in a 510 cartridge, and replace the mouthpiece.",
        "<strong>Power on/off:</strong> click the button <strong>5×</strong>.",
        "<strong>Adjust voltage:</strong> click <strong>3×</strong> to cycle the heat settings.",
        "<strong>Preheat:</strong> click <strong>2×</strong> for a 10-second 1.8V preheat.",
        "<strong>Draw:</strong> <strong>hold</strong> the button to activate and draw.",
        "Auto shut-off after <strong>2 minutes</strong> of inactivity.",
      ] },
      { title: "Care & What's In the Box", points: [
        "Clean the mouthpiece and battery/cartridge connection with a cotton swab and <strong>Isopropyl Alcohol</strong>. <strong>Do not soak the battery.</strong>",
        "In the box: the Hydout 510 battery + magnetic mouthpiece cover. A 510 cartridge and USB-C cable are <strong>not included</strong>.",
      ] },
    ],
    quiz: [
      { q: "What is the G Pen Hydout?", choices: ["A dry herb vaporizer", "A 510 cartridge battery", "A hot knife", "A gravity infuser"], answer: 1, why: "The Hydout is a discreet 510 cartridge battery." },
      { q: "What is the Hydout's signature discreet feature?", choices: ["A hidden magnetic mouthpiece cover", "A folding screen", "A silent motor", "A camo wrap"], answer: 0, why: "It has a hidden magnetic mouthpiece cover for a discreet look." },
      { q: "What is the Hydout's voltage range?", choices: ["1.0V–2.0V", "2.4V–3.8V (5 settings)", "3.8V–4.8V", "A single fixed voltage"], answer: 1, why: "The Hydout offers 5 heat settings from 2.4V to 3.8V." },
      { q: "What is the Hydout's battery capacity?", choices: ["200mAh", "400mAh", "900mAh", "1,800mAh"], answer: 1, why: "It has a 400mAh rechargeable battery." },
      { q: "How do you power the Hydout on or off?", choices: ["Click the button 5×", "Hold for 3 seconds", "Click 2×", "Breathe in"], answer: 0, why: "Click the button 5× to turn the Hydout on or off." },
      { q: "How do you change the voltage?", choices: ["Click 3×", "Click 5×", "Hold the button", "Twist the mouthpiece"], answer: 0, why: "Click the button 3× to cycle through the heat settings." },
      { q: "How do you take a draw on the Hydout?", choices: ["Just inhale", "Hold the button while drawing", "Click 2×", "Press and release"], answer: 1, why: "Hold the button to activate and draw." },
      { q: "What does clicking the button 2× do?", choices: ["Turns it off", "Starts a 10-second 1.8V preheat", "Locks it", "Nothing"], answer: 1, why: "Clicking 2× starts a 10-second 1.8V preheat." },
      { q: "How long until the Hydout auto shuts off?", choices: ["2 minutes", "10 minutes", "30 seconds", "1 hour"], answer: 0, why: "The Hydout auto shuts off after 2 minutes of inactivity." },
      { q: "What is the correct way to clean the Hydout?", choices: ["Soak the whole battery in alcohol", "Cotton swab + Isopropyl Alcohol on the connection — do NOT soak the battery", "Rinse under water", "It never needs cleaning"], answer: 1, why: "Use a cotton swab with Isopropyl Alcohol on the connection points; never soak the battery." },
    ],
  },

  /* ------------------------------------------------------------- 510 ORIGINAL */
  {
    slug: "510-original",
    name: "510 Original",
    category: "510 Cartridge Battery",
    tagline: "The smallest, most affordable G Pen battery ever.",
    minutes: 6, passPct: 80, msrp: "$12.95", accent: "#FEC870",
    cover: "https://cdn.shopify.com/s/files/1/0185/1576/files/510_on_white_01.png?v=1767045174",
    productUrl: "https://www.gpen.com/products/g-pen-510-original",
    description: "The smallest and most affordable G Pen battery ever, the 510 Original reimagines Grenco's very first 2012 battery with modern breath-activated, ultra-portable performance for 510 cartridges.",
    highlights: ["Smallest G Pen battery ever", "Breath activation — just inhale and go", "Three preset voltages (3.2 / 3.6 / 3.8V)", "1.8V 10-second pre-heat mode", "400mAh battery", "USB-C pass-through charging", "Digital display"],
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
    modules: [
      { title: "Product Overview", points: [
        "The 510 Original is the <strong>smallest and most affordable G Pen battery ever</strong> — a modern remake of Grenco's very first 2012 battery.",
        "An ultra-portable <strong>510 cartridge battery</strong> with <strong>breath activation</strong>.",
        "MSRP <strong>$12.95</strong>.",
      ] },
      { title: "Key Specs", points: [
        "<strong>Breath-activated</strong> — just inhale (or hold the button).",
        "<strong>Three preset voltages: 3.2 / 3.6 / 3.8V</strong>.",
        "<strong>1.8V</strong> 10-second preheat mode.",
        "<strong>400mAh</strong> battery with <strong>USB-C pass-through</strong> charging.",
        "Digital <strong>display</strong>.",
        "Dimensions: <strong>24 × 21.1 × 56.7 mm</strong>.",
      ] },
      { title: "How to Use", points: [
        "<strong>Load:</strong> screw in a 510 cartridge.",
        "<strong>Power on/off:</strong> click the button <strong>5×</strong>.",
        "<strong>Adjust voltage:</strong> click <strong>3×</strong> to cycle 3.2 / 3.6 / 3.8V.",
        "<strong>Preheat:</strong> click <strong>2×</strong> for a 10-second 1.8V preheat.",
        "<strong>Draw:</strong> simply <strong>breathe in</strong> (breath-activated) — or hold the button.",
        "Auto shut-off after <strong>10 minutes</strong> of inactivity.",
      ] },
      { title: "Care & What's In the Box", points: [
        "Clean the battery/cartridge connection with a cotton swab and <strong>Isopropyl Alcohol</strong>. <strong>Do not soak the battery.</strong>",
        "In the box: the 510 Original battery. A USB-C charger and 510 cartridge are <strong>not included</strong>.",
      ] },
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
