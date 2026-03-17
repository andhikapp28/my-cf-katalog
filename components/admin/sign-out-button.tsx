"use client";

import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="secondary" className="w-full justify-center">
        Sign out
      </Button>
    </form>
  );
}


