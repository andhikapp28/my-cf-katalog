"use client";

import { type ReactNode, useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAdminCreateToggleOptional } from "@/components/admin/admin-create-toggle";

export type ActionFormState = {
  success?: string;
  error?: string;
};

/**
 * Wrapper generik untuk form create/edit admin yang dipakai lewat
 * `useActionState`. Menggantikan pola lama `<form action={serverAction}>` +
 * `redirect()` pasca-mutasi, yang terbukti membuat client macet permanen di
 * build produksi sungguhan — lihat catatan panjang di actions/products.ts.
 *
 * Server Action yang dioper ke `action` HARUS bertanda tangan
 * `(prevState, formData) => Promise<{ success?: string; error?: string }>`
 * dan TIDAK PERNAH memanggil `redirect()`. Sukses/error ditampilkan lewat
 * toast di sini, dan `router.refresh()` dipanggil supaya data Server
 * Component (list/table) ikut ter-refresh tanpa navigasi apa pun.
 *
 * `closeCreateToggleOnSuccess` HANYA boleh dipasang di form "create" yang
 * benar-benar berada di dalam `<AdminCreateTogglePanel>` (panel yang
 * dikontrol oleh `<AdminCreateToggle>` di halaman yang sama) — akan memanggil
 * `toggle()` untuk menutup panel begitu submit sukses. JANGAN dipasang di
 * form edit yang visibilitasnya dikendalikan oleh searchParams (`?edit=`),
 * karena `toggle()` akan salah sasaran menutup/membuka panel "Add" yang
 * berbeda alih-alih panel edit tsb.
 */
export function ActionStateForm({
  action,
  children,
  className,
  closeCreateToggleOnSuccess = false,
  onSuccess
}: {
  action: (prevState: ActionFormState, formData: FormData) => Promise<ActionFormState>;
  children: ReactNode;
  className?: string;
  closeCreateToggleOnSuccess?: boolean;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const toggleContext = useAdminCreateToggleOptional();
  const [state, formAction, isPending] = useActionState(action, {} as ActionFormState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      router.refresh();
      if (closeCreateToggleOnSuccess) {
        toggleContext?.toggle();
      }
      onSuccess?.();
    }
    if (state.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className={className} aria-busy={isPending}>
      {children}
    </form>
  );
}
