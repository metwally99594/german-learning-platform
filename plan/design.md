# C1 Mündlich — Design Document

## 1. Overview & Goals

The **C1 Mündlich** module helps advanced learners prepare for the German C1 speaking exam by practising the four classic tasks:

1. **Präsentation** — present a complex topic for ~3 minutes.
2. **Diskussion** — discuss a statement or problem with the examiner / a partner.
3. **Bildbeschreibung** — describe and interpret a picture, chart, or diagram.
4. **Meinung äußern** — react to a short text/quote and argue a position.

### Target users

- Learners at C1 level who need exam-style oral practice.
- ADHD users who need short, gamified, low-distraction sessions with timers and visible progress.

### MVP goals

- Provide realistic C1 prompts, model answers, Redemittel, and a self-assessment rubric.
- Let learners record themselves in the browser and play back the recording.
- Do **not** persist audio blobs on the server (no storage backend).
- Reuse the existing `Exercise` model with `type = SPEAKING`.
- Stay ADHD-friendly: timers, break reminders, progress, points, badges, focus mode.

---

## 2. Routes & Navigation

All routes live under the existing `(main)` group so they automatically use `Shell`, `Navbar`, and `Sidebar`.

| Route | Purpose |
|-------|---------|
| `/mündlich` | Landing / hub: choose a part, see streak, points, last session. |
| `/mündlich/präsentation` | List of presentation prompts. |
| `/mündlich/präsentation/[id]` | Practice screen for one prompt. |
| `/mündlich/diskussion` | List of discussion prompts. |
| `/mündlich/diskussion/[id]` | Practice screen for one prompt. |
| `/mündlich/bildbeschreibung` | List of image-description prompts. |
| `/mündlich/bildbeschreibung/[id]` | Practice screen for one prompt. |
| `/mündlich/meinung` | List of opinion prompts. |
| `/mündlich/meinung/[id]` | Practice screen for one prompt. |

### Sidebar nav

Add one entry to `src/components/layout/sidebar.tsx`:

```ts
{ title: "C1 Mündlich", href: "/mündlich", icon: Mic }
```

`Mic` is imported from `lucide-react`.

### Entry points

- Sidebar link.
- Dashboard "Continue speaking practice" card (future, optional).
- `/mündlich` hero card grid for each part.

---

## 3. Component Architecture

All new components live under `src/components/mündlich/`.

### Container / hub components

| Component | File | Props | Responsibility |
|-----------|------|-------|----------------|
| `MündlichHub` | `src/components/mündlich/mündlich-hub.tsx` | `parts: SpeakingPartSummary[]` | Renders part cards, streak, points, session length selector. |
| `PartOverview` | `src/components/mündlich/part-overview.tsx` | `part: SpeakingPart; exercises: Exercise[]` | Lists prompts for a part with difficulty/duration badges. |

### Practice components

| Component | File | Props | Responsibility |
|-----------|------|-------|----------------|
| `SpeakingSession` | `src/components/mündlich/speaking-session.tsx` | `exercise: Exercise; sessionMins?: number` | Orchestrates prep timer, recorder, playback, reveal, self-rating. |
| `PromptCard` | `src/components/mündlich/prompt-card.tsx` | `title, stimulus?, prompt, instructions` | Shows prompt and any image/quote stimulus. |
| `PrepTimer` | `src/components/mündlich/prep-timer.tsx` | `seconds: number; onComplete` | Countdown for preparation phase. |
| `RecordingControls` | `src/components/mündlich/recording-controls.tsx` | `isRecording, isPaused, onStart, onStop, onPause, elapsedMs` | Big record/stop/pause buttons with visual feedback. |
| `AudioPlayback` | `src/components/mündlich/audio-playback.tsx` | `blob: Blob` | Renders `<audio>` with playback speed control. |
| `ModelAnswerPanel` | `src/components/mündlich/model-answer-panel.tsx` | `modelAnswer, phrases, rubric` | Collapsible tabs for model answer, Redemittel, and rubric. |
| `SelfAssessment` | `src/components/mündlich/self-assessment.tsx` | `rubric: RubricItem[]; onRate` | Checklist rubric with yes/mostly/no per criterion. |
| `SessionSummary` | `src/components/mündlich/session-summary.tsx` | `points, badges, duration, nextHref?` | End-of-prompt recap. |
| `FocusModeToggle` | `src/components/mündlich/focus-mode-toggle.tsx` | `enabled, onChange` | Switch that hides sidebar/footer decorations. |
| `BreakReminder` | `src/components/mündlich/break-reminder.tsx` | `open, onDismiss, onTakeBreak` | Dialog shown after ~10 min or each part. |

### Hooks

| Hook | File | Responsibility |
|------|------|----------------|
| `useMediaRecorder` | `src/components/mündlich/use-media-recorder.ts` | Wraps `MediaRecorder` + `getUserMedia`, returns `start/stop/pause/blob/error`. |
| `useCountdown` | `src/components/mündlich/use-countdown.ts` | Generic countdown with pause/resume and completion callback. |
| `useSessionTimer` | `src/components/mündlich/use-session-timer.ts` | Tracks total session time and triggers break reminders. |

### Types (add to `src/types/index.ts`)

```ts
export type SpeakingPart = "präsentation" | "diskussion" | "bildbeschreibung" | "meinung";

export type RubricItem = {
  criterion: string;
  description: string;
  maxPoints: number;
};

export type SpeakingExerciseContent = {
  part: SpeakingPart;
  prompt: string;
  stimulus?: string; // image URL, quote, chart alt text
  instructions: string;
  prepTimeSeconds: number;
  responseTimeSeconds: number;
  modelAnswer: string;
  usefulPhrases: string[];
  hints?: string[];
};
```

---

## 4. Data Model Usage

No new Prisma models. Reuse the existing `Exercise` table with `type = SPEAKING`.

### JSON shape

```json
{
  "part": "präsentation",
  "prompt": "Präsentieren Sie, wie sich die digitale Kommunikation auf zwischenmenschliche Beziehungen auswirkt.",
  "stimulus": null,
  "instructions": "Sie haben 3 Minuten Zeit. Strukturieren Sie Ihren Vortrag in Einleitung, Hauptteil und Schluss.",
  "prepTimeSeconds": 180,
  "responseTimeSeconds": 180,
  "modelAnswer": "...",
  "usefulPhrases": ["Ich möchte zunächst auf... eingehen", "Ein zentrales Argument ist...", "Zusammenfassend lässt sich sagen..."],
  "hints": ["Verwenden Sie Konjunktiv II für Hypothesen.", "Gehen Sie auf Gegenargumente ein."]
}
```

### Rubric storage

Store the rubric in `answerKey` (currently `Json?` with default `"[]"`):

```json
[
  { "criterion": "Struktur", "description": "Einleitung, Hauptteil, Schluss erkennbar", "maxPoints": 2 },
  { "criterion": "Wortschatz", "description": "C1-typische Redemittel und Nuancen", "maxPoints": 2 },
  { "criterion": "Satzstrukturen", "description": "Komplexe Sätze, Konnektoren, Konjunktiv", "maxPoints": 2 },
  { "criterion": "Argumentation", "description": "Klare These, Belege, Gegenargument", "maxPoints": 2 },
  { "criterion": "Flüssigkeit", "description": "Wenige Pausen und Ahs", "maxPoints": 2 }
]
```

### Seeding approach

Create one C1 lesson named **"C1 Mündliche Prüfung"** and attach `Exercise` records with `type = SPEAKING` for each prompt. This lets us reuse `UserProgress` to track completion and score per lesson, and `Achievement` for badges.

### What is **not** persisted

- Audio recordings.
- Per-attempt self-ratings.

Only the user's final "mark as practised" action may update `UserProgress.score` / `timeSpentSeconds` if implemented.

---

## 5. User Flows

### Präsentation

1. Learner selects **Präsentation** from the hub.
2. Chooses a topic from the list.
3. Reads instructions: 3 min prep, 3 min speaking.
4. Clicks **Start preparation** → `PrepTimer` counts down.
5. After prep, timer beeps; learner clicks **Record**.
6. `RecordingControls` show a visualiser and elapsed time.
7. Learner stops manually or recording auto-stops at time limit.
8. Playback appears; learner listens.
9. Learner reveals **Model answer**, **Redemittel**, and **Rubric**.
10. Self-assessment: rate each rubric item.
11. Finish: points + badge awarded, return to hub or next prompt.

### Diskussion

1. Select **Diskussion**.
2. Read a statement/stimulus (e.g. "Soziale Medien isolieren Menschen").
3. 1 min preparation.
4. Record a structured response: agree/disagree, reason, example, counter-argument.
5. Playback + model dialogue + Redemittel for discussion.
6. Self-rate.

### Bildbeschreibung

1. Select **Bildbeschreibung**.
2. View image/chart and guiding questions.
3. 1 min preparation.
4. Describe the picture objectively, interpret it, give a short personal reaction.
5. Playback + model description + Redemittel for interpreting visuals.
6. Self-rate.

### Meinung äußern

1. Select **Meinung äußern**.
2. Read a quote or short text.
3. 1 min preparation.
4. State opinion, justify with examples, mention limits.
5. Playback + model answer + Redemittel for opinion language.
6. Self-rate.

---

## 6. ADHD-Focused UX

### Session length options

On the hub, let the learner pick a commitment before starting:

- **5 Minuten** (1 prompt)
- **10 Minuten** (2 prompts + micro-break)
- **15 Minuten** (3 prompts + breaks)

### Per-prompt timer

- Always-visible circular countdown.
- Colour change at 50 % (yellow) and 20 % (red).
- Soft audio tick optional and off by default.

### Break reminders

- After every 10 minutes or after each part, show a `BreakReminder` dialog.
- One-tap actions: **2-min break**, **Skip**, **End session**.

### Progress & gamification

- Progress bar at the top of the session: "Prompt 1 of 3".
- Points per prompt based on rubric self-rating.
- Streak flame next to the hub title.
- Badges awarded for milestones:
  - `Sprechfluss` — record without long pauses.
  - `Struktur-Profi` — all structure criteria met.
  - `Wortschatz-Meister` — used 3+ Redemittel.
  - `Erste Präsentation`, `Diskussions-Profi`, etc.

### Focus mode

- Toggle hides the sidebar, footer, and decorative animations.
- Uses the existing `Switch` component and CSS classes.
- Stored only in component state (session-only).

### Minimal distractions

- One primary action per screen.
- Large buttons (min 44 × 44 px touch target).
- No auto-play audio or moving backgrounds.
- Clear labels: "Aufnahme läuft", "Bereitschaftsphase", "Wiedergabe".

---

## 7. Audio Handling

### Recording

- Use the browser `MediaRecorder` API inside `useMediaRecorder`.
- Request `navigator.mediaDevices.getUserMedia({ audio: true })` when the user clicks **Record**.
- Preferred MIME type: `audio/webm`; fallback to whatever the browser offers.
- Store chunks in a `Blob[]` ref and build a final `Blob` on stop.
- Expose the blob via object URL (`URL.createObjectURL`) to `<audio>`.

### Permissions

- Before first recording, show a permission helper card explaining microphone use.
- If permission is denied, show a friendly message and allow the user to practise without recording (read-aloud mode).
- Never request permission on page load; request only on user gesture.

### Playback

- Render a native `<audio controls src={blobUrl} />`.
- Add optional playback speed buttons (0.75×, 1×, 1.25×).
- Revoke object URLs when the component unmounts to avoid memory leaks.

### Why nothing is persisted

- No object storage (S3, Supabase Storage, etc.) is configured.
- Privacy: speaking practice can feel sensitive.
- MVP scope: the value comes from self-assessment and model answers, not long-term audio archives.

---

## 8. Content Samples

### Präsentation

**Prompt:** Präsentieren Sie, wie sich die digitale Kommunikation auf zwischenmenschliche Beziehungen auswirkt.

**Model answer:**
> Im Folgenden möchte ich darlegen, wie die digitale Kommunikation unsere Beziehungen verändert. Zunächst einmal ermöglicht sie einen ständigen Austausch über räumliche Distanzen hinweg. Ein zentrales Argument ist jedoch, dass dieser Austausch oft oberflächlich bleibt, da nonverbale Signale verloren gehen. Andererseits können soziale Medien auch Gemeinschaften stärken, die sonst isoliert wären. Zusammenfassend lässt sich sagen, dass die Qualität der Kommunikation entscheidender ist als die Quantität der Nachrichten.

**Rubric:**

| Criterion | Description | Max |
|-----------|-------------|-----|
| Struktur | Einleitung, Hauptteil, Schluss erkennbar | 2 |
| Argumentation | Klare These, Belege, Gegenargument | 2 |
| Wortschatz | C1-typische Redemittel und Nuancen | 2 |
| Satzstrukturen | Komplexe Sätze, Konnektoren, Konjunktiv | 2 |
| Flüssigkeit | Wenige Pausen und Füllwörter | 2 |

**Redemittel:**

- Im Folgenden möchte ich darlegen, dass…
- Ein zentrales Argument ist…
- Andererseits muss man bedenken, dass…
- Zusammenfassend lässt sich sagen, dass…

### Diskussion

**Prompt:** "Soziale Medien isolieren Menschen eher, als sie Gemeinschaft zu schaffen." Nehmen Sie Stellung.

**Model answer:**
> Diese Behauptung ist meines Erachtens nur bedingt zutreffend. Zwar kann der exzessive Gebrauch sozialer Medien zu Isolation führen, insbesondere wenn virtueller Kontakt realen ersetzt. Dennoch bieten sie auch Plattformen für Minderheiten und chronisch Kranke, um Unterstützung zu finden. Entscheidend ist daher ein bewusster Umgang mit diesen Medien.

**Rubric:**

| Criterion | Description | Max |
|-----------|-------------|-----|
| Stellungnahme | Klare Positionierung | 2 |
| Begründung | Logische Argumente mit Beispielen | 2 |
| Gegenhaltung | Gegenargument einbringen | 2 |
| Diskussionsredemittel | Einverständnis, Zweifel, Nachfragen | 2 |
| Flüssigkeit | Natürlicher Dialogfluss | 2 |

**Redemittel:**

- Diese Behauptung ist meines Erachtens nur bedingt zutreffend.
- Zwar…, dennoch…
- Ein Gegenargument wäre…
- Worauf wollen Sie hinaus?

### Bildbeschreibung

**Prompt:** Beschreiben und interpretieren Sie die Grafik zum Thema "Anteil erneuerbarer Energien in Deutschland 2010–2025".

**Model answer:**
> Die Grafik zeigt den Anteil erneuerbarer Energien in Deutschland von 2010 bis 2025. Zu erkennen ist ein kontinuierlicher Anstieg von etwa 17 % auf über 50 %. Besonders steil verläuft die Kurve zwischen 2018 und 2022, was vermutlich auf den Kohleausstieg und den Ausbau der Windenergie zurückzuführen ist. Meiner Einschätzung nach spiegelt dies einen grundlegenden gesellschaftlichen Wandel wider.

**Rubric:**

| Criterion | Description | Max |
|-----------|-------------|-----|
| Beschreibung | Sachliche, chronologische Beschreibung | 2 |
| Interpretation | Vermutungen und Ursachen nennen | 2 |
| Wortschatz | Fachbegriffe, Prozentangaben, Steigerungen | 2 |
| Struktur | Überleitungen zwischen Beschreibung und Deutung | 2 |
| Flüssigkeit | Flüssige, selbstständige Rede | 2 |

**Redemittel:**

- Die Grafik veranschaulicht…
- Zu erkennen ist ein deutlicher Anstieg/Rückgang…
- Dies lässt sich vermutlich damit erklären, dass…
- Meiner Einschätzung nach…

### Meinung äußern

**Prompt:** "Bildung sollte für alle Menschen lebenslang kostenlos sein." Äußern Sie Ihre Meinung.

**Model answer:**
> Ich bin grundsätzlich der Auffassung, dass lebenslange Bildung ein zentrales gesellschaftliches Gut darstellt. Kostenlose Weiterbildung würde Chancengerechtigkeit erhöhen und Anpassungsfähigkeit im Arbeitsmarkt stärken. Allerdings stellt sich die Frage der Finanzierung; möglicherweise sollte man gezielt einkommensschwache Gruppen fördern, anstatt alles pauschal kostenlos anzubieten.

**Rubric:**

| Criterion | Description | Max |
|-----------|-------------|-----|
| Meinungsäußerung | Klare, nuancierte Position | 2 |
| Begründung | Mehrere Argumente mit Beispielen | 2 |
| Einschränkung | Gegenargument oder Differenzierung | 2 |
| Meinungsredemittel | Ich bin der Auffassung, Es lässt sich darüber streiten | 2 |
| Flüssigkeit | Natürliche, flüssige Rede | 2 |

**Redemittel:**

- Ich bin der Auffassung, dass…
- Ein gewichtiges Argument dafür/dagegen ist…
- Allerdings stellt sich die Frage, ob…
- Meiner Ansicht nach sollte man…

---

## 9. Implementation Phases

### Phase 1 — Scaffold & data

- Add `SpeakingPart`, `RubricItem`, and `SpeakingExerciseContent` types to `src/types/index.ts`.
- Create route folders under `src/app/(main)/mündlich/` and stub pages.
- Add sidebar nav entry `C1 Mündlich` with `Mic` icon.
- Seed C1 speaking lesson + `Exercise` records via a script in `scripts/seed-speaking.ts` (or SQL) using the JSON shapes above.

### Phase 2 — Core interaction

- Build `useMediaRecorder` hook with permission handling.
- Build `PrepTimer`, `RecordingControls`, `AudioPlayback`.
- Build `SpeakingSession` that wires timer → record → playback → reveal.
- Implement `/mündlich/[part]/[id]` pages with dynamic data fetch via a server action.

### Phase 3 — Self-assessment & feedback

- Build `ModelAnswerPanel` with tabs for model answer, Redemittel, rubric.
- Build `SelfAssessment` checklist.
- Calculate points from self-ratings.

### Phase 4 — ADHD & gamification

- Add session length selector on hub.
- Add `useSessionTimer` and `BreakReminder`.
- Add progress bar, streak, points, badges.
- Add `FocusModeToggle` to hide non-essential UI.

### Phase 5 — Polish

- Arabic RTL layout verification.
- Keyboard shortcuts (Space to start/stop recording when focused).
- Accessible labels and focus states.
- Optional: add a `/mündlich/settings` page for default session length.

---

## 10. Open Questions / Future Work

### Out of scope for MVP

- AI-generated pronunciation, grammar, or fluency feedback.
- Persistent audio storage or cloud upload.
- Peer/partner real-time discussion mode.
- Examiner simulation via TTS.
- Detailed analytics dashboard per user.
- Mobile native recording optimisations beyond browser API.

### Future possibilities

- Supabase Storage for opt-in audio persistence.
- Server-side `SpeakingAttempt` log table once persistence is required.
- OpenAI Whisper transcription + LLM rubric scoring.
- Integration with `Exam` model for full mock C1 oral exams.
- Community model answers ranked by learners.

### Questions for the Manager

1. Should self-ratings update `UserProgress.score` immediately, or stay local to the session?
2. Do we seed the C1 speaking lesson now, or wait for a content admin UI?
3. Is microphone permission fallback (read-aloud mode without recording) acceptable for the MVP?
