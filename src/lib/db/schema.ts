import {
  pgTable,
  uuid,
  text,
  date,
  integer,
  timestamp,
  time,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "rejected",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["gcash", "cash"]);

// Type-safe enum value helpers
export const BookingStatus = {
  Pending: "pending",
  Confirmed: "confirmed",
  Rejected: "rejected",
} as const;

export const PaymentMethod = {
  GCash: "gcash",
  Cash: "cash",
} as const;

// Courts table
export const courts = pgTable("courts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  timezone: text("timezone").notNull(),
  openTime: time("open_time").notNull(),
  closeTime: time("close_time").notNull(),
  pricePerHour: integer("price_per_hour").notNull(),
  currencyCode: text("currency_code").notNull(),
  isAcceptingBookings: boolean("is_accepting_bookings").notNull().default(true),
  acceptsGcash: boolean("accepts_gcash").notNull().default(true),
  acceptsCash: boolean("accepts_cash").notNull().default(true),
  houseRules: text("house_rules").notNull(),
  houseRulesUpdatedAt: timestamp("house_rules_updated_at", { withTimezone: true }),
  gcashNumber: text("gcash_number"),
  gcashName: text("gcash_name"),
  messengerUrl: text("messenger_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email"),
  fullName: text("full_name"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Bookings table
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courtId: uuid("court_id").notNull(),
    bookingCode: text("booking_code").notNull().unique(),
    bookingDate: date("booking_date").notNull(),
    fullName: text("full_name").notNull(),
    contactNumber: text("contact_number").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    status: bookingStatusEnum("status").notNull(),
    slotCount: integer("slot_count").notNull(),
    pricePerHourSnapshot: integer("price_per_hour_snapshot").notNull(),
    totalAmount: integer("total_amount").notNull(),
    reviewerId: uuid("reviewer_id"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    rejectedReason: text("rejected_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    bookingCodeIdx: index("bookings_booking_code_key").on(table.bookingCode),
  }),
);

// Booking slots table
export const bookingSlots = pgTable(
  "booking_slots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id").notNull(),
    courtId: uuid("court_id").notNull(),
    bookingDate: date("booking_date").notNull(),
    slotStartAt: timestamp("slot_start_at", { withTimezone: true }).notNull(),
    slotEndAt: timestamp("slot_end_at", { withTimezone: true }).notNull(),
    status: bookingStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    bookingIdIdx: index("booking_slots_booking_id_idx").on(table.bookingId),
    courtSlotIdx: index("booking_slots_court_slot_idx").on(
      table.courtId,
      table.slotStartAt,
    ),
  }),
);

// Relations
export const bookingsRelations = relations(bookings, ({ one }) => ({
  court: one(courts, {
    fields: [bookings.courtId],
    references: [courts.id],
  }),
}));

export const bookingSlotsRelations = relations(bookingSlots, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingSlots.bookingId],
    references: [bookings.id],
  }),
  court: one(courts, {
    fields: [bookingSlots.courtId],
    references: [courts.id],
  }),
}));

export const courtsRelations = relations(courts, ({ many }) => ({
  bookings: many(bookings),
  bookingSlots: many(bookingSlots),
}));
