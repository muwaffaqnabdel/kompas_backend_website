import { prisma, withDbFallback, memoryState } from './db-fallback.js';

// -------------------------------------------------------------
// JURI SCORING & LEADERBOARD
// -------------------------------------------------------------
export async function submitJuriScore({ eventId = 'evt-lkbb-2026', participantId, juriId, scores, penaltySeconds = 0 }) {
  const submission = {
    id: `sub-${Date.now()}`,
    eventId,
    participantId,
    juriId,
    scores, // { c1: 85, c2: 90, ... }
    penaltySeconds,
    submittedAt: new Date().toISOString(),
  };

  memoryState.scores.push(submission);

  return {
    success: true,
    message: 'Nilai juri berhasil tersimpan dengan aman ke sistem.',
    submission,
  };
}

export async function saveAIFeedback({ eventId = 'evt-lkbb-2026', participantId, juriId, rawTranscript, refinedText }) {
  const feedback = {
    id: `fb-${Date.now()}`,
    eventId,
    participantId,
    juriId,
    rawTranscript,
    refinedText,
    createdAt: new Date().toISOString(),
  };

  memoryState.feedbacks.push(feedback);
  return feedback;
}

export async function getLeaderboardData(eventId = 'evt-lkbb-2026') {
  const participants = memoryState.participants.filter((p) => p.eventId === eventId);
  
  // Hitung agregat skor per tim
  const leaderboard = participants.map((p, index) => {
    const teamScores = memoryState.scores.filter((s) => s.participantId === p.id);
    let totalScore = 0;
    if (teamScores.length > 0) {
      teamScores.forEach((s) => {
        const sum = Object.values(s.scores).reduce((a, b) => a + b, 0);
        totalScore += sum - (s.penaltySeconds * 2);
      });
    } else {
      // Dummy demo score jika belum ada submission
      totalScore = 365 - index * 7;
    }

    return {
      rank: index + 1,
      participantId: p.id,
      teamName: p.teamName,
      schoolName: p.schoolName,
      queueNumber: p.queueNumber,
      totalScore,
      status: p.status,
    };
  }).sort((a, b) => b.totalScore - a.totalScore)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  return leaderboard;
}
