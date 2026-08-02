export type PublicProgramModule = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  indicator?: string;
  description: string;
  competencies: string[];
  result: string;
  transition?: string;
};

export const publicProgramModules: PublicProgramModule[] = [
  {
    id: "modulo-1",
    number: 1,
    title: "Criterio antes de interpretación",
    subtitle:
      "Establece una forma profesional de observar el mercado antes de evaluar decisiones.",
    description:
      "El primer módulo ordena la base mental del participante: contexto, evidencia, disciplina y diferencia entre opinión y análisis. La intención es dejar de perseguir movimientos aislados y comenzar a diagnosticar condiciones.",
    competencies: [
      "Distinguir análisis estructurado de interpretación impulsiva.",
      "Comprender por qué el contexto precede a la decisión.",
      "Reconocer los limites de una lectura aislada.",
      "Adoptar una mentalidad orientada al proceso.",
    ],
    result:
      "Comenzarás a observar el mercado como un entorno que debe diagnosticarse con método.",
    transition:
      "Con esa base, el siguiente paso es comprender las fuerzas que condicionan el movimiento visible.",
  },
  {
    id: "modulo-2",
    number: 2,
    title: "Mecánicas reales del mercado",
    subtitle:
      "Comprende las relaciones entre instrumentos, liquidez y participantes institucionales.",
    description:
      "Este módulo introduce la estructura que conecta índices, futuros, ETFs, opciones, liquidez y cobertura. El participante aprende a leer el mercado como un ecosistema interconectado, no como una serie de instrumentos separados.",
    competencies: [
      "Comprender la relación entre instrumentos principales.",
      "Interpretar el papel de los market makers.",
      "Diferenciar intención direccional de cobertura.",
      "Reconocer cómo la liquidez condiciona el movimiento.",
    ],
    result:
      "Podrás ubicar cada dato dentro de una estructura mayor antes de construir una hipótesis.",
    transition:
      "Una vez comprendidas las mecánicas, necesitas reconocer por qué el comportamiento cambia según el entorno.",
  },
  {
    id: "modulo-3",
    number: 3,
    title: "Gamma, convexidad y regímenes",
    subtitle:
      "Aprende a identificar condiciones de estabilización, expansión y transición.",
    description:
      "La exposición gamma se estudia como información de contexto, no como indicación automática. El objetivo es entender cómo cambia la sensibilidad del mercado y cómo adaptar la lectura a distintos regímenes.",
    competencies: [
      "Comprender gamma como sensibilidad del mercado.",
      "Interpretar exposición agregada.",
      "Diferenciar regímenes positivos y negativos.",
      "Reconocer zonas de transición relevantes.",
    ],
    result:
      "Serás capaz de diagnosticar el régimen antes de seleccionar una hipótesis.",
    transition:
      "Después de reconocer el régimen, el programa convierte esa información en un mapa de preparación.",
  },
  {
    id: "modulo-4",
    number: 4,
    title: "Lectura GEX aplicada",
    subtitle:
      "Convierte información de opciones en escenarios claros para preparar la jornada.",
    indicator: "Doble profundidad técnica",
    description:
      "El participante aprende a organizar niveles, exposición y régimen dentro de una jerarquía práctica. GEXBot Classic, State y Orderflow se integran como herramientas de lectura para construir hipótesis condicionales.",
    competencies: [
      "Identificar niveles relevantes de exposición gamma.",
      "Interpretar Call Wall, Put Wall y Zero Gamma.",
      "Integrar lectura GEX con comportamiento observado.",
      "Construir escenarios antes de participar.",
    ],
    result:
      "Podrás transformar datos de opciones en un mapa organizado de zonas, condiciones y posibles respuestas.",
    transition:
      "El mapa define dónde mirar; el siguiente módulo entrena cómo interpretar la reacción real del mercado.",
  },
  {
    id: "modulo-5",
    number: 5,
    title: "Volume Profile y Order Flow",
    subtitle:
      "Lee estructura, aceptación y reacción sin convertir cada dato en una orden.",
    description:
      "Volume Profile y Order Flow se integran como herramientas de confirmación contextual. Cada una responde una pregunta específica dentro del proceso de lectura y ayuda a validar o invalidar hipótesis.",
    competencies: [
      "Interpretar valor, aceptación y rechazo.",
      "Utilizar Profile para organizar estructura.",
      "Leer Order Flow como reacción.",
      "Distinguir esfuerzo de resultado.",
    ],
    result:
      "Podrás contrastar una hipótesis observando cómo responde el mercado en zonas previamente definidas.",
    transition:
      "Cuando contexto, estructura y reacción se alinean, llega el momento de convertir lectura en decisión gestionada.",
  },
  {
    id: "modulo-6",
    number: 6,
    title: "Estructuras de decisión",
    subtitle:
      "Transforma una hipótesis validada en un marco repetible de participación.",
    description:
      "Los setups se presentan como estructuras de decisión, no como patrones mecánicos. El participante integra contexto, zona, comportamiento esperado, confirmación, invalidación, ejecución y gestión.",
    competencies: [
      "Seleccionar estructuras según régimen.",
      "Definir confirmación e invalidación.",
      "Identificar condiciones de cancelación.",
      "Integrar riesgo antes de participar.",
    ],
    result:
      "Podrás evaluar oportunidades mediante una estructura donde la decisión aparece al final del proceso.",
    transition:
      "Una metodología solo adquiere valor cuando puede protegerse, repetirse y revisarse con disciplina.",
  },
  {
    id: "modulo-7",
    number: 7,
    title: "Gestión, rutina y consolidación",
    subtitle:
      "Convierte el conocimiento adquirido en una práctica sostenible y revisable.",
    description:
      "El cierre del programa integra riesgo, tamaño, preparación diaria, revisión y disciplina. El participante aprende a evaluar la calidad de su proceso más allá del resultado aislado de una decisión.",
    competencies: [
      "Definir riesgo antes de participar.",
      "Adaptar tamaño a la invalidación.",
      "Preparar escenarios diarios.",
      "Revisar decisiones con objetividad.",
    ],
    result:
      "Terminarás con un protocolo para preparar, esperar, participar, gestionar y revisar con criterio.",
    transition:
      "El recorrido culmina en una conversación individual preparada con evidencia real de tu proceso.",
  },
];

export const publicFormationJourney = [
  "Descubres Invictus GEX",
  "Comprendes el programa",
  "Comienzas tu formación",
  "Estudias y practicas",
  "Documentas tu proceso",
  "Reservas tu mentoría",
  "Continúas tu desarrollo",
];

export const publicMethodologySteps = [
  {
    title: "Contexto",
    question: "Qué tipo de mercado estoy observando.",
  },
  {
    title: "Zona",
    question: "Dónde merece atención la lectura.",
  },
  {
    title: "Hipótesis",
    question: "Qué comportamiento podría confirmar o invalidar el escenario.",
  },
  {
    title: "Reacción",
    question: "Cómo responde el mercado ante las zonas preparadas.",
  },
  {
    title: "Riesgo",
    question: "Si la decisión tiene estructura suficiente para participar.",
  },
];

export const publicGlobalCompetencies = [
  "Diagnosticar regímenes de mercado.",
  "Construir mapas de preparación.",
  "Formular hipótesis condicionales.",
  "Interpretar estructura y reacción.",
  "Seleccionar decisiones según contexto.",
  "Definir invalidación y riesgo.",
  "Crear una rutina profesional.",
  "Revisar decisiones con objetividad.",
];

export const publicProgramAudience = [
  "Buscas una formación seria para interpretar el mercado con método.",
  "Quieres ordenar liquidez, volumen, GEX, estructura y riesgo dentro de un mismo proceso.",
  "Estás dispuesto a estudiar, practicar y documentar tu avance con honestidad.",
  "Prefieres desarrollar criterio antes que depender de indicaciones externas.",
  "Valoras una mentoría individual preparada con evidencia de tu propio recorrido.",
];

export const publicProgramNonAudience = [
  "Buscas indicaciones para copiar sin desarrollar criterio propio.",
  "Esperas promesas de rentabilidad o resultados financieros asegurados.",
  "Quieres participar en el mercado sin estudiar contexto, riesgo y proceso.",
  "No estás dispuesto a revisar decisiones ni sostener una práctica ordenada.",
  "Prefieres atajos comerciales por encima de una formación progresiva.",
];
