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
     accent      : hex used for the card's color pop
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
    family: "dryherb",
    tagline: "Pocket-sized dry herb vaporizer with temperature control.",
    /* What the object IS, in the plainest words available: the answer to "what
       is this thing and what is it for", shown at the top of the course above
       the price. Not marketing and not positioning — a rep who has never seen
       the category should be able to read one line and be right. */
    whatItIs: "A dry herb vaporizer, designed to vaporize ground cannabis flower.",
    differentiator: "The entry dry herb vaporizer. Simple to use.",
    minutes: 9, passPct: 80, msrp: "$49.95", accent: "#FEC870",
    cover: CDN + "Dash2_thumb_01.png?v=1782936076",
    heroImg: LIFE + "dash-ii/f37d082035ae142949fa4dfe33aeebf6d9b556a2745187c26db91bc2ca08a020.jpg",
    /* Packaging, from the asset portal's synced "Packaging" folder. `perDisplay`
       is the inner-pack count on the SKU sheet — what a store actually receives. */
    packaging: {
      box: LIFE + "dash-ii/04b596f545b1102e2eabdcf72bf97966379f050f79ce58d19ee59c64e1626b73.jpg",
      pop: LIFE + "dash-ii/724cced5aa650e369377feb04e9f49054c7c00ed936b48ef2ab813c98783cb49.jpg",
      perDisplay: "10",
      inBox: ["G Pen Dash II vaporizer", "Built-in loading tool", "Silicone mouthpiece sleeve"],
      notIncluded: ["USB-C charging cable"],
    },
    // productUrl / faqUrl are provenance: the pages every spec and description
    // on this course was verified against. Nothing renders them.
    productUrl: "https://www.gpen.com/products/g-pen-dash-ii-vaporizer",
    faqUrl: "https://www.gpen.com/pages/dash-ii-faq",
    gallery: [
      { url: CDN + "dash2_thumb_02.jpg?v=1772834595", caption: "OLED display — real-time temp & battery" },
      { url: CDN + "dash2_thumb_09.jpg?v=1772834595", caption: "Pocket-sized \u2014 about as tall as a lighter" },
      { url: CDN + "dash2_thumb_05.jpg?v=1772834595", caption: "The mouthpiece cap, off" },
      { url: CDN + "dash2_thumb_08.jpg?v=1772834595", caption: "Cap off, ready to load" },
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
      pairsWith: ["dash-plus"],
      // No invented fractions: "half the terpenes" was a fabricated statistic.
      vital: "A vaporizer heats ground flower instead of burning it, which gives a clearer flavor of the strain. The Dash II is the lowest-priced way into that.",
      aov: "Every flower sale can carry a $49.95 device. It is the highest-value add-on available on a flower purchase, and it brings the customer back for flower.",
      keyFacts: ["Pocket-sized dry herb vaporizer", "Heats in about 30 seconds · 0.4g chamber", "$49.95 — the entry price point"],
      talkTrack: { say: "Since you are buying flower: this heats it instead of burning it. You get more sessions from the same amount and a clearer flavor. $49.95, and it fits in a pocket." },
      whichClose: "Two options for flower: the Dash II at $49.95, or the Dash+ with a titanium chamber at $99.95. Which suits you?",
      scenarios: [
        { sees: "A half-ounce of flower + a grinder in their basket", say: "You are already grinding it, so this is the next piece. Pack the ground flower and press the button. The same amount lasts longer because you are heating it, not burning it. $49.95." },
        { sees: "They bring up how a joint feels compared to vaping", say: "The difference is burning versus heating. A joint combusts the flower; this vaporizes it. I cannot give health advice, but flavor is the reason most people switch. $49.95 — would you like to hold it?" },
      ],
      trap: "Never describe it as being like smoking. Say that it heats the flower and does not burn it. If a customer raises coughing, harshness, lungs, or any other health topic, do NOT diagnose it and do NOT say the product fixes it. That is a claim the brand cannot make. Redirect to flavor and experience, or refer them to their doctor.",
      objections: [
        { says: "I'll just roll it.", say: "You still can. Rolling burns the flower, so part of every bowl is lost to smoke. This heats the same flower at a set temperature, so a gram goes further and the flavor is clearer. Would you like to see the size?", why: "Do not argue against rolling. Reframe on waste and flavor." },
        { says: "Is $49.95 worth it?", say: "$49.95 is the entry price for a vaporizer with real temperature control and a display. It pays for itself in flower you no longer burn. Add a USB-C cable and you are ready.", why: "Anchor on what the price buys, then attach the cable. It is not in the box." },
        { says: "I have never used a dry herb vaporizer.", say: "It is four steps: grind, pack, hold the button to power on, then double-tap to heat. That is the whole process.", why: "Answer with the actual step count. Four concrete steps removes the fear faster than reassurance does." },
      ],
    },
    videos: [
      { title: "How to Use: G Pen Dash II", thumb: "https://i.ytimg.com/vi/sqCdU8Kn5ek/hqdefault.jpg", youtube: "sqCdU8Kn5ek" },
      { title: "How to Clean: Dash II", thumb: "https://i.ytimg.com/vi/wBOzqPxDhd8/hqdefault.jpg", youtube: "wBOzqPxDhd8" },
    ],
    quiz: [
      { q: "A customer sets down a half-ounce of flower and a grinder. They have never owned a vaporizer and mention they would rather not spend much. What do you put on the counter next to it?", choices: ["The Melt Hot Knife, so they can prep it without the mess", "The 510 Original, the cheapest battery on the wall", "The Dash II, the entry pocket dry-herb vape", "The Dash+, since the titanium oven is the better vape"], answer: 2, why: "Work the basket in two steps: the category decides the device — flower means a dry-herb vape, not a 510 battery or a concentrate tool — then the customer decides the model. A first-timer watching their spend takes the entry unit, not the upgrade." },
      { q: "\"I'll just roll it,\" the customer says, waving off the vape. What is the strongest next line?", choices: ["\"Rolling burns off the flavor, and some of it just goes up in smoke — this heats the same gram, so it goes further.\"", "\"Joints are honestly a bad habit — most people who switch over never go back to rolling papers again.\"", "\"Sure, but the vape is a lot more discreet — nobody standing around you knows what you're using.\"", "\"Rolling's fine if you're into it, though the vape is really just the more modern way to do it now.\""], answer: 0, why: "Arguing against a habit the customer already enjoys puts them on the defensive. Reframe instead, and anchor on waste and flavor — things they can judge for themselves, and the only ground the brand can stand on." },
      { q: "The customer is interested but hesitates: \"Is $49.95 really worth it?\" Besides holding the price, what should you do before they leave?", choices: ["Offer to knock a few bucks off if they buy today", "Attach a USB-C cable so they can charge it", "Show them the $99.95 Dash+ so fifty feels cheap", "Tell them the warranty covers them for a full year"], answer: 1, why: "Holding a price only wins the sale if the customer can actually use the thing that night — the Dash II box has no charging cable, so the sale is not finished until you close that gap. Discounting teaches them to wait for a deal, and the warranty is only a full year if they register." },
      { q: "Mid-pitch, a customer says smoking makes them cough and asks whether this device would help with that. Your move?", choices: ["Tell them heating instead of burning is gentler on the throat", "Say it depends on temperature and suggest they run it low", "Decline the health question and steer back to flavor and taste", "Explain that vapor leaves behind the harsher parts of smoke"], answer: 2, why: "Any comfort, health, or symptom claim becomes the brand's liability, not just yours. The safe and still-persuasive ground is flavor and experience — or telling them to ask a doctor." },
      { q: "An existing owner asks whether trading up to the Dash+ gets them a bigger oven. What is accurate?", choices: ["It is roughly double, so a session lasts about twice as long", "It is smaller, near 0.3g — you are paying for heat quality", "It is bigger, since titanium walls are thinner than ceramic", "It is the same size; only the screen and the body change"], answer: 1, why: "Capacity is the one thing the Dash+ does not upgrade — a titanium hybrid-convection oven at roughly 0.3g against this device's 0.4g. Sell the upgrade on heat and flavor, because a capacity promise gets found out the first time they pack it." },
      { q: "A customer returns a few weeks after buying: \"It barely produces anything anymore.\" What is the first thing to check?", choices: ["Whether the battery has stopped holding a charge", "Whether spent material has built up in the chamber", "Whether they are running the temperature too low", "Whether they are packing the chamber too tightly"], answer: 1, why: "Check maintenance before hardware — residue in the ceramic chamber restricts airflow long before a battery or heater actually fails. Packing density matters too, which is why the Dash II is meant to be packed lightly rather than crammed." },
      { q: "Someone at the counter is buying a gram of wax and a 510 cartridge. They ask if this device handles both. What do you tell them?", choices: ["The cart threads right on, but the wax has to go elsewhere", "Dry herb only, so neither of those two goes in it", "Both are fine as long as you load them with the pick tool", "The wax goes in the chamber, but the cart needs a battery"], answer: 1, why: "Selling a device into the wrong material is the fastest way to turn a sale into a return. Name the limit first, then route them — wax to the Melt, the cart to a 510 battery — and you keep the customer instead of the refund." },
      { q: "A customer tries your floor demo, says the first pull tasted like nothing, and mentions they packed it in as firmly as they could and the draw felt tight. What do you correct?", choices: ["They packed the chamber too tightly for air to pull through", "They should have set a higher temperature before starting", "They were holding the button down through the whole draw", "They only filled the ceramic chamber about halfway"], answer: 0, why: "A dry-herb oven needs air moving across the load — cram it and heat never reaches the herb. Under-filling is wrong too (the spec is a full chamber, packed light), but that thins the vapor rather than killing the draw." },
      { q: "\"I've never used a dry-herb vape before\" — a hesitant first-timer. What framing closes them?", choices: ["Walk them through the settings menu so nothing is a surprise", "Frame it as the hard-to-mess-up one and keep it to a few steps", "Compare the temperature range against the higher-end model", "Steer them to the pricier one since it is more forgiving"], answer: 1, why: "Inexperience objections are fear of complexity, not a gap in information, so shrink the process to its four steps (grind, pack, hold to power on, double-tap to heat) instead of adding to it. Anything that piles on detail or price, like a settings tour or a step up in model, makes a nervous buyer more nervous." },
      { q: "A flower customer is clearly deciding between two dry-herb units. How should you present the choice?", choices: ["Lead with the Dash+ — it is the better vaporizer of the two", "Ask whether they want the pocket Dash II or the titanium Dash+", "Start at $49.95 and only mention the other if they object", "Ask their budget first, then show only the tier that fits it"], answer: 1, why: "A which-close beats a yes-or-no close because either answer is a sale. Framing the two units as a preference rather than a budget question also keeps the customer from feeling sold up or priced out." },
      { q: "\"Do I just drop a nug in?\" the customer asks, holding the open chamber. What do you say?", choices: ["Grind it first, then fill the chamber and pack it lightly", "A whole bud is fine as long as it fits the chamber", "Break it up by hand, since grinding makes it pack too tight", "Grind it and press it in firmly so it makes full contact"], answer: 0, why: "The load spec is two things at once: ground herb, filling the chamber, packed light with the pick tool. Both wrong instincts miss one half of it, and it is the natural moment to attach a grinder to the sale." },
    ],
  },

  /* ------------------------------------------------------------------- DASH+ */
  {
    slug: "dash-plus",
    name: "Dash+",
    category: "Dry Herb Vaporizer",
    family: "dryherb",
    tagline: "Hybrid convection + conduction in a full titanium chamber.",
    /* What the object IS, in the plainest words available: the answer to "what
       is this thing and what is it for", shown at the top of the course above
       the price. Not marketing and not positioning — a rep who has never seen
       the category should be able to read one line and be right. */
    whatItIs: "A dry herb vaporizer, designed to vaporize ground cannabis flower.",
    differentiator: "Titanium chamber and hybrid heating. The step-up model.",
    minutes: 9, passPct: 80, msrp: "$99.95", accent: "#D75D43",
    cover: CDN + "dash__vape_thumb_5e14bcb4-a63a-4cc3-8078-e57fc572e4da.png?v=1729247649",
    heroImg: LIFE + "dash-plus/5e5f67089995d3cfba84f862caf73d287ae9bc1d86d05818dde9204e6fce4b74.jpg",
    /* No POP display for the Dash+ — it ships as a single unit only, which is why
       the SKU sheet lists its inner pack as N/A. The section renders one card. */
    packaging: {
      box: LIFE + "dash-plus/37bc777dbc866911332713bc01829c0e2dba3c97bc7d970d57d224e7da185e7b.jpg",
      inBox: ["Dash+ vaporizer", "Mouthpiece silicone sleeve", "Loading tool with keychain", "USB-C charging cable"],
      notIncluded: [],
    },
    productUrl: "https://www.gpen.com/products/g-pen-dash-plus-vaporizer",
    gallery: [
      { url: CDN + "dash__vape_thumb_2_455ab888-db45-48a5-8680-3f5c685cd05f.jpg?v=1729247650", caption: "Full-color LED display" },
      { url: CDN + "dash__vape_thumb_3_461b1dc3-9698-4b90-852b-130035e8252a.jpg?v=1729247646", caption: "USB-C port on the side" },
      { url: CDN + "dash__vape_thumb_4_43ebed07-78d2-4186-8c51-c36b11921f28.jpg?v=1729247643", caption: "Durable zinc-alloy body" },
      { url: CDN + "dash__vape_thumb_6_2d2b66e0-28c5-4ab1-af46-f8f63d53227a.jpg?v=1729247640", caption: "Magnetic mouthpiece and its air path" },
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
      pairsWith: ["dash-ii"],
      vital: "The titanium chamber and hybrid heating give more vapor and a fuller flavor than the Dash II. This is the model for a customer buying higher-grade flower.",
      aov: "Present the Dash II at $49.95 first, then this at $99.95. Showing the two together doubles the device value on the same flower sale.",
      keyFacts: ["Full titanium chamber, hybrid heating", "Heats in about 20 seconds · color display", "$99.95 — the step up from the Dash II"],
      talkTrack: { say: "If flavor matters to you, this is the one. Full titanium chamber, hybrid heating, ready in about 20 seconds. $99.95, and the charging cable is included." },
      whichClose: "The Dash II at $49.95, or the Dash+ with the titanium chamber at $99.95?",
      scenarios: [
        { sees: "A regular who buys top-shelf flower every week", say: "You are buying high-grade flower, and this is the model that does it justice. Titanium chamber and hybrid heating, so more of the flavor reaches you instead of burning off." },
        { sees: "Buying a nice strain as a gift, or trading up from a Dash II", say: "For a gift or a step up, this is the one. Colour display, a vibration when it reaches temperature, and a full titanium chamber. $99.95." },
      ],
      trap: "Do not sell it on specifications. Sell the difference in flavor, which is the thing the customer can judge. Nobody buys titanium; they buy what it tastes like.",
      objections: [
        { says: "Why is this double the Dash II?", say: "The extra $50 buys the titanium chamber and hybrid heating. That is what produces the fuller flavor and heavier vapor. If flavor is your priority, it is worth it.", why: "Justify the gap with the mechanism behind the difference, not with a spec list." },
        { says: "It looks complicated.", say: "Three buttons, and it vibrates when it is ready. Load, double-click, draw. The color display always shows your temperature.", why: "Reduce it to three actions. Perceived complexity, not real complexity, is what loses this sale." },
        { says: "I already have a pocket vape.", say: "Then this is the upgrade. Full titanium chamber, hybrid heating, ready in about 20 seconds. You will notice the difference on the first draw.", why: "Position it as a step up, not a replacement. Sell heat quality, never capacity: the Dash+ chamber is 0.3g against the Dash II's 0.4g." },
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
    /* Added from the official one-sheet (20260617_GPEN_Grinder_Onesheet) plus the
       product photography in the asset portal. NOTE: this product is not on
       gpen.com yet — there is no storefront page, so productUrl is empty and every
       number here comes from the one-sheet, not from a guess. There is also no
       video for it yet, which is why `videos` is absent. */
    slug: "grinder",
    name: "3-Piece Grinder",
    category: "Dry Herb Accessory",
    family: "dryherb",
    tagline: "64mm aluminum grinder. No kief screen — nothing gets left behind.",
    /* What the object IS, in the plainest words available: the answer to "what
       is this thing and what is it for", shown at the top of the course above
       the price. Not marketing and not positioning — a rep who has never seen
       the category should be able to read one line and be right. */
    whatItIs: "A hand grinder, designed to break up cannabis flower before it is packed.",
    differentiator: "The $19.95 add-on for any flower sale.",
    minutes: 5, passPct: 80, msrp: "$19.95", accent: "#5E8C61",
    /* Locally cut out, not a CDN render: every stashgrinder_* asset on the CDN and in
       the asset portal is a JPEG with a baked white background, and every other cover
       in this file is a transparent cut-out — a white square would sit inside the
       card's warm-grey media box. Keyed by flood-filling the background inward from
       the border, which is what preserves the enclosed white G on the lid (a plain
       near-white threshold punches a hole through the logo). Swap this for an official
       transparent render the moment marketing produces one. */
    cover: "assets/img/grinder-cover.png",
    heroImg: LIFE + "slim-3-piece-grinder/6120e7c350834c0bc55f5b70288d5102d25d49bb546603d0fc2919f243c9f3da.jpg",
    /* Packaging assets pending — the grinder has no "Packaging" folder in the asset
       portal yet. packagingHTML() renders nothing until this block exists, so
       adding it here is the only change needed when the images land. */
    productUrl: "",
    gallery: [
      { url: CDN + "stashgrinder_thumb_03.jpg", caption: "Three pieces: lid, grinding ring, catch cup" },
      { url: CDN + "stashgrinder_thumb_02.jpg", caption: "Lid off — teeth above, drop-through floor below" },
      { url: CDN + "stashgrinder_thumb_04.jpg", caption: "Micro-rounded teeth, and the magnet in the middle" },
      { url: CDN + "stashgrinder_thumb_05.jpg", caption: "Patent No. 11690480, printed on the rim" },
      { url: CDN + "stashgrinder_thumb_01.jpg", caption: "Closed — lid seated flush" },
    ],
    description: [
      "The G&nbsp;Pen Grinder is a <strong>3-piece, 64mm</strong> grinder precision-machined from durable <strong>6063 anodized aluminum</strong> — the same aircraft-grade material family as the devices it feeds.",
      "Its <strong>patented micro-rounded teeth</strong> (Patent No. 11690480) gently separate flower rather than shredding it, for a smoother, more consistent grind. A <strong>strong magnetic lid</strong> keeps the closure tight and the contents where they belong.",
      "There is <strong>no kief screen</strong>, and that is deliberate: everything you grind — flower, trichomes and kief together — falls into the catch cup and goes into your bowl or chamber.",
    ],
    highlights: ["3-piece, 64mm", "Patented micro-rounded teeth", "6063 anodized aluminum", "Strong magnetic lid", "No kief screen — nothing separated out", "Designed to help retain terpenes and trichomes"],
    specs: [
      { label: "Type", value: "3-piece dry herb grinder (accessory — no battery, no heat)" },
      { label: "Size", value: "64mm" },
      { label: "Pieces", value: "Lid, grinding ring, catch cup" },
      { label: "Teeth", value: "Patented micro-rounded (Patent No. 11690480)" },
      { label: "Materials", value: "Precision-machined 6063 anodized aluminum" },
      { label: "Lid", value: "Strong magnetic closure" },
      { label: "Kief screen", value: "<strong>None</strong> — flower, trichomes and kief stay together" },
      { label: "Retail pack", value: "10-pack POP display (GPA-001-APSC)" },
    ],
    howToUse: [
      "<strong>Twist the lid off</strong> — it is magnetic, so it lifts away rather than unscrewing.",
      "Break your flower into the <strong>grinding ring</strong>, around the teeth. Do not pack it in.",
      "Put the lid back on and <strong>twist back and forth</strong> a few turns.",
      "Lift the ring off the <strong>catch cup</strong> — the ground flower has dropped through.",
      "Load straight into a bowl, a paper, or a <strong>Dash II / Dash+</strong> chamber.",
    ],
    howToClean: [
      "Take all three pieces apart — there is nothing electronic in it, so it can be cleaned properly.",
      "Brush the teeth and the floor holes out with a <strong>dry brush</strong> first.",
      "For resin build-up, soak the aluminum pieces in <strong>Isopropyl Alcohol</strong>, then rinse and dry fully before reassembling.",
      "Dry it completely — trapped moisture is what makes flower clump on the teeth.",
    ],
    faq: [
      { q: "Why is there no kief screen?", a: "By design. A screen separates trichomes out into a fourth chamber, where most people forget about them. With no screen, the flower, trichomes and kief stay together and all of it goes into your bowl." },
      { q: "How big is it?", a: "64mm across — a full-size grinding surface in a slim body." },
      { q: "What is it made of?", a: "Precision-machined 6063 anodized aluminum." },
      { q: "What do the micro-rounded teeth do?", a: "They separate flower gently instead of shredding it, which is what gives the smoother, more consistent grind. The design is patented (No. 11690480)." },
      { q: "Does the lid stay on?", a: "Yes — it uses a strong magnetic closure, so it holds shut in a bag or a pocket." },
      { q: "Does it need charging?", a: "No. It is a fully mechanical accessory — no battery, no heat, nothing to charge." },
    ],
    howToSell: {
      upsellFrom: "Flower",
      pairsWith: ["dash-ii", "dash-plus"],
      vital: "Every flower customer grinds somehow. This is the cheapest thing on the counter that improves what they already bought, and it is the accessory that makes a Dash pack evenly.",
      aov: "A $19.95 mechanical add-on with nothing to break and nothing to charge. It attaches to any flower sale, and it ships as a 10-pack POP display so it can live right at the register.",
      keyFacts: ["3-piece, 64mm, aluminum", "Patented micro-rounded teeth", "No kief screen — $19.95"],
      talkTrack: { say: "How are you breaking up your flower? This is 64mm machined aluminum with patented teeth, and no kief screen, so nothing is separated out and left behind. $19.95, and your vaporizer packs more evenly." },
      whichClose: "Packing a vaporizer or rolling? An even grind matters either way. Add the grinder at $19.95?",
      scenarios: [
        { sees: "Flower going out with no grinder in the basket", say: "How are you breaking that up? A plastic grinder crushes flower. This has micro-rounded teeth that separate it instead. $19.95, machined aluminum, and nothing to charge." },
        { sees: "Someone buying a Dash II or Dash+ with flower", say: "Add the grinder. A dry herb vaporizer performs to the quality of the grind: an even, loose pack lets the chamber heat the flower evenly. $19.95." },
      ],
      trap: "Do not sell it as a kief catcher — it deliberately has NO kief screen, and a customer expecting a fourth chamber will bring it back. Sell that as the feature it is: nothing gets separated out and left behind.",
      objections: [
        { says: "I already have a grinder.", say: "Most free grinders are plastic and crush the flower rather than separating it. This is machined aluminum with micro-rounded teeth. You will notice the difference in how evenly it packs. $19.95.", why: "Compete on grind quality and material, never on price." },
        { says: "Where does the kief go?", say: "There is no kief screen on this one, on purpose. Everything stays together and goes into your bowl instead of collecting in a chamber you forget about.", why: "Answer it straight and immediately. This is THE question on a 3-piece, and dodging it is what causes returns." },
        { says: "$19.95 for a grinder?", say: "It is machined aluminum with patented teeth and a magnetic lid. There is nothing in it to wear out and nothing to charge.", why: "Durability is the value argument. Never discount into this objection." },
      ],
    },
    quiz: [
      { q: "A customer picks up the 3-Piece Grinder, turns it over and asks where the kief collects. What do you tell them?", choices: ["It collects in the bottom cup along with the flower", "There is no kief screen — everything stays together on purpose", "Kief collects under the teeth and you scrape it out", "You have to buy the four-piece for that"], answer: 1, why: "This is the single most common question on a 3-piece and the fastest route to a return if you fudge it. There is no kief screen at all, which the one-sheet frames as the feature: flower, trichomes and kief stay together instead of separating into a chamber people forget." },
      { q: "A regular says their free plastic grinder works fine. What is the strongest thing to lead with?", choices: ["This one costs more, so the build quality is better", "It is aluminum with micro-rounded teeth that separate rather than crush", "Plastic grinders break within a few months of daily use", "It is the same idea but it has the G Pen logo on it"], answer: 1, why: "Name the mechanism, not the price and not a durability claim you cannot back up. Micro-rounded teeth separating flower instead of shredding it is the patented difference, and it is what they will actually notice in the grind." },
      { q: "Someone is buying flower and a Dash+ together. How does the grinder attach to that sale?", choices: ["It is a spare part they will need when the chamber wears", "An even grind is what makes the chamber heat the flower evenly", "It doubles the capacity of the Dash+ chamber", "It is required for the warranty to stay valid"], answer: 1, why: "A dry herb vape only performs as well as its grind — even, fluffy flower is what lets the chamber heat consistently. That is a real reason to pair it, and it does not overstate anything about capacity or warranty." },
      { q: "What is the grinder actually made of, and what size is it?", choices: ["64mm, precision-machined 6063 anodized aluminum", "50mm, anodized aluminum with a steel grinding ring", "64mm, zinc alloy with an aluminum lid", "70mm, titanium-coated aluminum"], answer: 0, why: "64mm and 6063 anodized aluminum are the two spec facts on the one-sheet. Reps get asked about material constantly on accessories, and inventing a metal is how a spec argument starts at the counter." },
      { q: "How many pieces come apart, and what are they?", choices: ["Two: a lid and a grinding cup", "Three: lid, grinding ring, and catch cup", "Three: lid, grinding ring, and a kief screen", "Four: lid, ring, screen, and kief chamber"], answer: 1, why: "Three pieces: the magnetic lid, the ring that holds the teeth and the drop-through floor, and the cup that catches the ground flower. Naming them in order is also how you demo it in about five seconds." },
      { q: "A customer asks how the lid stays shut in a bag. What is accurate?", choices: ["It screws down onto a threaded rim", "It uses a strong magnetic closure", "It snaps on with a silicone gasket", "It is friction-fit, so keep it upright"], answer: 1, why: "The lid is magnetic — that is why it lifts straight off rather than unscrewing, and it is the answer to the spill question a commuter will ask." },
      { q: "\"Does it need charging?\" — what do you say?", choices: ["No — it is fully mechanical, nothing to charge", "Only the magnetic lid holds a small charge", "Yes, over USB-C like the rest of the lineup", "It charges from the Dash II when stacked"], answer: 0, why: "It is an accessory with no battery and no heat. This sounds obvious on the floor, but it is worth being crisp about, because everything else in the lineup does charge." },
      { q: "How should someone actually load the grinding ring?", choices: ["Pack it in tight so the teeth get full contact", "Break the flower in loosely around the teeth", "Fill it to the very top of the rim", "Grind one small piece at a time in the centre"], answer: 1, why: "Loose flower around the teeth is what lets the ring turn and the ground flower drop through the floor. Packing it tight is the usual reason someone says a grinder is stiff or does not work." },
      { q: "A customer wants to know how to clean resin off it. What is safe to tell them?", choices: ["Rinse it under hot water and dry it fast", "Take it apart and soak the pieces in Isopropyl Alcohol", "Run it through the dishwasher on a low cycle", "Wipe it while it is warm from grinding"], answer: 1, why: "There is nothing electronic in it, so unlike every other product in the lineup it can be fully taken apart and soaked. Dry it completely afterwards — trapped moisture is what makes flower clump on the teeth." },
      { q: "The grinder ships to retail in what format?", choices: ["Single boxed units only", "A 10-pack POP display for the counter", "A 24-count carton with no display", "Bulk polybags, display sold separately"], answer: 1, why: "It comes as a 10-pack POP display (GPA-001-APSC), which is worth knowing because a counter display is what turns a $19.95 accessory into an impulse attach on a flower sale." },
      { q: "A customer asks what the patented part actually is. What is accurate?", choices: ["The magnetic lid closure", "The micro-rounded tooth design", "The 6063 aluminum alloy", "The 64mm form factor"], answer: 1, why: "Patent No. 11690480 covers the micro-rounded teeth — the gentle-separation design. It is printed right on the rim, so a curious customer can read it themselves." },
    ],
  },
  {
    slug: "melt-hot-knife",
    name: "Melt Hot Knife",
    category: "Concentrate Tool",
    family: "concentrate",
    tagline: "The smallest hot knife on the market. Loads concentrate cleanly.",
    /* What the object IS, in the plainest words available: the answer to "what
       is this thing and what is it for", shown at the top of the course above
       the price. Not marketing and not positioning — a rep who has never seen
       the category should be able to read one line and be right. */
    whatItIs: "An electric hot knife, designed to scoop and load cannabis concentrate.",
    differentiator: "Electric hot knife. Scoops and releases without residue.",
    minutes: 7, passPct: 80, msrp: "$24.95", accent: "#E8833A",
    cover: CDN + "Melt_thumbA.png?v=1772813232",
    heroImg: LIFE + "melt/b1cac7548cacc2f2b15e0b9385e6ff04e8a8168f7dbec9e1be8f8354dc506aea.jpg",
    packaging: {
      box: LIFE + "melt/a831957ad756e42f0d8b13053463f621777b42649d01b141e0b3e9ede7c3417a.jpg",
      pop: LIFE + "melt/628e9f284fb810bfa05a760c85834f37860f0b0a153fa722d0be65289bf9df26.jpg",
      perDisplay: "20",
      inBox: ["G Pen Melt hot knife", "Protective travel cap"],
      notIncluded: ["USB-C charging cable"],
    },
    productUrl: "https://www.gpen.com/products/g-pen-melt",
    gallery: [
      { url: CDN + "Melt_thumb_05.jpg?v=1772808678", caption: "Rapid-heat ceramic tip" },
      { url: CDN + "Melt_thumb_07.jpg?v=1772808678", caption: "Clean, controlled concentrate drops" },
      { url: CDN + "Melt_thumb_04.jpg?v=1772808678", caption: "The smallest hot knife on the market" },
      { url: CDN + "Melt_thumb_02.jpg?v=1772808678", caption: "Travel cap off, ceramic tip ready" },
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
      pairsWith: [],
      vital: "Concentrate needs a tool to handle it, and a cold tool drags and leaves residue behind. The heated ceramic tip releases it cleanly into the rig, so less of what they paid for is wasted.",
      aov: "A $24.95 add-on that fits every concentrate sale. Anyone buying wax or rosin is already working with a cold tool, so the need exists before you mention it.",
      keyFacts: ["Heated ceramic tip releases concentrate cleanly", "Heats in seconds · pocket-sized", "Loads any rig or banger — $24.95"],
      talkTrack: { say: "Buying concentrate? This is how you handle it. Heated ceramic tip, so it scoops and releases without residue. $24.95, pocket-sized, works with any rig or banger." },
      whichClose: "Loading a rig or a banger? Either way this is how the concentrate gets in cleanly. Add one at $24.95?",
      scenarios: [
        { sees: "A gram of rosin or live resin on the counter", say: "That rosin is too good to leave on a cold tool. The heated tip releases it cleanly into the rig, so none of it stays on the tool. $24.95." },
        { sees: "Concentrate + a banger or rig in the same sale", say: "You have the rig. This is how you load it cleanly. Heats in seconds, scoops, releases. $24.95." },
      ],
      trap: "Be precise about what it replaces: the Melt replaces the sticky dab tool, NOT the torch or e-nail that heats a quartz banger. Sell it on clean loading. Promising 'you won't need a torch at all' is the fastest way to get it returned.",
      objections: [
        { says: "I already have a dab tool.", say: "A cold tool is the reason concentrate drags and sticks. A heated tip releases it cleanly every time, so less is left behind.", why: "Reframe the cold tool as the problem rather than comparing products." },
        { says: "Do I need a torch?", say: "Not for this. It is electric, charges over USB-C, and heats in seconds. You still heat a quartz banger the way you normally do. This moves the concentrate from the jar into it cleanly.", why: "Be precise. Overselling this as replacing a torch is the main reason it is returned." },
        { says: "$24.95 for a tool?", say: "It is the smallest hot knife made, and it replaces a cold tool and the waste that comes with it. Add a USB-C cable and you are ready.", why: "The USB-C cable is not in the box. Attach it to the sale." },
      ],
    },
    videos: [
      { title: "A Closer Look at the Melt", thumb: "https://i.ytimg.com/vi/nEDYSJqHk5o/hqdefault.jpg", youtube: "nEDYSJqHk5o" },
      { title: "Melt — The Judge's Favorite", thumb: "https://i.ytimg.com/vi/mgErvUJHYQU/hqdefault.jpg", youtube: "mgErvUJHYQU" },
    ],
    quiz: [
      { q: "A customer says \"I've already got a dab tool.\" What is the strongest response?", choices: ["This one is smaller and easier to carry in a pocket every day", "The cold tool is the problem; heat lets the dab release clean", "Yours will wear out eventually, so a backup is worth having around", "This one is electric instead of manual, so it is the premium pick"], answer: 1, why: "Comparing features against a tool they already own turns into a price argument you lose. Name the problem they live with instead — a cold tool is what causes the stringing and the reclaim left behind." },
      { q: "\"$24.95 for a dab tool?\" You justify the value, then attach one more item. Which one does this customer actually need?", choices: ["A USB-C charging cable", "A second protective travel cap", "Isopropyl swabs for the ceramic tip", "Nothing — close it at sticker price"], answer: 0, why: "Before any accessory leaves the counter, check what the box does not include. The Melt ships with the device and its cap only, so without a cable the customer gets home to something they cannot power up." },
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
    family: "510",
    tagline: "Discreet 510 battery with a hidden magnetic mouthpiece.",
    /* What the object IS, in the plainest words available: the answer to "what
       is this thing and what is it for", shown at the top of the course above
       the price. Not marketing and not positioning — a rep who has never seen
       the category should be able to read one line and be right. */
    whatItIs: "A battery, designed to power a 510-thread cannabis oil cartridge.",
    differentiator: "510 battery with the mouthpiece hidden inside.",
    minutes: 8, passPct: 80, msrp: "$24.95", accent: "#7E8AA2",
    cover: CDN + "Hydout_vape_01.png?v=1762467078",
    heroImg: LIFE + "hydout/ad92f94cf68885a5ecb0b673ca262349a3f7c0476bf1762cbb375d2289bf39b1.jpg",
    packaging: {
      box: LIFE + "hydout/4439b92f07acc9f80b7aa5899b8819efaf6f5d7366b04341efb7fda07dbd1056.jpg",
      pop: LIFE + "hydout/9a919bb3e6e6f6073f0dc9936df41d2811a88782290ef8451f3f1f8b18858e6d.jpg",
      perDisplay: "10",
      inBox: ["G Pen Hydout 510 battery", "Magnetic mouthpiece cover"],
      notIncluded: ["510 cartridge", "USB-C charging cable"],
    },
    productUrl: "https://www.gpen.com/products/g-pen-hydout",
    gallery: [
      { url: CDN + "Hydout_vape_thumb_07.jpg?v=1762461585", caption: "Low-key sessions, on the go" },
      { url: CDN + "Hydoutout_vape_015.jpg?v=1762461585", caption: "Hidden magnetic mouthpiece cover" },
      { url: CDN + "Hydout_vape_thumb_011.jpg?v=1762461585", caption: "Loads a standard 510 cart inside" },
      { url: CDN + "Hydout_vape_thumb_03.jpg?v=1762461585", caption: "Closed up, with the cart hidden inside" },
    ],
    description: [
      "The G Pen Hydout is a discreet 510 cartridge battery — a compact, <strong>concealed</strong> vape battery for 510 cartridges that delivers serious performance without blowing your cover.",
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
      pairsWith: ["510-original"],
      vital: "It does the same job as any 510 battery, but the mouthpiece stores inside the body. That keeps the cartridge discreet and shielded from light.",
      aov: "The step-up cartridge battery. Against the $12.95 510 Original, this adds discretion and five voltage settings, and doubles the value of the battery attach.",
      keyFacts: ["Mouthpiece stores inside the body", "Five voltage settings plus preheat", "Discreet, and shields the cartridge — $24.95"],
      talkTrack: { say: "For your cartridges: the mouthpiece stores inside the body, so it stays discreet in a pocket. Five voltage settings to match any oil. $24.95, and it shields the cartridge from light." },
      whichClose: "The 510 Original at $12.95, or the Hydout at $24.95 with the mouthpiece stored inside?",
      scenarios: [
        { sees: "Buying a cart, mentions they vape at work or in public", say: "If you use it away from home, this is the one. The mouthpiece stores inside the body, so it stays discreet in a pocket. Five voltage settings as well. $24.95." },
        { sees: "A thick distillate cart", say: "Thicker oil needs heat to flow. This has five voltage settings and a preheat mode, so the cartridge draws instead of clogging. $24.95." },
      ],
      trap: "Do not lead with the price difference against the 510 Original. Lead with discretion and voltage control. A price-first comparison loses the upgrade.",
      objections: [
        { says: "Why pay more than the 510 Original?", say: "Two things: discretion and control. The mouthpiece stores inside the body, and five voltage settings let you match the oil. If you use it away from home, this is the one.", why: "Sell the two upgrades the extra $12 buys: discretion and voltage control." },
        { says: "Will it fit my cartridge?", say: "It fits most standard 510 cartridges up to 2g. Thread it on and it is ready.", why: "The only limits that matter are the 510 thread standard and the 2g size ceiling, not the brand of the cartridge." },
        { says: "My oil clogs and will not draw.", say: "That is what preheat is for. Double-click and it warms the oil for ten seconds so it flows.", why: "Name the exact action and duration. Vague reassurance does not fix a clog at the counter." },
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
      { q: "A customer is deciding between the two 510 batteries and asks what they actually get for the extra money in heat control.", choices: ["Five voltage steps instead of three, plus the same preheat", "Ten voltage steps instead of three, plus a hotter preheat", "A temperature dial in degrees rather than fixed steps", "Double the wattage at every one of the settings"], answer: 0, why: "The real difference is more steps and a lower floor — 2.4V against 3.2V — not finer steps or a different class of control. Both share the preheat, so overstating the gap sets up a disappointed customer." },
      { q: "A shopper picks up the Hydout, looks at the price tag, and says nothing. What is the strongest opening line?", choices: ["The whole mouthpiece tucks inside, so it just disappears in a pocket", "It is only twenty-five, barely more than the basic battery over here", "This is our best-selling cart battery on the wall right now", "It has a bright display so you can always see your battery level"], answer: 0, why: "Whoever names price first sets what the conversation is about. Open on the thing the cheap battery cannot do and price lands as fair; open on price and you have invited them to just take the cheaper one." },
      { q: "A customer texts that their new battery \"keeps turning itself off\" between hits. What is going on?", choices: ["It shuts itself off after two minutes of sitting idle", "Holding the button too long trips a safety cutoff mid-draw", "The battery is defective and should be swapped out today", "It overheats on higher voltages and cuts out until it cools"], answer: 0, why: "Before treating a device as defective, rule out normal designed behavior — an idle timeout is a standard battery safety feature, and knowing it turns a would-be return into a ten-second answer." },
    ],
  },

  /* ------------------------------------------------------------- 510 ORIGINAL */
  {
    slug: "510-original",
    name: "510 Original",
    category: "510 Cartridge Battery",
    family: "510",
    tagline: "The smallest, most affordable G Pen battery ever.",
    /* What the object IS, in the plainest words available: the answer to "what
       is this thing and what is it for", shown at the top of the course above
       the price. Not marketing and not positioning — a rep who has never seen
       the category should be able to read one line and be right. */
    whatItIs: "A battery, designed to power a 510-thread cannabis oil cartridge.",
    differentiator: "The smallest and lowest-priced G Pen 510 battery.",
    minutes: 7, passPct: 80, msrp: "$12.95", accent: "#A9A296",
    cover: CDN + "510_on_white_01.png?v=1767045174",
    heroImg: LIFE + "510-original/058259adc75c62d0fe69f23e94cbb694621854da02665759ab93ad284e329267.jpg",
    packaging: {
      box: LIFE + "510-original/70b73f25507013009c2fad970c5725efb2bff1e0cf615335f82ca988f6798ff0.jpg",
      pop: LIFE + "510-original/97c99ee846af2e0ff3833804d029f130dec0f2af58cd246443fa8a5494b48f55.jpg",
      perDisplay: "20",
      inBox: ["G Pen 510 Original battery"],
      notIncluded: ["USB-C charger", "510 cartridge"],
    },
    productUrl: "https://www.gpen.com/products/g-pen-510-original",
    gallery: [
      { url: CDN + "510_thumb_06_b4bfbf97-a651-4032-9723-ecc13f5493cf.jpg?v=1767045041", caption: "Ultra-portable, effortless to use" },
      { url: CDN + "510_thumb_010_7a9d38b8-860e-41f6-8936-8731df1fef28.jpg?v=1767045147", caption: "Fits standard 510 cartridges" },
      { url: CDN + "510_thumb_01_10b544e9-9c4f-4b13-ae5f-69482331740d.png?v=1767045132", caption: "Three preset voltages on the digital display" },
      { url: CDN + "510_thumb_04_f7997520-6f48-4d8b-8ef1-95b24ee3af36.jpg?v=1767045073", caption: "Black \u2014 one of six colorways" },
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
      pairsWith: ["hydout"],
      vital: "A cartridge does not work without a battery. This is the lowest-priced way to make the cartridge they are already buying usable.",
      aov: "At $12.95 this is the simplest attach in the store, because the need is absolute: no customer should leave with a cartridge and no way to use it.",
      keyFacts: ["Smallest G Pen battery — $12.95", "Draw-activated: no button needed", "Fits any standard 510 cartridge"],
      talkTrack: { say: "That cartridge needs a battery. Do you have one? This is $12.95, draw-activated, and fits any standard cartridge. No buttons." },
      whichClose: "The 510 Original at $12.95, or the Hydout at $24.95 with five voltage settings?",
      scenarios: [
        { sees: "A first-timer buying their very first cart", say: "First cartridge? Then you need a battery. This is the simplest one: thread the cartridge on and draw. No buttons to learn. $12.95, and it fits whichever cartridge you buy next." },
        { sees: "Buying two or three carts at once", say: "You are buying several cartridges. Do you have a battery? This is $12.95 and works with all of them. One reliable battery protects every cartridge you thread onto it." },
      ],
      trap: "Do not ask whether they need a battery, because that invites a no. Ask whether they already have one.",
      objections: [
        { says: "I have an old battery at home.", say: "If it still works, good. An unmatched battery can run a cartridge too hot. $12.95 gets one built for the thread, which protects the cartridge you just bought.", why: "Frame it as protecting the more expensive item already in the basket." },
        { says: "Do I really need it?", say: "You need a battery to use the cartridge. The 510 Original at $12.95, or the Hydout at $24.95?", why: "Offer the choice rather than a yes or no question." },
        { says: "What is the difference from the Hydout?", say: "Price and features. This is the small, simple one at $12.95. The Hydout stores its mouthpiece inside and has five voltage settings, at $24.95. Both fit your cartridge.", why: "State both prices and the two real differences. Let the customer choose rather than choosing for them." },
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
