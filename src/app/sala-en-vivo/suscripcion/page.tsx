import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { liveRoom } from "@/content/live-room";
import { getCurrentServerUser } from "@/lib/auth/server";
import { LiveRoomService } from "@/lib/services/live-room.service";
import { DiscordMembershipService } from "@/lib/services/discord-membership.service";
import { LiveRoomMembershipPanel } from "@/components/live-room/LiveRoomMembershipPanel";

export const metadata = { robots: { index: false, follow: false } };

export default async function LiveRoomSubscriptionPage({ searchParams }: { searchParams: Promise<{ checkout?: string; discord?: string }> }) {
  const user = await getCurrentServerUser();

  if (!user) {
    redirect(`/registro?next=${encodeURIComponent(liveRoom.subscriptionHref)}`);
  }

  const params = await searchParams;
  const offer = await LiveRoomService.getOffer();
  let account: Awaited<ReturnType<typeof LiveRoomService.getAccount>> = null;
  let setupPending = !offer.configured;
  try { account = await LiveRoomService.getAccount(user.id); }
  catch (error) {
    if (error instanceof Error && ["LIVE_ROOM_SCHEMA_PENDING", "LIVE_ROOM_NOT_CONFIGURED"].includes(error.message)) setupPending = true;
    else throw error;
  }
  const active = LiveRoomService.canEnter(account);
  const hasSubscription = Boolean(account && !["none", "canceled", "incomplete_expired"].includes(account.subscription_status));
  return (
    <AuthPageShell eyebrow="Sala privada en vivo" title={active ? "Tu acceso a la sala" : "Tu membresía mensual"} description="Gestiona tu suscripción y el acceso de tu cuenta de Discord a la sala privada.">
      <LiveRoomMembershipPanel discordName={account?.discord_name ?? null} active={active} hasSubscription={hasSubscription}
        paidThrough={account?.paid_through ?? null} cancelling={account?.cancel_at_period_end ?? false}
        channelUrl={active ? DiscordMembershipService.channelUrl() : null} amountUsd={offer.amountUsd}
        available={offer.configured} setupPending={setupPending} syncOnLoad={params.checkout === "success"} discordError={params.discord === "error"} />
    </AuthPageShell>
  );
}
