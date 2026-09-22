export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 leading-relaxed text-[#22201F]">
      <h1 className="mb-6 text-2xl font-bold">개인정보처리방침</h1>
      <p className="mb-4 text-sm text-[#78716C]">최종 수정일: 2026-09-22</p>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">1. 수집하는 정보</h2>
        <p>
          PROJECT ONE HUNDRED는 Google 로그인을 통해 이름, 이메일 주소,
          프로필 사진을 수집합니다. 서비스 이용 과정에서 닉네임, 유저네임,
          목표, 보상, 타임존, 체크인 기록, 메모, 친구 관계, 이모지 리액션이
          추가로 저장됩니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">2. 정보 이용 목적</h2>
        <p>
          수집된 정보는 로그인 인증, 100일 챌린지 진행 상황 기록, 친구 간
          진행 상황 공유 및 응원 기능 제공을 위해서만 사용됩니다. 제3자에게
          판매하거나 광고 목적으로 제공하지 않습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">3. 정보 저장</h2>
        <p>
          모든 데이터는 Supabase(PostgreSQL)에 저장되며, 접근 제어를 통해
          본인 및 승인된 친구만 관련 정보를 조회할 수 있습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">4. 정보 삭제</h2>
        <p>
          계정 삭제 또는 정보 삭제를 원하시면 아래 문의처로 연락해 주세요.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">5. 문의</h2>
        <p>yujinnieohh@gmail.com</p>
      </section>
    </main>
  )
}
