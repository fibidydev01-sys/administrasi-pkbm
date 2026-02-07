"use client";

import { useEffect, useMemo, useState } from "react";
import { useJadwalStore, useAbsenStore, useSettingsStore } from "@/stores";
import { calculateJadwalStatus, getCurrentDayIndex } from "@/lib/jadwal";
import type { JadwalStatus } from "@/types";

export function useMyJadwalToday(guruId: string | undefined) {
  const { myJadwalToday, fetchMyJadwalToday, todayAbsensi, fetchTodayAbsensi } = useAbsenStore();
  const { settings, fetchSettings } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchSettings();

      if (guruId) {
        await Promise.all([
          fetchMyJadwalToday(guruId),
          fetchTodayAbsensi(guruId)
        ]);
      }

      setIsLoading(false);
    };

    loadData();
  }, [guruId, fetchMyJadwalToday, fetchTodayAbsensi, fetchSettings]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (guruId) {
        fetchTodayAbsensi(guruId);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [guruId, fetchTodayAbsensi]);

  const jadwalWithStatus: JadwalStatus[] = useMemo(() => {
    if (!settings) {
      return [];
    }

    if (!myJadwalToday.length) {
      return [];
    }

    return myJadwalToday.map((jadwal) => {
      const absensiForJadwal = todayAbsensi.filter(
        (a) => a.jadwal_id === jadwal.id
      );

      const status = calculateJadwalStatus(jadwal, settings, absensiForJadwal);
      return status;
    });
  }, [myJadwalToday, settings, todayAbsensi]);

  const activeJadwal = useMemo(() => {
    return jadwalWithStatus.find(
      (j) => j.isWithinWindow && (j.canAbsenMasuk || j.canAbsenPulang)
    );
  }, [jadwalWithStatus]);

  return {
    jadwalList: myJadwalToday,
    jadwalWithStatus,
    activeJadwal,
    isLoading,
  };
}

export function useAllJadwalToday() {
  const { jadwalToday, fetchJadwalToday, isLoading } = useJadwalStore();

  useEffect(() => {
    fetchJadwalToday();
  }, [fetchJadwalToday]);

  return {
    jadwalToday,
    isLoading,
    refetch: fetchJadwalToday,
  };
}

export function useJadwalList() {
  const {
    jadwalList,
    fetchJadwalList,
    isLoading,
    filterHari,
    filterGuru,
    setFilterHari,
    setFilterGuru,
  } = useJadwalStore();

  useEffect(() => {
    fetchJadwalList();
  }, [fetchJadwalList, filterHari, filterGuru]);

  return {
    jadwalList,
    isLoading,
    filterHari,
    filterGuru,
    setFilterHari,
    setFilterGuru,
    refetch: fetchJadwalList,
  };
}

export function useAbsenStatusForJadwal(jadwalId: string, guruId: string | undefined) {
  const { todayAbsensi, fetchTodayAbsensi } = useAbsenStore();
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    if (guruId) {
      fetchTodayAbsensi(guruId);
    }
    fetchSettings();
  }, [guruId, fetchTodayAbsensi, fetchSettings]);

  const absensiForJadwal = useMemo(() => {
    return todayAbsensi.filter((a) => a.jadwal_id === jadwalId);
  }, [todayAbsensi, jadwalId]);

  const hasAbsenMasuk = absensiForJadwal.some((a) => a.tipe === "masuk");
  const hasAbsenPulang = absensiForJadwal.some((a) => a.tipe === "pulang");
  const absenMasuk = absensiForJadwal.find((a) => a.tipe === "masuk");
  const absenPulang = absensiForJadwal.find((a) => a.tipe === "pulang");

  return {
    hasAbsenMasuk,
    hasAbsenPulang,
    absenMasuk,
    absenPulang,
    isComplete: hasAbsenMasuk && hasAbsenPulang,
  };
}