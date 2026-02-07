"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  IdCard,
  CheckCircle,
  Shield,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks";
import { useGuruStore } from "@/stores";
import { PageHeader, AvatarDisplay } from "@/components/shared";
import { toast } from "sonner";

export default function ProfilPage() {
  const { guru, refetch } = useAuth();
  const { updateGuru, isSubmitting } = useGuruStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama: guru?.nama || "",
    no_hp: guru?.no_hp || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    if (!guru) return;

    const result = await updateGuru(guru.id, {
      nama: formData.nama,
      no_hp: formData.no_hp || null,
    });

    if (result.success) {
      toast.success("Profil berhasil diperbarui");
      setIsEditing(false);
      refetch();
    } else {
      toast.error(result.error || "Gagal memperbarui profil");
    }
  };

  const handleCancel = () => {
    setFormData({
      nama: guru?.nama || "",
      no_hp: guru?.no_hp || "",
    });
    setIsEditing(false);
  };

  if (!guru) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Profil Saya" description="Kelola informasi akun Anda" />

      {/* Profile Card */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto">
            <AvatarDisplay name={guru.nama} imageUrl={guru.foto_url} size="lg" />
          </div>
          <CardTitle className="mt-4">{guru.nama}</CardTitle>
          <div className="flex flex-wrap justify-center gap-2">
            {guru.is_admin && (
              <Badge variant="default" className="gap-1">
                <Shield className="h-3 w-3" />
                Admin
              </Badge>
            )}
            {guru.is_verified && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Terverifikasi
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Nama lengkap"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_hp">No. HP</Label>
                <Input
                  id="no_hp"
                  name="no_hp"
                  value={formData.no_hp}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Simpan
                </Button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{guru.email}</p>
                </div>
              </div>

              {guru.nip && (
                <div className="flex items-center gap-3">
                  <IdCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">NIP</p>
                    <p className="font-medium">{guru.nip}</p>
                  </div>
                </div>
              )}

              {guru.jabatan && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Jabatan</p>
                    <p className="font-medium">{guru.jabatan}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">No. HP</p>
                  <p className="font-medium">{guru.no_hp || "-"}</p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="mt-4 w-full"
              >
                Edit Profil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Alert>
        <AlertDescription>
          Untuk mengubah email, NIP, atau jabatan, silakan hubungi administrator.
        </AlertDescription>
      </Alert>
    </div>
  );
}