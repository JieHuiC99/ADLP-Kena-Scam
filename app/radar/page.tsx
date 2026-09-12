import type { Metadata } from "next";
import { RadarClient } from "@/components/radar/radar-client";
import { NotConnected } from "@/components/not-connected";
import { REFERENCE_DATE, getRadarReports } from "@/lib/repo";

export const metadata: Metadata = {
  title: "Scam Radar",
  description:
    "A state-by-state view of community scam reports across Malaysia, with the scam types and platforms rising fastest.",
};

export default async function RadarPage() {
  const reports = await getRadarReports();
  if (!reports.length) return <NotConnected what="radar reports" />;

  return <RadarClient reports={reports} referenceTime={REFERENCE_DATE.getTime()} />;
}
