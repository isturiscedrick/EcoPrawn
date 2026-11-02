import demo from "@/data/demo.json";

export function GET() {
  return Response.json({
    heroReadouts: demo.heroReadouts,
    feedSchedule: demo.feedSchedule,
    tankFormDefaults: demo.tankFormDefaults,
  });
}
