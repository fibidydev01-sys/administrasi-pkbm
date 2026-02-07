"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftRight,
  Plus,
  Inbox,
  Send,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { useTukarJadwalStore } from "@/stores";
import { getToday } from "@/lib/utils";
import { PageHeader, LoadingSpinner } from "@/components/shared";
import { TukarJadwalCard, TukarJadwalForm } from "@/components/tukar-jadwal";
import { ConfirmDialog } from "@/components/shared";
import type { TukarJadwalWithRelations } from "@/types";

export default function TukarJadwalPage() {
  const { guru, isLoading: authLoading } = useAuth();
  const {
    permintaanSaya,
    permintaanMasuk,
    pendingMasukCount,
    isLoading,
    isSubmitting,
    fetchPermintaanSaya,
    fetchPermintaanMasuk,
    respondTukarJadwal,
    cancelTukarJadwal,
  } = useTukarJadwalStore();

  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("masuk");

  // Confirm dialogs
  const [confirmApprove, setConfirmApprove] = useState<{ tukarGuruId: string; tukarJadwalId: string } | null>(null);
  const [confirmReject, setConfirmReject] = useState<{ tukarGuruId: string; tukarJadwalId: string } | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  useEffect(() => {
    if (guru?.id) {
      fetchPermintaanSaya(guru.id);
      fetchPermintaanMasuk(guru.id);
    }
  }, [guru?.id, fetchPermintaanSaya, fetchPermintaanMasuk]);

  // Auto-switch to masuk tab if there are pending requests
  useEffect(() => {
    if (pendingMasukCount > 0) {
      setActiveTab("masuk");
    }
  }, [pendingMasukCount]);

  const handleApprove = async () => {
    if (!confirmApprove || !guru?.id) return;
    const result = await respondTukarJadwal(confirmApprove.tukarGuruId, confirmApprove.tukarJadwalId, "approved");
    if (result.success) {
      toast.success("Permintaan tukar jadwal disetujui!");
      fetchPermintaanMasuk(guru.id);
      fetchPermintaanSaya(guru.id);
    } else {
      toast.error(result.error || "Gagal menyetujui");
    }
    setConfirmApprove(null);
  };

  const handleReject = async () => {
    if (!confirmReject || !guru?.id) return;
    const result = await respondTukarJadwal(confirmReject.tukarGuruId, confirmReject.tukarJadwalId, "rejected");
    if (result.success) {
      toast.success("Permintaan tukar jadwal ditolak");
      fetchPermintaanMasuk(guru.id);
      fetchPermintaanSaya(guru.id);
    } else {
      toast.error(result.error || "Gagal menolak");
    }
    setConfirmReject(null);
  };

  const handleCancel = async () => {
    if (!confirmCancel || !guru?.id) return;
    const result = await cancelTukarJadwal(confirmCancel);
    if (result.success) {
      toast.success("Permintaan dibatalkan");
      fetchPermintaanSaya(guru.id);
    } else {
      toast.error(result.error || "Gagal membatalkan");
    }
    setConfirmCancel(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    if (guru?.id) {
      fetchPermintaanSaya(guru.id);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Memuat..." />
      </div>
    );
  }

  if (!guru) return null;

  // Show form view
  if (showForm) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <PageHeader
          title="Ajukan Tukar Jadwal"
          description="Pilih jadwal, tanggal, dan guru yang mau ditukar"
        />
        <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="-mt-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali
        </Button>
        <TukarJadwalForm
          guruId={guru.id}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  // Filter: hanya pending + approved yang tampil. Rejected/cancelled/expired → hilang total.
  // Swap yang kedua tanggalnya sudah lewat → otomatis hilang (bersih).
  // Pending yang salah satu tanggalnya sudah lewat → ga relevan lagi, hilang juga.
  const today = getToday();

  const activeSaya = permintaanSaya.filter(
    (p) => p.status === "pending" && p.tanggal_pemohon >= today && p.tanggal_target >= today
  );
  const approvedSaya = permintaanSaya.filter(
    (p) => p.status === "approved" && (p.tanggal_pemohon >= today || p.tanggal_target >= today)
  );
  const activeMasuk = permintaanMasuk.filter(
    (p) => p.status === "pending" && p.tanggal_pemohon >= today && p.tanggal_target >= today
  );
  const approvedMasuk = permintaanMasuk.filter(
    (p) => p.status === "approved" && (p.tanggal_pemohon >= today || p.tanggal_target >= today)
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Tukar Jadwal"
        description="Ajukan atau respon permintaan tukar jadwal"
        action={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Ajukan
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="masuk" className="gap-1.5">
            <Inbox className="h-4 w-4" />
            Masuk
            {pendingMasukCount > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 px-1 text-[10px]">
                {pendingMasukCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="saya" className="gap-1.5">
            <Send className="h-4 w-4" />
            Terkirim
            {activeSaya.length > 0 && (
              <Badge variant="outline" className="h-5 min-w-5 px-1 text-[10px]">
                {activeSaya.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Permintaan Masuk */}
        {/* Hanya tampilkan: pending (perlu aksi) + approved (info swap aktif) */}
        {/* Rejected/cancelled/expired → hilang total, ga bikin bingung */}
        <TabsContent value="masuk" className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner text="Memuat permintaan..." />
            </div>
          ) : activeMasuk.length === 0 && approvedMasuk.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Tidak ada permintaan masuk"
              description="Permintaan tukar jadwal dari guru lain akan muncul di sini"
            />
          ) : (
            <>
              {activeMasuk.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Menunggu Respon ({activeMasuk.length})
                  </h3>
                  {activeMasuk.map((tj) => (
                    <TukarJadwalCard
                      key={tj.id}
                      tukarJadwal={tj}
                      currentGuruId={guru.id}
                      mode="masuk"
                      onApprove={(tukarGuruId, tukarJadwalId) =>
                        setConfirmApprove({ tukarGuruId, tukarJadwalId })
                      }
                      onReject={(tukarGuruId, tukarJadwalId) =>
                        setConfirmReject({ tukarGuruId, tukarJadwalId })
                      }
                      isSubmitting={isSubmitting}
                    />
                  ))}
                </div>
              )}

              {approvedMasuk.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-green-600">
                    Swap Aktif ({approvedMasuk.length})
                  </h3>
                  {approvedMasuk.map((tj) => (
                    <TukarJadwalCard
                      key={tj.id}
                      tukarJadwal={tj}
                      currentGuruId={guru.id}
                      mode="masuk"
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Tab: Permintaan Saya (Terkirim) */}
        {/* Sama: hanya pending + approved. Rejected/cancelled → hilang. Clean. */}
        <TabsContent value="saya" className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner text="Memuat permintaan..." />
            </div>
          ) : activeSaya.length === 0 && approvedSaya.length === 0 ? (
            <EmptyState
              icon={Send}
              title="Belum ada permintaan"
              description="Klik tombol 'Ajukan' untuk membuat permintaan tukar jadwal baru"
            />
          ) : (
            <>
              {activeSaya.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Menunggu Respon ({activeSaya.length})
                  </h3>
                  {activeSaya.map((tj) => (
                    <TukarJadwalCard
                      key={tj.id}
                      tukarJadwal={tj}
                      currentGuruId={guru.id}
                      mode="saya"
                      onCancel={(id) => setConfirmCancel(id)}
                      isSubmitting={isSubmitting}
                    />
                  ))}
                </div>
              )}

              {approvedSaya.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-green-600">
                    Swap Aktif ({approvedSaya.length})
                  </h3>
                  {approvedSaya.map((tj) => (
                    <TukarJadwalCard
                      key={tj.id}
                      tukarJadwal={tj}
                      currentGuruId={guru.id}
                      mode="saya"
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={!!confirmApprove}
        onOpenChange={(open) => !open && setConfirmApprove(null)}
        title="Setujui Tukar Jadwal?"
        description="Anda yakin ingin menyetujui permintaan tukar jadwal ini? Jadwal Anda akan ditukar pada tanggal yang ditentukan."
        confirmLabel="Ya, Setuju"
        isLoading={isSubmitting}
        onConfirm={handleApprove}
      />

      <ConfirmDialog
        open={!!confirmReject}
        onOpenChange={(open) => !open && setConfirmReject(null)}
        title="Tolak Tukar Jadwal?"
        description="Anda yakin ingin menolak permintaan tukar jadwal ini?"
        confirmLabel="Ya, Tolak"
        variant="destructive"
        isLoading={isSubmitting}
        onConfirm={handleReject}
      />

      <ConfirmDialog
        open={!!confirmCancel}
        onOpenChange={(open) => !open && setConfirmCancel(null)}
        title="Batalkan Permintaan?"
        description="Anda yakin ingin membatalkan permintaan tukar jadwal ini?"
        confirmLabel="Ya, Batalkan"
        variant="destructive"
        isLoading={isSubmitting}
        onConfirm={handleCancel}
      />
    </div>
  );
}

// Simple inline empty state component
function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/50 mb-3" />
      <h3 className="font-medium text-muted-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground/70 mt-1">{description}</p>
    </div>
  );
}
