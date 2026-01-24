import { CreateKpiForm } from "@/components/kpis/create-kpi-form";

export default function CreateKpiPage() {
  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New KPI</h1>
        <p className="text-muted-foreground">
          Define a new Key Performance Indicator to track your sustainability
          goals.
        </p>
      </div>
      <CreateKpiForm />
    </div>
  );
}
