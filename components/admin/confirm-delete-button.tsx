import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmDeleteButton({
  label = "Delete",
  className
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Button type="submit" variant="danger" className={cn("min-w-[88px]", className)}>
      {label}
    </Button>
  );
}