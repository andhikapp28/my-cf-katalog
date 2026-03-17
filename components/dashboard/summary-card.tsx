import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export function SummaryCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs uppercase tracking-[0.24em] text-ink-500">{label}</p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-ink-900">{typeof value === "number" ? formatCurrency(value) : value}</p>
        {helper ? <p className="mt-2 text-sm text-ink-500">{helper}</p> : null}
      </CardContent>
    </Card>
  );
}


