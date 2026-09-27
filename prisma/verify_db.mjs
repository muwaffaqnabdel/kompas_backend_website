import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      userEvents: {
        include: {
          event: true,
          assignedDp: true,
        },
      },
    },
  });

  console.log(`[VERIFIKASI] Total Pengguna di Supabase: ${users.length}`);
  users.forEach((u) => {
    console.log(`- ${u.fullName} (${u.email}) [GlobalRole: ${u.globalRole}]`);
    u.userEvents.forEach((ue) => {
      console.log(`   -> Event: ${ue.event.name} | Role: ${ue.role} ${ue.assignedDp ? `| Pos: ${ue.assignedDp.name}` : ''}`);
    });
  });

  const event = await prisma.event.findFirst({
    include: {
      decisionPoints: true,
      criteria: { include: { options: true } },
      participants: true,
    },
  });

  console.log(`\n[VERIFIKASI] Event di Supabase: ${event?.name}`);
  console.log(`- Total Pos DP: ${event?.decisionPoints?.length}`);
  event?.decisionPoints?.forEach((dp) => console.log(`   * ${dp.name} (Kapasitas: ${dp.capacityLimit})`));
  console.log(`- Total Kriteria Nilai: ${event?.criteria?.length}`);
  event?.criteria?.forEach((c) => console.log(`   * ${c.name} (${c.minScore} - ${c.maxScore}, ${c.options.length} pilihan nilai)`));
  console.log(`- Total Tim Peserta: ${event?.participants?.length}`);
  event?.participants?.forEach((p) => console.log(`   * ${p.teamName} (${p.schoolName}) [Status: ${p.status}]`));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
