import { NextResponse } from "next/server";

import {
  SERVER_AUTH_ERROR_CODES,
  ServerAuthError,
} from "@/lib/auth/server-errors";
import { requireServerAuthContext } from "@/lib/auth/server";
import { academyProductSlug } from "@/lib/academy-product";
import { getAcademyEnrollmentAccess } from "@/lib/services/academy-access.service";
import { MentorshipPreparationService } from "@/lib/services/mentorship-preparation.service";
import { MentorshipSchedulingService } from "@/lib/services/mentorship-scheduling.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  MentorshipBooking,
  MentorshipSlot,
} from "@/lib/types/mentorship-scheduling.types";

export const runtime = "nodejs";

type MentorshipSchedulingResponseBody =
  | {
      bookings: MentorshipBooking[];
      slots: MentorshipSlot[];
    }
  | {
      booking: MentorshipBooking;
      bookings?: MentorshipBooking[];
      slots?: MentorshipSlot[];
    }
  | {
      error: {
        code: string;
        message: string;
      };
    };

const forbiddenMentorshipFields = new Set([
  "profileId",
  "profile_id",
  "userId",
  "user_id",
  "enrollmentId",
  "enrollment_id",
  "productId",
  "product_id",
]);

function jsonResponse(body: MentorshipSchedulingResponseBody, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

async function readJsonPayload(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error("MENTORSHIP_INVALID_PAYLOAD");
  }

  const payload = (await request.json()) as unknown;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("MENTORSHIP_INVALID_PAYLOAD");
  }

  const body = payload as Record<string, unknown>;
  const forbiddenField = Object.keys(body).find((key) =>
    forbiddenMentorshipFields.has(key),
  );

  if (forbiddenField) {
    throw new Error("MENTORSHIP_FORBIDDEN_CONTEXT_FIELD");
  }

  return body;
}

async function readBookPayload(request: Request) {
  const body = await readJsonPayload(request);

  if (
    typeof body.slotId !== "string" ||
    typeof body.participantTimezone !== "string" ||
    (
      body.participantNote !== undefined &&
      body.participantNote !== null &&
      typeof body.participantNote !== "string"
    )
  ) {
    throw new Error("MENTORSHIP_INVALID_PAYLOAD");
  }

  return {
    participantNote: body.participantNote,
    participantTimezone: body.participantTimezone,
    slotId: body.slotId,
  };
}

async function readCancelPayload(request: Request) {
  const body = await readJsonPayload(request);

  if (typeof body.bookingId !== "string") {
    throw new Error("MENTORSHIP_INVALID_PAYLOAD");
  }

  return {
    bookingId: body.bookingId,
  };
}

function mapError(error: unknown) {
  if (error instanceof ServerAuthError) {
    if (error.code === SERVER_AUTH_ERROR_CODES.UNAUTHENTICATED) {
      return {
        code: "UNAUTHENTICATED",
        message: "Debes iniciar sesion para gestionar tu mentoria.",
        status: 401,
      };
    }
  }

  const message = error instanceof Error ? error.message : "";

  if (
    message.includes("SLOT_NOT_AVAILABLE") ||
    message.includes("SLOT_ALREADY_BOOKED")
  ) {
    return {
      code: "SLOT_NOT_AVAILABLE",
      message:
        "Ese horario ya no esta disponible. Actualizamos la lista para que puedas elegir otra opcion.",
      status: 409,
    };
  }

  if (message.includes("MENTORSHIP_REQUIREMENTS_NOT_MET")) {
    return {
      code: "MENTORSHIP_REQUIREMENTS_NOT_MET",
      message:
        "Tu proceso todavia no cumple los requisitos para reservar la mentoria.",
      status: 403,
    };
  }

  if (message.includes("BOOKING_COMPLETED")) {
    return {
      code: "BOOKING_COMPLETED",
      message: "Esta reserva ya fue completada y no puede cancelarse.",
      status: 409,
    };
  }

  if (
    message.includes("MENTORSHIP_INVALID_PAYLOAD") ||
    message.includes("MENTORSHIP_FORBIDDEN_CONTEXT_FIELD") ||
    message.includes("PARTICIPANT_TIMEZONE_REQUIRED")
  ) {
    return {
      code: "MENTORSHIP_INVALID_PAYLOAD",
      message: "No pudimos procesar la solicitud de mentoria.",
      status: 400,
    };
  }

  return {
    code: "MENTORSHIP_SCHEDULING_ERROR",
    message: "No pudimos gestionar la mentoria en este momento.",
    status: 500,
  };
}

export async function GET() {
  try {
    const { profile } = await requireServerAuthContext();
    const supabase = await createSupabaseServerClient();
    const academyAccess = await getAcademyEnrollmentAccess(profile.id, supabase);
    const academyProduct = academyAccess.activeProducts.find(
      (product) => product.productSlug === academyProductSlug,
    );

    if (!academyProduct) {
      return jsonResponse({ bookings: [], slots: [] }, 200);
    }

    const preparation = await MentorshipPreparationService.getStudentPreparation(
      {
        productId: academyProduct.productId,
        profileId: profile.id,
      },
      supabase,
    );
    const [slots, bookings] = await Promise.all([
      preparation.requirementsSatisfied
        ? MentorshipSchedulingService.listAvailableSlots(supabase)
        : Promise.resolve([]),
      MentorshipSchedulingService.listStudentBookings(profile.id, supabase),
    ]);

    return jsonResponse({ bookings, slots }, 200);
  } catch (error) {
    const mappedError = mapError(error);

    return jsonResponse(
      {
        error: {
          code: mappedError.code,
          message: mappedError.message,
        },
      },
      mappedError.status,
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireServerAuthContext();
    const payload = await readBookPayload(request);
    const supabase = await createSupabaseServerClient();
    const booking = await MentorshipSchedulingService.bookSlot(
      payload,
      supabase,
    );
    const [slots, bookings] = await Promise.all([
      MentorshipSchedulingService.listAvailableSlots(supabase),
      MentorshipSchedulingService.listStudentBookings(booking.profileId, supabase),
    ]);

    return jsonResponse({ booking, bookings, slots }, 201);
  } catch (error) {
    const mappedError = mapError(error);

    return jsonResponse(
      {
        error: {
          code: mappedError.code,
          message: mappedError.message,
        },
      },
      mappedError.status,
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireServerAuthContext();
    const payload = await readCancelPayload(request);
    const supabase = await createSupabaseServerClient();
    const booking = await MentorshipSchedulingService.cancelBooking(
      payload.bookingId,
      supabase,
    );
    const [slots, bookings] = await Promise.all([
      MentorshipSchedulingService.listAvailableSlots(supabase),
      MentorshipSchedulingService.listStudentBookings(booking.profileId, supabase),
    ]);

    return jsonResponse({ booking, bookings, slots }, 200);
  } catch (error) {
    const mappedError = mapError(error);

    return jsonResponse(
      {
        error: {
          code: mappedError.code,
          message: mappedError.message,
        },
      },
      mappedError.status,
    );
  }
}
