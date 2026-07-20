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

   ESCAPING CONVENTION — read before "fixing" anything here.
   A few fields deliberately carry AUTHORED HTML and are interpolated raw:
     specs[].value   (e.g. "dry herb <strong>only</strong>")
     description[]   (paragraph markup)
     the floor-drill cue/label glyphs, rarity symbols, and fact emoji
   EVERYTHING ELSE is passed through esc() at render time — course names, captions,
   FAQ text, quiz stems/choices/why, about stats. If you wrap a raw field in esc()
   the markup prints literally across every spec sheet; if you leave a plain-text
   field raw, an ampersand breaks the page. When adding a field, default to
   plain text and esc() it.
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
      whichClose: "For your flower, want the pocket Dash II or the titanium Dash+?",
      scenarios: [
        { sees: "A half-ounce of flower + a grinder in their basket", say: "You're already grinding it — the Dash II's the next piece. Pack that ground flower, hit the button, you're vaping instead of burning. That half-oz lasts way longer when you're not torching it. Fifty bucks." },
        { sees: "They bring up how a joint feels compared to vaping", say: "The honest difference is burning versus heating — a joint combusts the flower, the Dash II vaporizes it. I can't give you health advice, but flavor is why most people switch: you actually taste the strain instead of smoke. Fifty bucks — want to hold it?" },
      ],
      trap: "Don't call it 'like smoking' — it's the opposite. Say 'heats, doesn't burn.' And if a customer raises coughing, harshness, lungs, or anything else health-related, do NOT diagnose it or promise the product fixes it — that's a claim the brand can't make and it lands on Grenco, not you. Redirect to flavor and experience, or tell them to ask their doctor.",
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
      { q: "A customer sets down a half-ounce of flower and a grinder. They have never owned a vaporizer and mention they would rather not spend much. What do you put on the counter next to it?", choices: ["The Melt Hot Knife, so they can prep it without the mess", "The 510 Original, the cheapest battery on the wall", "The Dash II, the entry pocket dry-herb vape", "The Dash+, since the titanium oven is the better vape"], answer: 2, why: "Work the basket in two steps: the category decides the device — flower means a dry-herb vape, not a 510 battery or a concentrate tool — then the customer decides the model. A first-timer watching their spend takes the entry unit, not the upgrade." },
      { q: "\"I'll just roll it,\" the customer says, waving off the vape. What is the strongest next line?", choices: ["\"Rolling burns off the flavor and half goes up in smoke — this heats the same gram, so it goes further.\"", "\"Joints are honestly a bad habit — most people who switch over never go back to rolling papers again.\"", "\"Sure, but the vape is a lot more discreet — nobody standing around you knows what you're using.\"", "\"Rolling's fine if you're into it, though the vape is really just the more modern way to do it now.\""], answer: 0, why: "Arguing against a habit the customer already enjoys puts them on the defensive. Reframe instead, and anchor on waste and flavor — things they can judge for themselves, and the only ground the brand can stand on." },
      { q: "The customer is warming to it but hesitates: \"Is fifty bucks really worth it?\" Besides holding the price, what should you do before they leave?", choices: ["Offer to knock a few bucks off if they buy today", "Attach a USB-C cable so they can charge it", "Show them the $99.95 Dash+ so fifty feels cheap", "Tell them the warranty covers them for a full year"], answer: 1, why: "Holding a price only wins the sale if the customer can actually use the thing that night — the Dash II box has no charging cable, so the sale is not finished until you close that gap. Discounting teaches them to wait for a deal, and the warranty is only a full year if they register." },
      { q: "Mid-pitch, a customer says smoking makes them cough and asks whether this device would help with that. Your move?", choices: ["Tell them heating instead of burning is gentler on the throat", "Say it depends on temperature and suggest they run it low", "Decline the health question and steer back to flavor and taste", "Explain that vapor leaves behind the harsher parts of smoke"], answer: 2, why: "Any comfort, health, or symptom claim becomes the brand's liability, not just yours. The safe and still-persuasive ground is flavor and experience — or telling them to ask a doctor." },
      { q: "An existing owner asks whether trading up to the Dash+ gets them a bigger oven. What is accurate?", choices: ["It is roughly double, so a session lasts about twice as long", "It is smaller, near 0.3g — you are paying for heat quality", "It is bigger, since titanium walls are thinner than ceramic", "It is the same size; only the screen and the body change"], answer: 1, why: "Capacity is the one thing the Dash+ does not upgrade — a titanium hybrid-convection oven at roughly 0.3g against this device's 0.4g. Sell the upgrade on heat and flavour, because a capacity promise gets found out the first time they pack it." },
      { q: "A customer returns a few weeks after buying: \"It barely produces anything anymore.\" What is the first thing to check?", choices: ["Whether the battery has stopped holding a charge", "Whether spent material has built up in the chamber", "Whether they are running the temperature too low", "Whether they are packing the chamber too tightly"], answer: 1, why: "Check maintenance before hardware — residue in the ceramic chamber restricts airflow long before a battery or heater actually fails. Packing density matters too, which is why the Dash II is meant to be packed lightly rather than crammed." },
      { q: "Someone at the counter is buying a gram of wax and a 510 cartridge. They ask if this device handles both. What do you tell them?", choices: ["The cart threads right on, but the wax has to go elsewhere", "Dry herb only, so neither of those two goes in it", "Both are fine as long as you load them with the pick tool", "The wax goes in the chamber, but the cart needs a battery"], answer: 1, why: "Selling a device into the wrong material is the fastest way to turn a sale into a return. Name the limit first, then route them — wax to the Melt, the cart to a 510 battery — and you keep the customer instead of the refund." },
      { q: "A customer tries your floor demo, says the first pull tasted like nothing, and mentions they packed it in as firmly as they could and the draw felt tight. What do you correct?", choices: ["They packed the chamber too tightly for air to pull through", "They should have set a higher temperature before starting", "They were holding the button down through the whole draw", "They only filled the ceramic chamber about halfway"], answer: 0, why: "A dry-herb oven needs air moving across the load — cram it and heat never reaches the herb. Under-filling is wrong too (the spec is a full chamber, packed light), but that thins the vapour rather than killing the draw." },
      { q: "\"I've never used a dry-herb vape before\" — a hesitant first-timer. What framing closes them?", choices: ["Walk them through the settings menu so nothing is a surprise", "Frame it as the hard-to-mess-up one and keep it to a few steps", "Compare the temperature range against the higher-end model", "Steer them to the pricier one since it is more forgiving"], answer: 1, why: "Inexperience objections are fear of complexity, not a gap in information — so shrink the process (grind, pack, hold three seconds) instead of adding to it. Anything that piles on detail or price, like a settings tour or a step up in model, makes a nervous buyer more nervous." },
      { q: "A flower customer is clearly deciding between two dry-herb units. How should you present the choice?", choices: ["Lead with the Dash+ — it is the better vaporizer of the two", "Ask whether they want the pocket Dash II or the titanium Dash+", "Start at $49.95 and only mention the other if they object", "Ask their budget first, then show only the tier that fits it"], answer: 1, why: "A which-close beats a yes-or-no close because either answer is a sale. Framing the two units as a preference rather than a budget question also keeps the customer from feeling sold up or priced out." },
      { q: "\"Do I just drop a nug in?\" the customer asks, holding the open chamber. What do you say?", choices: ["Grind it first, then fill the chamber and pack it lightly", "A whole bud is fine as long as it fits the chamber", "Break it up by hand, since grinding makes it pack too tight", "Grind it and press it in firmly so it makes full contact"], answer: 0, why: "The load spec is two things at once: ground herb, filling the chamber, packed light with the pick tool. Both wrong instincts miss one half of it, and it is the natural moment to attach a grinder to the sale." },
    ],
  },

  /* ------------------------------------------------------------------- DASH+ */
  {
    slug: "dash-plus",
    name: "Dash+",
    category: "Dry Herb Vaporizer",
    tagline: "Hybrid convection + conduction in a full titanium chamber.",
    differentiator: "Titanium chamber, hybrid convection, 20s heat-up. The upgrade sell.",
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
      scenarios: [
        { sees: "A regular who buys top-shelf flower every week", say: "You're paying top-shelf prices — the Dash+ is what actually tastes it. Titanium oven, true convection, so the terpenes hit instead of going up in smoke. If you're buying the good flower, this is how you get your money's worth." },
        { sees: "Buying a nice strain as a gift, or trading up from a Dash II", say: "If it's a gift or you want the 'wow' one, this is it. Color screen, buzzes when it's ready, full titanium oven. It feels premium because it is." },
      ],
      trap: "Don't sell it on specs. Sell the flavor jump — 'you taste the strain.' Nobody buys titanium, they buy taste.",
      objections: [
        { says: "Why is this double the Dash II?", say: "Titanium chamber and true convection — that's what you're paying for. It's the difference between 'it works' and 'wow, I taste the strain.' If flavor's your thing, worth the jump.", why: "Justify the price with the flavor mechanism, not a spec sheet." },
        { says: "Looks complicated.", say: "Three buttons, and it buzzes when it's ready. Load, double-click, draw. The color screen means you're never guessing your temp." },
        { says: "I already have a pocket vape.", say: "Then you get it — this is the upgrade. Full titanium chamber, real convection, heats in about 20 seconds. Cleaner flavor, and you feel it on the first hit.", why: "Position as the step-up, not a replacement. Sell heat quality, not capacity — the Dash+ chamber is actually smaller." },
      ],
    },
    videos: [
      { title: "How to Use: G Pen Dash+", thumb: "https://i.ytimg.com/vi/OzgMUHgEQao/hqdefault.jpg", youtube: "OzgMUHgEQao" },
      { title: "How to Clean: G Pen Dash+", thumb: "https://i.ytimg.com/vi/vSAc8WPkUpY/hqdefault.jpg", youtube: "vSAc8WPkUpY" },
    ],
    quiz: [
      { q: "A basket has an eighth of flower and a gram of live rosin in it. What is the correct two-piece attach?", choices: ["A Dash+ for the flower and a Melt for the rosin", "A Hydout for the flower and a Melt for the rosin", "One Dash+, which covers both the flower and the rosin", "One Melt, which covers both the rosin and the flower"], answer: 0, why: "Match the device to the material, not to the customer. The Dash+ is dry herb only and the Melt is a loading tool for concentrate, so two materials on the counter is always two attaches." },
      { q: "\"Why is this double the price of the Dash II?\" What answers that best at the counter?", choices: ["It has a bigger oven, so you fit more flower in each session", "It is the newer model, and the older one is being phased out", "Titanium chamber and hybrid convection, so you actually taste the strain", "It also takes concentrates, so one device covers your flower and your wax"], answer: 2, why: "Price objections close on the mechanism behind the experience, not a feature list — name the oven and the heat, then let flavor justify the jump. Two things never to claim: the Dash+ chamber is smaller than the Dash II's, and it is dry herb only." },
      { q: "A rep tells a Dash II owner to trade up because \"the Dash+ oven is bigger.\" What is wrong with that pitch?", choices: ["Nothing is wrong, the Dash+ does hold more herb per session", "The Dash+ chamber is smaller, the upgrade is heat quality", "The chamber claim is fine, but the real upgrade is the battery", "Both ovens hold the same, so lead with the color screen"], answer: 1, why: "The Dash+ chamber is about 0.3g against the Dash II 0.4g. Promising more capacity sets up a disappointed customer and a return, so position it as the step up in heat, not size." },
      { q: "A customer comes back saying their new Dash+ barely produces anything. What do you walk them through first?", choices: ["Turn the temperature up, let it finish heating, then draw slowly and steadily", "Pack the chamber as tight as it will go and take short quick puffs", "Run it at the lowest temperature so one load stretches the whole session", "Top the battery off first, since a low charge weakens the heater"], answer: 0, why: "Weak vapor is usually technique, not a defect. Convection only works once the oven is fully up to temp and air is actually moving through it, so correct heat and draw before you look at anything else." },
      { q: "A daily user says their Dash+ has \"stopped hitting\" after a few months. What do you have them do first?", choices: ["Let it cool, then swab the chamber and mouthpiece with isopropyl alcohol", "Rinse the chamber and mouthpiece under warm water, then dry it overnight", "Swab the chamber with isopropyl while it is still hot from a session", "Send it in under warranty, since battery output fades as cells age"], answer: 0, why: "Weak vapor on a well-used dry herb vape is almost always resin in the chamber and air path, not a failed part. Alcohol goes on a cool device, and it has to air dry fully before it goes back together." },
      { q: "A shopper says smoking makes her cough and asks whether the Dash+ will be easier on her lungs. What do you say?", choices: ["Tell her it is gentler on the lungs because it heats instead of burning", "Say you cannot speak to health effects, then talk about flavor instead", "Explain that vaporizing leaves the harmful part of the smoke behind", "Confirm it is the healthier option and suggest she ask a doctor too"], answer: 1, why: "Health claims are not ours to make, and hedging one still counts as making it. Decline the medical question outright and move the conversation to flavor and experience." },
      { q: "Holding a gram of shatter, a customer asks if the Dash+ can handle it. What is the move?", choices: ["Yes, on the lowest setting so it does not scorch", "Yes, once the silicone insert is seated in the chamber", "No, it is dry herb only, so pair it with the Melt", "No, but the Hydout handles concentrate through a 510 cart"], answer: 2, why: "The Dash+ chamber takes ground flower only, so the answer is no at any temperature setting. Build the habit of matching material to device — flower to a Dash, concentrate to the Melt — so a no on one product becomes a yes on another." },
      { q: "You are ringing up a Dash+ and a Dash II on the same order. Which add-on question actually matters?", choices: ["Neither one needs a cable, both boxes ship with USB-C included", "The Dash II needs a USB-C cable, the Dash+ already includes one", "The Dash+ needs a USB-C cable, the Dash II already includes one", "Both need a cable, because neither box includes one at all"], answer: 1, why: "The Dash+ box includes a USB-C cable; the Dash II box does not. Check in-box contents before the customer leaves, because a device they cannot charge at home comes back as a complaint, not a repeat visit." },
      { q: "A customer is weighing the Dash II against the Dash+ and asks how long each one is covered for. What do you tell them?", choices: ["Dash+ is two years, three with registration; Dash II is six months, a year with registration", "Both are six months out of the box, and both extend to a full year once the customer registers", "Both carry two years of coverage, but only the Dash+ can be extended by registering it", "Dash+ is one year, two with registration; the Dash II has no way to extend its coverage"], answer: 0, why: "Coverage scales with the tier and is part of what the price jump actually buys, so quote it per product rather than as one blanket number for the line. Always name the registration step too, since the extension only exists if the customer does it." },
      { q: "A customer asks whether one charge on the Dash+ will get him through a long day out. What do you tell him?", choices: ["About forty minutes of heating per charge, and it refills fast over USB-C", "About three hours of heating per charge, so a full day out is covered", "About ten minutes of heating per charge, so he should carry a power bank", "Effectively unlimited if he keeps it plugged in, since it charges while in use"], answer: 0, why: "Answer battery questions in heating time, not vague all-day language — heating minutes are what the customer actually burns through. Pair the real number with the fast USB-C recharge so the expectation you set is one the device can keep." },
      { q: "Which opener follows the Dash+ playbook with a browser who has not touched one yet?", choices: ["It runs an 1,800mAh cell with hybrid convection and a titanium oven", "If you care how your flower tastes, this is it, ready in twenty seconds", "This is our premium model, so it is the best one we have on the wall", "The zinc-alloy body and full-color screen are what set this one apart"], answer: 1, why: "Nobody buys titanium, they buy taste. Lead with the outcome the customer can imagine, and keep the specs in reserve to back it up if they ask." },
    ],
  },

  /* -------------------------------------------------------- MELT HOT KNIFE */
  {
    slug: "melt-hot-knife",
    name: "Melt Hot Knife",
    category: "Concentrate Tool",
    tagline: "The smallest hot knife on the market — zero-mess dabs.",
    differentiator: "Electric hot knife. Scoop and drop, no sticky mess.",
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
      { q: "What is it compatible with?", a: "The Micro+, Connect, Hyer, traditional bangers, e-rigs and e-nails — it works with any concentrate you'd normally load by hand." },
      { q: "Does it have adjustable heat settings?", a: "No — it uses a precisely tuned heating element optimized for smooth, controlled melting without burning." },
      { q: "Can I use it while charging?", a: "Yes — USB-C pass-through lets you use it while it's plugged in. A USB-C cable is not included." },
      { q: "Is it travel-friendly?", a: "Yes — it's tiny, it only powers on after 5 button presses so it won't fire in a bag, and it comes with a protective travel cap." },
      { q: "What's the warranty?", a: "A 90-day limited warranty covering the electronics (physical damage not covered)." },
    ],
    howToSell: {
      upsellFrom: "Dabs / concentrate",
      cue: "🍯",
      pairsWith: [],
      vital: "You can't handle a dab with your fingers — it needs heat and a tool. The Melt is the clean way to LOAD the concentrate they're buying: the tip heats, so it releases instead of stringing.",
      aov: "Cheap, universal impulse add. Everyone buying concentrate is fighting a cold, sticky tool — a $24.95 Melt rides along with every gram of wax or rosin.",
      keyFacts: ["Heated ceramic tip — the dab releases instead of stringing", "Rapid-heat · pocket-size", "Loads any rig or banger ($24.95)"],
      talkTrack: { say: "Grabbing concentrate? The Melt's how you handle it — heated ceramic tip, scoop and drop, no sticky mess. Tiny, twenty-five bucks, works with any rig or banger." },
      whichClose: "Loading a rig or a banger? Either way the Melt's how the dab gets in clean — want one with that wax?",
      scenarios: [
        { sees: "A gram of rosin or live resin on the counter", say: "That rosin's too good to waste on a cold scoop. The Melt heats the tip so it drops clean into your rig — no stringy pull, no reclaim stuck to the tool. Twenty-five bucks and every dab lands where it should." },
        { sees: "Concentrate + a banger or rig in the same sale", say: "You've got the rig — the Melt's how you load it clean. Heats in seconds, scoops, drops. Toss it in the bag and you're set. Twenty-five bucks." },
      ],
      trap: "Be precise about what it replaces: the Melt replaces the sticky dab tool, NOT the torch or e-nail that heats a quartz banger. Sell it on clean loading. Promising 'you won't need a torch at all' is the fastest way to get it returned.",
      objections: [
        { says: "I've got a dab tool already.", say: "A cold tool is where the mess and the string-cheese pull come from. The Melt heats the tip, so the concentrate releases clean every time — no reclaim disaster.", why: "Reframe: a cold tool is the problem, not the solution." },
        { says: "Do I need a torch?", say: "Not for the Melt itself — it's electric, USB-C, heats in seconds. If you're dabbing off a quartz banger you'll still heat that however you normally do; the Melt is what gets the concentrate out of the jar and into it without the mess.", why: "Be straight here. Overselling this as 'no torch at all' is the #1 reason it comes back." },
        { says: "Twenty-five for a tool?", say: "Smallest hot knife made, and it replaces your dab tool and the mess that comes with it. If you dab, it pays for itself the first sticky disaster it saves. Grab a USB-C cable and you're set.", why: "The USB-C cable isn't in the box — attach it." },
      ],
    },
    videos: [
      { title: "A Closer Look at the Melt", thumb: "https://i.ytimg.com/vi/nEDYSJqHk5o/hqdefault.jpg", youtube: "nEDYSJqHk5o" },
      { title: "Melt — The Judge's Favorite", thumb: "https://i.ytimg.com/vi/mgErvUJHYQU/hqdefault.jpg", youtube: "mgErvUJHYQU" },
    ],
    quiz: [
      { q: "A customer says \"I've already got a dab tool.\" What is the strongest response?", choices: ["This one is smaller and easier to carry in a pocket every day", "The cold tool is the problem; heat lets the dab release clean", "Yours will wear out eventually, so a backup is worth having around", "This one is electric instead of manual, so it is the premium pick"], answer: 1, why: "Comparing features against a tool they already own turns into a price argument you lose. Name the problem they live with instead — a cold tool is what causes the stringing and the reclaim left behind." },
      { q: "\"Twenty-five bucks for a dab tool?\" You justify the value, then attach one more item. Which one does this customer actually need?", choices: ["A USB-C charging cable", "A second protective travel cap", "Isopropyl swabs for the ceramic tip", "Nothing — close it at sticker price"], answer: 0, why: "Before any accessory leaves the counter, check what the box does not include. The Melt ships with the device and its cap only, so without a cable the customer gets home to something they cannot power up." },
      { q: "A regular brings his Melt back with visible buildup around the ceramic tip. He has never cleaned it and asks how to deal with it. What do you walk him through?", choices: ["Soaking the whole device in isopropyl alcohol overnight", "Rinsing the tip under warm running water after each use", "Wiping the tip with an isopropyl-soaked swab while it is still warm", "Scraping the buildup off the tip with a metal pick"], answer: 2, why: "The Melt is a sealed electronic tool, not a piece of glass, so heat does the work: residue lifts off with alcohol while the tip is still warm. Liquid getting inside or metal against the ceramic is physical damage, which the 90-day electronics-only warranty does not cover." },
      { q: "Mid-demo the Melt stops putting out heat while the customer is still scooping, and he says it seems defective. What do you tell him?", choices: ["The battery is low and it needs a full charge before it will hold heat", "That is normal — it heats up to five seconds per press, so press and hold again", "He powered it on wrong — the button has to be pressed five times to arm it", "The ten-minute auto shutoff kicked in and the device has to be restarted"], answer: 1, why: "The Melt has one button and no variable heat, so the short capped cycle is deliberate — you re-press for each scoop rather than holding a constant temperature. Explaining intended behaviour calmly is what stops a return before it starts." },
      { q: "\"Can I turn the temperature down for my terp sauce?\" What is accurate?", choices: ["Yes, one button cycles through three heat levels", "Yes, but only while it is plugged in over USB-C", "No, it runs one tuned heat setting with no adjustment", "No, but a longer press pushes the tip hotter"], answer: 2, why: "Fixed heat is a positioning point, not a shortfall: the element is tuned for controlled melting. Inventing settings a device does not have guarantees a disappointed customer at home." },
      { q: "A customer at the counter presses the Melt and the LED blinks eight times. What do you tell them?", choices: ["Let it charge first, the tip will not reach temperature on a low battery", "That blink pattern means a fault, so swap it for another unit", "It is a low-battery signal, and pass-through means it works while plugged in", "Nothing is wrong, the blink is just the ten-minute shutoff warning"], answer: 2, why: "An eight-blink LED is a status signal, not a malfunction, and the Melt draws through the USB-C port rather than only from the cell. Charge level never has to gate a demo or a sale on a pass-through device." },
      { q: "A customer asks what the Melt's warranty actually covers before they buy. Accurate answer?", choices: ["Ninety-day limited coverage on the electronics; physical damage is excluded", "Ninety-day limited coverage on the electronics and on accidental damage", "One-year limited coverage on the electronics; physical damage is excluded", "No coverage at all; concentrate tools go out as final sale"], answer: 0, why: "Whatever you say at the counter is the promise the store has to honor later. Naming the exclusion up front is what keeps a limited electronics warranty from being heard as a free replacement policy." },
      { q: "A customer with an e-rig at home is holding a gram of rosin and says they are not sure the Melt is relevant to their setup. What do you tell them?", choices: ["It is built for traditional glass rigs and quartz bangers only", "It works with anything you would otherwise load by hand, e-rigs included", "It pairs specifically with G Pen devices like the Micro+ and Hyer", "They are already covered on concentrate, so steer them to a Dash+ instead"], answer: 1, why: "The Melt is defined by the job it does, getting concentrate out of the jar and into something, not by the device on the other end. Sell the job and it attaches to every concentrate sale in the store." },
      { q: "A customer buying wax mentions that torch smoke bothers him and asks whether this is easier on his lungs. What do you do?", choices: ["Confirm it is gentler, since the tip runs far cooler than a torch", "Say it is not a health product and steer back to clean, mess-free loading", "Explain that the ceramic tip avoids the byproducts a butane flame creates", "Suggest it as a lower-risk option for anyone sensitive to smoke"], answer: 1, why: "A true spec does not license a health conclusion — the tip really is cooler than a flame, but turning that into gentler or lower risk is a claim no rep can make for the brand. Decline the health question and sell what the tool actually does: get the concentrate out of the jar and into the rig without the sticky mess." },
      { q: "An eighth of flower and a lighter are on the counter, and the customer asks what would make this better. Which G Pen do you attach?", choices: ["The Melt Hot Knife", "The Dash II", "The 510 Original", "The Hydout"], answer: 1, why: "Attach to the material in the bag, not to whatever is cheapest to add on. The Melt is a concentrate loading tool and does nothing for loose flower — flower buyers pair with a dry-herb vape." },
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
      scenarios: [
        { sees: "Buying a cart, mentions they vape at work or in public", say: "If you're hitting it out and about, the Hydout's your one — the mouthpiece hides inside, so it just looks like nothing in your pocket. Five heat settings too. Twenty-five bucks and nobody's the wiser." },
        { sees: "A thick distillate cart", say: "Thicker oil needs a little heat to flow — the Hydout's got five voltages and a preheat, so it pulls instead of clogging. That cart'll hit way better on this than a basic battery." },
      ],
      trap: "Don't lead with price vs. the 510 — lead with discretion and voltage. Price-first loses the upgrade.",
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
      { q: "A customer buying a 2g distillate cart mentions they mostly vape on their lunch break behind the shop where they work. Which battery do you put in their hand?", choices: ["The Hydout, since the mouthpiece hides inside for pocket carry", "The 510 Original, since it is the cheapest way to run the cart", "The 510 Original, since a 2g cart is too big for the Hydout", "Either one, since the two batteries only differ on price"], answer: 0, why: "Both batteries fit most 510 carts up to 2g, so price is not what decides it — the customer's context is. When someone volunteers where they vape, discretion is the feature that closes the sale." },
      { q: "A customer with a cart in hand is looking at both batteries on the shelf. \"Why would I pay double for that when the cheap one is right there?\" What do you lead with?", choices: ["Discretion, plus five voltage settings instead of three", "It is a stronger battery so the cart lasts longer", "It is only twelve dollars more, basically the same price", "The cheap one tends to burn carts out over time"], answer: 0, why: "Answer a price objection with what the extra money buys, never with the money itself — discounting the gap teaches them the product is not worth it. Both batteries are 400mAh, so runtime claims or knocking the cheaper one are things you cannot back up." },
      { q: "A regular complains that their thick distillate cart takes forever to pull and sometimes gives nothing. What do you show them on the device?", choices: ["Double-click for the ten-second warm-up", "Drop the voltage to the lowest setting", "Hold the button longer on every draw", "Screw the cartridge down noticeably tighter"], answer: 0, why: "A sluggish thick cart is cold oil that will not flow, not a weak battery. The Hydout has a dedicated low-voltage warm cycle for exactly that moment; the other moves change how hard the rep pulls or how tight the cart sits, neither of which is the actual variable." },
      { q: "A customer asks whether the Hydout filters the vapor through water the way a bong does. What do you tell them?", choices: ["No water at all, it is a 510 cart battery and the name means staying low-key", "Yes, a small water reservoir sits under the magnetic mouthpiece cover", "Only in preheat mode, which routes the vapor through a water path first", "Yes, that is the point of the concealed mouthpiece chamber"], answer: 0, why: "The Hydout is a straight 510 cartridge battery, its upgrades are concealment, five voltages and preheat. Confirming a feature the spec sheet does not list is how a sale becomes a return, so correct the assumption and sell what the device actually does." },
      { q: "A customer returns a month later saying their battery just stopped hitting. It is charged, powered on, and the fresh cart is screwed all the way down. What do you do?", choices: ["Power it off and swab the threads and contacts with alcohol", "Soak the threaded end in alcohol to break up the buildup", "Give the connection a quick rinse and let it dry overnight", "Process it as a warranty claim and hand them a new one"], answer: 0, why: "Once charge and connection are ruled out, oil residue on the contact point is the usual culprit and it mimics a dead cell exactly. Clean it dry with a swab, because the battery is a sealed electronic, not a washable part." },
      { q: "A customer holds up an oversized ceramic-tip cart from another brand and asks if it will work on this. What do you tell them?", choices: ["It fits most standard 510 carts up to 2g", "It only threads on carts up to 1g reliably", "Ceramic tips sit too high, so metal tips only", "It only fits carts sold under the G Pen name"], answer: 0, why: "The only limits that matter on a 510 battery are the thread standard and the size ceiling — not the brand on the box or whether the tip is ceramic or metal. Nearly every cart on a shelf falls inside that, so the honest answer is usually yes." },
      { q: "You are bagging up a Hydout. What does the customer still need that the box does not include?", choices: ["Both a 510 cartridge and a USB-C cable", "Just a 510 cartridge, the cable is included", "Just a USB-C cable, a starter cart is included", "Nothing else, the box has cart and cable"], answer: 0, why: "The box is the battery and its magnetic cover, nothing more. Confirming what is missing before a customer leaves is what keeps the first session from failing, and it is a natural second attach." },
      { q: "\"I have got an old battery in a drawer somewhere, I will just use that.\" Best response?", choices: ["That may work — the Hydout just adds five voltages and hides the cart", "Old batteries always leak and will ruin that cartridge pretty fast", "A used battery voids the warranty on any cart you buy in here", "Fair enough, come back and see us if it does not work out"], answer: 0, why: "Never argue with a claim you cannot disprove, and never invent one to win — a scare line a customer later finds out was false costs you every future sale. Concede the point, then reframe on what the upgrade actually adds." },
      { q: "Mid-sale a customer asks if switching to this from smoking will be easier on their chest. What do you say?", choices: ["I cannot speak to health, but I can show you the voltage settings", "It is definitely gentler, that is why most people switch over", "There is no combustion, so nothing harsh reaches your lungs", "Stick to the lower voltages and you will be totally fine"], answer: 0, why: "Health questions are outside a rep's lane no matter what the customer is buying, and the Hydout data supports discretion and voltage control only. Decline the health frame and move back to how the device performs." },
      { q: "A customer is deciding between the two 510 batteries and asks what they actually get for the extra money in heat control.", choices: ["Five voltage steps instead of three, plus the same preheat", "Ten voltage steps instead of three, plus a hotter preheat", "A temperature dial in degrees rather than fixed steps", "Double the wattage at every one of the settings"], answer: 0, why: "The real difference is finer steps and a lower floor, not a different class of control. Both share the preheat, so overstating the gap sets up a disappointed customer." },
      { q: "A shopper picks up the Hydout, looks at the price tag, and says nothing. What is the strongest opening line?", choices: ["The whole mouthpiece tucks inside, so it just disappears in a pocket", "It is only twenty-five, barely more than the basic battery over here", "This is our best-selling cart battery on the wall right now", "It has a bright display so you can always see your battery level"], answer: 0, why: "Whoever names price first sets what the conversation is about. Open on the thing the cheap battery cannot do and price lands as fair; open on price and you have invited them to just take the cheaper one." },
      { q: "A customer texts that their new battery \"keeps turning itself off\" between hits. What is going on?", choices: ["It shuts itself off after two minutes of sitting idle", "Holding the button too long trips a safety cutoff mid-draw", "The battery is defective and should be swapped out today", "It overheats on higher voltages and cuts out until it cools"], answer: 0, why: "Before treating a device as defective, rule out normal designed behavior — an idle timeout is a standard battery safety feature, and knowing it turns a would-be return into a ten-second answer." },
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
      scenarios: [
        { sees: "A first-timer buying their very first cart", say: "First cart? Then you need something to hit it with — this is the easy one. Screw the cart on, breathe in, done. No buttons to learn. Thirteen bucks, fits whatever cart you grab next." },
        { sees: "Buying two or three carts at once", say: "Grabbing a few carts — you set for a battery? The 510's thirteen bucks and swaps between all of them. Cheap to keep one that fires clean instead of killing a good cart." },
      ],
      trap: "Don't ask 'do you need a battery?' — that invites a no. Ask 'you got a battery for that?' Assume it.",
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
      { q: "A customer sets a single 510 cart on the counter and it is clearly their first one. What is the strongest opening?", choices: ["You got a battery for that cart?", "Do you need a battery to go with that?", "Let me know if you need anything else.", "Want to see our dry herb vapes too?"], answer: 0, why: "Assume the need instead of asking permission. A yes or no question invites a no, so presume the battery and keep the sale moving." },
      { q: "A customer buying a cart waves you off: \"I've got an old battery at home.\" What's the right reply?", choices: ["Fair enough — hang onto it and come back if it quits on you.", "Honestly, old batteries aren't safe. You should replace it today.", "If it still hits, great — but a random one can burn that cart.", "Ours is stronger and will hit that cart a lot harder than yours."], answer: 2, why: "The lever is the cart they already paid for, not the battery. Framing a cheap battery as insurance on an expensive purchase beats arguing about whose battery is more powerful." },
      { q: "A customer buying a cart shrugs and asks if they really need a battery. What is the strongest reply?", choices: ["Honestly it is up to you, but most people grab one.", "Only if you do not have one that still works at home?", "You need something to hit it with, this one or the Hydout?", "Yes, a cart will not fire at all without a battery."], answer: 2, why: "A yes or no question invites a no. Reframing it as a choice between two batteries moves the customer from deciding whether to buy to deciding which one to buy." },
      { q: "A customer picks up an eighth of flower and has no device on them yet. What do you put in their hand?", choices: ["The Melt Hot Knife", "The Dash II or Dash+", "The 510 Original battery", "The Hydout battery"], answer: 1, why: "A 510 battery only powers a threaded oil cartridge, and the Melt only handles concentrate — neither one heats flower at all. Always match the device to the material the customer is actually buying." },
      { q: "A regular is buying a 510 Original for their carts and mentions they also picked up a gram of wax. What do you add and how do you frame it?", choices: ["Add the Melt, and say its heated tip drops the wax in clean instead of stringing", "Add the Melt, and say it means they can finally leave the torch at home for good", "Skip it, and say the 510 Original will handle the wax fine on its 3.8V setting", "Skip it, and say the 10-second preheat is the setting made for thicker wax"], answer: 0, why: "A 510 battery only fires 510-thread cartridges, so concentrate always needs its own heated loading tool. The Melt gets wax out of the jar cleanly at around 150C, but the customer still heats their banger however they normally do." },
      { q: "A customer comparing the 510 Original and the Hydout guesses the Hydout runs vapor through water. What do you tell them?", choices: ["Yes, it has a small internal water chamber.", "No, it is a 510 battery with a concealed mouthpiece.", "Yes, the magnetic cover holds a small reservoir.", "No, but preheat mode adds moisture to the draw."], answer: 1, why: "When a customer hands you a feature the device does not have, correct it and pivot to what it does have — here, concealment, five voltages and preheat for thick oil. Confirming an invented feature is how a return gets started." },
      { q: "A shopper says they are moving to carts because they think it is easier on their chest. Best move?", choices: ["Agree that vapor is gentler than smoking.", "Confirm it and steer them to the lowest voltage.", "Say it depends on which oil they end up buying.", "Skip the health question and talk flavor and control."], answer: 3, why: "Reps never make or confirm health claims about any device. Redirect to what you can honestly sell, which is flavor, control, and convenience." },
      { q: "A regular comes back a week later saying the battery just stopped hitting. Where do you start?", choices: ["Check the 510 connection point for oil buildup.", "Call it defective and start a warranty exchange.", "Tell him the voltage is too low and to run 3.8V.", "Tell him the cartridge is empty and sell a new one."], answer: 0, why: "A battery that quits is usually a contact problem, not a dead device — oil creeps onto the 510 connection and breaks the circuit. Rule that out first with a lightly dampened isopropyl swab, and never soak the battery." },
      { q: "Mid winter, a customer says the oil barely moves on their first pull. What do you show them?", choices: ["Screw the cartridge down tighter for better contact.", "Double click for the ten second 1.8V preheat mode.", "Take a few long back to back draws to warm it up.", "Bump it to the highest 3.8V setting instead."], answer: 1, why: "Cold oil is a flow problem, not a power problem, so the fix is warming it before the draw. Cranking voltage or pulling harder just works a cart that has not started moving yet, and over-tightening is the one thing the manual warns against." },
      { q: "A customer buys the 510 Original on its own. What do you tell them before they leave?", choices: ["It comes with a cartridge pre-installed and ready to go.", "It is just the battery; the cartridge and cable are separate.", "It includes a USB-C cable, but the cartridge is separate.", "It includes a cartridge, but the USB-C cable is separate."], answer: 1, why: "Anything not named on the box becomes a second trip or a return. Say what is missing at the counter and it turns into an attach instead of a complaint." },
      { q: "A customer buys their first cart and a 510 Original together. Which ten-second demo at the counter heads off the most likely day-one problem?", choices: ["Screw the cart on until it is snug, then stop.", "Crank the cart down tight so it cannot work loose.", "Run a full charge cycle before the first draw.", "Press and hold the button on every single inhale."], answer: 0, why: "Over-tightening damages the connection point, and it is the one failure a rep can prevent before the customer leaves. The other three are preferences, not problems." },
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
    // Derived from the 2012 founding so it can never contradict the About
    // headline or go stale — see brandYears() in app.js.
    { number: (new Date().getFullYear() - 2012) + "+", label: "Years leading the industry" },
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
  { emoji: "🎤", text: "Snoop Dogg partnered with G Pen in 2013 — one of the first true celebrity collaborations in the vaporizer world." },
  { emoji: "🍫", text: "Anandamide, one of your body's own cannabinoids, is named after the Sanskrit word for \"bliss.\" It's also found in chocolate." },
  { emoji: "🌿", text: "Hemp is one of the oldest cultivated crops on Earth — woven fabric samples date back roughly 10,000 years." },
  { emoji: "🫙", text: "Light and heat degrade cannabinoids faster than anything else. Cool, dark, airtight — that's the whole storage lecture." },
  { emoji: "⚡", text: "A dirty chamber is the #1 cause of \"my vape stopped hitting.\" Nine times out of ten it's a cleaning issue, not a defect." },
  { emoji: "🤝", text: "The \"entourage effect\" is the theory that cannabinoids and terpenes work better together than any one compound alone." },
  { emoji: "🔌", text: "Voltage is the whole game on a 510 cart: too low and it barely vapes, too high and you scorch the oil. That's why the Hydout gives you five settings instead of three." },
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
      { name: "Hot Knife", cost: 1, dmg: "302°F", text: "Ceramic tip hits ~150°C so concentrate releases clean instead of stringing." },
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
    // No warranty stat here: the 510 Original course does not state one, and a
    // card asserting "90 d" is a term a rep could repeat to a customer.
    statsRow: [{ k: "Presets", v: "3" }, { k: "Auto-off", v: "10 min" }, { k: "Charge", v: "USB-C" }],
  },
};

/* The 6th card, the Certified G. Collect all five product cards and it reveals
   in gold — it carries the program’s top reward: 40% off. */
window.GPEN_SECRET_CARD = {
  no: 6, rarity: "secret", element: "gold", code: "G 420",
  name: "Certified G", power: "∞", powerUnit: "",
  moves: [
    { name: "Total Recall", cost: 3, dmg: "5/5", text: "Knows every G Pen product cold — specs, cleaning, objections, all of it." },
    { name: "House Discount", cost: 2, dmg: "40%", text: "The highest reward in the program. Nobody else on the floor has this card." },
  ],
  statsRow: [{ k: "Lineup", v: "5/5" }, { k: "Reward", v: "40% off" }, { k: "Rank", v: "👑" }],
  flavor: "Fully trained. Fully loaded. A G Pen Product Specialist in every sense.",
};

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
    // "don't pack it" read as an instruction not to pack at all, which is the
    // opposite verb from the Dash II step ("pack lightly with the pick tool").
    "Grind it, pack it light. Airflow is the whole ballgame.",
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
