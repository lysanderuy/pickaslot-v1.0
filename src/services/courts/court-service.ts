import { BadRequestError, NotFoundError } from "@/lib/errors";
import { getDataSource } from "@/lib/db";
import { CourtEntity } from "@/lib/db/entities";

export interface CourtSettingsUpdateInput {
  slug?: string;
  name?: string;
  location?: string;
  timezone?: string;
  openTime?: string;
  closeTime?: string;
  pricePerHourCents?: number;
  currencyCode?: string;
  isAcceptingBookings?: boolean;
  houseRules?: string;
  paymentInstructions?: string;
}

function buildUpdateClause(input: CourtSettingsUpdateInput) {
  const assignments: string[] = [];
  const values: Array<string | number | boolean> = [];

  const addField = (column: string, value: string | number | boolean | undefined) => {
    if (value === undefined) {
      return;
    }

    values.push(value);
    assignments.push(`${column} = $${values.length}`);
  };

  addField("slug", input.slug);
  addField("name", input.name);
  addField("location", input.location);
  addField("timezone", input.timezone);
  addField("open_time", input.openTime);
  addField("close_time", input.closeTime);
  addField("price_per_hour_cents", input.pricePerHourCents);
  addField("currency_code", input.currencyCode);
  addField("is_accepting_bookings", input.isAcceptingBookings);
  addField("house_rules", input.houseRules);
  addField("payment_instructions", input.paymentInstructions);

  if (assignments.length === 0) {
    throw new BadRequestError("At least one court setting must be provided");
  }

  return { assignments, values };
}

export async function getPrimaryCourt() {
  const db = await getDataSource();
  const [court] = await db.getRepository(CourtEntity).find({
    order: { createdAt: "ASC" },
    take: 1,
  });

  if (!court) {
    throw new NotFoundError("Court not found");
  }

  return court;
}

export async function updateCourtSettings(
  courtId: string,
  input: CourtSettingsUpdateInput,
) {
  const db = await getDataSource();
  const { assignments, values } = buildUpdateClause(input);
  values.push(courtId);

  const rows = (await db.query(
    `
      update public.courts
      set ${assignments.join(", ")}, updated_at = now()
      where id = $${values.length}
      returning *
    `,
    values,
  )) as CourtEntity[];

  const court = rows[0];

  if (!court) {
    throw new NotFoundError("Court not found");
  }

  return court;
}
