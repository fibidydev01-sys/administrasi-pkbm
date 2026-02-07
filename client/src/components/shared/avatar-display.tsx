import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { User } from "lucide-react";

interface AvatarDisplayProps {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
};

export function AvatarDisplay({
  name,
  imageUrl,
  size = "md",
  className,
}: AvatarDisplayProps) {
  const initials = getInitials(name);

  return (
    <Avatar className={cn(sizeMap[size], className)}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback className="bg-primary/10 text-primary">
        {initials || <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
}

interface GuruAvatarProps {
  nama: string;
  fotoUrl?: string | null;
  jabatan?: string | null;
  size?: "sm" | "md" | "lg";
  showInfo?: boolean;
  className?: string;
}

export function GuruAvatar({
  nama,
  fotoUrl,
  jabatan,
  size = "md",
  showInfo = false,
  className,
}: GuruAvatarProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <AvatarDisplay name={nama} imageUrl={fotoUrl} size={size} />
      {showInfo && (
        <div className="min-w-0">
          <p className="font-medium truncate">{nama}</p>
          {jabatan && (
            <p className="text-sm text-muted-foreground truncate">{jabatan}</p>
          )}
        </div>
      )}
    </div>
  );
}