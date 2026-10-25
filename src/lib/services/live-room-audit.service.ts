import "server-only";
import { LiveRoomRepository } from "@/lib/repositories/live-room.repository";
import { DiscordMembershipService } from "@/lib/services/discord-membership.service";
import { compareLiveRoomRole, hasPaidLiveRoomAccess } from "@/lib/services/live-room-access";
import { getLiveRoomStripe, liveRoomEnv, liveRoomIsLive } from "@/lib/services/live-room-config";
import type { LiveRoomAccountRow } from "@/lib/types/live-room.types";

export async function auditLiveRoomAccount(row: LiveRoomAccountRow) {
  let expected: boolean | null = null;
  let actual: boolean | null = row.discord_user_id ? null : false;
  let inServer: boolean | null = row.discord_user_id ? null : false;
  let status = "unverified";
  let invoiceStatus: string | null = null;
  let periodEnd: string | null = null;
  let cancelAtEnd = false;
  let stripeError = false;
  let discordError = false;
  await Promise.all([
    (async () => {
      try {
        if (!row.stripe_subscription_id) { expected = false; status = "none"; return; }
        const sub = await getLiveRoomStripe().subscriptions.retrieve(row.stripe_subscription_id, { expand: ["latest_invoice"] }, { timeout: 4_000, maxNetworkRetries: 0 });
        const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const product = sub.items.data[0]?.price.product;
        const productId = typeof product === "string" ? product : product?.id;
        if (sub.livemode !== row.livemode || sub.metadata.app_product !== "live-room" || sub.metadata.profile_id !== row.profile_id || customer !== row.stripe_customer_id || sub.items.data.length !== 1 || productId !== liveRoomEnv("STRIPE_LIVE_ROOM_PRODUCT_ID")) throw new Error("MISMATCH");
        expected = hasPaidLiveRoomAccess(sub);
        status = sub.status;
        const invoice = sub.latest_invoice;
        invoiceStatus = invoice && typeof invoice !== "string" ? invoice.status : null;
        const end = sub.items.data[0]?.current_period_end;
        periodEnd = end ? new Date(end * 1000).toISOString() : null;
        cancelAtEnd = sub.cancel_at_period_end || Boolean(sub.cancel_at);
      } catch { stripeError = true; }
    })(),
    (async () => {
      if (!row.discord_user_id) return;
      try {
        const member = await DiscordMembershipService.inspectMember(row.discord_user_id);
        actual = member.hasRole; inServer = member.inServer;
      } catch { discordError = true; }
    })(),
  ]);
  return { row, expected, actual, inServer, status, invoiceStatus, periodEnd, cancelAtEnd, stripeError, discordError,
    result: compareLiveRoomRole(expected, actual), checkedAt: new Date().toISOString() };
}

export async function getLiveRoomAudit(page: number) {
  const mode = liveRoomIsLive();
  const listing = await LiveRoomRepository.listForAdmin(mode, page);
  const inventoryPromise = (async () => {
    try {
      const members = await DiscordMembershipService.listRoleMembers();
      const linked = await LiveRoomRepository.findLinkedDiscordIds(mode, members.holders.map((member) => member.id));
      return { unlinked: members.holders.filter((member) => !linked.has(member.id)), complete: members.complete };
    } catch { return null; }
  })();
  const accounts: Awaited<ReturnType<typeof auditLiveRoomAccount>>[] = [];
  // Bound provider concurrency and audit only the visible page, never silently sample all users.
  for (let index = 0; index < listing.accounts.length; index += 5) {
    accounts.push(...await Promise.all(listing.accounts.slice(index, index + 5).map(auditLiveRoomAccount)));
  }
  const inventory = await inventoryPromise;
  return { ...listing, accounts, inventory, mode, checkedAt: new Date().toISOString() };
}
