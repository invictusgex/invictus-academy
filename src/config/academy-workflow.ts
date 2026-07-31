export const academyWorkflowConfig = {
  requiredTradingDays: 5,
  session101: {
    blocked: {
      ctaLabel: "Ver requisitos",
      dashboardDescription:
        "Completa los modulos, formularios requeridos y dias de trading para desbloquear la siguiente etapa.",
      dashboardTitle: "Sesion 101",
      statusLabel: "Bloqueada",
    },
    ctas: {
      modules: {
        href: "/academy/programa",
        label: "Completar modulos",
      },
      requiredForms: {
        href: "/academy",
        label: "Revisar formularios",
      },
      tradingDays: {
        href: "/academy",
        label: "Registrar dias",
      },
    },
    unlocked: {
      ctaLabel: "Abrir Sesion 101",
      dashboardDescription:
        "Tus requisitos academicos estan completos. Ya puedes revisar las instrucciones de preparacion.",
      dashboardTitle: "Sesion 101",
      description:
        "Llegaste a la etapa de preparacion para tu Sesion 101. Revisa tus evidencias, dudas principales y objetivos antes de coordinar el siguiente paso.",
      instructions: [
        "Repasa tus modulos completados y anota las dudas que todavia afectan tu ejecucion.",
        "Revisa tus dias de trading registrados y selecciona ejemplos concretos para analizar.",
        "Prepara capturas o notas de contexto que ayuden a evaluar tu proceso.",
      ],
      statusLabel: "Desbloqueada",
      title: "Sesion 101 desbloqueada",
    },
  },
} as const;
