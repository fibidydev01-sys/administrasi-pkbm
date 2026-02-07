import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Kembali",
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {backHref && (
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link href={backHref}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}