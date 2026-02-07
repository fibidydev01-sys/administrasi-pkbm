"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks";
import { ROLE_LABELS } from "@/constants";
import type { UserRole } from "@/types";

import { PageHeader, FullPageLoader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Save, User } from "lucide-react";

export default function ProfilPage() {
  const { user, isLoading, refetch } = useAuth();
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isNameLoaded, setIsNameLoaded] = useState(false);
  const supabase = createClient();

  // Initialize name from user data
  if (user && !isNameLoaded) {
    setFullName(user.full_name);
    setIsNameLoaded(true);
  }

  async function handleSave() {
    if (!user) return;
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from("user_profiles")
        .update({ full_name: fullName.trim() })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profil berhasil diperbarui");
      await refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <FullPageLoader />;

  if (!user) return null;

  const roleLabel = ROLE_LABELS[user.role as UserRole] ?? user.role;

  return (
    <div className="space-y-6">
      <PageHeader title="Profil Saya" description="Kelola informasi profil Anda" />

      <div className="max-w-2xl">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle>{user.full_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="mt-1">
                {roleLabel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap Anda"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled />
              <p className="text-xs text-muted-foreground">
                Email tidak dapat diubah dari sini
              </p>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={roleLabel} disabled />
              <p className="text-xs text-muted-foreground">
                Role diatur oleh administrator
              </p>
            </div>

            <Button onClick={handleSave} disabled={isSaving || !fullName.trim()}>
              {isSaving ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
