"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useMediaQuery } from "@/hooks";
import { jadwalSchema } from "@/lib/validators";
import { HARI_OPTIONS } from "@/types";
import type { Jadwal, Guru } from "@/types";
import { z } from "zod";

type JadwalFormValues = z.infer<typeof jadwalSchema>;

interface JadwalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jadwal?: Jadwal | null;
  guruList: Guru[];
  onSubmit: (data: JadwalFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function JadwalForm({
  open,
  onOpenChange,
  jadwal,
  guruList,
  onSubmit,
  isSubmitting,
}: JadwalFormProps) {
  const isEdit = !!jadwal;
  const isMobile = useMediaQuery("(max-width: 640px)");

  const form = useForm<JadwalFormValues>({
    resolver: zodResolver(jadwalSchema),
    defaultValues: {
      hari: 1,
      jam_mulai: "13:00",
      jam_selesai: "14:45",
      guru_id: "",
      mapel: "",
      keterangan: "",
      lokasi: "jiwan",
      is_active: true,
    },
  });

  useEffect(() => {
    if (jadwal) {
      form.reset({
        hari: jadwal.hari,
        jam_mulai: jadwal.jam_mulai.slice(0, 5),
        jam_selesai: jadwal.jam_selesai.slice(0, 5),
        guru_id: jadwal.guru_id,
        mapel: jadwal.mapel || "",
        keterangan: jadwal.keterangan || "",
        lokasi: jadwal.lokasi,
        is_active: jadwal.is_active,
      });
    } else {
      form.reset({
        hari: 1,
        jam_mulai: "13:00",
        jam_selesai: "14:45",
        guru_id: "",
        mapel: "",
        keterangan: "",
        lokasi: "jiwan",
        is_active: true,
      });
    }
  }, [jadwal, form, open]);

  const handleFormSubmit = async (data: JadwalFormValues) => {
    await onSubmit(data);
    if (!isEdit) {
      form.reset();
    }
  };

  const activeGuruList = guruList.filter(g => g.is_active);

  const FormContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="hari"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hari</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(parseInt(v))}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih hari" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {HARI_OPTIONS.map((h) => (
                      <SelectItem key={h.value} value={h.value.toString()}>
                        {h.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guru_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guru</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih guru" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activeGuruList.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="jam_mulai"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jam Mulai</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jam_selesai"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jam Selesai</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="mapel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mata Pelajaran</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Matematika" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lokasi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lokasi Mengajar</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih lokasi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="jiwan">Jiwan - Madiun</SelectItem>
                  <SelectItem value="grobogan">Grobogan - Madiun</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-sm">Status Aktif</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Nonaktif = tidak muncul untuk absen
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="flex-1"
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEdit ? "Simpan" : "Tambah"}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>
              {isEdit ? "Edit Jadwal" : "Tambah Jadwal Baru"}
            </DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="px-4 pb-4 overflow-auto">
            {FormContent}
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-hidden flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>
            {isEdit ? "Edit Jadwal" : "Tambah Jadwal Baru"}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6 py-4">
          {FormContent}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}