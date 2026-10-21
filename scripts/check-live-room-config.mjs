import Stripe from "stripe";

// Read-only checks. Never print credentials, OAuth tokens or raw API responses.
const required = [
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET",
  "DISCORD_BOT_TOKEN",
  "DISCORD_GUILD_ID",
  "DISCORD_MEMBER_ROLE_ID",
  "DISCORD_LIVE_CHANNEL_ID",
  "STRIPE_LIVE_ROOM_PRODUCT_ID",
  "STRIPE_LIVE_ROOM_PRICE_ID",
  "STRIPE_LIVE_ROOM_SECRET_KEY",
];
const value = (name) => process.env[name]?.trim();
let failures = 0;

function report(ok, message) {
  console.log(`${ok ? "OK" : "PENDIENTE"}: ${message}`);
  if (!ok) failures += 1;
}

for (const key of required) report(Boolean(value(key)), key);

async function discordRead(path) {
  const response = await fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: `Bot ${value("DISCORD_BOT_TOKEN")}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

const stripeKey = value("STRIPE_LIVE_ROOM_SECRET_KEY");
if (stripeKey) {
  if (!stripeKey.startsWith("sk_test_") && !stripeKey.startsWith("rk_test_")) {
    report(false, "Esta comprobación requiere una clave Stripe de prueba.");
  } else {
    try {
      const stripe = new Stripe(stripeKey, { maxNetworkRetries: 0, timeout: 10_000 });
      const price = await stripe.prices.retrieve(value("STRIPE_LIVE_ROOM_PRICE_ID"));
      report(!price.livemode, "Precio en modo de prueba");
      report(price.product === value("STRIPE_LIVE_ROOM_PRODUCT_ID"), "Producto del precio correcto");
      report(price.active, "Precio activo");
      report(price.unit_amount === 3000 && price.currency === "usd", "Precio de 30 USD");
      report(price.recurring?.interval === "month" && price.recurring.interval_count === 1, "Renovación mensual");
    } catch (error) {
      const knownCode = error?.code === "resource_missing" ? "Precio no encontrado en esta cuenta o Sandbox" : "No se pudo consultar Stripe";
      report(false, knownCode);
    }
  }
}

if (value("DISCORD_BOT_TOKEN") && value("DISCORD_GUILD_ID")) {
  try {
    const guildPath = `/guilds/${value("DISCORD_GUILD_ID")}`;
    const me = await discordRead("/users/@me");
    report(me.id === value("DISCORD_CLIENT_ID"), "El token pertenece al bot configurado");
    const roles = await discordRead(`${guildPath}/roles`);
    const membership = await discordRead(`${guildPath}/members/${me.id}`);
    const target = roles.find((role) => role.id === value("DISCORD_MEMBER_ROLE_ID"));
    const ownRoles = roles.filter((role) => membership.roles.includes(role.id));
    report(Boolean(target) && !target.managed, "Rol de suscriptores existente y gestionable");
    report(ownRoles.some((role) => role.position > (target?.position ?? Infinity)), "Bot por encima del rol de suscriptores");
    report(ownRoles.some((role) => (BigInt(role.permissions) & 268435456n) !== 0n), "Bot con permiso Gestionar roles");
    report(!ownRoles.some((role) => (BigInt(role.permissions) & 8n) !== 0n), "Bot sin permiso Administrador");
    try {
      const channel = await discordRead(`/channels/${value("DISCORD_LIVE_CHANNEL_ID")}`);
      report(channel.guild_id === value("DISCORD_GUILD_ID") && channel.type === 2, "Canal de voz del servidor correcto");
    } catch {
      report(false, "No se pudo verificar el canal; revisa el ID y el permiso Ver canal del bot en la categoría privada.");
    }
  } catch {
    report(false, "No se pudo verificar el bot y sus roles en Discord.");
  }
}

console.log("Comprobación de solo lectura terminada. No se crearon pagos ni se modificaron roles.");
process.exitCode = failures ? 1 : 0;
