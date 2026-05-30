import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum BookingStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Rejected = "rejected",
}

export enum PaymentMethod {
  GCash = "gcash",
  Cash = "cash",
}

@Entity({ name: "bookings" })
@Index("bookings_booking_code_key", ["bookingCode"], { unique: true })
export class BookingEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "court_id", type: "uuid" })
  courtId!: string;

  @Column({ name: "booking_code", type: "text" })
  bookingCode!: string;

  @Column({ name: "booking_date", type: "date" })
  bookingDate!: string;

  @Column({ name: "full_name", type: "text" })
  fullName!: string;

  @Column({ name: "contact_number", type: "text" })
  contactNumber!: string;

  @Column({ name: "payment_method", type: "enum", enum: PaymentMethod })
  paymentMethod!: PaymentMethod;

  @Column({ name: "status", type: "enum", enum: BookingStatus })
  status!: BookingStatus;

  @Column({ name: "slot_count", type: "integer" })
  slotCount!: number;

  @Column({ name: "price_per_hour_cents_snapshot", type: "integer" })
  pricePerHourCentsSnapshot!: number;

  @Column({ name: "total_cost_cents", type: "integer" })
  totalCostCents!: number;

  @Column({ name: "reviewer_id", type: "uuid", nullable: true })
  reviewerId!: string | null;

  @Column({ name: "reviewed_at", type: "timestamptz", nullable: true })
  reviewedAt!: Date | null;

  @Column({ name: "rejected_reason", type: "text", nullable: true })
  rejectedReason!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
