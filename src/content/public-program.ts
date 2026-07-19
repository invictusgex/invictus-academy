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
    title: "El nuevo mapa del mercado",
    subtitle:
      "Transforma la forma en que interpretas cada movimiento antes de pensar en operar.",
    description:
      "Construye una nueva perspectiva del mercado y comprende por qué operar únicamente patrones, indicadores o movimientos aislados limita la calidad de tus decisiones. Este módulo establece los principios de una metodología donde el contexto precede a la ejecución.",
    competencies: [
      "Diferenciar análisis estructurado de opinión.",
      "Comprender el papel del contexto.",
      "Reconocer las limitaciones de las señales aisladas.",
      "Adoptar una mentalidad orientada al proceso.",
    ],
    result:
      "Comenzarás a observar el mercado como un entorno que debe diagnosticarse, no como una sucesión de señales que deben perseguirse.",
    transition:
      "Con una nueva forma de pensar, el siguiente paso será comprender las fuerzas y participantes que condicionan el movimiento del mercado.",
  },
  {
    id: "modulo-2",
    number: 2,
    title: "Mecánicas reales del mercado",
    subtitle:
      "Comprende las fuerzas que existen detrás del movimiento visible del precio.",
    description:
      "Explora la relación entre índices, futuros, ETFs, opciones, liquidez y cobertura institucional. Descubrirás por qué muchas órdenes no representan una apuesta direccional y cómo la gestión de riesgo de los participantes puede influir en el comportamiento del mercado.",
    competencies: [
      "Comprender la relación entre los principales instrumentos.",
      "Interpretar la función de los market makers.",
      "Diferenciar intención direccional de cobertura.",
      "Reconocer cómo la liquidez condiciona el movimiento.",
    ],
    result:
      "Podrás interpretar el mercado como un ecosistema interconectado en lugar de analizar cada instrumento de manera aislada.",
    transition:
      "Una vez comprendidas las mecánicas, necesitarás reconocer por qué el comportamiento del mercado cambia de un entorno a otro.",
  },
  {
    id: "modulo-3",
    number: 3,
    title: "Gamma, convexidad y regímenes",
    subtitle:
      "Identifica por qué el mismo patrón puede producir resultados completamente diferentes.",
    description:
      "Comprende cómo la exposición gamma modifica la sensibilidad y el comportamiento potencial del mercado. Aprenderás a diferenciar entornos de estabilización, expansión y transición sin convertir la información de opciones en una señal automática.",
    competencies: [
      "Comprender gamma como sensibilidad.",
      "Interpretar la exposición gamma agregada.",
      "Diferenciar regímenes positivos y negativos.",
      "Reconocer Zero Gamma como zona de transición.",
    ],
    result:
      "Serás capaz de diagnosticar el régimen antes de seleccionar una hipótesis o una forma de ejecución.",
    transition:
      "Después de reconocer el régimen, aprenderás a convertir esa información en un mapa operativo para la sesión.",
  },
  {
    id: "modulo-4",
    number: 4,
    title: "Lectura de GEX y GEXBot",
    subtitle:
      "Convierte la información del mercado de opciones en escenarios que puedas preparar antes de ejecutar.",
    indicator: "2 sesiones especializadas",
    description:
      "Aprende a organizar niveles, exposición y régimen dentro de una jerarquía práctica. Integrarás GEXBot Classic, State y Orderflow para construir hipótesis condicionales sin confundir información con confirmación.",
    competencies: [
      "Identificar niveles relevantes de exposición gamma.",
      "Interpretar Call Wall, Put Wall y Zero Gamma.",
      "Integrar Classic, State y Orderflow.",
      "Construir escenarios antes de la sesión.",
    ],
    result:
      "Podrás transformar datos de opciones en un mapa organizado que indique dónde vale la pena observar el comportamiento del precio.",
    transition:
      "El mapa identifica dónde prestar atención. El siguiente módulo te enseñará cómo interpretar la reacción real del mercado al llegar a esas zonas.",
  },
  {
    id: "modulo-5",
    number: 5,
    title: "Volume Profile y Order Flow",
    subtitle:
      "Lee estructura, aceptación y reacción sin convertir cada dato en una señal.",
    description:
      "Aprende a integrar Volume Profile y Order Flow dentro de una metodología donde cada herramienta responde una pregunta específica. Comprenderás dónde se construyó valor, cómo reacciona el mercado y cuándo el esfuerzo observado realmente produce resultado.",
    competencies: [
      "Interpretar valor, aceptación y rechazo.",
      "Utilizar Profile para organizar estructura.",
      "Leer Order Flow como reacción.",
      "Distinguir esfuerzo de resultado.",
    ],
    result:
      "Podrás validar o invalidar hipótesis observando cómo el mercado responde alrededor de zonas previamente definidas.",
    transition:
      "Cuando contexto, estructura y reacción se alinean, llega el momento de convertir la lectura en una oportunidad operable.",
  },
  {
    id: "modulo-6",
    number: 6,
    title: "Setups operables",
    subtitle:
      "Transforma una hipótesis validada en una estructura de decisión repetible.",
    description:
      "Construye setups como marcos de decisión, no como patrones mecánicos. Integrarás contexto, zona, comportamiento esperado, confirmación, invalidación, ejecución y gestión dentro de una arquitectura aplicable a distintos regímenes.",
    competencies: [
      "Seleccionar setups según el régimen.",
      "Definir confirmación e invalidación.",
      "Identificar condiciones de cancelación.",
      "Integrar riesgo antes de la entrada.",
    ],
    result:
      "Podrás evaluar oportunidades mediante una estructura repetible donde la entrada aparece únicamente al final del proceso.",
    transition:
      "Una metodología solo adquiere valor cuando puede protegerse, repetirse y revisarse con disciplina.",
  },
  {
    id: "modulo-7",
    number: 7,
    title: "Gestión, rutina y profesionalización",
    subtitle: "Convierte el conocimiento adquirido en un proceso sostenible.",
    description:
      "Cierra el recorrido integrando riesgo, tamaño, stops, targets, preparación diaria, revisión y disciplina. Aprenderás a evaluar la calidad de una decisión más allá del resultado económico de una sola operación.",
    competencies: [
      "Definir riesgo antes de ejecutar.",
      "Adaptar el tamaño a la invalidación.",
      "Preparar escenarios diarios.",
      "Revisar decisiones mediante un diario estructurado.",
    ],
    result:
      "Terminarás con un protocolo completo para preparar, esperar, ejecutar, gestionar y revisar cada sesión.",
    transition:
      "El programa termina donde comienza el verdadero desarrollo: practicar el proceso, documentarlo y repetirlo con honestidad.",
  },
];

export const publicProgramTrajectory = [
  "Mentalidad",
  "Mecánicas",
  "Regímenes",
  "Mapa",
  "Lectura",
  "Ejecución",
  "Profesionalización",
];

export const publicMethodologySteps = [
  {
    title: "Contexto",
    question: "¿Qué tipo de mercado tengo delante?",
  },
  {
    title: "Zona",
    question: "¿Dónde merece atención?",
  },
  {
    title: "Hipótesis",
    question: "¿Qué comportamiento espero?",
  },
  {
    title: "Confirmación",
    question: "¿El mercado valida la lectura?",
  },
  {
    title: "Riesgo",
    question: "¿La oportunidad merece participación?",
  },
];

export const publicGlobalCompetencies = [
  "Diagnosticar regímenes de mercado.",
  "Construir mapas operativos.",
  "Formular hipótesis condicionales.",
  "Interpretar estructura y reacción.",
  "Seleccionar setups según contexto.",
  "Definir invalidación y riesgo.",
  "Crear una rutina profesional.",
  "Revisar decisiones con objetividad.",
];

export const publicProgramAudience = [
  "Traders que desean comprender antes de ejecutar.",
  "Operadores que utilizan futuros sobre índices.",
  "Personas interesadas en Gamma Exposure, Volume Profile y Order Flow dentro de una metodología integrada.",
  "Traders que quieren reemplazar improvisación por proceso.",
  "Alumnos dispuestos a practicar y revisar sus decisiones.",
];

export const publicProgramNonAudience = [
  "Quien busca señales para copiar.",
  "Quien espera ganancias garantizadas.",
  "Quien desea una estrategia sin práctica.",
  "Quien busca operar cada movimiento.",
  "Quien no está dispuesto a gestionar el riesgo.",
];
