import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileEdit,
  Send,
  Archive,
} from "lucide-react";
import type { SuratStatus } from "@/types";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }
> = {
  draft: { label: "Draft", variant: "secondary", icon: FileEdit },
  approved: { label: "Disetujui", variant: "default", icon: CheckCircle },
  sent: { label: "Terkirim", variant: "outline", icon: Send },
  archived: { label: "Diarsipkan", variant: "outline", icon: Archive },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    variant: "outline" as const,
    icon: Clock,
  };
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn("gap-1", className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
