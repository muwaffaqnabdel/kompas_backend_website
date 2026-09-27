/**
 * Groq AI Service Helper
 * Mendukung Speech-To-Text (Whisper Large v3) dan LLM (Llama 3 / Mixtral)
 * Dilengkapi graceful fallback (mock mode) ketika GROQ_API_KEY belum terisi atau sedang maintenance.
 */

export async function transcribeAudioWithWhisper(audioBuffer, mimeType = 'audio/webm') {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.warn('[GROQ SERVICE] GROQ_API_KEY belum disetel. Menggunakan fallback mock STT.');
    return {
      rawText: 'Siap laksanakan, variasi formasi kerapihan saf dan banjar cukup baik, tempo langkah tegap perlu disesuaikan dengan danton.',
      isMock: true,
    };
  }

  try {
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType });
    formData.append('file', blob, 'recording.webm');
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'id');
    formData.append('response_format', 'json');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq Whisper error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return {
      rawText: data.text,
      isMock: false,
    };
  } catch (error) {
    console.error('[GROQ WHISPER ERROR]', error);
    return {
      rawText: 'Terjadi kendala koneksi ke server STT. Mohon gunakan transkrip manual.',
      error: error.message,
      isMock: true,
    };
  }
}

export async function refineFeedbackWithLlama(rawTranscript, context = {}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.warn('[GROQ SERVICE] GROQ_API_KEY belum disetel. Menggunakan fallback mock NLP.');
    return {
      refinedText: `Catatan Dewan Juri: Kerapihan saf dan banjar pasukan terlihat solid dan terkoordinasi dengan baik. Catatan evaluasi utama: tempo langkah tegap perlu diperhatikan agar lebih selaras dengan aba-aba komandan peleton (Danton).`,
      isMock: true,
    };
  }

  try {
    const systemPrompt = `Anda adalah asisten panitia lomba Paskibra resmi yang bertugas merapikan catatan suara juri di lapangan menjadi catatan evaluasi resmi, santun, baku, dan konstruktif.
Gunakan istilah baku Paskibra (misal: saf, banjar, langkah tegap, danton, periksa kerapihan, dll).
Perbaiki kata-kata yang mungkin salah didengar akibat suara bising di lapangan.
Jangan menambah fakta baru yang tidak disebutkan oleh juri.`;

    const userPrompt = `Transkrip suara mentah juri: "${rawTranscript}"
${context.teamName ? `Nama Pasukan: ${context.teamName}` : ''}
Susunlah menjadi 2-3 kalimat evaluasi resmi yang siap dikirimkan kepada tim peserta.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq LLM error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const refinedText = data.choices?.[0]?.message?.content?.trim() || rawTranscript;

    return {
      refinedText,
      isMock: false,
    };
  } catch (error) {
    console.error('[GROQ LLAMA ERROR]', error);
    return {
      refinedText: rawTranscript,
      error: error.message,
      isMock: true,
    };
  }
}
