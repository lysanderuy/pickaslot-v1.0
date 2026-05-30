import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "profiles" })
export class ProfileEntity {
  @PrimaryColumn({ name: "id", type: "uuid" })
  id!: string;

  @Column({ name: "email", type: "text", nullable: true })
  email!: string | null;

  @Column({ name: "full_name", type: "text", nullable: true })
  fullName!: string | null;

  @Column({ name: "is_admin", type: "boolean", default: false })
  isAdmin!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
