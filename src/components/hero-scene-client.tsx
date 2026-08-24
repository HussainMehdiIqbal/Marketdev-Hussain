"use client";

import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/hero-scene").then((m) => m.HeroScene), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-surface-2" />,
});

export function HeroSceneClient() {
  return <HeroScene />;
}
