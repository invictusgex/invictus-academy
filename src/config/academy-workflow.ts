export const academyWorkflowConfig = {
  requiredTradingDays: 5,
  session101: {
    blocked: {
      ctaLabel: "Ver requisitos",
      dashboardDescription:
        "Completa los módulos, formularios requeridos y días de trading para desbloquear la siguiente etapa.",
      dashboardTitle: "Sesión 101",
      statusLabel: "Bloqueada",
    },
    ctas: {
      modules: {
        href: "/academy/programa",
        label: "Completar módulos",
      },
      requiredForms: {
        href: "/academy",
        label: "Revisar formularios",
      },
      tradingDays: {
        href: "/academy",
        label: "Registrar días",
      },
    },
    unlocked: {
      ctaLabel: "Abrir Sesión 101",
      dashboardDescription:
        "Tus requisitos académicos están completos. Ya puedes revisar las instrucciones de preparación.",
      dashboardTitle: "Sesión 101",
      description:
        "Llegaste a la etapa de preparación para tu Sesión 101. Revisa tus evidencias, dudas principales y objetivos antes de coordinar el siguiente paso.",
      instructions: [
        "Repasa tus módulos completados y anota las dudas que todavía afectan tu ejecución.",
        "Revisa tus días de trading registrados y selecciona ejemplos concretos para analizar.",
        "Prepara capturas o notas de contexto que ayuden a evaluar tu proceso.",
      ],
      statusLabel: "Desbloqueada",
      title: "Sesión 101 desbloqueada",
    },
  },
} as const;
