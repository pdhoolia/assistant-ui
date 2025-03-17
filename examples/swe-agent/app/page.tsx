"use client";

import { Shadcn } from "@/components/shadcn/Shadcn";
import { MyRuntimeProvider } from "./MyRuntimeProvider";

export default function Home() {
  return (
    <div className="h-screen overflow-hidden">
      <MyRuntimeProvider>
        <Shadcn />
      </MyRuntimeProvider>
    </div>
  );
}
