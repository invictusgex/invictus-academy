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
    title: "Criterio antes de interpretacion",
    subtitle:
      "Establece una forma profesional de observar el mercado antes de evaluar decisiones.",
    description:
      "El primer modulo ordena la base mental del participante: contexto, evidencia, disciplina y diferencia entre opinion y analisis. La intencion es dejar de perseguir movimientos aislados y comenzar a diagnosticar condiciones.",
    competencies: [
      "Distinguir analisis estructurado de interpretacion impulsiva.",
      "Comprender por que el contexto precede a la decision.",
      "Reconocer los limites de una lectura aislada.",
      "Adoptar una mentalidad orientada al proceso.",
    ],
    result:
      "Comenzaras a observar el mercado como un entorno que debe diagnosticarse con metodo.",
    transition:
      "Con esa base, el siguiente paso es comprender las fuerzas que condicionan el movimiento visible.",
  },
  {
    id: "modulo-2",
    number: 2,
    title: "Mecanicas reales del mercado",
    subtitle:
      "Comprende las relaciones entre instrumentos, liquidez y participantes institucionales.",
    description:
      "Este modulo introduce la estructura que conecta indices, futuros, ETFs, opciones, liquidez y cobertura. El participante aprende a leer el mercado como un ecosistema interconectado, no como una serie de instrumentos separados.",
    competencies: [
      "Comprender la relacion entre instrumentos principales.",
      "Interpretar el papel de los market makers.",
      "Diferenciar intencion direccional de cobertura.",
      "Reconocer como la liquidez condiciona el movimiento.",
    ],
    result:
      "Podras ubicar cada dato dentro de una estructura mayor antes de construir una hipotesis.",
    transition:
      "Una vez comprendidas las mecanicas, necesitas reconocer por que el comportamiento cambia segun el entorno.",
  },
  {
    id: "modulo-3",
    number: 3,
    title: "Gamma, convexidad y regimenes",
    subtitle:
      "Aprende a identificar condiciones de estabilizacion, expansion y transicion.",
    description:
      "La exposicion gamma se estudia como informacion de contexto, no como indicacion automatica. El objetivo es entender como cambia la sensibilidad del mercado y como adaptar la lectura a distintos regimenes.",
    competencies: [
      "Comprender gamma como sensibilidad del mercado.",
      "Interpretar exposicion agregada.",
      "Diferenciar regimenes positivos y negativos.",
      "Reconocer zonas de transicion relevantes.",
    ],
    result:
      "Seras capaz de diagnosticar el regimen antes de seleccionar una hipotesis.",
    transition:
      "Despues de reconocer el regimen, el programa convierte esa informacion en un mapa de preparacion.",
  },
  {
    id: "modulo-4",
    number: 4,
    title: "Lectura GEX aplicada",
    subtitle:
      "Convierte informacion de opciones en escenarios claros para preparar la jornada.",
    indicator: "Doble profundidad tecnica",
    description:
      "El participante aprende a organizar niveles, exposicion y regimen dentro de una jerarquia practica. GEXBot Classic, State y Orderflow se integran como herramientas de lectura para construir hipotesis condicionales.",
    competencies: [
      "Identificar niveles relevantes de exposicion gamma.",
      "Interpretar Call Wall, Put Wall y Zero Gamma.",
      "Integrar lectura GEX con comportamiento observado.",
      "Construir escenarios antes de participar.",
    ],
    result:
      "Podras transformar datos de opciones en un mapa organizado de zonas, condiciones y posibles respuestas.",
    transition:
      "El mapa define donde mirar; el siguiente modulo entrena como interpretar la reaccion real del mercado.",
  },
  {
    id: "modulo-5",
    number: 5,
    title: "Volume Profile y Order Flow",
    subtitle:
      "Lee estructura, aceptacion y reaccion sin convertir cada dato en una orden.",
    description:
      "Volume Profile y Order Flow se integran como herramientas de confirmacion contextual. Cada una responde una pregunta especifica dentro del proceso de lectura y ayuda a validar o invalidar hipotesis.",
    competencies: [
      "Interpretar valor, aceptacion y rechazo.",
      "Utilizar Profile para organizar estructura.",
      "Leer Order Flow como reaccion.",
      "Distinguir esfuerzo de resultado.",
    ],
    result:
      "Podras contrastar una hipotesis observando como responde el mercado en zonas previamente definidas.",
    transition:
      "Cuando contexto, estructura y reaccion se alinean, llega el momento de convertir lectura en decision gestionada.",
  },
  {
    id: "modulo-6",
    number: 6,
    title: "Estructuras de decision",
    subtitle:
      "Transforma una hipotesis validada en un marco repetible de participacion.",
    description:
      "Los setups se presentan como estructuras de decision, no como patrones mecanicos. El participante integra contexto, zona, comportamiento esperado, confirmacion, invalidacion, ejecucion y gestion.",
    competencies: [
      "Seleccionar estructuras segun regimen.",
      "Definir confirmacion e invalidacion.",
      "Identificar condiciones de cancelacion.",
      "Integrar riesgo antes de participar.",
    ],
    result:
      "Podras evaluar oportunidades mediante una estructura donde la decision aparece al final del proceso.",
    transition:
      "Una metodologia solo adquiere valor cuando puede protegerse, repetirse y revisarse con disciplina.",
  },
  {
    id: "modulo-7",
    number: 7,
    title: "Gestion, rutina y consolidacion",
    subtitle:
      "Convierte el conocimiento adquirido en una practica sostenible y revisable.",
    description:
      "El cierre del programa integra riesgo, tamano, preparacion diaria, revision y disciplina. El participante aprende a evaluar la calidad de su proceso mas alla del resultado aislado de una decision.",
    competencies: [
      "Definir riesgo antes de participar.",
      "Adaptar tamano a la invalidacion.",
      "Preparar escenarios diarios.",
      "Revisar decisiones con objetividad.",
    ],
    result:
      "Terminaras con un protocolo para preparar, esperar, participar, gestionar y revisar con criterio.",
    transition:
      "El recorrido culmina en una conversacion individual preparada con evidencia real de tu proceso.",
  },
];

export const publicFormationJourney = [
  "Ingreso al Programa",
  "Formacion estructurada",
  "Aplicacion practica",
  "Reflexion sobre el aprendizaje",
  "Preparacion personalizada",
  "Mentoria individual",
  "Consolidacion del criterio profesional",
];

export const publicMethodologySteps = [
  {
    title: "Contexto",
    question: "Que tipo de mercado estoy observando.",
  },
  {
    title: "Zona",
    question: "Donde merece atencion la lectura.",
  },
  {
    title: "Hipotesis",
    question: "Que comportamiento podria confirmar o invalidar el escenario.",
  },
  {
    title: "Reaccion",
    question: "Como responde el mercado ante las zonas preparadas.",
  },
  {
    title: "Riesgo",
    question: "Si la decision tiene estructura suficiente para participar.",
  },
];

export const publicGlobalCompetencies = [
  "Diagnosticar regimenes de mercado.",
  "Construir mapas de preparacion.",
  "Formular hipotesis condicionales.",
  "Interpretar estructura y reaccion.",
  "Seleccionar decisiones segun contexto.",
  "Definir invalidacion y riesgo.",
  "Crear una rutina profesional.",
  "Revisar decisiones con objetividad.",
];

export const publicProgramAudience = [
  "Buscas una formacion seria para interpretar el mercado con metodo.",
  "Quieres ordenar liquidez, volumen, GEX, estructura y riesgo dentro de un mismo proceso.",
  "Estas dispuesto a estudiar, practicar y documentar tu avance con honestidad.",
  "Prefieres desarrollar criterio antes que depender de indicaciones externas.",
  "Valoras una mentoría individual preparada con evidencia de tu propio recorrido.",
];

export const publicProgramNonAudience = [
  "Buscas indicaciones para copiar sin desarrollar criterio propio.",
  "Esperas promesas de rentabilidad o resultados financieros asegurados.",
  "Quieres participar en el mercado sin estudiar contexto, riesgo y proceso.",
  "No estas dispuesto a revisar decisiones ni sostener una practica ordenada.",
  "Prefieres atajos comerciales por encima de una formacion progresiva.",
];
