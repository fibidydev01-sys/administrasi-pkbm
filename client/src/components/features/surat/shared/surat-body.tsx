interface SuratBodyProps {
  isiSurat: string;
}

export default function SuratBody({ isiSurat }: SuratBodyProps) {
  return (
    <div className="surat-body mt-5">
      <p>Dengan hormat,</p>

      <div
        className="text-justify leading-relaxed my-4"
        dangerouslySetInnerHTML={{ __html: isiSurat }}
      />

      <p className="mt-4">
        Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.
      </p>
    </div>
  );
}
