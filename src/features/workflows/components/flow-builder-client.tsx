"use client";

import dynamic from "next/dynamic";

export const FlowBuilderClient = dynamic(
  () => import("./flow-builder").then((mod) => mod.FlowBuilder),
  { ssr: false },
);
