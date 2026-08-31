"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire up real authentication.
    router.push("/dashboard");
  }

  return { email, setEmail, password, setPassword, handleSubmit };
}
