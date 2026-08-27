/* =============================================================================
   G PEN TRAINING — COURSE DATA
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
    minutes: 7, passPct: 80, msrp: "$49.95", accent: "#FEC870",
    cover: CDN + "Dash2_thumb_01.png?v=1782936076",
    heroImg: LIFE + "dash-ii/c9266bf083319a954ee1773b4a2486080fefcc51ffbdabda737a81257ea25bdb.jpg",
    heroSplit: true,
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
      { q: "How big is the chamber?", a: "The ceramic chamber fits 0.4g of ground flower." },
      { q: "How does it charge?", a: "Via USB-C with pass-through, so you can use it while it's plugged in. A USB-C cable is not included." },
      { q: "Does it have temperature control?", a: "Yes — precise, adjustable temperature control with an OLED display showing real-time temp and battery." },
      { q: "How long does it take to heat up?", a: "About 30 seconds with its conduction heating system." },
      { q: "What's the warranty?", a: "A 6-month limited warranty; registering the device at gpen.com/register adds 6 more months for a full year." },
    ],
    howToSell: {
      upsellFrom: "Flower",
      // No invented fractions: "half the terpenes" was a fabricated statistic.
      keyFacts: ["Pocket-sized dry herb vaporizer", "Heats in about 30 seconds · 0.4g chamber", "$49.95 entry level price point"],
      talkTrack: { say: "Have you tried a dry herb vaporizer? This heats it instead of burning it, so you taste the terpenes and flavor of the strain instead of the smoke." },
      objections: [
        { says: "Is $49.95 worth it?", say: "This has all the bells and whistles of a $100 device — temp control, ceramic chamber, built-in pick tool — for $50." },
        { says: "I've never used a dry herb vaporizer.", say: "It's simpler than you'd think — four steps. Grind, pack, hold to power on, double-tap to heat. That's it." },
      ],
    },
    videos: [
      { title: "How to Use: G Pen Dash II", thumb: LIFE + "dash-ii/104a7f0b4823caa9475f7a3b5f3d7cdbc33ac29136a00172c3a2fcba981894d1.jpg", vimeo: "1170864602" },
      { title: "How to Clean: Dash II", thumb: LIFE + "dash-ii/d3998c328bcc382ab553d2e0933e5e3db9ad263f3efd336d2aef5dad67d6e2d7.jpg", vimeo: "1170878031" },
    ],
    quiz: [
      { q: "A customer puts a half-ounce of flower on the counter. What is the strongest way to open?", choices: ["“Do you need a grinder to go with that?”", "“Have you tried a dry herb vaporizer?”", "“Can I show you what is on sale today?”", "“Are you a smoker, or more of an edibles person?”"], answer: 1, why: "Open with a question they can answer about what they are already buying. Leading with a product or a discount asks them to decide before they know why." },
      { q: "A flower customer picks up the Dash II and asks, “so is this basically like smoking it?”", choices: ["“Pretty much the same thing, only smoother on your throat”", "“Yes, the same idea, just electric instead of a lighter”", "“It heats the flower instead of burning it, so you taste the strain”", "“It is the healthier way to do it, which is why people switch”"], answer: 2, why: "Heating rather than burning is the whole product in one sentence, and it is a fact you are allowed to state. Throat comfort and health are claims the brand cannot make. And calling it the same as smoking throws away the only reason to buy it." },
      { q: "“Is $49.95 worth it?” What is the strongest answer?", choices: ["“It is on sale this week, so it works out cheaper”", "“It has the features of a $100 device for half that”", "“You will make the money back within a month or two”", "“It is the cheapest one we carry, so there is no risk”"], answer: 1, why: "Say what the money buys: temperature control, a ceramic chamber and a built-in tool are $100 features at $50." },
            { q: "“I have never used a dry herb vaporizer.” What closes them?", choices: ["Walk them through the temperature settings first", "Hand them the manual so nothing is a surprise", "Point them at the pricier one, it is more forgiving", "Tell them it is four steps, and name the four"], answer: 3, why: "Inexperience is fear of complexity, not a gap in information. Shrink the process — grind, pack, hold to power on, double-tap — rather than adding to it. A settings tour, a manual, or a step up in price all make a nervous buyer more nervous." },
      { q: "A customer says smoking makes them cough, and asks whether this would help with that.", choices: ["Explain that vapor leaves out the harsher parts of smoke", "Say it is gentler, because it heats instead of burning", "Decline the health question and steer back to flavor", "Suggest they run it on a lower temperature setting"], answer: 2, why: "Any comfort or health claim becomes the brand's problem, not just yours. You can say it heats instead of burns and that it tastes better. You cannot say it is safer, healthier, or easier on anyone's lungs — no matter how the question is phrased." },
      { q: "Someone is buying a gram of wax and a 510 cartridge. They ask if this handles both.", choices: ["Both are fine, as long as you use the loading tool", "The wax goes in, but the cartridge needs a battery", "The cartridge threads on, the wax has to go elsewhere", "Neither one — this is a dry herb vaporizer only"], answer: 3, why: "Selling a device into the wrong material is the fastest way to turn a sale into a return. Name the limit first, then route them — wax to the Melt, the cartridge to a 510 battery — and you keep the customer instead of the refund." },
      { q: "A customer worries the battery will die on them mid-session. What do you tell them?", choices: ["It charges over USB-C and works while plugged in", "The battery will last about a week between charges", "You can carry a spare battery and swap it over", "Charge it overnight and it will get through the day"], answer: 0, why: "Pass-through charging is the answer to that worry and it is on the spec sheet: it runs while it charges. Do not invent battery life figures, and do not promise a swap — the battery is not removable." },
      { q: "A customer asks what the chamber is made of and how much it holds.", choices: ["Ceramic, and it takes 0.4g of ground flower", "Titanium, and it takes 0.4g of ground flower", "Ceramic, and it takes about a gram of flower", "Stainless steel, and it holds half a gram"], answer: 0, why: "Ceramic at 0.4g, and both halves matter. Titanium is the Dash+, a different product at a different price, and over-stating the capacity gets found out the first time they pack it." }
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
    whatItIs: "A dry herb vaporizer, with conduction and convection heating.",
    differentiator: "Titanium chamber and hybrid heating. The step-up model.",
    minutes: 6, passPct: 80, msrp: "$99.95", accent: "#D75D43",
    cover: CDN + "dash__vape_thumb_5e14bcb4-a63a-4cc3-8078-e57fc572e4da.png?v=1729247649",
    heroImg: LIFE + "dash-plus/6743d30cc6b543bd2b0e37255049d0f7d5067a2a6f76dda6b10d5e03d762213f.jpg",
    heroSplit: true,
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
      "The Dash+ features <strong>hybrid convection and conduction</strong> heating in a full <strong>titanium chamber</strong>, capable of reaching vaporization temperatures in as little as 20 seconds. Dual clean-air intake channels and a magnetic mouthpiece with a spiral ceramic air path deliver superior vapor production and flavor.",
      "With an easy 3-button interface, full-color LED display, and haptic feedback in a durable zinc-alloy body — powered by a 1,800mAh USB-C battery — the Dash+ is the evolution in portable dry herb vaporization.",
    ],
    highlights: ["Hybrid convection + conduction heating", "Full titanium heating chamber, holds 0.4g", "Heats up in ~20 seconds", "1,800mAh battery, USB-C fast charging", "Full-color LED display", "Haptic feedback, 3-button interface", "Zinc-alloy body", "USB-C cable included"],
    specs: [
      { label: "Type", value: "Dry herb vaporizer (dry herb <strong>only</strong>)" },
      { label: "Heating", value: "Hybrid convection + conduction, full titanium chamber (0.4g)" },
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
      "<strong>Load:</strong> remove the mouthpiece, pack the titanium chamber with 0.4g of ground dry herb, and re-attach the mouthpiece.",
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
      /* Same shape as the Dash II: the trigger, one line to say, two objections a rep
         actually hears, and the compliance rule. No overview paragraph, no either/or close
         and no counter scenarios — everything that was restating something else on the page
         or sitting there unread. */
      keyFacts: ["Full titanium chamber, hybrid heating", "Heats in about 20 seconds \u00b7 color display", "$99.95 \u2014 the step up from the Dash II"],
      talkTrack: { say: "How much do you care about vapor production? This heats by convection and conduction in a titanium chamber, giving you better flavor and denser vapor." },
      objections: [
        { says: "Why is this double the cost of Dash II?", say: "The extra $50 buys the hybrid heating and titanium chamber. That is where the fuller flavor and denser vapor comes from." },
        { says: "It looks complicated.", say: "It's actually pretty simple. Three buttons. Load it, double-click, draw \u2014 and it buzzes when it is ready." },
      ],
    },
    videos: [
      { title: "How to Use: G Pen Dash+", thumb: LIFE + "dash-plus/affe3e09cd229d28ff4daa80404a4a76db423c0eaa0f956af5163391e122244e.jpg", vimeo: "843236157/221a4aa774" },
      { title: "How to Clean: G Pen Dash+", thumb: LIFE + "dash-plus/26deeb240b7db5f44cd9358b942aef8c94bb22f371a0a3221af4d23b2df5d7dc.jpg", vimeo: "989096678" },
    ],
    quiz: [
            { q: "“Why is this double the price of the Dash II?” What answers that best at the counter?", choices: ["It is newer, so the older model is being phased out", "It holds more flower, so a session lasts longer", "The battery is bigger, so it lasts a lot longer", "The extra $50 buys titanium and hybrid heating"], answer: 3, why: "Justify the gap with the mechanism behind the difference: a titanium chamber heated by convection and conduction together. Capacity is not the answer — both chambers hold 0.4g." },
      { q: "A customer asks how the Dash+ actually heats the flower.", choices: ["Convection and conduction together, in titanium", "Conduction only, straight off the chamber wall", "Convection only, hot air passing through it", "Induction, which is why it heats in 20 seconds"], answer: 0, why: "Hybrid heating is the product. Hot air moves through the load while the titanium chamber heats it from the wall, and that combination is what the extra money buys." },
            { q: "A customer buys a half-ounce of top-shelf flower and a Dash+. What else belongs in that basket?", choices: ["A Melt Hot Knife, for loading the chamber cleanly", "A Hydout, so they have a battery for cartridges", "A 510 Original, the cheapest battery on the wall", "A 3-Piece Grinder, because flower has to be ground"], answer: 3, why: "The Dash+ takes ground flower, so the grinder is the piece that finishes the sale. A hot knife is for concentrate and a 510 battery is for cartridges — neither belongs to a flower purchase." },
      { q: "A shopper says smoking makes her cough and asks whether the Dash+ will be easier on her chest.", choices: ["Say vapor is gentler because there is no combustion", "Explain that a lower temperature is easier on you", "Decline the health question and talk about flavor", "Tell her most people switch for exactly that reason"], answer: 2, why: "You can say it heats instead of burns and that it tastes better. You cannot say it is safer, healthier, or easier on anyone's lungs — no matter how the question is put to you." },
      { q: "Holding a gram of shatter, a customer asks whether the Dash+ can handle it.", choices: ["Yes, if they load it with the tool in the box", "Yes, but only on the lowest temperature setting", "No — this is dry herb only, so route them to the Melt", "No, but a concentrate insert is sold separately"], answer: 2, why: "Dry herb only. Naming the limit and routing them to the Melt keeps the customer; selling the device into concentrate turns the sale into a return." },
            { q: "A flower customer is weighing the Dash II against the Dash+. How do you present the choice?", choices: ["Ask their budget, then show only the tier that fits", "Ask which matters more: the price, or how it tastes", "Lead with the Dash+, it is the better vaporizer", "Start at $49.95 and mention the other if they object"], answer: 1, why: "Either answer is a sale, which is why a which-close beats a yes-or-no. Framing it as taste against price also lets the customer choose, rather than feeling sold up or priced out." }
    ],
  },

  /* ------------------------------------------------------- 3-PIECE GRINDER */
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
    tagline: "64mm (2.5\") aluminum grinder. No kief screen — nothing gets left behind.",
    /* What the object IS, in the plainest words available: the answer to "what
       is this thing and what is it for", shown at the top of the course above
       the price. Not marketing and not positioning — a rep who has never seen
       the category should be able to read one line and be right. */
    whatItIs: "Grinder with micro-rounded teeth gently breaks up flower instead of shredding it",
    differentiator: "The $19.95 add-on for any flower sale.",
    minutes: 6, passPct: 80, msrp: "$19.95", accent: "#5E8C61",
    /* Locally cut out, not a CDN render: every stashgrinder_* asset on the CDN and in
       the asset portal is a JPEG with a baked white background, and every other cover
       in this file is a transparent cut-out — a white square would sit inside the
       card's warm-grey media box. Keyed by flood-filling the background inward from
       the border, which is what preserves the enclosed white G on the lid (a plain
       near-white threshold punches a hole through the logo). Swap this for an official
       transparent render the moment marketing produces one. */
    cover: "assets/img/grinder-cover.png",
    heroImg: LIFE + "slim-3-piece-grinder/0fbb1f8d492eb9a3230da10082b02e5dbce938d37a055f7945e5ac7080e2dd90.jpg",
    heroSplit: true,
    packaging: {
      box: LIFE + "slim-3-piece-grinder/af9109ac9d7ac666346e4454bf5f71f02e4fccd6ab69228928184991885a9d10.jpg",
      pop: LIFE + "slim-3-piece-grinder/1d36eb3de3fe085fd7d75671701db97d24e1a7741e0af7488ba2d8d93d75dc29.jpg",
      inBox: ["3-Piece Grinder \u2014 64mm (2.5\") anodized aluminum"],
      /* Not a missing accessory but a design choice, and it belongs here anyway: this
         list exists for the things a customer expects and does not get, because those
         are what generate a return. A buyer who assumes a kief screen and finds none is
         exactly that case, and the course quiz already keys on it. */
      notIncluded: ["Kief screen"],
    },
    /* Chosen from the portal's "Packaging" folder, which now has eight grinder files.
       Matched to what every other product already uses so the six course pages stay
       consistent: the BOX is the three-quarter view (grinder-3-4_1, 640x640, same as
       every other box shot) and the POP is the straight-on front (grinder pop front 2,
       640x800, same as the Dash II and 510 POPs).
       Two candidates were rejected on purpose. "grinder pop" is an angled three-quarter
       shot of the display — a better photograph, but every other product pairs an
       angled box with a front-on POP, and matching that matters more than one nicer
       frame. "grinder pop front copy" is the same front view on a warm cream ground,
       which sat badly next to the neutral box shot beside it.
       Transparent variants exist for all of these and are not used: the portal serves
       them as flattened JPGs anyway, so the transparency buys nothing here.
       perDisplay is deliberately ABSENT — see the note in packagingHTML's caption. */
    productUrl: "",
    gallery: [
      { url: CDN + "stashgrinder_thumb_03.jpg", caption: "Three pieces: lid, grinding ring, catch cup" },
      { url: CDN + "stashgrinder_thumb_02.jpg", caption: "Lid off — teeth above, drop-through floor below" },
      { url: CDN + "stashgrinder_thumb_04.jpg", caption: "Micro-rounded teeth, and the magnet in the middle" },
      { url: LIFE + "slim-3-piece-grinder/a52401de4dd42ba77080be116de92aa4b9faed4bfebe6be94822bc3df8e0d0a8.jpg", caption: "The teeth up close \u2014 domed, not sharpened to a point" },
      { url: LIFE + "slim-3-piece-grinder/f0daf4e2325f2cd99f3fd9509d0f448f12b3edcd538aecad8807329dc3feb31a.jpg", caption: "Rounded teeth over drop-through holes, and no screen below" },
      { url: CDN + "stashgrinder_thumb_05.jpg", caption: "Patent No. 11690480, printed on the rim" },
      { url: CDN + "stashgrinder_thumb_01.jpg", caption: "Closed — lid seated flush" },
    ],
    description: [
      "Every great session starts with a better grind. The G&nbsp;Pen Slim 3-Piece Grinder is engineered with <strong>micro-rounded teeth</strong> that gently separate flower into a consistent grind, helping preserve the cannabinoids and terpenes that make each strain distinct.",
      "Unlike traditional sharp-tooth grinders, the rounded tooth geometry and smooth interior <strong>reduce friction and minimize buildup</strong>, keeping more of the flower where it belongs. The <strong>screenless</strong> 3-piece design keeps trichomes mixed into the ground material instead of separating them away, and the slim profile suits a pocket, a bag or everyday carry.",
      "Crafted from <strong>6063 aircraft-grade anodized aluminum</strong>, it delivers smooth rotation, lasting durability and precision performance. In independent testing by <strong>Orange Photonics</strong>, the micro-rounded tooth design showed the highest post-grind THC retention among the grinder styles tested.",
      "The consistent grind it produces is ideal for vaporization, so it pairs naturally with the <strong>G&nbsp;Pen Dash II</strong> and <strong>G&nbsp;Pen Dash+</strong> — an even, efficient pack, and more flavor out of every bowl.",
    ],
    highlights: ["3-piece, 64mm (2.5\")", "Patented micro-rounded teeth", "Highest post-grind THC retention in independent testing", "Screenless — trichomes stay in the grind", "Smooth interior reduces friction and buildup", "6063 aircraft-grade anodized aluminum", "Strong magnetic lid"],
    specs: [
      { label: "Type", value: "3-piece dry herb grinder (accessory — no battery, no heat)" },
      { label: "Size", value: "64mm (2.5\")" },
      { label: "Pieces", value: "Lid, grinding ring, catch cup" },
      { label: "Teeth", value: "Patented micro-rounded (Patent No. 11690480)" },
      { label: "Materials", value: "Precision-machined 6063 anodized aluminum" },
      { label: "Lid", value: "Strong magnetic closure" },
      { label: "Kief screen", value: "<strong>None</strong> — flower, trichomes and kief stay together" },
      { label: "Retail pack", value: "10-pack POP display (GPA-001-APSC)" },
    ],
    howToUse: [
      "<strong>Lift the lid off</strong> — it is magnetic, so it lifts away rather than unscrewing.",
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
      { q: "How big is it?", a: "64mm (2.5\") across — a full-size grinding surface in a slim body." },
      { q: "What is it made of?", a: "Precision-machined 6063 anodized aluminum." },
      { q: "What do the micro-rounded teeth do?", a: "They separate flower gently instead of shredding it, which is what gives the smoother, more consistent grind. The design is patented (No. 11690480)." },
      { q: "Does the lid stay on?", a: "Yes — it uses a strong magnetic closure, so it holds shut in a bag or a pocket." },
      { q: "Does it need charging?", a: "No. It is a fully mechanical accessory — no battery, no heat, nothing to charge." },
    ],
    howToSell: {
      upsellFrom: "Flower",
      /* Same four blocks as the Dash II and Dash+: trigger, one line to say, two objections,
         compliance. The overview paragraph, the product rationale, the either/or close, the
         common-mistake line and both counter scenarios are gone.
         The kief objection is kept deliberately. It was also the subject of the removed trap,
         and it is the one thing on this product that brings a customer back: no screen means
         no fourth chamber, and a buyer expecting one returns it. */
      keyFacts: ["Rounded teeth separate, they do not shred", "Highest THC retention in independent testing", "Screenless \u2014 trichomes stay in \u00b7 $19.95"],
      talkTrack: { say: "How are you breaking up your flower? Rounded teeth separate it instead of shredding it, so more stays in the grind \u2014 independent testing put this design highest for THC retention." },
      objections: [
        { says: "I already have a grinder.", say: "Most grinders use sharp teeth that shred it. These are rounded, so they separate the flower \u2014 independent testing put this design highest for THC retention." },
        { says: "Where does the kief go?", say: "It stays in your grind. There is no screen, so the trichomes go into the bowl with everything else instead of collecting in a chamber." },
      ],
    },
    videos: [
      /* The only clip supplied for the grinder. Vimeo titles it "Grinder Larry Horiztonal A"
         and it runs 14 seconds, so it is a brand loop rather than a how-to — named neutrally
         here rather than as a tutorial it is not. */
      { title: "G Pen 3-Piece Grinder", thumb: LIFE + "slim-3-piece-grinder/a8a0f52f0494bd3368b12fab45566d0d1fba32d773ecc3fa4129bff8250da72d.jpg", vimeo: "1212760378/75b863a6cb" },
    ],
    quiz: [
      { q: "A customer asks what makes this different from the grinder they already own.", choices: ["It has a much finer screen, so the kief separates better", "Micro-rounded teeth separate flower instead of shredding it", "It grinds faster, because the teeth are sharper than most", "The chambers are deeper, so it holds more in a single go"], answer: 1, why: "The rounded tooth geometry is the product. It parts the flower instead of tearing it, which is why independent testing put this design highest for post-grind THC retention among the styles tested." },
      { q: "A customer turns it over and asks where the kief goes.", choices: ["There is no screen — nothing gets separated out", "The bottom chamber collects it once the screen fills", "It sits under the teeth and you tap it out later", "A screen is included in the box if they want one"], answer: 0, why: "No kief screen, on purpose, and it has to be said as the feature it is: nothing is held back, so all of it goes in the bowl. A customer who expects a fourth chamber brings the grinder back." },
      { q: "“Twenty bucks for a grinder?” What do you lead with?", choices: ["It is on sale this week, so it works out cheaper", "The free ones break within a few months of use", "Machined aluminum, patented teeth, magnetic lid", "It catches your kief, so it pays for itself"], answer: 2, why: "Say what the money buys. Discounting teaches them to wait for a sale, durability claims about other brands are not yours to make, and kief is the one thing this grinder deliberately does not do." },
      { q: "What is the grinder made of, and what size is it?", choices: ["50mm, anodized aluminum with a steel grinding ring", "64mm, zinc alloy with an aluminum lid", "64mm, 7075 anodized aluminum with a steel ring", "64mm, precision-machined 6063 anodized aluminum"], answer: 3, why: "64mm of machined 6063 anodized aluminum — the same aircraft-grade family as the devices it feeds. The alloy number and the size are both things a customer weighing it in their hand will ask about." },
      { q: "A customer is buying flower and a Dash II. What completes that sale?", choices: ["The grinder, because a vaporizer needs an even grind", "A second Dash II, so they have one for travelling", "The Melt Hot Knife, for loading the chamber cleanly", "A Hydout, so they have a battery for cartridges"], answer: 0, why: "A dry herb vaporizer only performs as well as the grind: an even, loose pack is what lets air move through the load. That makes the grinder the piece that finishes a flower-and-vaporizer basket." },
      { q: "A customer asks whether the rounded teeth actually make any difference.", choices: ["It is a design choice, mostly about how it feels to turn", "Independent testing put it highest for THC retention", "It doubles what you get out of the same amount of flower", "It produces a finer grind than any sharp-tooth grinder"], answer: 1, why: "Orange Photonics tested several grinder styles and this one retained the most THC after grinding. That is a specific, testable claim, which is what makes it worth saying — do not stretch it into a yield promise or a claim about fineness, neither of which was tested." }
    ],
  },
  /* -------------------------------------------------------- MELT HOT KNIFE */
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
    minutes: 9, passPct: 80, msrp: "$24.95", accent: "#E8833A",
    cover: CDN + "Melt_thumbA.png?v=1772813232",
    heroImg: LIFE + "melt/36a00c4baa0a4b96dd224a762191ef5cbc67b80afeb954c54cf79e5c5c90f594.jpg",
    heroSplit: true,
    packaging: {
      box: LIFE + "melt/a831957ad756e42f0d8b13053463f621777b42649d01b141e0b3e9ede7c3417a.jpg",
      pop: LIFE + "melt/628e9f284fb810bfa05a760c85834f37860f0b0a153fa722d0be65289bf9df26.jpg",
      perDisplay: "20",
      inBox: ["G Pen Melt Hot Knife", "Protective travel cap"],
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
      "Designed for <strong>zero-mess</strong> scooping and smooth, controlled drops, its rapid-heat ceramic tip warms up instantly for perfect transfers every time. No sticky tools, no wasted reclaim, no fumbling.",
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
      { q: "What is the G Pen Melt?", a: "Grenco Science's smallest electric hot knife — built for clean, mess-free dab prep. It heats fast and drops concentrates smoothly." },
      { q: "What is it compatible with?", a: "The Micro+, Connect, Hyer, traditional bangers, e-rigs and e-nails — it works with any concentrate you'd normally load by hand." },
      { q: "Does it have adjustable heat settings?", a: "No — it uses a precisely tuned heating element optimized for smooth, controlled melting without burning." },
      { q: "Can I use it while charging?", a: "Yes — USB-C pass-through lets you use it while it's plugged in. A USB-C cable is not included." },
      { q: "Is it travel-friendly?", a: "Yes — it's tiny, it only powers on after 5 button presses so it won't fire in a bag, and it comes with a protective travel cap." },
      { q: "What's the warranty?", a: "A 90-day limited warranty covering the electronics (physical damage not covered)." },
    ],
    howToSell: {
      upsellFrom: "Dabs / concentrate",
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
      { title: "How to Use: G Pen Melt", thumb: LIFE + "melt/a856f7a351d9b1451fdda2922f32016d138d9a0523890ad39e2e288ea16e0a2a.jpg", vimeo: "1208556908/162aaa2dfa" },
      { title: "How to Clean: G Pen Melt", thumb: LIFE + "melt/8c42edc1a83f93335746bd5c1c61f4b707d231f6d04779917e05cce55397f303.jpg", vimeo: "1208557447/7d62827d9d" },
    ],
    quiz: [
      { q: "A customer says \"I've already got a dab tool.\" What is the strongest response?", choices: ["The cold tool is the problem; heat lets the dab release clean", "Yours will wear out eventually, so a backup is worth having around", "This one is electric instead of manual, so it is the premium pick", "This one is smaller and easier to carry in a pocket every day"], answer: 0, why: "Comparing features against a tool they already own turns into a price argument you lose. Name the problem they live with instead — a cold tool is what causes the stringing and the reclaim left behind." },
      { q: "\"$24.95 for a dab tool?\" You justify the value, then attach one more item. Which one does this customer actually need?", choices: ["Nothing — close it at sticker price", "A USB-C charging cable", "A second protective travel cap", "Isopropyl swabs for the ceramic tip"], answer: 1, why: "Before any accessory leaves the counter, check what the box does not include. The Melt ships with the device and its cap only, so without a cable the customer gets home to something they cannot power up." },
      { q: "A regular brings his Melt back with visible buildup around the ceramic tip. He has never cleaned it and asks how to deal with it. What do you walk him through?", choices: ["Soaking the whole device in isopropyl alcohol overnight", "Rinsing the tip under warm running water after each use", "Wiping the tip with an isopropyl-soaked swab while it is still warm", "Scraping the buildup off the tip with a metal pick"], answer: 2, why: "The Melt is a sealed electronic tool, not a piece of glass, so heat does the work: residue lifts off with alcohol while the tip is still warm. Liquid getting inside or metal against the ceramic is physical damage, which the 90-day electronics-only warranty does not cover." },
      { q: "Mid-demo the Melt stops putting out heat while the customer is still scooping, and he says it seems defective. What do you tell him?", choices: ["He powered it on wrong — the button has to be pressed five times to arm it", "The ten-minute auto shutoff kicked in and the device has to be restarted", "The battery is low and it needs a full charge before it will hold heat", "That is normal — it heats up to five seconds per press, so press and hold again"], answer: 3, why: "The Melt has one button and no variable heat, so the short capped cycle is deliberate — you re-press for each scoop rather than holding a constant temperature. Explaining intended behavior calmly is what stops a return before it starts." },
      { q: "\"Can I turn the temperature down for my terp sauce?\" What is accurate?", choices: ["Yes, but only while it is plugged in over USB-C", "No, it runs one tuned heat setting with no adjustment", "No, but a longer press pushes the tip hotter", "Yes, one button cycles through three heat levels"], answer: 1, why: "Fixed heat is a positioning point, not a shortfall: the element is tuned for controlled melting. Inventing settings a device does not have guarantees a disappointed customer at home." },
      { q: "A customer at the counter presses the Melt and the LED blinks eight times. What do you tell them?", choices: ["It is a low-battery signal, and pass-through means it works while plugged in", "Nothing is wrong, the blink is just the ten-minute shutoff warning", "Let it charge first, the tip will not reach temperature on a low battery", "That blink pattern means a fault, so swap it for another unit"], answer: 0, why: "An eight-blink LED is a status signal, not a malfunction, and the Melt draws through the USB-C port rather than only from the cell. Charge level never has to gate a demo or a sale on a pass-through device." },
      { q: "A customer asks what the Melt's warranty actually covers before they buy. Accurate answer?", choices: ["Ninety-day limited coverage on the electronics and on accidental damage", "One-year limited coverage on the electronics; physical damage is excluded", "No coverage at all; concentrate tools go out as final sale", "Ninety-day limited coverage on the electronics; physical damage is excluded"], answer: 3, why: "Whatever you say at the counter is the promise the store has to honor later. Naming the exclusion up front is what keeps a limited electronics warranty from being heard as a free replacement policy." },
      { q: "A customer with an e-rig at home is holding a gram of rosin and says they are not sure the Melt is relevant to their setup. What do you tell them?", choices: ["They are already covered on concentrate, so steer them to a Dash+ instead", "It is built for traditional glass rigs and quartz bangers only", "It works with anything you would otherwise load by hand, e-rigs included", "It pairs specifically with G Pen devices like the Micro+ and Hyer"], answer: 2, why: "The Melt is defined by the job it does, getting concentrate out of the jar and into something, not by the device on the other end. Sell the job and it attaches to every concentrate sale in the store." },
      { q: "A customer buying wax mentions that torch smoke bothers him and asks whether this is easier on his lungs. What do you do?", choices: ["Suggest it as a lower-risk option for anyone sensitive to smoke", "Confirm it is gentler, since the tip runs far cooler than a torch", "Say it is not a health product and steer back to clean, mess-free loading", "Explain that the ceramic tip avoids the byproducts a butane flame creates"], answer: 2, why: "A true spec does not license a health conclusion — the tip really is cooler than a flame, but turning that into gentler or lower risk is a claim no rep can make for the brand. Decline the health question and sell what the tool actually does: get the concentrate out of the jar and into the rig without the sticky mess." },
      { q: "An eighth of flower and a lighter are on the counter, and the customer asks what would make this better. Which G Pen do you attach?", choices: ["The 510 Original", "The Hydout", "The Melt Hot Knife", "The Dash II"], answer: 3, why: "Attach to the material in the bag, not to whatever is cheapest to add on. The Melt is a concentrate loading tool and does nothing for loose flower — flower buyers pair with a dry-herb vape." },
      { q: "A gram of live resin and a quartz banger are on the counter together. What attaches?", choices: ["A 3-Piece Grinder at $19.95, they will need to break it up", "The Melt Hot Knife at $24.95, to load the banger cleanly", "A Dash II at $49.95, so they are covered for flower as well", "A Hydout at $24.95, because concentrate still needs a battery"], answer: 1, why: "They have already solved how to heat it. What is unsolved is getting concentrate off the tool and into the banger without dragging half of it back out, and that is the one job this does. A grinder is for flower and a 510 battery is for cartridges — neither belongs to a rig sale." },
      { q: "A customer with a quartz banger asks, \"so with this I can ditch the torch?\"", choices: ["Yes, it heats electrically, so the torch is done with", "Only if you are running low-temp dabs, under 302°F", "Not for the banger. It loads the dab; you still heat the glass", "Not for the dab itself, only to warm the banger through a little first"], answer: 2, why: "This one sentence decides whether the Melt stays sold. The tip runs about 150°C, which is for handling concentrate, not for heating glass — it replaces the cold dab tool, never the heat source. And 302°F is the tip's own temperature, not a dab temperature: a banger runs hundreds of degrees hotter, so there is no setting at which this becomes the heat source. Over-promise and it is back at the counter within a week." }
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
    minutes: 9, passPct: 80, msrp: "$24.95", accent: "#7E8AA2",
    cover: CDN + "Hydout_vape_01.png?v=1762467078",
    heroImg: LIFE + "hydout/64110ae4840bd115e2d36096765440b068af3225e2896ae80b51f2d4ec6b3d75.jpg",
    heroSplit: true,
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
      { title: "How to Use: G Pen Hydout", thumb: LIFE + "hydout/5f15ce2c04041ca331f87bc6b421339df199542a8bbf003b75522456d8f3712b.jpg", vimeo: "1105930986/af9928a9e8" },
      { title: "How to Clean: G Pen Hydout", thumb: LIFE + "hydout/0dd6886b1f0ce220b40b6216f9626174c0826e6c1057d0c0d7314404895a5579.jpg", vimeo: "1105958727" },
    ],
    quiz: [
      { q: "A customer buying a 2g distillate cart mentions they mostly vape on their lunch break behind the shop where they work. Which battery do you put in their hand?", choices: ["The Hydout, since the mouthpiece hides inside for pocket carry", "The 510 Original, since it is the cheapest way to run the cart", "The 510 Original, since a 2g cart is too big for the Hydout", "Either one, since the two batteries only differ on price"], answer: 0, why: "Both batteries fit most 510 carts up to 2g, so price is not what decides it — the customer's context is. When someone volunteers where they vape, discretion is the feature that closes the sale." },
      { q: "A customer with a cart in hand is looking at both batteries on the shelf. \"Why would I pay double for that when the cheap one is right there?\" What do you lead with?", choices: ["The cheap one tends to burn carts out over time", "Discretion, plus five voltage settings instead of three", "It is a stronger battery so the cart lasts longer", "It is only twelve dollars more, basically the same price"], answer: 1, why: "Answer a price objection with what the extra money buys, never with the money itself — discounting the gap teaches them the product is not worth it. Both batteries are 400mAh, so runtime claims or knocking the cheaper one are things you cannot back up." },
      { q: "A regular complains that their thick distillate cart takes forever to pull and sometimes gives nothing. What do you show them on the device?", choices: ["Hold the button longer on every draw", "Screw the cartridge down noticeably tighter", "Double-click for the ten-second warm-up", "Drop the voltage to the lowest setting"], answer: 2, why: "A sluggish thick cart is cold oil that will not flow, not a weak battery. The Hydout has a dedicated low-voltage warm cycle for exactly that moment; the other moves change how hard they pull or how tight the cart sits, neither of which is the actual variable." },
      { q: "A customer asks whether the Hydout filters the vapor through water the way a bong does. What do you tell them?", choices: ["Yes, a small water reservoir sits under the magnetic mouthpiece cover", "Only in preheat mode, which routes the vapor through a water path first", "Yes, that is the point of the concealed mouthpiece chamber", "No water at all, it is a 510 cart battery and the name means staying low-key"], answer: 3, why: "The Hydout is a straight 510 cartridge battery; its upgrades are concealment, five voltages and preheat. Confirming a feature the spec sheet does not list is how a sale becomes a return, so correct the assumption and sell what the device actually does." },
      { q: "A customer returns a month later saying their battery just stopped hitting. It is charged, powered on, and the fresh cart is screwed all the way down. What do you do?", choices: ["Process it as a warranty claim and hand them a new one", "Power it off and swab the threads and contacts with alcohol", "Soak the threaded end in alcohol to break up the buildup", "Give the connection a quick rinse and let it dry overnight"], answer: 1, why: "Once charge and connection are ruled out, oil residue on the contact point is the usual culprit and it mimics a dead cell exactly. Clean it dry with a swab, because the battery is a sealed electronic, not a washable part." },
      { q: "A customer holds up an oversized ceramic-tip cart from another brand and asks if it will work on this. What do you tell them?", choices: ["It fits most standard 510 carts up to 2g", "It only threads on carts up to 1g reliably", "Ceramic tips sit too high, so metal tips only", "Any cart with a 510 thread — there is no size limit"], answer: 0, why: "The only limits that matter on a 510 battery are the thread standard and the size ceiling — not the brand on the box or whether the tip is ceramic or metal. Nearly every cart on a shelf falls inside that, so the honest answer is usually yes." },
      { q: "You are bagging up a Hydout. What does the customer still need that the box does not include?", choices: ["Just a 510 cartridge, the cable is included", "Just a USB-C cable, a starter cart is included", "Nothing else, the box has cart and cable", "Both a 510 cartridge and a USB-C cable"], answer: 3, why: "The box is the battery and its magnetic cover, nothing more. Confirming what is missing before a customer leaves is what keeps the first session from failing, and it is a natural second attach." },
      { q: "\"I have got an old battery in a drawer somewhere, I will just use that.\" Best response?", choices: ["A used battery voids the warranty on any cart you buy in here", "Fair enough, come back and see us if it does not work out", "That may work — the Hydout just adds five voltages and hides the cart", "Old batteries always leak and will ruin that cartridge pretty fast"], answer: 2, why: "Never argue with a claim you cannot disprove, and never invent one to win — a scare line a customer later finds out was false costs you every future sale. Concede the point, then reframe on what the upgrade actually adds." },
      { q: "Mid-sale a customer asks if switching to this from smoking will be easier on their chest. What do you say?", choices: ["There is no combustion, so nothing harsh reaches your lungs", "Stick to the lower voltages and you will be totally fine", "I cannot speak to health, but I can show you the voltage settings", "It is definitely gentler, that is why most people switch over"], answer: 2, why: "Health questions are outside a rep's lane no matter what the customer is buying, and the Hydout data supports discretion and voltage control only. Decline the health frame and move back to how the device performs." },
      { q: "A customer is deciding between the two 510 batteries and asks what they actually get for the extra money in heat control.", choices: ["Ten voltage steps instead of three, plus a hotter preheat", "A temperature dial in degrees rather than fixed steps", "Double the wattage at every one of the settings", "Five voltage steps instead of three, plus the same preheat"], answer: 3, why: "The real difference is more steps and a lower floor — 2.4V against 3.2V — not finer steps or a different class of control. Both share the preheat, so overstating the gap sets up a disappointed customer." },
      { q: "A shopper picks up the Hydout, looks at the price tag, and says nothing. What is the strongest opening line?", choices: ["The whole mouthpiece tucks inside, so it just disappears in a pocket", "It is only twenty-five, barely more than the basic battery over here", "This is our best-selling cart battery on the wall right now", "It has a bright display so you can always see your battery level"], answer: 0, why: "Whoever names price first sets what the conversation is about. Open on the thing the cheap battery cannot do and price lands as fair; open on price and you have invited them to just take the cheaper one." },
      { q: "A customer texts that their new battery \"keeps turning itself off\" between hits. What is going on?", choices: ["It overheats on higher voltages and cuts out until it cools", "It shuts itself off after two minutes of sitting idle", "Holding the button too long trips a safety cutoff mid-draw", "The battery is defective and should be swapped out today"], answer: 1, why: "Before treating a device as defective, rule out normal designed behavior — an idle timeout is a standard battery safety feature, and knowing it turns a would-be return into a ten-second answer." }
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
    minutes: 9, passPct: 80, msrp: "$12.95", accent: "#A9A296",
    cover: CDN + "510_on_white_01.png?v=1767045174",
    heroImg: LIFE + "510-original/fee78eb478029ce3fda7a2a847d8021905b47e0ce6e3710333b608a1258cc9ce.jpg",
    heroSplit: true,
    packaging: {
      box: LIFE + "510-original/70b73f25507013009c2fad970c5725efb2bff1e0cf615335f82ca988f6798ff0.jpg",
      pop: LIFE + "510-original/97c99ee846af2e0ff3833804d029f130dec0f2af58cd246443fa8a5494b48f55.jpg",
      perDisplay: "20",
      inBox: ["G Pen 510 Original battery"],
      notIncluded: ["USB-C charging cable", "510 cartridge"],
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
      "Designed with <strong>breath activation</strong>, the 510 Original makes sessions effortless — just inhale and go. The single-button interface cycles three preset voltages (3.2 / 3.6 / 3.8V) and a 1.8V 10-second preheat, all shown on a digital display. At just <strong>$12.95</strong>, it's also the most affordable G Pen battery ever.",
    ],
    highlights: ["Smallest G Pen battery ever", "Breath activation — just inhale and go", "Three preset voltages (3.2 / 3.6 / 3.8V)", "1.8V 10-second preheat mode", "400mAh battery", "USB-C pass-through charging", "Digital display", "10-minute auto shut-off"],
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
      { q: "What does preheat do?", a: "Pressing the button twice starts a 10-second 1.8V preheat to warm thicker oils and improve flow." },
      { q: "How do I read the charging display?", a: "While charging, the battery bars blink; once fully charged, the bars stay solid." },
      { q: "Is it good for beginners?", a: "Yes — simple controls, breath activation, and a clear digital display make it ideal for new and experienced users." },
    ],
    howToSell: {
      upsellFrom: "510 cartridge",
      vital: "A cartridge does not work without a battery. This is the lowest-priced way to make the cartridge they are already buying usable.",
      aov: "At $12.95 this is the simplest attach in the store, because the need is absolute: no customer should leave with a cartridge and no way to use it.",
      keyFacts: ["Smallest G Pen battery — $12.95", "Draw-activated: no button needed", "Fits most standard 510 cartridges"],
      talkTrack: { say: "That cartridge needs a battery. Do you have one? This is $12.95, draw-activated, and fits most standard cartridges. No buttons." },
      whichClose: "The 510 Original at $12.95, or the Hydout at $24.95 with five voltage settings?",
      scenarios: [
        { sees: "A first-timer buying their very first cart", say: "First cartridge? Then you need a battery. This is the simplest one: thread the cartridge on and draw. No buttons to learn. $12.95, and it fits whichever cartridge you buy next." },
        { sees: "Buying two or three carts at once", say: "You are buying several cartridges. Do you have a battery? This is $12.95 and works with all of them. One battery that works, and it will run whichever cart you buy next." },
      ],
      trap: "Do not ask whether they need a battery, because that invites a no. Ask whether they already have one.",
      objections: [
        { says: "I have an old battery at home.", say: "If it still works, good. This one is $12.95 and is built for the thread on the cartridge you just bought.", why: "Concede, then reframe on fit and price. Never claim a mismatched battery runs a cart too hot — that is an unproven safety claim the brand cannot make." },
        { says: "Do I really need it?", say: "You need a battery to use the cartridge. The 510 Original at $12.95, or the Hydout at $24.95?", why: "Offer the choice rather than a yes or no question." },
        { says: "What is the difference from the Hydout?", say: "Price and features. This is the small, simple one at $12.95. The Hydout stores its mouthpiece inside and has five voltage settings, at $24.95. Both fit your cartridge.", why: "State both prices and the two real differences. Let the customer choose rather than choosing for them." },
      ],
    },
    videos: [
      { title: "How to Use: G Pen 510 Original", thumb: LIFE + "510-original/7f3879a1dddf6f4c5c8dca1404cb9a67a4fb43c8ffda183ba69d311c5f3db50a.jpg", vimeo: "1149053260" },
      { title: "How to Clean: G Pen 510 Original", thumb: LIFE + "510-original/b9aef761b21b9e90b3a5055b0faac40424242203669762451ada8b51d0541069.jpg", vimeo: "1198848006" },
    ],
    quiz: [
      { q: "A customer sets a single 510 cart on the counter and it is clearly their first one. What is the strongest opening?", choices: ["You got a battery for that cart?", "Do you need a battery to go with that?", "Let me know if you need anything else.", "Want to see our dry herb vapes too?"], answer: 0, why: "Assume the need instead of asking permission. A yes or no question invites a no, so presume the battery and keep the sale moving." },
      { q: "A customer buying a cart waves you off: \"I've got an old battery at home.\" What's the right reply?", choices: ["Honestly, old batteries aren't safe. You should replace it today.", "If it still hits, great — this one is $12.95 and is built for the thread on that cart.", "Ours is stronger and will hit that cart a lot harder than yours.", "Fair enough — hang onto it and come back if it quits on you."], answer: 1, why: "Concede the point you cannot disprove, then reframe on something true — fit and price. Do not reach for a risk claim to win the sale." },
      { q: "A customer buying a cart shrugs and asks if they really need a battery. What is the strongest reply?", choices: ["Honestly it is up to you, but most people grab one.", "Only if you do not have one that still works at home?", "You need something to hit it with, this one or the Hydout?", "Yes, a cart will not fire at all without a battery."], answer: 2, why: "A yes or no question invites a no. Reframing it as a choice between two batteries moves the customer from deciding whether to buy to deciding which one to buy." },
      { q: "A customer picks up an eighth of flower and has no device on them yet. What do you put in their hand?", choices: ["The 510 Original battery", "The Hydout battery", "The Melt Hot Knife", "The Dash II or Dash+"], answer: 3, why: "A 510 battery only powers a threaded oil cartridge, and the Melt only handles concentrate — neither one heats flower at all. Always match the device to the material the customer is actually buying." },
      { q: "A regular is buying a 510 Original for their carts and mentions they also picked up a gram of wax. What do you add and how do you frame it?", choices: ["Skip it, and say the 10-second preheat is the setting made for thicker wax", "Add the Melt, and say its heated tip drops the wax in clean instead of stringing", "Add the Melt, and say it means they can finally leave the torch at home for good", "Skip it, and say the 510 Original will handle the wax fine on its 3.8V setting"], answer: 1, why: "A 510 battery only fires 510-thread cartridges, so concentrate always needs its own heated loading tool. The Melt gets wax out of the jar cleanly at around 150°C / 302°F, but the customer still heats their banger however they normally do." },
      { q: "A customer comparing the 510 Original and the Hydout guesses the Hydout runs vapor through water. What do you tell them?", choices: ["No, it is a 510 battery with a concealed mouthpiece.", "Yes, the magnetic cover holds a small reservoir.", "No, but preheat mode adds moisture to the draw.", "Yes, it has a small internal water chamber."], answer: 0, why: "When a customer hands you a feature the device does not have, correct it and pivot to what it does have — here, concealment, five voltages and preheat for thick oil. Confirming an invented feature is how a return gets started." },
      { q: "A shopper says they are moving to carts because they think it is easier on their chest. Best move?", choices: ["Agree that vapor is gentler than smoking.", "Confirm it and steer them to the lowest voltage.", "Say it depends on which oil they end up buying.", "Skip the health question and talk flavor and control."], answer: 3, why: "Reps never make or confirm health claims about any device. Redirect to what you can honestly sell, which is flavor, control, and convenience." },
      { q: "A regular comes back a week later saying the battery just stopped hitting. Where do you start?", choices: ["Tell him the voltage is too low and to run 3.8V.", "Tell him the cartridge is empty and sell a new one.", "Check the 510 connection point for oil buildup.", "Call it defective and start a warranty exchange."], answer: 2, why: "A battery that quits is usually a contact problem, not a dead device — oil creeps onto the 510 connection and breaks the circuit. Rule that out first with a lightly dampened isopropyl swab, and never soak the battery." },
      { q: "Midwinter, a customer says the oil barely moves on their first pull. What do you show them?", choices: ["Bump it to the highest 3.8V setting instead.", "Screw the cartridge down tighter for better contact.", "Double-click for the ten-second 1.8V preheat mode.", "Take a few long back-to-back draws to warm it up."], answer: 2, why: "Cold oil is a flow problem, not a power problem, so the fix is warming it before the draw. Cranking voltage or pulling harder just works a cart that has not started moving yet, and over-tightening is the one thing the manual warns against." },
      { q: "A customer buys the 510 Original on its own. What do you tell them before they leave?", choices: ["It includes a USB-C cable, but the cartridge is separate.", "It includes a cartridge, but the USB-C cable is separate.", "It comes with a cartridge pre-installed and ready to go.", "It is just the battery; the cartridge and cable are separate."], answer: 3, why: "Anything not named on the box becomes a second trip or a return. Say what is missing at the counter and it turns into an attach instead of a complaint." },
      { q: "A customer buys their first cart and a 510 Original together. Which ten-second demo at the counter heads off the most likely day-one problem?", choices: ["Screw the cart on until it is snug, then stop.", "Crank the cart down tight so it cannot work loose.", "Run a full charge cycle before the first draw.", "Press and hold the button on every single inhale."], answer: 0, why: "Over-tightening damages the connection point, and it is the one failure a rep can prevent before the customer leaves. The other three are preferences, not problems." },
      
      { q: "A customer asks how the 510 Original works. What is the shortest complete answer?", choices: ["Click it five times, then hold the button down while it heats up", "Set the voltage you want first, then hold the button and draw", "Five clicks to turn it on, thread the cart, then just breathe in", "Double-click it to preheat, wait for the light, and then draw"], answer: 2, why: "Draw activation is the entire reason this is the beginner battery: once it is on, it works before you have learned anything else about it. But it does have to be turned on, so an answer that leaves out the five clicks sends the customer home to a device that seems dead. The button and the three voltage presets exist for people who want them — leading with either turns the simplest battery on the wall into one with a manual." }
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
