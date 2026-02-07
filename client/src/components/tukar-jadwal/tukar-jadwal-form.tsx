"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  ArrowLeftRight,
  Search,
  ChevronRight,
  ChevronLeft,
  Send,
  Calendar,
  User,
  Clock,
  Check,
  BookOpen,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { tukarJadwalSchema, type TukarJadwalFormData } from "@/lib/validators";
import { useTukarJadwalStore } from "@/stores";
import { getHariName, formatJam } from "@/lib/jadwal";
import { formatTanggalPendek } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { JadwalWithGuru } from "@/types";

// =============================================
// Step definitions
// =============================================
const STEPS = [
  { label: "Jadwal", icon: BookOpen },
  { label: "Tanggal", icon: Calendar },
  { label: "Guru", icon: User },
  { label: "Kirim", icon: Send },
] as const;

// =============================================
// Timeline Stepper Component (minimalist)
// =============================================
function StepTimeline({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-5">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={idx} className="flex items-center">
            {/* Circle + Label */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isActive
                      ? "border-2 border-primary text-primary"
                      : "border border-muted-foreground/25 text-muted-foreground/40"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span className="text-[11px] font-semibold">{stepNum}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive
                    ? "text-foreground"
                    : isCompleted
                      ? "text-muted-foreground"
                      : "text-muted-foreground/40"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Short line connector */}
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-8 h-px mx-1 mb-5",
                  stepNum < currentStep
                    ? "bg-primary"
                    : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// =============================================
// Main Form Component
// =============================================
interface TukarJadwalFormProps {
  guruId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TukarJadwalForm({ guruId, onSuccess, onCancel }: TukarJadwalFormProps) {
  const { createTukarJadwal, isSubmitting } = useTukarJadwalStore();

  // Step state
  const [step, setStep] = useState(1);

  // Data
  const [myJadwalList, setMyJadwalList] = useState<JadwalWithGuru[]>([]);
  const [targetJadwalList, setTargetJadwalList] = useState<JadwalWithGuru[]>([]);
  const [isLoadingJadwal, setIsLoadingJadwal] = useState(false);
  const [isLoadingTarget, setIsLoadingTarget] = useState(false);

  // Selections
  const [selectedJadwal, setSelectedJadwal] = useState<JadwalWithGuru | null>(null);
  const [selectedTargetGuru, setSelectedTargetGuru] = useState<Map<string, { guru_id: string; jadwal_id: string; nama: string; mapel: string; jam: string }>>(new Map());

  // Form
  const form = useForm<TukarJadwalFormData>({
    resolver: zodResolver(tukarJadwalSchema),
    defaultValues: {
      jadwal_pemohon_id: "",
      tanggal_pemohon: "",
      tanggal_target: "",
      alasan: "",
      guru_target: [],
    },
  });

  // Load my jadwal list
  useEffect(() => {
    const loadMyJadwal = async () => {
      setIsLoadingJadwal(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("jadwal")
        .select("*, guru:guru_id(*)")
        .eq("guru_id", guruId)
        .eq("is_active", true)
        .order("hari", { ascending: true })
        .order("jam_mulai", { ascending: true });

      if (!error && data) {
        setMyJadwalList(data as JadwalWithGuru[]);
      }
      setIsLoadingJadwal(false);
    };
    loadMyJadwal();
  }, [guruId]);

  // Load target jadwal when target date is selected
  const loadTargetJadwal = async (tanggalTarget: string) => {
    setIsLoadingTarget(true);
    setSelectedTargetGuru(new Map());

    const [year, month, day] = tanggalTarget.split("-").map(Number);
    const targetDate = new Date(year, month - 1, day);
    const targetDayIndex = targetDate.getDay();

    const supabase = createClient();
    const { data, error } = await supabase
      .from("jadwal")
      .select("*, guru:guru_id(*)")
      .eq("hari", targetDayIndex)
      .eq("is_active", true)
      .neq("guru_id", guruId)
      .order("jam_mulai", { ascending: true });

    if (!error && data) {
      setTargetJadwalList(data as JadwalWithGuru[]);
    }
    setIsLoadingTarget(false);
  };

  // Auto-calculate next occurrence of a day (0=Minggu, 1=Senin, ...)
  // diff == 0 means today IS that day → keep today (allow same-day swap)
  // diff < 0 means that day already passed this week → jump to next week
  const getNextOccurrence = (dayIndex: number): string => {
    const today = new Date();
    const todayDay = today.getDay();
    let diff = dayIndex - todayDay;
    if (diff < 0) diff += 7;
    const next = new Date(today);
    next.setDate(today.getDate() + diff);
    // Use local date parts to avoid UTC timezone shift
    const yyyy = next.getFullYear();
    const mm = String(next.getMonth() + 1).padStart(2, "0");
    const dd = String(next.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSelectJadwal = (jadwal: JadwalWithGuru) => {
    setSelectedJadwal(jadwal);
    form.setValue("jadwal_pemohon_id", jadwal.id);
    form.setValue("tanggal_pemohon", getNextOccurrence(jadwal.hari));
  };

  const handleTanggalTargetChange = (tanggal: string) => {
    form.setValue("tanggal_target", tanggal);
    form.clearErrors("tanggal_target");
    if (tanggal) {
      loadTargetJadwal(tanggal);
    }
  };

  const toggleGuruTarget = (jadwal: JadwalWithGuru) => {
    const newMap = new Map(selectedTargetGuru);
    const key = `${jadwal.guru_id}_${jadwal.id}`;

    if (newMap.has(key)) {
      newMap.delete(key);
    } else {
      newMap.set(key, {
        guru_id: jadwal.guru_id,
        jadwal_id: jadwal.id,
        nama: jadwal.guru?.nama || "",
        mapel: jadwal.mapel || "Tanpa Mapel",
        jam: `${formatJam(jadwal.jam_mulai)} - ${formatJam(jadwal.jam_selesai)}`,
      });
    }

    setSelectedTargetGuru(newMap);
    form.setValue(
      "guru_target",
      Array.from(newMap.values()).map((v) => ({
        guru_id: v.guru_id,
        jadwal_id: v.jadwal_id,
      }))
    );
  };

  const handleSubmit = async () => {
    const values = form.getValues();
    const result = tukarJadwalSchema.safeParse(values);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Data tidak valid";
      toast.error(firstError);
      return;
    }

    const response = await createTukarJadwal(guruId, result.data);
    if (response.success) {
      toast.success("Permintaan tukar jadwal berhasil dikirim!");
      onSuccess();
    } else {
      toast.error(response.error || "Gagal mengirim permintaan");
    }
  };

  // Step validation (can proceed?)
  const canNextStep1 = !!selectedJadwal;
  const canNextStep2 = !!form.watch("tanggal_target") && !form.formState.errors.tanggal_target;
  const canNextStep3 = selectedTargetGuru.size > 0;

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      {/* Timeline Stepper */}
      <StepTimeline currentStep={step} />

      {/* Step Content */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* ========================= STEP 1 ========================= */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Pilih Jadwal Saya</h3>
                <p className="text-xs text-muted-foreground">Tap jadwal yang mau kamu tukar</p>
              </div>

              {isLoadingJadwal ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : myJadwalList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Tidak ada jadwal aktif
                </p>
              ) : (
                <div className="space-y-2">
                  {myJadwalList.map((j) => {
                    const isSelected = selectedJadwal?.id === j.id;
                    const nextDate = getNextOccurrence(j.hari);

                    return (
                      <div
                        key={j.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => handleSelectJadwal(j)}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{j.mapel || "Tanpa Mapel"}</p>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{getHariName(j.hari)}, {formatJam(j.jam_mulai)} - {formatJam(j.jam_selesai)}</span>
                          <span>·</span>
                          <span>{j.lokasi}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mt-1.5">
                          <Calendar className="h-3 w-3" />
                          <span>{formatTanggalPendek(nextDate)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================= STEP 2 ========================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Pilih Tanggal Tujuan</h3>
                <p className="text-xs text-muted-foreground">Mau ditukar ke tanggal berapa?</p>
              </div>

              {/* Mini summary of step 1 */}
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="text-xs">
                  <span className="font-medium">{selectedJadwal?.mapel || "Tanpa Mapel"}</span>
                  <span className="text-muted-foreground">
                    {" "}· {getHariName(selectedJadwal!.hari)}, {formatTanggalPendek(form.getValues("tanggal_pemohon"))}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Tanggal tujuan swap</Label>
                <Input
                  type="date"
                  min={today}
                  value={form.watch("tanggal_target")}
                  onChange={(e) => handleTanggalTargetChange(e.target.value)}
                />
                {form.formState.errors.tanggal_target && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.tanggal_target.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ========================= STEP 3 ========================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Pilih Guru yang Ditukar</h3>
                <p className="text-xs text-muted-foreground">Bisa pilih lebih dari 1 guru</p>
              </div>

              {isLoadingTarget ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : targetJadwalList.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Search className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    Tidak ada jadwal guru lain di tanggal ini
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                    Ganti tanggal
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {targetJadwalList.map((j) => {
                    const key = `${j.guru_id}_${j.id}`;
                    const isSelected = selectedTargetGuru.has(key);

                    return (
                      <div
                        key={j.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => toggleGuruTarget(j)}
                      >
                        <Checkbox checked={isSelected} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {j.guru?.nama}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{j.mapel || "Tanpa Mapel"}</span>
                            <span>-</span>
                            <span>{formatJam(j.jam_mulai)} - {formatJam(j.jam_selesai)}</span>
                            <span>-</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />
                              {j.lokasi}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {selectedTargetGuru.size > 0 && (
                    <p className="text-xs text-primary font-medium pt-1">
                      {selectedTargetGuru.size} guru dipilih
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================= STEP 4 ========================= */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Preview & Kirim</h3>
                <p className="text-xs text-muted-foreground">Periksa dan kirim permintaan</p>
              </div>

              {/* Preview Card */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                {/* My jadwal */}
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Jadwal Saya</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{formatTanggalPendek(form.getValues("tanggal_pemohon"))}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{selectedJadwal?.mapel || "Tanpa Mapel"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{formatJam(selectedJadwal!.jam_mulai)} - {formatJam(selectedJadwal!.jam_selesai)}</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center py-1">
                  <ArrowLeftRight className="h-5 w-5 text-primary" />
                </div>

                {/* Target */}
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Ditukar Dengan</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{formatTanggalPendek(form.getValues("tanggal_target"))}</span>
                  </div>
                  {Array.from(selectedTargetGuru.values()).map((g, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{g.nama}</span>
                      <span className="text-muted-foreground text-xs">({g.mapel}, {g.jam})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alasan */}
              <div className="space-y-2">
                <Label className="text-sm">Catatan (opsional)</Label>
                <Textarea
                  placeholder="Alasan tukar jadwal..."
                  rows={2}
                  className="resize-none"
                  onChange={(e) => form.setValue("alasan", e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-2">
        {step > 1 && (
          <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        )}

        {step === 1 && (
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Batal
          </Button>
        )}

        {step < 4 && (
          <Button
            className="flex-1"
            disabled={
              (step === 1 && !canNextStep1) ||
              (step === 2 && !canNextStep2) ||
              (step === 3 && !canNextStep3)
            }
            onClick={() => setStep(step + 1)}
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}

        {step === 4 && (
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Send className="h-4 w-4 mr-1" />
            )}
            Kirim Permintaan
          </Button>
        )}
      </div>
    </div>
  );
}
