/* =============================================================================
   G PEN TRAINING — ESPAÑOL (es)

   MACHINE TRANSLATED, PENDING NATIVE REVIEW. The portal says so on every page.

   HOW THIS FILE WORKS
   `strings` is an English -> Spanish map. The English sentence in app.js IS the
   lookup key, so nothing here can drift out of sync with a key name: a key that no
   longer exists in the app is simply unused, and a string the app asks for that is
   missing here renders in English wrapped in <span lang="en"> so a screen reader
   switches voice for it.

   RULES FOR EDITORS
   - Keep every {placeholder} exactly as written. They are substituted at render
     time and may be MOVED within the sentence to suit Spanish word order.
   - Keep HTML tags (<b>, <strong>) and entities (&middot;, &nbsp;) intact.
   - Never translate: product names (Dash II, Dash+, Melt, Hydout, 510 Original),
     prices, discount codes, "G Pen", "Grenco Science", or "MSRP".
   - Quiz questions, choices and explanations are NOT here and must not be added.
     A quiz item is scored by an integer index into its choices; translating or
     reordering them fails a rep who answered correctly.
   - The 21+ eligibility attestation is NOT here either. It is a legal statement
     and stays in English until a qualified translation is signed off per market.
   ========================================================================== */
window.GPEN_I18N = {
  lang: "es",
  strings: {
    /* ---- notice + chrome ---- */
    "Machine translated and pending review. Quiz questions stay in English.": "Traducción automática pendiente de revisión. Las preguntas del examen permanecen en inglés.",
    "Skip to content": "Ir al contenido",
    "This device changed hands": "Este dispositivo cambió de manos",
    "This quiz was started by {who}, but {now} is signed in now. It has not been scored, so nobody is certified for someone else's answers.": "Este examen lo comenzó {who}, pero ahora ha iniciado sesión {now}. No se ha puntuado, de modo que nadie queda certificado por las respuestas de otra persona.",
    "{total} products &middot; about 8 minutes each &middot; earn up to <b>{pct}% off</b> at gpen.com": "{total} productos &middot; unos 8 minutos cada uno &middot; gane hasta un <b>{pct}% de descuento</b> en gpen.com",
    "Start with {product}": "Empiece con {product}",
    "Continue with {product}": "Continúe con {product}",
    "{done} of {total} certified": "{done} de {total} certificados",
    "Go to the quiz": "Ir al examen",
    "Pick up where you left off": "Continúe donde lo dejó",
    "You answered {n} of {total} questions. Your answers are saved on this device.": "Respondió {n} de {total} preguntas. Sus respuestas están guardadas en este dispositivo.",
    "Continue from question {i}": "Continuar desde la pregunta {i}",
    "Start the quiz over": "Comenzar el examen de nuevo",
    "est. 2012": "desde 2012",
    "Products": "Productos",
    "Explore the Product Lineup": "Explore la gama de productos",
    "About": "Acerca de",
    "About G Pen": "Acerca de G Pen",
    "Shop gpen.com": "Comprar en gpen.com",
    "Privacy": "Privacidad",
    /* The footer compliance line, from config.js footerNote. */
    "for authorized G Pen retail partners, 21+ — training and hardware education only. No cannabis, nicotine or e-liquid products are sold or shipped through this site.": "para socios minoristas autorizados de G Pen, mayores de 21 años — únicamente formación y educación sobre hardware. A través de este sitio no se venden ni se envían productos de cannabis, nicotina ni e-líquidos.",
    "Program and press:": "Programa y prensa:",
    "for authorized G Pen retail partners.": "para socios minoristas autorizados de G Pen.",
    "Reset my progress and start over": "Borrar mi progreso y empezar de nuevo",
    "This page didn't load completely.": "Esta página no se cargó por completo.",
    "Check your connection and reload. Your progress and certificates are safe.": "Compruebe su conexión y vuelva a cargar. Su progreso y sus certificados están a salvo.",
    "Reload": "Volver a cargar",
    "Progress cleared.": "Progreso borrado.",
    "Close": "Cerrar",

    /* ---- home masthead ---- */
    "Product training": "Formación de producto",
    "Training complete &middot; {total} of {total}": "Formación completada &middot; {total} de {total}",
    "All products complete.": "Todos los productos completados.",
    "Your discount code is below. Your certificate is on record.": "Su código de descuento aparece abajo. Su certificado está registrado.",
    "Copy code": "Copiar código",
    "View certificate": "Ver certificado",

    /* ---- home hero ---- */
    "Essentials for Every Session": "Lo esencial para cada sesión",
    "Turn every sale into an upsell with G Pen accessories designed for flower, concentrates, and 510 cartridges.": "Convierta cada venta en una venta adicional con los accesorios de G Pen, diseñados para flor, concentrados y cartuchos 510.",
    "A G Pen retail shelf: the countertop POP displays grouped into dry herb, concentrates and 510 batteries, each with its price flag.": "Una estantería de tienda G Pen: los expositores POP de mostrador agrupados en hierba seca, concentrados y baterías 510, cada uno con su etiqueta de precio.",

    /* ---- lineup ---- */
    "The better you know the lineup, the easier it is to recommend the right product for every customer.": "Cuanto mejor conozca la gama, más fácil le será recomendar el producto adecuado a cada cliente.",
    "Dry Herb Accessories": "Accesorios para hierba seca",
    "Vaporizers and accessories for flower": "Vaporizadores y accesorios para flor",
    "510 Batteries": "Baterías 510",
    "510-thread cartridge batteries": "Baterías para cartuchos de rosca 510",
    "Concentrate": "Concentrado",
    "Tools for wax, rosin and other concentrates": "Herramientas para wax, rosin y otros concentrados",
    "MSRP": "MSRP",
    "Certified {score}%": "Certificado {score}%",
    "Review": "Repasar",
    "Open": "Abrir",

    /* ---- reward ladder ---- */
    "Earn Exclusive Discounts": "Consiga descuentos exclusivos",
    "Complete product courses and quizzes to unlock bigger discounts on gpen.com": "Complete los cursos de producto y los exámenes para desbloquear descuentos mayores en gpen.com",
    "Rewards are for completing training. They are not tied to sales, orders, or product recommendations.": "Las recompensas son por completar la formación. No están vinculadas a ventas, pedidos ni recomendaciones de producto.",
    "1 more course to unlock": "1 curso más para desbloquear",
    "{n} more courses to unlock": "{n} cursos más para desbloquear",
    "Pass any 1 course": "Apruebe 1 curso cualquiera",
    "Pass any {n} courses": "Apruebe {n} cursos cualesquiera",
    "Unlocked": "Desbloqueado",
    "Next up": "Siguiente",
    "Locked": "Bloqueado",
    "Grand prize": "Gran premio",
    "Top discount": "Descuento máximo",
    "FREE G PEN": "G PEN GRATIS",
    "Certify all {total}": "Certifíquese en los {total}",
    "{pct}% off is yours either way.": "El {pct}% de descuento es suyo en cualquier caso.",
    "your best code on gpen.com, plus the master certificate.": "su mejor código en gpen.com, más el certificado general.",
    "Tap to copy": "Pulse para copiar",
    "View master certificate": "Ver certificado general",
    "Code copied — {code}": "Código copiado — {code}",

    /* ---- course page ---- */
    "All products": "Todos los productos",
    "Complete": "Completado",
    "{q} questions · {pct}% to pass · about {min} minutes": "{q} preguntas · {pct}% para aprobar · unos {min} minutos",
    "Key points": "Puntos clave",
    "About this product": "Acerca de este producto",
    "At the counter": "En el mostrador",
    "Videos": "Vídeos",
    "Video": "Vídeo",
    "Your certificate": "Su certificado",
    "Quiz": "Examen",
    "Product reference": "Referencia del producto",
    "Photos": "Fotos",
    "Full specifications": "Especificaciones completas",
    "How to use it": "Cómo usarlo",
    "How to clean it": "Cómo limpiarlo",
    "Common customer questions": "Preguntas frecuentes de clientes",
    "Video coming soon.": "Vídeo disponible próximamente.",
    "Video: {title}": "Vídeo: {title}",

    /* ---- battlecard ---- */
    /* The upsell trigger words. Short controlled vocabulary, uppercased at render. */
    "Flower": "Flor",
    "Dabs / concentrate": "Dabs / concentrado",
    "510 cartridge": "Cartucho 510",
    "Customer is buying <b>{what}</b>": "El cliente compra <b>{what}</b>",
    "Pair with": "Combínelo con",
    "Say this": "Diga esto",
    "Never a health claim.": "Nunca haga afirmaciones de salud.",
    "If a customer raises coughing, harshness, lungs, or any other health topic, do not diagnose it and do not say the product fixes it. Redirect to flavor and experience, or refer them to their doctor.": "Si un cliente menciona tos, aspereza, pulmones o cualquier otro tema de salud, no lo diagnostique ni diga que el producto lo soluciona. Redirija al sabor y la experiencia, o remítalo a su médico.",
    "Common mistake:": "Error habitual:",
    "More scripts and objections ({n})": "Más guiones y objeciones ({n})",
    "Counter scenarios": "Situaciones en el mostrador",
    "The either/or close": "El cierre de dos opciones",
    "When they hesitate": "Cuando duden",
    "They say": "Dicen",
    "You say": "Usted dice",
    "You see": "Usted ve",

    /* ---- packaging ---- */
    "Packaging": "Embalaje",
    "Retail box": "Caja de venta",
    "Retail POP display": "Expositor POP de tienda",
    "Ships in a retail-ready POP display, {n} units per display.": "Se sirve en un expositor POP listo para tienda, con {n} unidades por expositor.",
    "Ships in a retail-ready POP display.": "Se sirve en un expositor POP listo para tienda.",
    "not included": "no incluido",
    "View {label} full size": "Ver {label} a tamaño completo",
    "Image": "Imagen",

    /* ---- certify form ---- */
    "certified": "certificado",
    "You are a certified {product} Specialist": "Es especialista certificado en {product}",
    "Certificate earned {date}.": "Certificado obtenido el {date}.",
    "Your certificate and discount code are below. Retake the quiz at any time to improve your score.": "Su certificado y su código de descuento aparecen abajo. Puede repetir el examen en cualquier momento para mejorar su puntuación.",
    "Retake quiz": "Repetir examen",
    "Retake the quiz": "Repetir el examen",
    "Get certified": "Certifíquese",
    "Get certified and unlock {pct}% off": "Certifíquese y desbloquee un {pct}% de descuento",
    "Retake the {n}-question quiz (score {pct}%+) to refresh your score on your <strong>{product}</strong> certificate. Your discount code is unchanged.": "Repita el examen de {n} preguntas (con un {pct}% o más) para actualizar la puntuación de su certificado de <strong>{product}</strong>. Su código de descuento no cambia.",
    "Score {pct}%+ on the {n}-question quiz to earn your <strong>{product}</strong> Product Specialist certificate and a gpen.com discount code. Spell your name the way you want it printed on the certificate.": "Obtenga un {pct}% o más en el examen de {n} preguntas para conseguir su certificado de Especialista de Producto de <strong>{product}</strong> y un código de descuento para gpen.com. Escriba su nombre tal como quiere que aparezca en el certificado.",
    "Your full name": "Su nombre completo",
    "Jane Budtender": "María López",
    "Email address": "Correo electrónico",
    "Store name": "Nombre de la tienda",
    "Cloud 9 Smoke Shop": "Cloud 9 Smoke Shop",
    "Start the quiz": "Comenzar el examen",
    "Use your own phone.": "Use su propio teléfono.",
    "Progress and certificates save to this browser, so a shared tablet mixes staff together.": "El progreso y los certificados se guardan en este navegador, por lo que una tablet compartida mezcla al personal.",
    "Your name, email and store are recorded so G Pen can credit the completion to your shop, and may be sent to G Pen for that purpose.": "Su nombre, correo electrónico y tienda se registran para que G Pen pueda acreditar la formación a su tienda, y pueden enviarse a G Pen con ese fin.",
    "Enter your name for the certificate.": "Introduzca su nombre para el certificado.",
    "Enter a valid email address.": "Introduzca un correo electrónico válido.",
    "Enter your store name.": "Introduzca el nombre de su tienda.",
    "Confirm you are 21 or older and authorized retail staff.": "Confirme que tiene 21 años o más y que es personal minorista autorizado.",
    "someone else": "otra persona",
    "1 course certificate": "1 certificado de curso",
    "{n} course certificates": "{n} certificados de curso",
    "This device is signed in as {who}.": "Este dispositivo está registrado como {who}.",
    "Continuing as {name} will clear the progress saved on this device{lost}. This cannot be undone.": "Continuar como {name} borrará el progreso guardado en este dispositivo{lost}. Esta acción no se puede deshacer.",
    "including {lost}": "incluidos {lost}",
    "Continue as {name}?": "¿Continuar como {name}?",

    /* ---- quiz ---- */
    "Question {i} of {n}": "Pregunta {i} de {n}",
    "<b>{n}</b> correct": "<b>{n}</b> correctas",
    "Issuing your code…": "Emitiendo su código…",
    "Your code didn't come through": "Su código no llegó",
    "Your certificate is saved — nothing is lost. Try again, or contact us if it keeps failing.": "Su certificado está guardado; no se pierde nada. Vuelva a intentarlo o escríbanos si el problema continúa.",
    "Try again": "Intentar de nuevo",
    "Your certificate is on record.": "Su certificado está registrado.",
    "Your code didn't come through — reload this page to try again.": "Su código no llegó: vuelva a cargar esta página para intentarlo de nuevo.",
    "Your browser is blocking storage.": "Su navegador está bloqueando el almacenamiento.",
    "You can read the training, but progress and certificates will not be saved. Turn off private browsing or allow site data, then reload.": "Puede leer la formación, pero el progreso y los certificados no se guardarán. Desactive la navegación privada o permita los datos del sitio y vuelva a cargar.",
    "Correct answer": "Respuesta correcta",
    "Your answer": "Su respuesta",
    "Correct.": "Correcto.",
    "Incorrect.": "Incorrecto.",
    "Next question": "Siguiente pregunta",
    "See my results": "Ver mis resultados",
    "Answer": "Respuesta",
    "Worth another look &middot; {n} missed": "Para repasar &middot; {n} falladas",

    /* ---- results ---- */
    "{correct} of {n} correct": "{correct} de {n} correctas",
    "Not passed": "No aprobado",
    "You needed {pct}% to pass and were 1 question short.": "Necesitaba un {pct}% para aprobar y le faltó 1 pregunta.",
    "You needed {pct}% to pass and were {away} questions short.": "Necesitaba un {pct}% para aprobar y le faltaron {away} preguntas.",
    "Review the answers below, then try again.": "Repase las respuestas de abajo y vuelva a intentarlo.",
    "Passed": "Aprobado",
    "You are certified on the <strong>{product}</strong>.": "Está certificado en el <strong>{product}</strong>.",
    "This is your best score so far.": "Esta es su mejor puntuación hasta ahora.",
    "Your best score of {score}% remains on your certificate.": "Su mejor puntuación, un {score}%, se mantiene en su certificado.",
    "All products complete. Open your certificate and your <strong>{pct}% discount code</strong>.": "Todos los productos completados. Abra su certificado y su <strong>código de descuento del {pct}%</strong>.",
    "Next product: {product}": "Siguiente producto: {product}",
    "Back to all products": "Volver a todos los productos",

    /* ---- reward card ---- */
    "One code per product you certify on. Find each on that product's page — every code works on your whole order.": "Un código por cada producto en el que se certifique. Encuentre cada uno en la página del producto: todos los códigos se aplican a su pedido completo.",
    /* Tier labels, notes and terms — authored in config.js, shown on the reward card. */
    "25% off your next order at gpen.com": "25% de descuento en su próximo pedido en gpen.com",
    "30% off your next order at gpen.com": "30% de descuento en su próximo pedido en gpen.com",
    "35% off your entire order at gpen.com": "35% de descuento en todo su pedido en gpen.com",
    "40% off your entire order at gpen.com": "40% de descuento en todo su pedido en gpen.com",
    "Enter this code at checkout on gpen.com. It applies to the whole order.": "Introduzca este código al pagar en gpen.com. Se aplica a todo el pedido.",
    "One use per person. Not combinable with other offers. Expires 90 days after it is issued.": "Un uso por persona. No combinable con otras ofertas. Caduca 90 días después de su emisión.",
    "Top discount unlocked. Full lineup certified.": "Descuento máximo desbloqueado. Gama completa certificada.",
    "Reward unlocked": "Recompensa desbloqueada",
    "Earned by completing training. Not tied to sales, orders, or product recommendations.": "Obtenido por completar la formación. No está vinculado a ventas, pedidos ni recomendaciones de producto.",

    /* ---- certificate ---- */
    "Product Specialist Program": "Programa de Especialista de Producto",
    "Certificate of Completion": "Certificado de finalización",
    "This certifies that": "Se certifica que",
    "has completed the Product Specialist training and demonstrated expert product knowledge of the": "ha completado la formación de Especialista de Producto y ha demostrado un conocimiento experto del",
    "PRODUCT SPECIALIST": "ESPECIALISTA DE PRODUCTO",
    "Date Issued": "Fecha de emisión",
    "Authorized By": "Autorizado por",
    "Certificate ID": "ID del certificado",
    "Print certificate": "Imprimir certificado",
    "Download image": "Descargar imagen",
    "Email it": "Enviar por correo",
    "Full lineup certified": "Gama completa certificada",
    "Full Lineup Certified": "Gama completa certificada",
    "has completed every Product Specialist course and is recognized as a": "ha completado todos los cursos de Especialista de Producto y se le reconoce como",
    "Fully Trained G Pen Product Specialist": "Especialista de Producto de G Pen con formación completa",
    "{name}, you have completed every course in {program}. You are now a <strong>fully trained G Pen Product Specialist</strong>.": "{name}, ha completado todos los cursos de {program}. Ahora es un <strong>Especialista de Producto de G Pen con formación completa</strong>.",
    "We will email you if you are selected.": "Le escribiremos por correo electrónico si resulta seleccionado.",
    "Your <b>{pct}% off</b> code is available now, on every product in the lineup.": "Su código de <b>{pct}% de descuento</b> ya está disponible, para todos los productos de la gama.",
    "Copy your {pct}% code": "Copiar su código del {pct}%",

    /* ---- support band ---- */
    "Questions about a product?": "¿Preguntas sobre un producto?",
    "Talk to our team.": "Hable con nuestro equipo.",
    "Our team knows the hardware. Call or email when a customer is at the counter with a device that will not work, when you need a specification you cannot remember, or when you want the correct answer before you say it out loud.": "Nuestro equipo conoce el hardware. Llame o escriba cuando tenga un cliente en el mostrador con un dispositivo que no funciona, cuando necesite una especificación que no recuerda, o cuando quiera la respuesta correcta antes de decirla en voz alta.",

    /* ---- about ---- */
    "About the brand": "Acerca de la marca",
    "{years} years of leading the culture.": "{years} años a la cabeza de la cultura.",
    "Our story": "Nuestra historia",
    "Milestones": "Hitos",
    "Collaborations": "Colaboraciones",
    "G Pen has partnered with leading names in music and cannabis:": "G Pen ha colaborado con grandes nombres de la música y del cannabis:",
    "A global brand": "Una marca global",
    "Follow G Pen": "Siga a G Pen",
    "Back to my courses": "Volver a mis cursos",
    "Browse products": "Ver los productos",
  },

  /* Product reference. Only the keys named here are replaced; everything else on a
     course stays English and is marked as such in the page. Quiz items, product
     names, prices, photos and videos are refused by the merge in app.js. */
  courses: {
    "dash-ii": {
      whatItIs: "Un vaporizador de hierba seca, diseñado para vaporizar flor de cannabis molida.",
      packaging: {
        inBox: ["Vaporizador G Pen Dash II", "Herramienta de carga integrada", "Funda de silicona para la boquilla"],
        notIncluded: ["Cable de carga USB-C"],
      },
      category: "Vaporizador de hierba seca",
      tagline: "Vaporizador de hierba seca de bolsillo con control de temperatura.",
      differentiator: "El vaporizador de hierba seca de entrada. Fácil de usar.",
      description: [
        "La siguiente evolución de nuestro Dash más vendido: mejorado en todos los aspectos y ahora por solo $49.95.",
        "El G Pen Dash II es un <strong>vaporizador de hierba seca</strong> de bolsillo con control preciso de temperatura, pantalla OLED y una cámara de cerámica mejorada de 0,4 g diseñada para un mejor rendimiento y una carga más sencilla. Con una batería de 1.100 mAh de mayor duración, ofrece sesiones suaves y fiables, con un calentamiento de unos 30 segundos y carga USB-C pass-through.",
        "Más control. Carga más fácil. Mejor rendimiento.",
      ],
      highlights: [
        "Vaporizador de hierba seca de bolsillo",
        "Calentamiento en unos 30 segundos",
        "Control de temperatura ajustable y preciso",
        "Pantalla OLED",
        "Cámara de cerámica mejorada de 0,4 g",
        "Batería de 1.100 mAh",
        "Carga USB-C pass-through",
        "Herramienta de carga integrada",
      ],
      howToSell: {
        vital: "Un vaporizador calienta la flor molida en lugar de quemarla, lo que da un sabor más claro de la variedad. El Dash II es la forma más económica de empezar.",
        aov: "Cada venta de flor puede llevar un dispositivo de $49.95. Es el complemento de mayor valor disponible en una compra de flor, y hace que el cliente vuelva a por flor.",
        talkTrack: { say: "Ya que compra flor: esto la calienta en lugar de quemarla. Consigue más sesiones con la misma cantidad y un sabor más claro. $49.95, y cabe en un bolsillo." },
        whichClose: "Dos opciones para la flor: el Dash II a $49.95, o el Dash+ con cámara de titanio a $99.95. ¿Cuál prefiere?",
        trap: "Nunca lo describa como algo parecido a fumar. Diga que calienta la flor y no la quema.",
        keyFacts: [
          "Vaporizador de hierba seca de bolsillo",
          "Calienta en unos 30 segundos · cámara de 0,4 g",
          "$49.95 — el precio de entrada",
        ],
      },
    },
    "dash-plus": {
      whatItIs: "Un vaporizador de hierba seca, diseñado para vaporizar flor de cannabis molida.",
      packaging: {
        inBox: ["Vaporizador Dash+", "Funda de silicona para la boquilla", "Herramienta de carga con llavero", "Cable de carga USB-C"],
        notIncluded: [],
      },
      category: "Vaporizador de hierba seca",
      tagline: "Convección + conducción híbridas en una cámara de titanio completa.",
      differentiator: "Cámara de titanio y calentamiento híbrido. El modelo superior.",
      description: [
        "Grenco Science presenta la nueva generación de vaporizadores portátiles de hierba seca con el G Pen Dash+.",
        "El Dash+ combina calentamiento por <strong>convección y conducción híbridas</strong> en una <strong>cámara de titanio</strong> completa, capaz de alcanzar temperaturas de vaporización en tan solo 20 segundos. Los dos canales de entrada de aire limpio y una boquilla magnética con paso de aire de cerámica en espiral ofrecen una producción de vapor y un sabor superiores.",
        "Con una interfaz sencilla de 3 botones, pantalla LED en color y respuesta háptica en un cuerpo resistente de aleación de zinc, y con una batería USB-C de 1.800 mAh, el Dash+ es la evolución de la vaporización portátil de hierba seca.",
      ],
      highlights: [
        "Calentamiento híbrido por convección + conducción",
        "Cámara de calentamiento de titanio completa",
        "Calienta en unos 20 segundos",
        "Batería de 1.800 mAh, carga rápida USB-C",
        "Pantalla LED en color",
        "Respuesta háptica, interfaz de 3 botones",
        "Cuerpo de aleación de zinc",
        "Cable USB-C incluido",
      ],
      howToSell: {
        vital: "La cámara de titanio y el calentamiento híbrido dan más vapor y un sabor más completo que el Dash II. Es el modelo para el cliente que compra flor de mayor calidad.",
        aov: "Presente primero el Dash II a $49.95 y después este a $99.95. Mostrar los dos juntos duplica el valor del dispositivo en la misma venta de flor.",
        talkTrack: { say: "Si el sabor le importa, este es el suyo. Cámara de titanio completa, calentamiento híbrido, listo en unos 20 segundos. $99.95, y el cable de carga viene incluido." },
        whichClose: "¿El Dash II a $49.95, o el Dash+ con cámara de titanio a $99.95?",
        trap: "No lo venda por sus especificaciones. Venda la diferencia de sabor, que es lo que el cliente puede juzgar. Nadie compra titanio; compran a qué sabe.",
        keyFacts: [
          "Cámara de titanio completa, calentamiento híbrido",
          "Calienta en unos 20 segundos · pantalla en color",
          "$99.95 — el paso superior al Dash II",
        ],
      },
    },
    "grinder": {
      whatItIs: "Un grinder manual, diseñado para desmenuzar la flor de cannabis antes de cargarla.",
      category: "Accesorio para hierba seca",
      tagline: "Grinder de aluminio de 64 mm. Sin filtro de kief: no se queda nada atrás.",
      differentiator: "El complemento de $19.95 para cualquier venta de flor.",
      description: [
        "El G&nbsp;Pen Grinder es un grinder de <strong>3 piezas y 64 mm</strong> mecanizado con precisión en resistente <strong>aluminio anodizado 6063</strong>, la misma familia de materiales de calidad aeronáutica que los dispositivos que llena.",
        "Sus <strong>dientes microredondeados patentados</strong> (patente n.º 11690480) separan la flor con suavidad en lugar de desgarrarla, para un molido más uniforme. Una <strong>tapa magnética potente</strong> mantiene el cierre firme y el contenido en su sitio.",
        "<strong>No tiene filtro de kief</strong>, y es intencionado: todo lo que muele (flor, tricomas y kief juntos) cae en el vaso y pasa a su cazoleta o cámara.",
      ],
      highlights: [
        "3 piezas, 64 mm",
        "Dientes microredondeados patentados",
        "Aluminio anodizado 6063",
        "Tapa magnética potente",
        "Sin filtro de kief: nada se separa",
        "Diseñado para ayudar a conservar terpenos y tricomas",
      ],
      howToSell: {
        vital: "Todo cliente de flor la muele de alguna manera. Es lo más económico del mostrador que mejora lo que ya ha comprado, y es el accesorio que hace que un Dash se cargue de forma uniforme.",
        aov: "Un complemento mecánico de $19.95 sin nada que se rompa y sin nada que cargar. Se añade a cualquier venta de flor y se sirve en expositor de 10 unidades, para tenerlo junto a la caja.",
        talkTrack: { say: "¿Cómo desmenuza su flor? Este es de aluminio mecanizado de 64 mm con dientes patentados y sin filtro de kief, así que nada se separa ni se queda atrás. $19.95, y su vaporizador se carga de forma más uniforme." },
        whichClose: "¿Va a cargar un vaporizador o a liar? Un molido uniforme importa en ambos casos. ¿Añadimos el grinder por $19.95?",
        trap: "No lo venda como recolector de kief: deliberadamente NO tiene filtro de kief, y un cliente que espere una cuarta cámara lo devolverá. Véndalo como la ventaja que es: nada se separa ni se queda atrás.",
        keyFacts: [
          "3 piezas, 64 mm, aluminio",
          "Dientes microredondeados patentados",
          "Sin filtro de kief — $19.95",
        ],
      },
    },
    "melt-hot-knife": {
      whatItIs: "Un hot knife eléctrico, diseñado para recoger y cargar concentrado de cannabis.",
      packaging: {
        inBox: ["G Pen Melt hot knife", "Tapa protectora de viaje"],
        notIncluded: ["Cable de carga USB-C"],
      },
      category: "Herramienta para concentrados",
      tagline: "El hot knife más pequeño del mercado. Carga el concentrado de forma limpia.",
      differentiator: "Hot knife eléctrico. Recoge y suelta sin residuos.",
      description: [
        "Le presentamos el nuevo G Pen Melt Hot Knife: el <strong>hot knife más pequeño del mercado</strong> y la forma más rápida y limpia de preparar sus concentrados. Con solo 3,94 × 0,5 × 0,25 pulgadas, el Melt es ultracompacto y desaparece en cualquier bolsillo o kit de viaje.",
        "Diseñado para recoger <strong>sin ensuciar</strong> y depositar de forma suave y controlada, su punta de cerámica de calentamiento rápido está lista al instante para transferencias perfectas. Sin herramientas pegajosas, sin desastres de reclaim, sin torpezas.",
        "Con carga USB-C pass-through, un cuerpo estilizado de aluminio y la silueta característica de G Pen, el Melt es su herramienta de cada día, tanto para cargar un rig como para rellenar un Micro+ o preparar un Hyer.",
      ],
      highlights: [
        "El hot knife más pequeño del mercado",
        "Punta de cerámica de calentamiento rápido (~150 °C / 302 °F)",
        "Carga USB-C pass-through",
        "Cuerpo estilizado de aluminio",
        "Ultracompacto: 3,94 × 0,5 × 0,25 pulgadas",
        "Compatible con rigs, Micro+, Hyer, bangers y e-rigs",
      ],
      howToSell: {
        vital: "El concentrado necesita una herramienta para manipularlo, y una herramienta fría arrastra y deja residuos. La punta de cerámica caliente lo suelta limpiamente en el rig, así que se desperdicia menos de lo que ha pagado.",
        aov: "Un complemento de $24.95 que encaja en cualquier venta de concentrado. Quien compra wax o rosin ya está trabajando con una herramienta fría, así que la necesidad existe antes de que usted la mencione.",
        talkTrack: { say: "¿Compra concentrado? Así se manipula. Punta de cerámica caliente, así que recoge y suelta sin residuos. $24.95, de bolsillo, y funciona con cualquier rig o banger." },
        whichClose: "¿Va a cargar un rig o un banger? En ambos casos así entra el concentrado de forma limpia. ¿Añadimos uno por $24.95?",
        trap: "Sea preciso sobre lo que sustituye: el Melt sustituye a la herramienta pegajosa de dabs, NO al soplete ni al e-nail que calientan un banger de cuarzo. Véndalo por la carga limpia. Prometer que 'no necesitará soplete' es la vía más rápida a una devolución.",
        keyFacts: [
          "La punta de cerámica caliente suelta el concentrado limpiamente",
          "Calienta en segundos · de bolsillo",
          "Carga cualquier rig o banger — $24.95",
        ],
      },
    },
    "hydout": {
      whatItIs: "Una batería, diseñada para alimentar un cartucho de aceite de cannabis con rosca 510.",
      packaging: {
        inBox: ["Batería 510 G Pen Hydout", "Tapa magnética de la boquilla"],
        notIncluded: ["Cartucho 510", "Cable de carga USB-C"],
      },
      category: "Batería para cartuchos 510",
      tagline: "Batería 510 con la boquilla guardada dentro del cuerpo.",
      differentiator: "Batería 510 con la boquilla escondida dentro.",
      description: [
        "El G Pen Hydout es una batería discreta para cartuchos 510: una batería compacta y <strong>oculta</strong> para cartuchos 510 que ofrece un rendimiento serio sin llamar la atención.",
        "Este pequeño gran dispositivo incorpora una <strong>tapa magnética que oculta la boquilla</strong> para mantener el cartucho discreto y protegido de la luz (lo que ayuda a conservar la calidad del aceite), una batería de 400 mAh, voltaje ajustable y una pantalla LED luminosa para tener el control de cada calada.",
        "Compatible con la mayoría de cartuchos de rosca 510 de hasta 2 g, el Hydout es ideal para sesiones suaves y personalizables, dondequiera que esté.",
      ],
      highlights: [
        "Tapa magnética que oculta la boquilla",
        "5 ajustes de voltaje (2,4 V – 3,8 V)",
        "Modo de precalentamiento a 1,8 V",
        "Batería recargable de 400 mAh",
        "Pantalla LED luminosa",
        "Carga USB-C",
        "Compatible con cartuchos 510 de hasta 2 g",
      ],
      howToSell: {
        vital: "Hace el mismo trabajo que cualquier batería 510, pero la boquilla se guarda dentro del cuerpo. Eso mantiene el cartucho discreto y protegido de la luz.",
        aov: "La batería para cartuchos de nivel superior. Frente al 510 Original de $12.95, añade discreción y cinco ajustes de voltaje, y duplica el valor de la venta cruzada de batería.",
        talkTrack: { say: "Para sus cartuchos: la boquilla se guarda dentro del cuerpo, así que sigue siendo discreta en el bolsillo. Cinco ajustes de voltaje para adaptarse a cualquier aceite. $24.95, y protege el cartucho de la luz." },
        whichClose: "¿El 510 Original a $12.95, o el Hydout a $24.95 con la boquilla guardada dentro?",
        trap: "No lidere con la diferencia de precio frente al 510 Original. Lidere con la discreción y el control de voltaje. Una comparación centrada en el precio pierde la venta superior.",
        keyFacts: [
          "La boquilla se guarda dentro del cuerpo",
          "Cinco ajustes de voltaje más precalentamiento",
          "Discreto y protege el cartucho — $24.95",
        ],
      },
    },
    "510-original": {
      whatItIs: "Una batería, diseñada para alimentar un cartucho de aceite de cannabis con rosca 510.",
      packaging: {
        inBox: ["Batería G Pen 510 Original"],
        notIncluded: ["Cargador USB-C", "Cartucho 510"],
      },
      category: "Batería para cartuchos 510",
      tagline: "La batería 510 más pequeña y sencilla que hacemos.",
      differentiator: "La batería 510 de G Pen más pequeña y económica.",
      description: [
        "Volvemos al origen, con mejoras.",
        "El G Pen 510 Original cierra el círculo: se inspira en nuestra primera batería de 2012 y la reinventa para hoy. Es la <strong>batería de G Pen más pequeña jamás fabricada</strong> (24 × 21,1 × 56,7 mm), ultraportátil y sencillísima de usar, sin renunciar al rendimiento.",
        "Diseñada con <strong>activación por inhalación</strong>, el 510 Original hace que las sesiones no tengan complicación: solo inhale. La interfaz de un botón alterna tres voltajes preconfigurados (3,2 / 3,6 / 3,8 V), un precalentamiento de 10 segundos a 1,8 V y una pantalla digital. Por solo <strong>$12.95</strong>, es además la batería de G Pen más económica de la historia.",
      ],
      highlights: [
        "La batería de G Pen más pequeña jamás fabricada",
        "Activación por inhalación: solo inhale",
        "Tres voltajes preconfigurados (3,2 / 3,6 / 3,8 V)",
        "Modo de precalentamiento de 10 segundos a 1,8 V",
        "Batería de 400 mAh",
        "Carga USB-C pass-through",
        "Pantalla digital",
        "Apagado automático a los 10 minutos",
      ],
      howToSell: {
        vital: "Un cartucho no funciona sin batería. Esta es la forma más económica de hacer utilizable el cartucho que ya está comprando.",
        aov: "A $12.95 es la venta cruzada más sencilla de la tienda, porque la necesidad es absoluta: ningún cliente debería salir con un cartucho y sin forma de usarlo.",
        talkTrack: { say: "Ese cartucho necesita una batería. ¿Tiene una? Esta cuesta $12.95, se activa con la inhalación y encaja en la mayoría de los cartuchos estándar. Sin botones." },
        whichClose: "¿El 510 Original a $12.95, o el Hydout a $24.95 con cinco ajustes de voltaje?",
        trap: "No pregunte si necesitan una batería, porque eso invita a un no. Pregunte si ya tienen una.",
        keyFacts: [
          "La batería de G Pen más pequeña — $12.95",
          "Se activa con la inhalación: sin botón",
          "Compatible con la mayoría de los cartuchos 510 estándar",
        ],
      },
    },
  },
};
