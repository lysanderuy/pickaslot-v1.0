import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { BookingStatus } from "./booking.entity";

@Entity({ name: "booking_slots" })
@Index("booking_slots_booking_id_idx", ["bookingId"])
@Index("booking_slots_court_slot_idx", ["courtId", "slotStartAt"])
export class BookingSlotEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "booking_id", type: "uuid" })
  bookingId!: string;

  @Column({ name: "court_id", type: "uuid" })
  courtId!: string;

  @Column({ name: "booking_date", type: "date" })
  bookingDate!: string;

  @Column({ name: "slot_start_at", type: "timestamptz" })
  slotStartAt!: Date;

  @Column({ name: "slot_end_at", type: "timestamptz" })
  slotEndAt!: Date;

  @Column({ name: "status", type: "enum", enum: BookingStatus })
  status!: BookingStatus;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
