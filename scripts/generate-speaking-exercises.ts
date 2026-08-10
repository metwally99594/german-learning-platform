import { writeFileSync } from "fs";
import { join } from "path";

function uuid(index: number): string {
  const hex = index.toString(16).padStart(32, "0");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

const baseRubric = [
  { criterion: "Struktur", description: "Klare Einleitung, Hauptteil, Schluss", maxPoints: 2 },
  { criterion: "Argumentation", description: "Logische Argumente mit Beispielen", maxPoints: 2 },
  { criterion: "Wortschatz", description: "C1-typische Redemittel und Nuancen", maxPoints: 2 },
  { criterion: "Satzstrukturen", description: "Komplexe Sätze, Konnektoren, Konjunktiv", maxPoints: 2 },
  { criterion: "Flüssigkeit", description: "Wenige Pausen und Füllwörter", maxPoints: 2 },
];

const discussionRubric = [
  { criterion: "Stellungnahme", description: "Klare Positionierung", maxPoints: 2 },
  { criterion: "Begründung", description: "Logische Argumente mit Beispielen", maxPoints: 2 },
  { criterion: "Gegenhaltung", description: "Gegenargument einbringen", maxPoints: 2 },
  { criterion: "Diskussionsredemittel", description: "Einverständnis, Zweifel, Nachfragen", maxPoints: 2 },
  { criterion: "Flüssigkeit", description: "Natürlicher Dialogfluss", maxPoints: 2 },
];

const opinionRubric = [
  { criterion: "Meinungsäußerung", description: "Klare, nuancierte Position", maxPoints: 2 },
  { criterion: "Begründung", description: "Mehrere Argumente mit Beispielen", maxPoints: 2 },
  { criterion: "Einschränkung", description: "Gegenargument oder Differenzierung", maxPoints: 2 },
  { criterion: "Meinungsredemittel", description: "Ich bin der Auffassung, Es lässt sich darüber streiten", maxPoints: 2 },
  { criterion: "Flüssigkeit", description: "Natürliche, flüssige Rede", maxPoints: 2 },
];

const bildbeschreibungRubric = [
  { criterion: "Beschreibung", description: "Sachliche, chronologische Beschreibung", maxPoints: 2 },
  { criterion: "Interpretation", description: "Vermutungen und Ursachen nennen", maxPoints: 2 },
  { criterion: "Wortschatz", description: "Fachbegriffe, Prozentangaben, Steigerungen", maxPoints: 2 },
  { criterion: "Struktur", description: "Überleitungen zwischen Beschreibung und Deutung", maxPoints: 2 },
  { criterion: "Flüssigkeit", description: "Flüssige, selbstständige Rede", maxPoints: 2 },
];

const presentationsA = [
  "Bücher geben Anleitungen zum Glücklich sein, und von manchen Menschen wird behauptet, sie hätten das Glück gepachtet. Was ist für Sie Glück, und welchen Stellenwert hat es in Ihrem Leben? Erläutern Sie Ihre Vorstellungen.",
  "Würden Sie auch arbeiten, wenn Sie finanziell nicht darauf angewiesen wären? Schildern Sie Ihre Gedanken zum Thema arbeitsfreies Leben.",
  "Halloween oder das indische Frühlingsfest Holi – in Deutschland werden Bräuche aus anderen Kulturkreisen immer populärer. Schildern Sie Ihre Überlegungen zur Übernahme von fremden Bräuchen. Berichten Sie auch von eigenen Erfahrungen.",
  "Unsere Eltern und Großeltern können aus eigener Erfahrung von historischen Ereignissen berichten. Erachten Sie persönliche Schilderungen als vertrauenswürdige Quelle für Geschichtswissen? Legen Sie Ihre Überlegungen zu dieser Frage dar.",
  "Heutzutage werden im Spitzensport sehr hohe Gagen bezahlt. Finden Sie es richtig, dass Spitzensportler, z.B. Tennisspieler oder Fußballer, so viel Geld verdienen? Erläutern Sie Ihren Standpunkt. Oder: Finden Sie es gerecht, dass Spitzensportler so viel verdienen?",
  "Sind Sie gegen das Spiel Lotto und für die Entfernung dieses Spiels und seiner Arten? Was sind die Gründe? Erklären Sie Ihre Sichtweise und Meinung.",
  "Wie kann Architektur das Aussehen von Städten prägen? Geben Sie Beispiele.",
  "Welche Berufsgruppe halten Sie für besonders wichtig? Begründen Sie Ihre Meinung.",
  "Welche Berufe haben ein besonders hohes, welche ein besonders niedriges Prestige in Ihrem Herkunftsland (oder einem anderen Land Ihrer Wahl)? Wie kommen solche Prestigeunterschiede Ihrer Meinung nach zustande?",
  "Wie sind Abfallentsorgung und Recycling in Ihrem Herkunftsland organisiert? Welche Unterschiede gibt es zu Deutschland? Berichten Sie.",
  "Welche Rolle spielt der Tierschutz in einem Land Ihrer Wahl? Erläutern Sie dies anhand von Beispielen.",
  "Wie informieren die Medien in einem Land Ihrer Wahl über aktuelle Themen? Inwieweit vertrauen Sie der Berichterstattung? Erläutern Sie Ihre Haltung zu dieser Frage.",
  "Ist Altersvorsorge allein Aufgabe des Staates oder sollte jeder auch selbst dafür sorgen, dass er im Alter seinen Lebensunterhalt bestreiten kann? Legen Sie Ihre Überlegungen zu dieser Frage dar.",
  "Für den Skisport werden Lebensräume der Tierwelt zerstört. Mountainbiker fahren durch die Wälder, Klettertouristen verschmutzen das Hochgebirge. Ist Sport in sensiblen Umgebungen zu verantworten? Erläutern Sie Ihre Meinung.",
  "Manche Menschen behaupten, der medizinische Fortschritt sei mehr Fluch als Segen. Teilen Sie diese Ansicht? Begründen Sie Ihren Standpunkt anhand von Beispielen.",
];

const presentationsB = [
  "Sind Sie der Meinung, dass jede oder jeder Jugendliche sich sozial engagieren sollte? Erläutern Sie Ihre Meinung. Sie können auch von eigenen Erfahrungen berichten.",
  "Mitunter wird der Vorwurf erhoben, unsere Gesellschaft sei kinderfeindlich. Entspricht das Ihrem persönlichen Empfinden? Schildern Sie Erfahrungen und Beobachtungen. Sie können auch mit der Einstellung gegenüber Kindern in einem Land Ihrer Wahl vergleichen.",
  "Viele Menschen vertrauen Heilpraktikern, während andere sie als Scharlatane abtun. Sind Sie der Ansicht, dass das Heilen allein Ärztinnen und Ärzten vorbehalten sein sollte? Erläutern Sie Ihre Haltung. Berichten Sie auch von eigenen Erfahrungen.",
  "Sind Sie der Meinung, dass Kinder auf dem Land eine schönere Kindheit haben als solche, die in einer Großstadt aufwachsen? Begründen Sie Ihre Ansicht und berichten Sie von eigenen Erfahrungen.",
  "Immer wieder gehen Menschen auf die Straße, um die Öffentlichkeit auf bestimmte Anliegen aufmerksam zu machen. Betrachten Sie Demonstrationen als wirksames Mittel zur Meinungsäußerung? Erläutern Sie Ihre Haltung zu dieser Frage.",
  "Soll es ein generelles Handyverbot an den Schulen geben? Erläutern Sie Ihre Haltung.",
  "Was macht für Sie einen erfolgreichen Menschen aus? Schildern Sie Ihre Überlegungen zu dieser Frage.",
  "Sind Sie der Meinung, dass der Staat die Kunst fördern sollte? Begründen Sie Ihre Haltung.",
  "Sind Sie der Ansicht, dass Kinder unter allen Umständen für die Pflege ihrer Eltern zuständig sind? Legen Sie Ihre Haltung zu dieser Frage dar. Spiel-Trends: Wandel mit der Zeit. Welchen Stellenwert sollte das Spiel im Leben eines Menschen haben?",
  "Wenn Sie eine andere Person 24 Stunden lang sein würden: Was würden Sie tun? Warum? Stellen Sie sich vor.",
  "Kunst ist jahrhundertelang von Mäzenen und nicht vom Staat gefördert worden. Sind Sie der Meinung, dass Kunstförderung eine private Angelegenheit ist? Begründen Sie Ihre Haltung zu dieser Frage.",
  "Fernsehserien und Serien zum Herunterladen liegen zurzeit sehr im Trend; manche Menschen schauen sie täglich. Wie erklären Sie sich die Faszination, die von Serien ausgeht? Berichten Sie von Ihren Erfahrungen und Beobachtungen.",
  "Heutzutage scheint es schick zu sein, sich extrem beschäftigt oder gestresst zu zeigen. Selbst Entspannungszeiten sind häufig durchorganisiert, und Nichtstun ist verpönt. Welchen Stellenwert sollte Untätigkeit haben? Erläutern Sie Ihre Ansicht.",
  "Manche Menschen möchten sich den Zwängen entziehen und suchen alternative Lebensformen in einer fremden Umgebung. Ist Aussteigen für Sie eine nachvollziehbare Haltung? Begründen Sie Ihre Meinung.",
  "Der Zeitpunkt, zu dem Frauen in Deutschland ihr erstes Kind bekommen, verschiebt sich immer weiter nach hinten. Sehen Sie darin eine positive Entwicklung? Erläutern Sie Ihre Meinung zu dieser Frage.",
];

const presentationsC = [
  "Für jüngere Menschen ist das Duzen ganz normal, während ältere Menschen eher beim Sie bleiben. Sind Sie der Meinung, dass das Siezen überholt ist? Schildern Sie Ihre Meinung. Vergleichen Sie mit einem Land Ihrer Wahl.",
  "Tierversuche: Sollten Tierversuche verboten werden? Erläutern Sie Ihre Meinung.",
  "Welche positiven und negativen Funktionen hat Werbung? Erläutern Sie dies anhand von Beispielen.",
  "Beschreiben Sie ein Werk aus der Literatur. Wie schätzen Sie seine Bedeutung ein?",
  "Welche Bedeutung hat die Musik in Ihrem Herkunftsland (oder einem Land Ihrer Wahl)? Warum ist Musik wichtig für den einzelnen Menschen und für die Gesellschaft?",
  "Welche Rolle spielt der Naturschutz in Ihrem Herkunftsland (oder einem Land Ihrer Wahl)? Welche Maßnahmen werden ergriffen, um die Natur zu schützen, und wie effektiv sind sie?",
  "Wir leben immer länger, und die Pflege im Alter wird zu einem wichtigen Thema. Sind Sie der Auffassung, dass der Staat für die Betreuung alter Menschen verantwortlich ist? Legen Sie Ihre Ansichten dar und stellen Sie Vergleiche mit einem Land Ihrer Wahl an.",
  "In vielen Industrieländern findet das Konzept des städtischen Gartenbaus immer mehr Anklang. Denken Sie, dass Selbstversorgung durch Anbau auf Dachgärten und an Fassaden sinnvoll ist? Schildern Sie Ihre Überlegungen zu diesem Thema.",
  "Beschreiben Sie das Bildungssystem in einem Land Ihrer Wahl. Was funktioniert gut und wo sehen Sie Verbesserungsbedarf?",
  "Welche Rollen haben Männer und Frauen in einem Land Ihrer Wahl in der Gesellschaft und in der Familie? Erläutern Sie Ihre Beobachtungen.",
  "Vertreten Sie die Auffassung, dass Sportvereine dem Allgemeinwohl dienen und von der öffentlichen Hand staatlich gefördert werden sollten? Schildern Sie Ihre Gedanken zu dieser Frage.",
  "Für Konsumgüter gibt es heute fast überall bequeme Ratenzahlung. Ist Sparen für besondere Ankäufe wie zum Beispiel Möbel oder ein Auto noch zeitgemäß? Legen Sie Ihre Ansichten und Beobachtungen dar.",
  "Sollten Jungen und Mädchen gleich erzogen werden? Legen Sie Ihre Meinung zu diesem Thema dar. Berichten Sie auch von eigenen Erfahrungen.",
  "Oft hört man, dass die Mode dazu beitrage, die eigene Persönlichkeit zu betonen. Stimmen Sie der Aussage zu? Welchen Stellenwert hat Mode in Ihrem Leben?",
  "Sollten Politikerinnen und Politiker auf teure Statussymbole wie Rolex, Schmuck oder teure Autos und Kleidung verzichten? Begründen Sie Ihre Haltung.",
];

const discussions = [
  "Wege entstehen dadurch, dass man sie geht.",
  "Lügen ist immer besser als die Wahrheit.",
  "Über Geschmack muss man nicht streiten.",
  "Höflichkeit ist eine Kunst, die wir zeigen sollten.",
  "Wir brauchen Ernährungserziehung.",
  "Glück ist kostenlos, aber unbezahlbar.",
  "Freunde sind auch Familie, die man aussuchen kann.",
  "Jedes Kind ist gewissermaßen ein Genie, und jedes Genie ist gewissermaßen ein Kind.",
  "Es gibt eine Menge Menschen, aber noch viel mehr Gesichter.",
  "Träume nicht von deinem Leben, lebe deinen Traum.",
  "Das Handy bedeutet Verlust an Freiheit.",
  "Stärke bedeutet Wissen, nicht immer stark sein.",
  "Wenn zwei sich streiten, freut sich der Dritte.",
  "Statt die Gleichheit zu holen, sollte man zur Vielfalt raten.",
  "Erfahrung ist etwas, was man bekommt, nachdem man es gebraucht hätte.",
  "Konkurrenz ist gesund.",
  "Im Internet kann man mehr Informationen finden als in Büchern.",
  "Die Schule ist nur für Bildung, nicht für Erziehung.",
  "Nur tote Fische schwimmen mit dem Strom.",
  "Es ist nicht leicht, andere von seiner Meinung zu überzeugen.",
  "Hat die Mehrheit immer Recht?",
  "Die Zeit ist wertvoller als Geld.",
  "Ein nebliger Morgen ist noch kein wolkiger Tag.",
  "Genug ist besser als zu viel.",
  "Kein Mensch ist so reich, dass er nicht seinen Nachbarn bräuchte.",
  "Man kann im Leben alles erreichen, was man sich vornimmt.",
  "Papier ist geduldig.",
  "Spielen ist nur für Kinder.",
  "Wer nicht kann, will auch nicht.",
  "Bildung ist die mächtigste Waffe, um die Welt zu verändern.",
  "Wissen ist Macht.",
  "Schönheit ist der Schlüssel zum Erfolg.",
  "Jeder will länger leben, aber nicht älter werden.",
  "Das Leben ist komisch ohne Freude, aber schön mit Ernst.",
  "Eine Reise von tausend Meilen fängt mit dem ersten Schritt an.",
  "Die Hoffnung führt uns weiter als die Furcht.",
  "Das Gras wächst nicht schneller, wenn man daran zieht.",
  "Man kann nicht denken, wenn man es eilig hat.",
  "Erziehen heißt vorleben, alles andere ist höchstens Dressur.",
  "Was dem Schwarm nicht nützt, nützt auch der einzelnen Biene nicht.",
  "Die Familie ist vor allem eine solidarische Gemeinschaft.",
  "Beziehungen sind wichtiger als Können.",
  "Man kann das Leben ändern, wenn man seine Denkweise ändert.",
  "Soziale Netzwerke machen einsame Menschen einsamer.",
  "Fernsehen ist Zeitverschwendung.",
  "Der Kluge gibt nach – eine traurige Wahrheit, sie begründet die Weltherrschaft der Dummheit.",
  "Das Geld macht Menschen attraktiv.",
  "Geld verschafft Unabhängigkeit, aber zu wissen, dass man auch ohne leben kann, verschafft Freiheit.",
];

const opinions = [
  "Sind Sie gegen das Spiel Lotto und für die Entfernung dieses Spiels und seiner Arten? Erklären Sie Ihre Sichtweise und Meinung.",
  "Sind Sie der Meinung, dass jede oder jeder Jugendliche sich sozial engagieren sollte? Erläutern Sie Ihre Meinung.",
  "Soll es ein generelles Handyverbot an den Schulen geben? Äußern Sie Ihre Meinung.",
  "Sollte der Staat die Kunst fördern? Begründen Sie Ihre Meinung.",
  "Sind Sie der Ansicht, dass Kinder unter allen Umständen für die Pflege ihrer Eltern zuständig sind? Legen Sie Ihre Meinung dar.",
  "Sollten Tierversuche verboten werden? Äußern Sie Ihre Meinung.",
  "Sind Sie der Auffassung, dass der Staat für die Betreuung alter Menschen verantwortlich ist? Legen Sie Ihre Ansichten dar.",
  "Sollten Jungen und Mädchen gleich erzogen werden? Legen Sie Ihre Meinung zu diesem Thema dar.",
  "Sollten Politikerinnen und Politiker auf teure Statussymbole wie Rolex oder teure Autos verzichten? Begründen Sie Ihre Haltung.",
  "Sollten wir aus Umweltschutzgründen auf Reisen verzichten? Legen Sie Ihre Ansichten zu dieser Frage dar.",
  "Sind Sie der Meinung, dass man eine Fremdsprache nur in dem jeweiligen Land richtig gut lernen kann? Schildern Sie Ihre Erfahrungen.",
  "Sollte Sport ein fester Bestandteil des Bildungsangebotes sein? Erläutern Sie Ihren Standpunkt.",
  "Denken Sie, dass eine solche Überwachung durch Kameras an öffentlichen Plätzen notwendig ist? Begründen Sie Ihren Standpunkt.",
  "Befürworten Sie die allgemeine Verwendung von Kreditkarten? Sehen Sie darin auch Gefahren? Legen Sie Argumente dar.",
  "Sind Sie der Meinung, dass in der Schule immer noch traditionelle Rollenbilder von Mann und Frau vermittelt werden? Berichten Sie von Erfahrungen.",
  "Sollte man seine Gemütsverfassung auch in der Öffentlichkeit zeigen? Begründen Sie Ihre Haltung.",
  "Ist Altersvorsorge allein Aufgabe des Staates oder sollte jeder auch selbst dafür sorgen? Legen Sie Ihre Überlegungen dar.",
  "Ist Sport in sensiblen Umgebungen zu verantworten? Erläutern Sie Ihre Meinung.",
  "Ist Fitness-Training eitle Selbstoptimierung oder berechtigter Wunsch nach guter körperlicher Verfassung? Erläutern Sie Ihre Meinung.",
  "Brauchen Kinder Märchen? Glauben Sie, dass Kinder fantasievolle Geschichten brauchen? Erzählen Sie von Ihrer Erfahrung.",
];

const bildbeschreibungen = [
  {
    prompt: "Beschreiben und interpretieren Sie die Grafik zum Thema \"Anteil erneuerbarer Energien in Deutschland 2010–2025\".",
    stimulus: "Grafik: Anteil erneuerbarer Energien in Deutschland von 2010 bis 2025.",
  },
];

function makeExercise(
  index: number,
  part: "praesentation-a" | "praesentation-b" | "praesentation-c" | "diskussion" | "bildbeschreibung" | "meinung",
  prompt: string,
  stimulus: string | null,
  order: number
) {
  const id = uuid(index);
  const rubric =
    part === "diskussion"
      ? discussionRubric
      : part === "meinung"
      ? opinionRubric
      : part === "bildbeschreibung"
      ? bildbeschreibungRubric
      : baseRubric;

  const instructions =
    part === "praesentation-a" || part === "praesentation-b" || part === "praesentation-c"
      ? "Sie haben 3 Minuten Zeit. Strukturieren Sie Ihren Vortrag in Einleitung, Hauptteil und Schluss."
      : part === "diskussion"
      ? "Nehmen Sie Stellung und diskutieren Sie das Zitat. Sie haben 1 Minute Vorbereitungszeit und ca. 2 Minuten Sprechzeit."
      : part === "bildbeschreibung"
      ? "Beschreiben Sie die Grafik sachlich, interpretieren Sie sie und geben Sie eine kurze persönliche Einschätzung ab."
      : "Äußern Sie Ihre Meinung zum Thema, begründen Sie diese mit Beispielen und gehen Sie auf Einschränkungen ein.";

  const usefulPhrases =
    part === "diskussion"
      ? ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"]
      : part === "meinung"
      ? ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"]
      : part === "bildbeschreibung"
      ? ["Die Grafik veranschaulicht…", "Zu erkennen ist ein deutlicher Anstieg/Rückgang…", "Dies lässt sich vermutlich damit erklären, dass…", "Meiner Einschätzung nach…"]
      : ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"];

  return {
    id,
    part,
    prompt,
    stimulus,
    instructions,
    prepTimeSeconds: part === "praesentation-a" || part === "praesentation-b" || part === "praesentation-c" ? 180 : 60,
    responseTimeSeconds: part === "praesentation-a" || part === "praesentation-b" || part === "praesentation-c" ? 180 : 120,
    modelAnswer: "[Musterantwort folgt in einer späteren Version. Sprechen Sie frei und strukturiert über das Thema.]",
    usefulPhrases,
    hints: ["Begründen Sie Ihre Position mit Beispielen.", "Gehen Sie auf Gegenargumente ein."],
    rubric,
    order,
  };
}

let index = 1;
const exercises: unknown[] = [];

presentationsA.forEach((prompt, i) => exercises.push(makeExercise(index++, "praesentation-a", prompt, null, i + 1)));
presentationsB.forEach((prompt, i) => exercises.push(makeExercise(index++, "praesentation-b", prompt, null, i + 1)));
presentationsC.forEach((prompt, i) => exercises.push(makeExercise(index++, "praesentation-c", prompt, null, i + 1)));
discussions.forEach((prompt, i) => exercises.push(makeExercise(index++, "diskussion", prompt, null, i + 1)));
opinions.forEach((prompt, i) => exercises.push(makeExercise(index++, "meinung", prompt, null, i + 1)));
bildbeschreibungen.forEach((item, i) => exercises.push(makeExercise(index++, "bildbeschreibung", item.prompt, item.stimulus, i + 1)));

const output = { exercises };

writeFileSync(
  join(process.cwd(), "src", "data", "speaking-exercises.json"),
  JSON.stringify(output, null, 2)
);

console.log(`Generated ${exercises.length} exercises.`);
console.log(`Presentations A: ${presentationsA.length}, B: ${presentationsB.length}, C: ${presentationsC.length}`);
