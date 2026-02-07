"use client";

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useGuruStore } from "@/stores";
import { useMediaQuery } from "@/hooks";
import { guruSchema } from "@/lib/validators";
import { toast } from "sonner";
import type { Guru } from "@/types";
import { z } from "zod";

type GuruFormValues = z.infer<typeof guruSchema>;

interface GuruFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guru?: Guru | null;
  onSuccess?: () => void;
}

export function GuruForm({ open, onOpenChange, guru, onSuccess }: GuruFormProps) {
  const { createGuru, updateGuru, isSubmitting } = useGuruStore();
  const isEdit = !!guru;
  const isMobile = useMediaQuery("(max-width: 640px)");

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const form = useForm<GuruFormValues>({
    resolver: zodResolver(guruSchema),
    defaultValues: {
      nama: "",
      email: "",
      nip: "",
      jabatan: "",
      no_hp: "",
      is_admin: false,
      is_active: true,
    },
  });

  useEffect(() => {
    if (guru) {
      form.reset({
        nama: guru.nama,
        email: guru.email,
        nip: guru.nip || "",
        jabatan: guru.jabatan || "",
        no_hp: guru.no_hp || "",
        is_admin: guru.is_admin,
        is_active: guru.is_active,
      });
    } else {
      form.reset({
        nama: "",
        email: "",
        nip: "",
        jabatan: "",
        no_hp: "",
        is_admin: false,
        is_active: true,
      });
    }
    setShowChangePassword(false);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  }, [guru, form, open]);

  const onSubmit = async (data: GuruFormValues) => {
    if (!isEdit) {
      if (!newPassword || newPassword.length < 6) {
        setPasswordError("Password minimal 6 karakter");
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("Password tidak cocok");
        return;
      }
    }

    if (isEdit && showChangePassword) {
      if (!newPassword || newPassword.length < 6) {
        setPasswordError("Password minimal 6 karakter");
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("Password tidak cocok");
        return;
      }
    }

    const payload = {
      nama: data.nama,
      email: data.email,
      nip: data.nip || null,
      jabatan: data.jabatan || null,
      no_hp: data.no_hp || null,
      is_admin: data.is_admin,
      is_active: data.is_active,
    };

    let result;
    if (isEdit && guru) {
      result = await updateGuru(guru.id, payload);

      if (result.success && showChangePassword && newPassword && guru.auth_user_id) {
        try {
          const response = await fetch('/api/admin/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              auth_user_id: guru.auth_user_id,
              new_password: newPassword,
            }),
          });

          const data = await response.json();

          if (!data.success) {
            toast.error("Guru diupdate tapi gagal ubah password: " + data.error);
          } else {
            toast.success("Guru dan password berhasil diupdate");
          }
        } catch (err) {
          console.error('Reset password error:', err);
          toast.error("Gagal mengubah password");
        }
      } else if (result.success) {
        toast.success("Guru berhasil diupdate");
      }
    } else {
      result = await createGuru({
        ...payload,
        is_verified: true,
        password: newPassword
      });

      if (result.success) {
        toast.success("Guru berhasil ditambahkan");
      } else {
        toast.error(result.error || "Gagal menambahkan guru");
      }
    }

    if (result.success) {
      onSuccess?.();
      onOpenChange(false);
    }
  };

  const FormContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap *</FormLabel>
              <FormControl>
                <Input placeholder="Nama lengkap" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@pkbm.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  ⚠️ Admin dapat mengubah email user
                </p>
              )}
            </FormItem>
          )}
        />

        {!isEdit && (
          <div className="space-y-3 border-t pt-3">
            <FormLabel className="text-sm font-medium">Password Akun *</FormLabel>
            <div className="space-y-3 bg-muted/50 p-3 rounded-lg">
              <div className="space-y-2">
                <FormLabel className="text-xs">Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError("");
                  }}
                />
              </div>
              <div className="space-y-2">
                <FormLabel className="text-xs">Konfirmasi Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError("");
                  }}
                />
              </div>
              {passwordError && (
                <p className="text-xs text-destructive">{passwordError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                💡 Password ini akan digunakan guru untuk login pertama kali
              </p>
            </div>
          </div>
        )}

        {isEdit && (
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <FormLabel className="text-sm font-medium">Ubah Password</FormLabel>
              <Switch
                checked={showChangePassword}
                onCheckedChange={(checked) => {
                  setShowChangePassword(checked);
                  if (!checked) {
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                  }
                }}
              />
            </div>

            {showChangePassword && (
              <div className="space-y-3 bg-muted/50 p-3 rounded-lg">
                <div className="space-y-2">
                  <FormLabel className="text-xs">Password Baru</FormLabel>
                  <Input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError("");
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel className="text-xs">Konfirmasi Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError("");
                    }}
                  />
                </div>
                {passwordError && (
                  <p className="text-xs text-destructive">{passwordError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  ⚠️ Password user akan diubah. Pastikan sudah koordinasi dengan yang bersangkutan.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="nip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIP</FormLabel>
                <FormControl>
                  <Input placeholder="NIP" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="no_hp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. HP</FormLabel>
                <FormControl>
                  <Input placeholder="08xxx" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="jabatan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jabatan</FormLabel>
              <FormControl>
                <Input placeholder="Tutor Matematika" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_admin"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-sm">Admin</FormLabel>
                <p className="text-xs text-muted-foreground">Akses admin</p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {isEdit && (
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Status Aktif</FormLabel>
                  <p className="text-xs text-muted-foreground">Nonaktif = tidak bisa login</p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

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
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
            <DrawerTitle>{isEdit ? "Edit Guru" : "Tambah Guru Baru"}</DrawerTitle>
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
          <SheetTitle>{isEdit ? "Edit Guru" : "Tambah Guru Baru"}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6 py-4">
          {FormContent}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}