import Form from "@/components/email/verify/send/form";
import { Suspense } from "react";

export default function Send() {
  return (
    <div className="flex flex-col">
      <Suspense>
        <Form />
      </Suspense>
    </div>
  )
}
