"use client";

import { use, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useLembaga, usePermissions } from "@/hooks";
import { lembagaSchema, type LembagaFormData } from "@/lib/validators";
import { ROUTES } from "@/constants";

import { PageHeader, FullPageLoader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function LembagaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { lembaga, loading, updateLembaga } = useLembaga(id);
  const { can } = usePermissions();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LembagaFormData>({
    resolver: zodResolver(lembagaSchema),
    values: lembaga
      ? {
          kode: lembaga.kode,
          nama: lembaga.nama,
          alamat: lembaga.alamat,
          telepon: lembaga.telepon ?? "",
          email: lembaga.email ?? "",
          website: lembaga.website ?? "",
          nomor_prefix: lembaga.nomor_prefix,
          ttd_jabatan: lembaga.ttd_jabatan ?? "",
          ttd_nama: lembaga.ttd_nama ?? "",
          ttd_nip: lembaga.ttd_nip ?? "",
        }
      : undefined,
  });

  async function onSubmit(data: LembagaFormData) {
    try {
      setIsSaving(true);
      await updateLembaga(data);
      toast.success("Data lembaga berhasil diperbarui");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) return <FullPageLoader />;

  if (!lembaga) {
    return (
      <div className="space-y-6">
        <PageHeader title="Lembaga tidak ditemukan" />
        <Link href={ROUTES.LEMBAGA}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
      </div>
    );
  }

  const canEdit = can.updateLembaga;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`[${lembaga.kode}] ${lembaga.nama}`}
        description="Detail dan pengaturan lembaga"
      >
        <Link href={ROUTES.LEMBAGA}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Umum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kode">Kode Lembaga *</Label>
                <Input id="kode" {...register("kode")} disabled={!canEdit} />
                {errors.kode && (
                  <p className="text-sm text-destructive">{errors.kode.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomor_prefix">Prefix Nomor Surat *</Label>
                <Input id="nomor_prefix" {...register("nomor_prefix")} disabled={!canEdit} />
                {errors.nomor_prefix && (
                  <p className="text-sm text-destructive">{errors.nomor_prefix.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lembaga *</Label>
              <Input id="nama" {...register("nama")} disabled={!canEdit} />
              {errors.nama && (
                <p className="text-sm text-destructive">{errors.nama.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat *</Label>
              <Input id="alamat" {...register("alamat")} disabled={!canEdit} />
              {errors.alamat && (
                <p className="text-sm text-destructive">{errors.alamat.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telepon">Telepon</Label>
                <Input id="telepon" {...register("telepon")} disabled={!canEdit} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" {...register("email")} disabled={!canEdit} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" {...register("website")} disabled={!canEdit} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Penandatangan Default</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ttd_jabatan">Jabatan</Label>
              <Input
                id="ttd_jabatan"
                {...register("ttd_jabatan")}
                placeholder="Ketua Yayasan"
                disabled={!canEdit}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ttd_nama">Nama</Label>
                <Input id="ttd_nama" {...register("ttd_nama")} disabled={!canEdit} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ttd_nip">NIP</Label>
                <Input id="ttd_nip" {...register("ttd_nip")} disabled={!canEdit} />
              </div>
            </div>
          </CardContent>
        </Card>

        {canEdit && (
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSaving}>
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
          </div>
        )}
      </form>
    </div>
  );
}
