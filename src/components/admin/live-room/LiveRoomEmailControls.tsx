"use client";

import { useActionState } from "react";
import type { LiveRoomEmailActionState } from "@/lib/types/live-room-alert.types";

type Action = (previous: LiveRoomEmailActionState) => Promise<LiveRoomEmailActionState>;
const initial: LiveRoomEmailActionState = { status: "idle", message: "" };

export function LiveRoomEmailControls({ ready, queueReady, testAction, retryAction }: { ready: boolean; queueReady: boolean; testAction: Action; retryAction: Action }) {
  const [testState, runTest, testing] = useActionState(testAction, initial);
  const [retryState, runRetry, retrying] = useActionState(retryAction, initial);
  const busy = testing || retrying;
  const buttonClass = "rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50";
  return <div className="space-y-3" aria-busy={busy}>
    <div className="flex flex-wrap gap-3">
      <form action={runTest}><button type="submit" className={buttonClass} disabled={!ready || busy}>{testing ? "Enviando prueba…" : "Enviar prueba"}</button></form>
      <form action={runRetry}><button type="submit" className={buttonClass} disabled={!ready || !queueReady || busy}>{retrying ? "Reintentando…" : "Reintentar pendientes"}</button></form>
    </div>
    {[testState, retryState].filter((state) => state.message).map((state, index) => <p key={index} role={state.status === "error" ? "alert" : "status"} className={`max-w-3xl break-words text-sm leading-6 ${state.status === "error" ? "text-amber-300" : "text-emerald-300"}`}>{state.message}</p>)}
  </div>;
}
