import type { Tembusan } from "@/types";

interface TembusanListProps {
  tembusan: Tembusan[];
}

export default function TembusanList({ tembusan }: TembusanListProps) {
  if (!tembusan || tembusan.length === 0) return null;

  const sortedTembusan = [...tembusan].sort((a, b) => a.urutan - b.urutan);

  return (
    <div className="tembusan-list mt-10">
      <p className="font-bold">Tembusan:</p>
      <ol className="list-decimal list-inside mt-2">
        {sortedTembusan.map((item) => (
          <li key={item.id}>{item.nama_penerima}</li>
        ))}
      </ol>
    </div>
  );
}
