import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const C1_SPEAKING_LESSON_TITLE = "C1 Mündliche Prüfung";

const exercises = [
  {
    order: 1,
    instructions:
      "Sie haben 3 Minuten Zeit. Strukturieren Sie Ihren Vortrag in Einleitung, Hauptteil und Schluss.",
    content: {
      part: "präsentation",
      prompt:
        "Präsentieren Sie, wie sich die digitale Kommunikation auf zwischenmenschliche Beziehungen auswirkt.",
      stimulus: null,
      prepTimeSeconds: 180,
      responseTimeSeconds: 180,
      modelAnswer:
        "Im Folgenden möchte ich darlegen, wie die digitale Kommunikation unsere Beziehungen verändert. Zunächst einmal ermöglicht sie einen ständigen Austausch über räumliche Distanzen hinweg. Ein zentrales Argument ist jedoch, dass dieser Austausch oft oberflächlich bleibt, da nonverbale Signale verloren gehen. Andererseits können soziale Medien auch Gemeinschaften stärken, die sonst isoliert wären. Zusammenfassend lässt sich sagen, dass die Qualität der Kommunikation entscheidender ist als die Quantität der Nachrichten.",
      usefulPhrases: [
        "Im Folgenden möchte ich darlegen, dass…",
        "Ein zentrales Argument ist…",
        "Andererseits muss man bedenken, dass…",
        "Zusammenfassend lässt sich sagen, dass…",
      ],
      hints: [
        "Verwenden Sie Konjunktiv II für Hypothesen.",
        "Gehen Sie auf Gegenargumente ein.",
      ],
    },
    answerKey: [
      {
        criterion: "Struktur",
        description: "Einleitung, Hauptteil, Schluss erkennbar",
        maxPoints: 2,
      },
      {
        criterion: "Argumentation",
        description: "Klare These, Belege, Gegenargument",
        maxPoints: 2,
      },
      {
        criterion: "Wortschatz",
        description: "C1-typische Redemittel und Nuancen",
        maxPoints: 2,
      },
      {
        criterion: "Satzstrukturen",
        description: "Komplexe Sätze, Konnektoren, Konjunktiv",
        maxPoints: 2,
      },
      { criterion: "Flüssigkeit", description: "Wenige Pausen und Füllwörter", maxPoints: 2 },
    ],
  },
  {
    order: 2,
    instructions:
      "Nehmen Sie Stellung und diskutieren Sie das Zitat. Sie haben 1 Minute Vorbereitungszeit und ca. 2 Minuten Sprechzeit.",
    content: {
      part: "diskussion",
      prompt:
        '"Soziale Medien isolieren Menschen eher, als sie Gemeinschaft zu schaffen." Nehmen Sie Stellung.',
      stimulus: null,
      prepTimeSeconds: 60,
      responseTimeSeconds: 120,
      modelAnswer:
        "Diese Behauptung ist meines Erachtens nur bedingt zutreffend. Zwar kann der exzessive Gebrauch sozialer Medien zu Isolation führen, insbesondere wenn virtueller Kontakt realen ersetzt. Dennoch bieten sie auch Plattformen für Minderheiten und chronisch Kranke, um Unterstützung zu finden. Entscheidend ist daher ein bewusster Umgang mit diesen Medien.",
      usefulPhrases: [
        "Diese Behauptung ist meines Erachtens nur bedingt zutreffend.",
        "Zwar…, dennoch…",
        "Ein Gegenargument wäre…",
        "Worauf wollen Sie hinaus?",
      ],
      hints: [
        "Nehmen Sie eine klare Position ein.",
        "Beziehen Sie Gegenargumente mit ein.",
      ],
    },
    answerKey: [
      { criterion: "Stellungnahme", description: "Klare Positionierung", maxPoints: 2 },
      {
        criterion: "Begründung",
        description: "Logische Argumente mit Beispielen",
        maxPoints: 2,
      },
      { criterion: "Gegenhaltung", description: "Gegenargument einbringen", maxPoints: 2 },
      {
        criterion: "Diskussionsredemittel",
        description: "Einverständnis, Zweifel, Nachfragen",
        maxPoints: 2,
      },
      { criterion: "Flüssigkeit", description: "Natürlicher Dialogfluss", maxPoints: 2 },
    ],
  },
  {
    order: 3,
    instructions:
      "Beschreiben Sie die Grafik sachlich, interpretieren Sie sie und geben Sie eine kurze persönliche Einschätzung ab.",
    content: {
      part: "bildbeschreibung",
      prompt:
        'Beschreiben und interpretieren Sie die Grafik zum Thema "Anteil erneuerbarer Energien in Deutschland 2010–2025".',
      stimulus: "Grafik: Anteil erneuerbarer Energien in Deutschland von 2010 bis 2025.",
      prepTimeSeconds: 60,
      responseTimeSeconds: 120,
      modelAnswer:
        "Die Grafik zeigt den Anteil erneuerbarer Energien in Deutschland von 2010 bis 2025. Zu erkennen ist ein kontinuierlicher Anstieg von etwa 17 % auf über 50 %. Besonders steil verläuft die Kurve zwischen 2018 und 2022, was vermutlich auf den Kohleausstieg und den Ausbau der Windenergie zurückzuführen ist. Meiner Einschätzung nach spiegelt dies einen grundlegenden gesellschaftlichen Wandel wider.",
      usefulPhrases: [
        "Die Grafik veranschaulicht…",
        "Zu erkennen ist ein deutlicher Anstieg/Rückgang…",
        "Dies lässt sich vermutlich damit erklären, dass…",
        "Meiner Einschätzung nach…",
      ],
      hints: [
        "Beschreiben Sie zuerst Fakten, dann interpretieren Sie.",
        "Verwenden Sie Prozentangaben und Vergleiche.",
      ],
    },
    answerKey: [
      {
        criterion: "Beschreibung",
        description: "Sachliche, chronologische Beschreibung",
        maxPoints: 2,
      },
      { criterion: "Interpretation", description: "Vermutungen und Ursachen nennen", maxPoints: 2 },
      {
        criterion: "Wortschatz",
        description: "Fachbegriffe, Prozentangaben, Steigerungen",
        maxPoints: 2,
      },
      {
        criterion: "Struktur",
        description: "Überleitungen zwischen Beschreibung und Deutung",
        maxPoints: 2,
      },
      { criterion: "Flüssigkeit", description: "Flüssige, selbstständige Rede", maxPoints: 2 },
    ],
  },
  {
    order: 4,
    instructions:
      "Äußern Sie Ihre Meinung zum Zitat, begründen Sie diese mit Beispielen und gehen Sie auf Einschränkungen ein.",
    content: {
      part: "meinung",
      prompt: '"Bildung sollte für alle Menschen lebenslang kostenlos sein." Äußern Sie Ihre Meinung.',
      stimulus: null,
      prepTimeSeconds: 60,
      responseTimeSeconds: 120,
      modelAnswer:
        "Ich bin grundsätzlich der Auffassung, dass lebenslange Bildung ein zentrales gesellschaftliches Gut darstellt. Kostenlose Weiterbildung würde Chancengerechtigkeit erhöhen und Anpassungsfähigkeit im Arbeitsmarkt stärken. Allerdings stellt sich die Frage der Finanzierung; möglicherweise sollte man gezielt einkommensschwache Gruppen fördern, anstatt alles pauschal kostenlos anzubieten.",
      usefulPhrases: [
        "Ich bin der Auffassung, dass…",
        "Ein gewichtiges Argument dafür/dagegen ist…",
        "Allerdings stellt sich die Frage, ob…",
        "Meiner Ansicht nach sollte man…",
      ],
      hints: [
        "Begründen Sie Ihre Meinung mit konkreten Beispielen.",
        "Gehen Sie auf mögliche Gegenstimmen ein.",
      ],
    },
    answerKey: [
      {
        criterion: "Meinungsäußerung",
        description: "Klare, nuancierte Position",
        maxPoints: 2,
      },
      {
        criterion: "Begründung",
        description: "Mehrere Argumente mit Beispielen",
        maxPoints: 2,
      },
      {
        criterion: "Einschränkung",
        description: "Gegenargument oder Differenzierung",
        maxPoints: 2,
      },
      {
        criterion: "Meinungsredemittel",
        description: "Ich bin der Auffassung, Es lässt sich darüber streiten",
        maxPoints: 2,
      },
      { criterion: "Flüssigkeit", description: "Natürliche, flüssige Rede", maxPoints: 2 },
    ],
  },
];

const EXERCISE_IDS: Record<string, string> = {
  präsentation: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  diskussion: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  bildbeschreibung: "c3d4e5f6-a7b8-9012-cdef-123456789012",
  meinung: "d4e5f6a7-b8c9-0123-defa-234567890123",
};

async function main() {
  const c1Level = await prisma.cEFRLevel.upsert({
    where: { code: "C1" },
    update: {},
    create: {
      code: "C1",
      name: "C1 - Advanced",
      description: "Can understand a wide range of demanding, longer texts and recognise implicit meaning.",
      order: 5,
    },
  });

  let lesson = await prisma.lesson.findFirst({
    where: { title: C1_SPEAKING_LESSON_TITLE },
  });

  if (!lesson) {
    lesson = await prisma.lesson.create({
      data: {
        cefrLevelId: c1Level.id,
        title: C1_SPEAKING_LESSON_TITLE,
        description: "Practise the four tasks of the German C1 oral exam.",
        order: 1,
        estimatedMinutes: 30,
      },
    });
  }

  for (const exercise of exercises) {
    const exerciseId = EXERCISE_IDS[exercise.content.part];
    await prisma.exercise.upsert({
      where: {
        id: exerciseId,
      },
      update: {
        lessonId: lesson.id,
        instructions: exercise.instructions,
        content: exercise.content,
        answerKey: exercise.answerKey,
        order: exercise.order,
      },
      create: {
        id: exerciseId,
        lessonId: lesson.id,
        type: "SPEAKING",
        instructions: exercise.instructions,
        content: exercise.content,
        answerKey: exercise.answerKey,
        order: exercise.order,
      },
    });
  }

  console.log(`Seeded ${exercises.length} speaking exercises for lesson ${lesson.id}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
