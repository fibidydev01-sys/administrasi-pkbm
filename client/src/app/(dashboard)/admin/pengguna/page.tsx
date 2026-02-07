"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRequireAdmin } from "@/hooks";
import { ROLE_LABELS } from "@/constants";
import type { UserProfile, UserRole } from "@/types";

import { PageHeader, EmptyState, FullPageLoader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminPenggunaPage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("full_name");

      if (error) throw error;
      setUsers(data ?? []);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (!authLoading) loadUsers();
  }, [authLoading, loadUsers]);

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;
      toast.success("Role berhasil diubah");
      loadUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengubah role";
      toast.error(message);
    }
  }

  async function handleToggleActive(userId: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ is_active: !isActive })
        .eq("id", userId);

      if (error) throw error;
      toast.success(isActive ? "Pengguna dinonaktifkan" : "Pengguna diaktifkan");
      loadUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengubah status";
      toast.error(message);
    }
  }

  if (authLoading) return <FullPageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Pengguna"
        description="Kelola pengguna dan role dalam sistem"
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title="Belum ada pengguna"
          description="Tambahkan pengguna melalui Supabase Auth Dashboard"
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Lembaga</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.lembaga_id || "-"}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(val) => handleRoleChange(user.id, val)}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.is_active ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                    >
                      {user.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
