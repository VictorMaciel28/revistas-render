"use client";

import { useSearchParams } from "next/navigation";
import RequestForm from "../components/RequestForm";

export default function Page() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("id") ?? undefined;

  return <RequestForm requestId={requestId} />;
}