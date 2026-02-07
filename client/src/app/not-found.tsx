import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <FileQuestion className="h-24 w-24 text-muted-foreground" />
      <h1 className="mt-6 text-2xl font-bold">Halaman Tidak Ditemukan</h1>
      <p className="mt-2 text-center text-muted-foreground">
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Kembali ke Beranda
        </Link>
      </Button>
    </div>
  );
}