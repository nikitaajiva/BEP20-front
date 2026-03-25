import { Suspense } from "react";
import CallbackClient from "./CallbackClient";

export default function Page() {
  return (
    <Suspense fallback={<p style={{ padding: 40 }}>🔐 Processing login...</p>}>
      <CallbackClient />
    </Suspense>
  );
}
