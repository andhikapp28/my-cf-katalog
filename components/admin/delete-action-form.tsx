"use client";

import { type FormEvent, type ReactNode, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type DeleteFormState = {
  success?: string;
  error?: string;
};

/**
 * Wrapper generik untuk aksi delete admin (produk, event, circle, floor map,
 * booth, expense, expense category).
 *
 * TIDAK memakai `useActionState` + `<form action={...}>` seperti `ActionStateForm`.
 * Versi awal memakainya, tapi ditemukan bug nyata lewat debug langsung: komponen
 * delete ini hidup DI DALAM baris/kartu item yang JUSTRU DIHAPUS dari tree begitu
 * aksinya sukses (list di-refresh lewat `revalidatePath` yang menyasar halaman
 * yang sama, sehingga baris ybs hilang dari render berikutnya). Karena komponen
 * (dan `useActionState`-nya) ikut lenyap BERSAMAAN dengan update sukses itu
 * sendiri, `useEffect` yang seharusnya menampilkan toast TIDAK PERNAH sempat
 * berjalan — dibuktikan: console log state `useActionState` tidak pernah
 * menerima nilai sukses walau server merespons 200 dan baris memang terhapus
 * di database. Ini TIDAK terjadi pada `ActionStateForm` (create/edit) karena
 * panel form di sana tidak ikut lenyap sebagai konsekuensi langsung dari
 * sukses aksinya sendiri.
 *
 * Fix: panggil action sebagai fungsi async biasa di dalam `startTransition`
 * (bukan lewat binding `<form action={...}>`). `toast.success()`/`toast.error()`
 * dipanggil LANGSUNG dari closure ini begitu promise resolve — sonner menulis
 * ke store globalnya sendiri (dirender `<Toaster/>` di root layout yang TIDAK
 * ikut ter-unmount oleh perubahan list manapun), jadi toast tetap tampil
 * terlepas dari komponen pemanggilnya lenyap sesaat setelahnya.
 */
export function DeleteActionForm({
  action,
  hidden,
  children,
  className
}: {
  action: (prevState: DeleteFormState, formData: FormData) => Promise<DeleteFormState>;
  hidden: Record<string, string>;
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const formData = new FormData();
      for (const [key, value] of Object.entries(hidden)) {
        formData.set(key, value);
      }

      const result = await action({}, formData);

      if (result.success) {
        toast.success(result.success);
      }
      if (result.error) {
        toast.error(result.error);
      }

      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className={className} aria-busy={isPending}>
      {Object.entries(hidden).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} readOnly />
      ))}
      {children}
    </form>
  );
}
