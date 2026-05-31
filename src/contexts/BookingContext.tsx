"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { getToday } from "@/lib/date/calendar";
import type { Confirmation, PaymentMethod } from "@/types/bookings";

interface BookingContextValue {
  // Date state
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  calendarMonth: { year: number; month: number };
  setCalendarMonth: React.Dispatch<React.SetStateAction<{ year: number; month: number }>>;
  calendarOpen: boolean;
  setCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Slot selection
  selectedSlotStarts: string[];
  setSelectedSlotStarts: React.Dispatch<React.SetStateAction<string[]>>;

  // Sheet state
  sheetOpen: boolean;
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Warning modal state
  warningOpen: boolean;
  setWarningOpen: React.Dispatch<React.SetStateAction<boolean>>;
  warningType: "imminent" | "continuous";
  setWarningType: React.Dispatch<React.SetStateAction<"imminent" | "continuous">>;

  // Form state
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  contactNumber: string;
  setContactNumber: React.Dispatch<React.SetStateAction<string>>;
  paymentMethod: PaymentMethod;
  setPaymentMethod: React.Dispatch<React.SetStateAction<PaymentMethod>>;

  // Confirmation state
  confirmation: Confirmation | null;
  setConfirmation: React.Dispatch<React.SetStateAction<Confirmation | null>>;
}

const BookingContext = createContext<BookingContextValue | null>(null);

interface BookingProviderProps {
  children: ReactNode;
}

export function BookingProvider({ children }: BookingProviderProps) {
  const [selectedDate, setSelectedDate] = useState(() => getToday());
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = getToday();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedSlotStarts, setSelectedSlotStarts] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningType, setWarningType] = useState<"imminent" | "continuous">("imminent");
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("gcash");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const value: BookingContextValue = {
    selectedDate,
    setSelectedDate,
    calendarMonth,
    setCalendarMonth,
    calendarOpen,
    setCalendarOpen,
    selectedSlotStarts,
    setSelectedSlotStarts,
    sheetOpen,
    setSheetOpen,
    warningOpen,
    setWarningOpen,
    warningType,
    setWarningType,
    fullName,
    setFullName,
    contactNumber,
    setContactNumber,
    paymentMethod,
    setPaymentMethod,
    confirmation,
    setConfirmation,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
