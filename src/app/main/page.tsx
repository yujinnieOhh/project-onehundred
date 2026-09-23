import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocalDateString, daysUntil, addDays, formatDots } from "@/lib/date";
import { getAcceptedFriendsWithActivity } from "@/lib/friends";
import { habitCellState } from "@/lib/habit";
import { ReactionPicker } from "@/components/ReactionPicker";
import { DoneButton } from "@/components/DoneButton";
import { NoteButton } from "@/components/NoteButton";
import { SpeechBubble } from "@/components/SpeechBubble";
import { HabitPreviewGrid } from "@/components/HabitPreviewGrid";
import { ReminderModal } from "@/components/ReminderModal";

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
    .select("id, goal, start_date, end_date, created_at")
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

  // Grid is anchored to the global challenge start (not a rolling window),
  // chunked into fixed rows of 5 days, so every user's day 1 lines up in the
  // same column regardless of weekday or when they personally joined.
  const daysSinceStart = daysUntil(challenge.start_date, today);
  const chunkIndex = Math.floor(daysSinceStart / 5);
  const chunkStart = addDays(challenge.start_date, chunkIndex * 5);
  const previewStart = chunkIndex > 0 ? addDays(chunkStart, -5) : chunkStart;
  const previewLength = chunkIndex > 0 ? 10 : 5;

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

  const previewCells = Array.from({ length: previewLength }, (_, i) => {
    const date = addDays(previewStart, i);
    return { date, state: habitCellState(date, today, joinDate, completedByDate.has(date)) };
  });

  const friends = await getAcceptedFriendsWithActivity(supabase, user.id);
  const activeFriends = friends.filter((f) => f.completedToday || f.completedYesterday);

  return (
    <main className="flex min-h-screen flex-col items-center bg-bg px-5 py-10">
      <ReminderModal />
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex justify-end">
          <Link href="/settings" className="text-xs text-text-secondary underline">
            설정
          </Link>
        </div>

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
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-secondary">나의 100일</p>
            <Link href="/habit" className="text-xs text-text-secondary underline">
              전체보기
            </Link>
          </div>
          <HabitPreviewGrid cells={previewCells} />
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-secondary">친구</p>
            <Link href="/friends" className="text-xs text-text-secondary underline">
              전체보기
            </Link>
          </div>
          {activeFriends.length === 0 ? (
            <p className="text-sm text-text-secondary">
              오늘/어제 완료한 친구가 아직 없어요.
            </p>
          ) : (
            activeFriends.map((f) => (
              <div key={f.id} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">
                  {f.nickname} <span className="text-text-secondary">@{f.username}</span>
                  <span className="ml-2 text-xs text-pink-deep">
                    {f.completedToday ? "오늘 완료 ✓" : "어제 완료 ✓"}
                  </span>
                </span>
                {f.activeCheckinId && (
                  <ReactionPicker
                    checkinId={f.activeCheckinId}
                    myReactionEmoji={f.myReactionEmoji}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
