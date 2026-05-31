import { getPrimaryCourt } from "@/services/courts/court-service";
import { CourtSettingsForm } from "@/components/admin/CourtSettingsForm";

export default async function AdminSettingsPage() {
  const court = await getPrimaryCourt();

  return (
    <div className="flex flex-col">
      <CourtSettingsForm court={court} />
    </div>
  );
}
