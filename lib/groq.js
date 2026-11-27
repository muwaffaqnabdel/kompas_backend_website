/**
 * Groq AI Service Helper
 * - Speech-To-Text: Whisper Large v3 (`whisper-large-v3`) dengan auto-fallback ke `whisper-large-v3-turbo`
 * - LLM Refinement: Qwen 3.8 27B (`qwen/qwen3.8-27b`) dengan auto-fallback berantai ke
 *   `openai/gpt-oss-120b` -> `openai/gpt-oss-20b` (kuota gratis Groq terpisah per model)
 *
 * Sesuai PRD 6.6: jika seluruh model AI gagal, sistem tidak mengarang isi baru — mengembalikan
 * flag `aiFailed` agar Juri dapat memakai transkrip mentah, merekam ulang, atau menulis manual.
 */

function uniqueModels(list) {
  return [...new Set(list.filter(Boolean).map((m) => String(m).trim()).filter(Boolean))];
}

const WHISPER_MODELS = uniqueModels([
  process.env.GROQ_WHISPER_MODEL || 'whisper-large-v3',
  'whisper-large-v3',
  'whisper-large-v3-turbo',
]);

const LLM_MODELS = uniqueModels([
  process.env.GROQ_LLM_MODEL || 'qwen/qwen3.8-27b',
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
]);

// Kamus istilah Paskibra ringkas tanpa kalimat pembuka template agar Whisper tidak menggema di jeda hening
const PASKIBRA_VOCAB_PROMPT =
  'Sikap sempurna, berhimpun, penghormatan, pelipis, tutup kepala, pet, baret, lencang kanan, ' +
  'setengah lengan lencang kanan, berhitung, saf, banjar, danton, hadap kanan, hadap kiri, ' +
  'hadap serong, balik kanan, jalan di tempat, rata-rata air, tumpuan kaki, tumit, 45 derajat, ' +
  '90 derajat, tempo, langkah tegap, langkah perlahan, hormat kanan, melintang, haluan, ' +
  'hentakan kaki, ayunan tangan, variasi formasi, seragam.';

const WHISPER_ECHO_PATTERNS = [
  /(?:^|[\s.!?]+)evaluasi lomba baris[- ]berbaris(?:\s+paskibra(?:\s+lkbb)?)?[.\s!?]*$/i,
  /(?:^|[\s.!?]+)sikap sempurna,\s*berhimpun,\s*penghormatan,\s*pelipis[\s\S]*$/i,
  /(?:^|[\s.!?]+)terima kasih telah menonton[.\s!?]*$/i,
  /(?:^|[\s.!?]+)subtitles by[\s\S]*$/i,
];

function cleanWhisperHallucinations(text = '') {
  let cleaned = String(text || '').trim();
  if (!cleaned) return '';
  for (const pattern of WHISPER_ECHO_PATTERNS) {
    cleaned = cleaned.replace(pattern, '').trim();
  }
  return cleaned;
}

function cleanLlmOutputForTextarea(text = '') {
  let cleaned = String(text || '').trim();
  if (!cleaned) return '';
  // Hapus blok reasoning jika model menyertakan tag <think>
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  // Hapus kalimat pembuka generik seperti "Berikut adalah ringkasan evaluasi...:"
  cleaned = cleaned.replace(/^(?:berikut(?:\s+adalah)?|ini\s+adalah)[^\n:]*:\s*/i, '').trim();
  // Rapikan markdown bold (**teks**) agar bersih saat ditampilkan di textarea editable
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  // Normalisasi bullet markdown "*   " atau "- " menjadi "• " agar konsisten dan rapi
  cleaned = cleaned.replace(/^[ \t]*[*•-][ \t]+/gm, '• ');
  return cleaned.trim();
}

function resolveFileExtension(mimeType = 'audio/webm') {
  const clean = String(mimeType).toLowerCase();
  if (clean.includes('ogg')) return 'ogg';
  if (clean.includes('mp4') || clean.includes('m4a')) return 'm4a';
  if (clean.includes('mpeg') || clean.includes('mp3')) return 'mp3';
  if (clean.includes('wav')) return 'wav';
  return 'webm';
}

export async function transcribeAudioWithWhisper(audioBuffer, mimeType = 'audio/webm') {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.warn('[GROQ SERVICE] GROQ_API_KEY belum disetel.');
    return {
      rawText: '',
      segments: [],
      aiFailed: true,
      error: 'GROQ_API_KEY belum dikonfigurasi di server.',
    };
  }

  const cleanMime = String(mimeType || 'audio/webm').split(';')[0].trim();
  const ext = resolveFileExtension(cleanMime);
  let lastError = 'Gagal mentranskrip audio melalui Groq Whisper.';

  for (const model of WHISPER_MODELS) {
    try {
      const formData = new FormData();
      const blob = new Blob([audioBuffer], { type: cleanMime });
      formData.append('file', blob, `juri-evaluation.${ext}`);
      formData.append('model', model);
      formData.append('language', 'id');
      formData.append('response_format', 'verbose_json');
      formData.append('temperature', '0');
      formData.append('prompt', PASKIBRA_VOCAB_PROMPT);

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq Whisper (${model}) error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const segments = Array.isArray(data.segments)
        ? data.segments
            .map((seg) => ({
              start: Number(seg.start) || 0,
              end: Number(seg.end) || 0,
              text: cleanWhisperHallucinations(seg.text || ''),
            }))
            .filter((seg) => seg.text.length > 0)
        : [];

      const cleanedRawText = cleanWhisperHallucinations(data.text || '');

      return {
        rawText: cleanedRawText,
        segments,
        duration: data.duration ? Number(data.duration) : null,
        model,
        aiFailed: false,
      };
    } catch (error) {
      lastError = error.message;
      console.warn(`[GROQ WHISPER FALLBACK] Model ${model} gagal:`, error.message);
    }
  }

  console.error('[GROQ WHISPER ERROR] Semua model Whisper gagal:', lastError);
  return {
    rawText: '',
    segments: [],
    aiFailed: true,
    error: lastError,
  };
}

/**
 * Memetakan segmen transkrip Whisper bertimestamp ke daftar aba-aba yang sedang dibuka Juri
 * pada detik tersebut (Timestamp Marker), hanya mencantumkan aba-aba yang memang ada ucapannya.
 */
export function buildMarkerAnnotatedTranscript(rawTranscript, segments = [], abaAbaMarkers = []) {
  if (!Array.isArray(abaAbaMarkers) || abaAbaMarkers.length === 0) {
    return { annotatedText: rawTranscript, hasMarkers: false };
  }

  const sortedMarkers = [...abaAbaMarkers]
    .filter((m) => m && m.abaAbaName && typeof m.startSec === 'number')
    .sort((a, b) => a.startSec - b.startSec);

  if (sortedMarkers.length === 0) {
    return { annotatedText: rawTranscript, hasMarkers: false };
  }

  // Jika segmen timestamp Whisper tersedia, petakan tiap kalimat ke aba-aba pada detik tsb
  if (Array.isArray(segments) && segments.length > 0) {
    const grouped = [];
    for (const seg of segments) {
      const midTime = seg.start + (seg.end > seg.start ? (seg.end - seg.start) * 0.25 : 0);
      let matched = sortedMarkers[0];
      for (const m of sortedMarkers) {
        if (m.startSec <= midTime) {
          matched = m;
        } else {
          break;
        }
      }
      const label = matched?.abaAbaName || 'Umum';
      const last = grouped[grouped.length - 1];
      if (last && last.label === label) {
        last.texts.push(seg.text);
      } else {
        grouped.push({ label, texts: [seg.text] });
      }
    }

    if (grouped.length > 0) {
      const annotatedText = grouped
        .map((g) => `[Aba-Aba: ${g.label}] ${g.texts.join(' ')}`)
        .join('\n');
      return { annotatedText, hasMarkers: true };
    }
  }

  return { annotatedText: rawTranscript, hasMarkers: false };
}

export async function refineFeedbackWithLlama(rawTranscript, context = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  const {
    teamName = '',
    schoolName = '',
    judgeCategory = '',
    segments = [],
    abaAbaMarkers = [],
    abaAbaNames = [],
  } = context;

  if (!apiKey) {
    console.warn('[GROQ SERVICE] GROQ_API_KEY belum disetel.');
    return {
      refinedText: rawTranscript,
      aiFailed: true,
      error: 'GROQ_API_KEY belum dikonfigurasi di server.',
    };
  }

  const { annotatedText, hasMarkers } = buildMarkerAnnotatedTranscript(
    rawTranscript,
    segments,
    abaAbaMarkers
  );

  // Gabungkan daftar nama aba-aba dari rubrik event + marker sebagai kamus konteks resmi
  const referenceAbaAba = [
    ...new Set([
      ...(Array.isArray(abaAbaNames) ? abaAbaNames : []),
      ...(Array.isArray(abaAbaMarkers) ? abaAbaMarkers.map((m) => m?.abaAbaName) : []),
    ]
      .map((n) => String(n || '').trim())
      .filter(Boolean)),
  ].slice(0, 40);

  const systemPrompt = `Anda adalah asisten resmi Dewan Juri Lomba Keterampilan Baris-Berbaris (LKBB) Paskibra Indonesia.
Tugas Anda merapikan dan meringkas transkrip rekaman suara Juri di lapangan menjadi catatan evaluasi resmi yang santun, baku, padat, dan bermanfaat bagi pembinaan tim.

ATURAN WAJIB:
1. Gunakan istilah baku Paskibra Indonesia (sikap sempurna, berhimpun, penghormatan, pelipis, tutup kepala, pet, baret, lencang kanan, setengah lengan lencang kanan, berhitung, saf, banjar, danton, hadap kanan, hadap kiri, hadap serong, balik kanan, jalan di tempat, rata-rata air, tumpuan kaki, tumit, sudut 45 derajat, tempo, langkah tegap, langkah perlahan, hormat kanan, haluan, melintang, variasi formasi, hentakan kaki, ayunan tangan, kerapihan seragam).
2. Perbaiki kesalahan dengar fonetik (kata salah ketik suara/homofon bahasa Indonesia maupun bahasa Inggris akibat suara bergumam, pelan, bising lapangan, atau peluit), contoh pola koreksi:
   - "playpiece" / "plepis" -> "pelipis"
   - "tepu hormatan" / "penghurmatan" -> "penghormatan"
   - "loke roncangan" / "roncangan" / "lancang kanan" -> "lencang kanan"
   - "tumbuhan kaki" / "tumpuhan kaki" -> "tumpuan kaki"
   - "ditambalkan" -> "ditempelkan"
   - "menghadap ketawa" / "menghadap ke tawa" -> "menghadap ke bawah"
   Pertahankan istilah Paskibra yang memang benar (seperti "berhimpun", "rata-rata air", "saf", "banjar").
3. Abaikan kalimat gema/echo sistem yang tidak relevan (misalnya "Evaluasi lomba baris berbaris" yang muncul sendiri di akhir rekaman).
4. JANGAN PERNAH mengarang fakta, angka skor, pujian, atau koreksi baru yang tidak diucapkan oleh Juri.
5. Format keluaran WAJIB teks polos rapi (TANPA tanda markdown seperti ** atau #) dan TANPA kalimat pembuka/penutup seperti "Berikut adalah ringkasannya:":
   - Jika Juri mengomentari beberapa aba-aba spesifik, tulis daftar poin ringkas memakai simbol "• " per aba-aba yang benar-benar dikomentari Juri (contoh: "• Penghormatan: Eksekusi sudah baik, namun jari tangan agar ditempelkan rapat di pelipis."), dan jika relevan tambahkan 1 baris penutup "Saran Utama: ..." yang merangkum prioritas latihan.
   - Jangan mencantumkan aba-aba yang tidak dikomentari Juri.
   - Jika transkrip hanya 1 komentar umum singkat, cukup 2–3 kalimat evaluasi resmi yang rapi dan langsung pada inti.
6. Gunakan Bahasa Indonesia formal, sopan, objektif, dan membangun.`;

  const contextHeader = [
    schoolName ? `Sekolah / Kontingen: ${schoolName}` : '',
    teamName ? `Nama Pasukan: ${teamName}` : '',
    judgeCategory ? `Bidang Penjurian: ${judgeCategory}` : '',
    referenceAbaAba.length > 0
      ? `Daftar Aba-Aba pada Rubrik Event (gunakan sebagai acuan ejaan): ${referenceAbaAba.join(', ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const userPrompt = `${contextHeader ? `${contextHeader}\n\n` : ''}${
    hasMarkers
      ? `Transkrip suara Juri yang sudah dipetakan waktunya ke aba-aba di layar:\n${annotatedText}`
      : `Transkrip suara mentah Juri:\n"${rawTranscript}"`
  }

Susunlah ringkasan evaluasi resmi Dewan Juri yang rapi, akurat istilah Paskibranya, dan ringkas sesuai aturan.`;

  let lastError = 'Gagal merapikan evaluasi melalui Groq LLM.';

  for (const model of LLM_MODELS) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq LLM (${model}) error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content;
      const refinedText = cleanLlmOutputForTextarea(rawContent || '');

      if (!refinedText) {
        throw new Error(`Model LLM (${model}) mengembalikan respons kosong.`);
      }

      return {
        refinedText,
        model,
        usedMarkers: hasMarkers,
        aiFailed: false,
      };
    } catch (error) {
      lastError = error.message;
      console.warn(`[GROQ LLM FALLBACK] Model ${model} gagal:`, error.message);
    }
  }

  console.error('[GROQ LLAMA ERROR] Semua model LLM gagal:', lastError);
  return {
    refinedText: rawTranscript,
    aiFailed: true,
    error: lastError,
  };
}
