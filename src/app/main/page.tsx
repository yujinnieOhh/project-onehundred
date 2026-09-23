import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getLocalDateString,
  daysUntil,
  addDays,
  formatDots,
  mondayOfWeek,
} from "@/lib/date";
import { DoneButton } from "@/components/DoneButton";
import { NoteButton } from "@/components/NoteButton";
import { SpeechBubble } from "@/components/SpeechBubble";
import {
  HabitPreviewGrid,
  type HabitCellState,
} from "@/components/HabitPreviewGrid";

export default async function MainPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, timezone")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/setup");

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, goal, end_date, created_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!challenge) redirect("/setup");

  const today = getLocalDateString(profile.timezone);
  const dDay = daysUntil(today, "2027-01-01");
  const joinDate = getLocalDateString(
    profile.timezone,
    new Date(challenge.created_at)
  );

  const { data: todayCheckin } = await supabase
    .from("checkins")
    .select("id, note, completed")
    .eq("challenge_id", challenge.id)
    .eq("date", today)
    .maybeSingle();

  const { count: doneCount } = await supabase
    .from("checkins")
    .select("id", { count: "exact", head: true })
    .eq("challenge_id", challenge.id)
    .eq("completed", true);

  const previewStart = addDays(mondayOfWeek(today), -7);
  const { data: previewCheckins } = await supabase
    .from("checkins")
    .select("date, completed")
    .eq("challenge_id", challenge.id)
    .gte("date", previewStart)
    .lte("date", today);

  const completedByDate = new Map(
    (previewCheckins ?? [])
      .filter((c) => c.completed)
      .map((c) => [c.date, true])
  );

  const previewCells = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(previewStart, i);
    let state: HabitCellState;
    if (date > today) {
      state = "future";
    } else if (date < joinDate) {
      state = "preJoin";
    } else if (completedByDate.has(date)) {
      state = "completed";
    } else if (date < today) {
      state = "missed";
    } else {
      state = "future"; // today, not completed yet
    }
    return { date, state };
  });

  return (
    <main className="flex min-h-screen flex-col items-center bg-bg px-5 py-10">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex justify-around rounded-xl border border-border bg-surface p-4 text-center">
          <div>
            <p className="text-xl font-bold text-text-primary">
              {formatDots(today)}
            </p>
            <p className="text-xs text-text-secondary">오늘</p>
          </div>
          <div>
            <p className="text-xl font-bold text-text-primary">
              {dDay > 0 ? `D-${dDay}` : "D-DAY"}
            </p>
            <p className="text-xs text-text-secondary">2027년까지</p>
          </div>
          <div>
            <p className="text-xl font-bold text-text-primary">
              {doneCount ?? 0}개
            </p>
            <p className="text-xs text-text-secondary">완료</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center gap-3">
            <Image
              src="/images/animals/sg_cheerup.png"
              alt="sg"
              width={88}
              height={88}
              className="shrink-0"
              priority
            />
            <SpeechBubble>
              <p className="font-bold text-text-primary">{challenge.goal}</p>
              <p className="text-sm text-text-secondary">
                {todayCheckin?.completed
                  ? "오늘 완료 축하한다멍"
                  : "오늘 완료했냐멍?"}
              </p>
            </SpeechBubble>
          </div>
          <div className="flex justify-center gap-3">
            <DoneButton completedToday={!!todayCheckin?.completed} />
            <NoteButton initialNote={todayCheckin?.note ?? null} />
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text-secondary">
            나의 100일
          </p>
          <HabitPreviewGrid cells={previewCells} />
        </div>
      </div>
    </main>
  );
}
