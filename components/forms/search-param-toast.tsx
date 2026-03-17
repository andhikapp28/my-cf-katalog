"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function SearchParamToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      toast.success(success.replace(/-/g, " "));
    }

    if (error) {
      toast.error(error.replace(/-/g, " "));
    }
  }, [searchParams]);

  return null;
}


