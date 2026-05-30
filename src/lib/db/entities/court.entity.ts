import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "courts" })
@Index("courts_slug_key", ["slug"], { unique: true })
export class CourtEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "slug", type: "text" })
  slug!: string;

  @Column({ name: "name", type: "text" })
  name!: string;

  @Column({ name: "location", type: "text" })
  location!: string;

  @Column({ name: "timezone", type: "text" })
  timezone!: string;

  @Column({ name: "open_time", type: "time" })
  openTime!: string;

  @Column({ name: "close_time", type: "time" })
  closeTime!: string;

  @Column({ name: "price_per_hour_cents", type: "integer" })
  pricePerHourCents!: number;

  @Column({ name: "currency_code", type: "text" })
  currencyCode!: string;

  @Column({ name: "is_accepting_bookings", type: "boolean", default: true })
  isAcceptingBookings!: boolean;

  @Column({ name: "house_rules", type: "text" })
  houseRules!: string;

  @Column({ name: "payment_instructions", type: "text" })
  paymentInstructions!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
