"use client";

import { useState, useCallback, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { courts } from "@/lib/db/schema";

interface CourtSettingsFormProps {
  court: typeof courts.$inferSelect;
}

type SectionKey = "status" | "hours" | "details" | "payment" | "houseRules";

const SECTION_CONFIG: Record<SectionKey, { title: string; description: string }> = {
  status: {
    title: "Court Status",
    description: "Control whether your court is accepting new bookings.",
  },
  hours: {
    title: "Court Hours",
    description: "Set the operating hours for your court.",
  },
  details: {
    title: "Court Details",
    description: "Basic information about your court.",
  },
  payment: {
    title: "Payment",
    description: "Configure payment methods and instructions.",
  },
  houseRules: {
    title: "House Rules",
    description: "Set the rules and guidelines for your court.",
  },
};

function buildFormData(court: CourtSettingsFormProps["court"]) {
  return {
    isAcceptingBookings: court.isAcceptingBookings,
    openTime: court.openTime,
    closeTime: court.closeTime,
    name: court.name,
    location: court.location,
    pricePerHour: court.pricePerHour,
    acceptsGcash: court.acceptsGcash,
    acceptsCash: court.acceptsCash,
    gcashNumber: court.gcashNumber ?? "",
    gcashName: court.gcashName ?? "",
    messengerUrl: court.messengerUrl ?? "",
    houseRules: court.houseRules.split("\n").filter((r) => r.trim().length > 0),
  };
}

export function CourtSettingsForm({ court }: CourtSettingsFormProps) {
  const [formData, setFormData] = useState(() => buildFormData(court));
  const [savedData, setSavedData] = useState(() => buildFormData(court));

  const isDirty = useMemo(() => {
    return (
      formData.isAcceptingBookings !== savedData.isAcceptingBookings ||
      formData.openTime !== savedData.openTime ||
      formData.closeTime !== savedData.closeTime ||
      formData.name !== savedData.name ||
      formData.location !== savedData.location ||
      formData.pricePerHour !== savedData.pricePerHour ||
      formData.acceptsGcash !== savedData.acceptsGcash ||
      formData.acceptsCash !== savedData.acceptsCash ||
      formData.gcashNumber !== savedData.gcashNumber ||
      formData.gcashName !== savedData.gcashName ||
      formData.messengerUrl !== savedData.messengerUrl ||
      JSON.stringify(formData.houseRules) !== JSON.stringify(savedData.houseRules)
    );
  }, [formData, savedData]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/courts/${court.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAcceptingBookings: formData.isAcceptingBookings,
          openTime: formData.openTime,
          closeTime: formData.closeTime,
          name: formData.name,
          location: formData.location,
          pricePerHour: formData.pricePerHour,
          acceptsGcash: formData.acceptsGcash,
          acceptsCash: formData.acceptsCash,
          gcashNumber: formData.gcashNumber.trim() || null,
          gcashName: formData.gcashName.trim() || null,
          messengerUrl: formData.messengerUrl.trim() || null,
          houseRules: formData.houseRules.join("\n"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save settings");
      }

      setSavedData({ ...formData });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [court.id, formData]);

  const addHouseRule = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      houseRules: [...prev.houseRules, ""],
    }));
  }, []);

  const updateHouseRule = useCallback((index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      houseRules: prev.houseRules.map((rule, i) => (i === index ? value : rule)),
    }));
  }, []);

  const removeHouseRule = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      houseRules: prev.houseRules.filter((_, i) => i !== index),
    }));
  }, []);

  return (
    <>
      <AdminPageHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[20px] font-extrabold tracking-[-0.02em] text-slate-900">
            Court Settings
          </h1>
          <p className="mt-0.5 text-[13px] font-medium text-slate-500">
            Changes apply immediately to the user-facing booking site.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2">
          {error && (
            <p className="text-[13px] font-medium text-rose-600">{error}</p>
          )}
          {saved && !error && (
            <p className="text-[13px] font-medium text-green-600">Saved!</p>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </AdminPageHeader>

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <CourtStatusSection
          value={formData.isAcceptingBookings}
          onChange={(value) => setFormData((prev) => ({ ...prev, isAcceptingBookings: value }))}
        />
        <CourtHoursSection
          openTime={formData.openTime}
          closeTime={formData.closeTime}
          onChange={(field, value) =>
            setFormData((prev) => ({ ...prev, [field]: value }))
          }
        />
        <CourtDetailsSection
          name={formData.name}
          location={formData.location}
          pricePerHour={formData.pricePerHour}
          onChange={(field, value) =>
            setFormData((prev) => ({ ...prev, [field]: value }))
          }
        />
        <PaymentSection
          gcashNumber={formData.gcashNumber}
          gcashName={formData.gcashName}
          messengerUrl={formData.messengerUrl}
          acceptsGcash={formData.acceptsGcash}
          acceptsCash={formData.acceptsCash}
          onChange={(field, value) =>
            setFormData((prev) => ({ ...prev, [field]: value }))
          }
        />
        <HouseRulesSection
          rules={formData.houseRules}
          onAdd={addHouseRule}
          onUpdate={updateHouseRule}
          onRemove={removeHouseRule}
        />
      </div>
    </>
  );
}

function CourtStatusSection({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5 sm:py-4">
        <h2 className="text-[15px] font-bold text-slate-900">
          {SECTION_CONFIG.status.title}
        </h2>
        <p className="mt-0.5 text-[13px] font-medium text-slate-500">
          {SECTION_CONFIG.status.description}
        </p>
      </div>
      <div className="px-4 py-5 sm:px-5 sm:py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-slate-900">
              Accepting Bookings
            </p>
            <p className="mt-0.5 text-[13px] font-medium text-slate-500">
              {value
                ? "Your court is currently open for bookings."
                : "Your court is not accepting new bookings."}
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
            />
            <div className="peer relative h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500" />
          </label>
        </div>
      </div>
    </section>
  );
}

function CourtHoursSection({
  openTime,
  closeTime,
  onChange,
}: {
  openTime: string;
  closeTime: string;
  onChange: (field: "openTime" | "closeTime", value: string) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5 sm:py-4">
        <h2 className="text-[15px] font-bold text-slate-900">
          {SECTION_CONFIG.hours.title}
        </h2>
        <p className="mt-0.5 text-[13px] font-medium text-slate-500">
          {SECTION_CONFIG.hours.description}
        </p>
      </div>
      <div className="px-4 py-5 sm:px-5 sm:py-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700">
              Open Time
            </label>
            <input
              type="time"
              value={openTime}
              onChange={(e) => onChange("openTime", e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-[14px] font-medium text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-slate-700">
              Close Time
            </label>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => onChange("closeTime", e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-[14px] font-medium text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CourtDetailsSection({
  name,
  location,
  pricePerHour,
  onChange,
}: {
  name: string;
  location: string;
  pricePerHour: number;
  onChange: (field: "name" | "location" | "pricePerHour", value: string | number) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5 sm:py-4">
        <h2 className="text-[15px] font-bold text-slate-900">
          {SECTION_CONFIG.details.title}
        </h2>
        <p className="mt-0.5 text-[13px] font-medium text-slate-500">
          {SECTION_CONFIG.details.description}
        </p>
      </div>
      <div className="px-4 py-5 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700">
              Court Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onChange("name", e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-[14px] font-medium text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="e.g. Sunrise Court"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-slate-700">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => onChange("location", e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-[14px] font-medium text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="e.g. Villa del Rio, Babag II, Lapu-Lapu City, Cebu"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-slate-700">
              Price Per Hour (PHP)
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-slate-500">
                ₱
              </span>
              <input
                type="number"
                value={pricePerHour}
                min="0"
                step="1"
                onChange={(e) => onChange("pricePerHour", Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-[14px] font-medium text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="200"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PaymentSection({
  gcashNumber,
  gcashName,
  messengerUrl,
  acceptsGcash,
  acceptsCash,
  onChange,
}: {
  gcashNumber: string;
  gcashName: string;
  messengerUrl: string;
  acceptsGcash: boolean;
  acceptsCash: boolean;
  onChange: (
    field: "gcashNumber" | "gcashName" | "messengerUrl" | "acceptsGcash" | "acceptsCash",
    value: string | boolean,
  ) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5 sm:py-4">
        <h2 className="text-[15px] font-bold text-slate-900">
          {SECTION_CONFIG.payment.title}
        </h2>
        <p className="mt-0.5 text-[13px] font-medium text-slate-500">
          {SECTION_CONFIG.payment.description}
        </p>
      </div>
      <div className="px-4 py-5 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-[13px] font-semibold text-slate-700">Accepted Payment Methods</p>
            <div className="mt-4 flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="text-[20px]">💳</span>
                  <div>
                    <p className="text-[14px] font-semibold text-slate-900">GCash</p>
                    <p className="text-[12px] font-medium text-slate-500">
                      Accept mobile wallet payments via GCash
                    </p>
                  </div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={acceptsGcash}
                    onChange={(e) => onChange("acceptsGcash", e.target.checked)}
                  />
                  <div className="peer relative h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500" />
                </div>
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="text-[20px]">💵</span>
                  <div>
                    <p className="text-[14px] font-semibold text-slate-900">Cash</p>
                    <p className="text-[12px] font-medium text-slate-500">
                      Accept cash payments on-site
                    </p>
                  </div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={acceptsCash}
                    onChange={(e) => onChange("acceptsCash", e.target.checked)}
                  />
                  <div className="peer relative h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500" />
                </div>
              </label>
            </div>
          </div>

          {acceptsGcash && (
            <div className="border-t border-slate-200 pt-5">
              <p className="mb-4 text-[13px] font-semibold text-slate-700">GCash Details</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700">
                    GCash Number
                  </label>
                  <input
                    type="tel"
                    value={gcashNumber}
                    onChange={(e) => onChange("gcashNumber", e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-[14px] font-medium text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    placeholder="09XX XXX XXXX"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700">
                    GCash Account Name
                  </label>
                  <input
                    type="text"
                    value={gcashName}
                    onChange={(e) => onChange("gcashName", e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-[14px] font-medium text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    placeholder="e.g. Maria Santos"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 pt-5">
            <label className="block text-[13px] font-semibold text-slate-700">
              Messenger Link
            </label>
            <p className="mt-0.5 text-[12px] font-medium text-slate-500">
              Shown to users for sending GCash proof or asking questions.
            </p>
            <input
              type="url"
              value={messengerUrl}
              onChange={(e) => onChange("messengerUrl", e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-[14px] font-medium text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="https://m.me/yourpage"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HouseRulesSection({
  rules,
  onAdd,
  onUpdate,
  onRemove,
}: {
  rules: string[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5 sm:py-4">
        <h2 className="text-[15px] font-bold text-slate-900">
          {SECTION_CONFIG.houseRules.title}
        </h2>
        <p className="mt-0.5 text-[13px] font-medium text-slate-500">
          {SECTION_CONFIG.houseRules.description}
        </p>
      </div>
      <div className="px-4 py-5 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4">
          {rules.length > 0 && (
            <div className="flex flex-col gap-2">
              {rules.map((rule, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-2.5"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => onUpdate(index, e.target.value)}
                    className="flex-1 min-w-0 bg-transparent text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    placeholder="Enter house rule..."
                  />
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="shrink-0 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Remove rule"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-[11px] font-bold text-green-700">
              {rules.length + 1}
            </span>
            <button
              type="button"
              onClick={onAdd}
              className="flex-1 rounded-lg border-2 border-dashed border-slate-300 px-3 py-2.5 text-[14px] font-semibold text-slate-500 transition-colors hover:border-green-500 hover:text-green-600"
            >
              + Add a new house rule
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
