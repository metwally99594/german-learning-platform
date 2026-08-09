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

const presentationPrompts = [
  { prompt: "Bücher geben Anleitungen zum Glücklich sein. Was ist für Sie Glück, und welchen Stellenwert hat es in Ihrem Leben? Erläutern Sie Ihre Vorstellungen.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Würden Sie auch arbeiten, wenn Sie finanziell nicht darauf angewiesen wären? Schildern Sie Ihre Gedanken zum Thema arbeitsfreies Leben.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "In Deutschland werden Bräuche aus anderen Kulturkreisen wie Halloween oder Holi immer populärer. Schildern Sie Ihre Überlegungen zur Übernahme von fremden Bräuchen.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Unsere Eltern und Großeltern können aus eigener Erfahrung von historischen Ereignissen berichten. Erachten Sie persönliche Schilderungen als vertrauenswürdige Quelle für Geschichtswissen?", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Heutzutage werden im Spitzensport sehr hohe Gagen bezahlt. Finden Sie es richtig, dass Spitzensportler so viel Geld verdienen? Erläutern Sie Ihren Standpunkt.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Wie kann Architektur das Aussehen von Städten prägen? Geben Sie Beispiele und erläutern Sie Ihre Einschätzung.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Welche Berufsgruppe halten Sie für besonders wichtig? Begründen Sie Ihre Meinung anhand konkreter Beispiele.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Wie sind Abfallentsorgung und Recycling in Ihrem Herkunftsland organisiert? Welche Unterschiede gibt es zu Deutschland? Berichten Sie.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Welche Rolle spielt der Tierschutz in einem Land Ihrer Wahl? Erläutern Sie dies anhand von Beispielen.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Manche Menschen behaupten, der medizinische Fortschritt sei mehr Fluch als Segen. Teilen Sie diese Ansicht? Begründen Sie Ihren Standpunkt.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Immer wieder gehen Menschen auf die Straße, um die Öffentlichkeit auf bestimmte Anliegen aufmerksam zu machen. Betrachten Sie Demonstrationen als wirksames Mittel zur Meinungsäußerung?", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Was macht für Sie einen erfolgreichen Menschen aus? Schildern Sie Ihre Überlegungen zu dieser Frage.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Fernsehserien und Serien zum Herunterladen liegen zurzeit sehr im Trend. Wie erklären Sie sich die Faszination, die von Serien ausgeht? Berichten Sie von Ihren Erfahrungen.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Heutzutage scheint es schick zu sein, sich extrem beschäftigt oder gestresst zu zeigen. Welchen Stellenwert sollte Untätigkeit haben? Erläutern Sie Ihre Ansicht.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "In vielen Industrieländern findet das Konzept des städtischen Gartenbaus immer mehr Anklang. Denken Sie, dass Selbstversorgung durch Dachgärten sinnvoll ist?", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Welche Bedeutung hat die Musik in Ihrem Herkunftsland? Warum ist Musik wichtig für den einzelnen Menschen und für die Gesellschaft?", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Welche Rolle spielt der Naturschutz in Ihrem Herkunftsland? Welche Maßnahmen werden ergriffen, um die Natur zu schützen, und wie effektiv sind sie?", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Beschreiben Sie das Bildungssystem in einem Land Ihrer Wahl. Was funktioniert gut, und wo sehen Sie Verbesserungsbedarf?", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Vertreten Sie die Auffassung, dass Sportvereine dem Allgemeinwohl dienen und staatlich gefördert werden sollten? Schildern Sie Ihre Gedanken.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Viele Städte leiden unter dem ständig zunehmenden Straßenverkehr. Manche Bürger fordern ein vollständiges Verbot von Privatautos in Städten. Erläutern Sie Ihre Haltung.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Welche historischen Ereignisse sind Ihrer Meinung nach besonders wichtig? Begründen Sie Ihre Meinung.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Wie kann man eine Sprache gut lernen? Geben Sie Tipps und begründen Sie aus Ihrer Erfahrung.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Denken Sie, dass Schwierigkeiten vor allem Chancen sind? Begründen Sie Ihren Standpunkt.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
  { prompt: "Traditionelle und religiöse Feste werden zunehmend kommerzialisiert. Sehen Sie darin einen Grund, solche Feste gar nicht mehr zu feiern? Erläutern Sie Ihre Ansicht.", usefulPhrases: ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"] },
];

const opinionPrompts = [
  { prompt: "Sind Sie gegen das Spiel Lotto und für die Entfernung dieses Spiels und seiner Arten? Erklären Sie Ihre Sichtweise und Meinung.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Sind Sie der Meinung, dass jede oder jeder Jugendliche sich sozial engagieren sollte? Erläutern Sie Ihre Meinung.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Soll es ein generelles Handyverbot an den Schulen geben? Äußern Sie Ihre Meinung.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Sollte der Staat die Kunst fördern? Begründen Sie Ihre Meinung.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Sind Sie der Ansicht, dass Kinder unter allen Umständen für die Pflege ihrer Eltern zuständig sind? Legen Sie Ihre Meinung dar.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Sollten Tierversuche verboten werden? Äußern Sie Ihre Meinung.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Sind Sie der Auffassung, dass der Staat für die Betreuung alter Menschen verantwortlich ist? Legen Sie Ihre Ansichten dar.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Sollten Jungen und Mädchen gleich erzogen werden? Legen Sie Ihre Meinung zu diesem Thema dar.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Sollten Politikerinnen und Politiker auf teure Statussymbole wie Rolex oder teure Autos verzichten? Begründen Sie Ihre Haltung.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Sollten wir aus Umweltschutzgründen auf Reisen verzichten? Legen Sie Ihre Ansichten zu dieser Frage dar.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Sind Sie der Meinung, dass man eine Fremdsprache nur in dem jeweiligen Land richtig gut lernen kann? Schildern Sie Ihre Erfahrungen.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Sollte Sport ein fester Bestandteil des Bildungsangebotes sein? Erläutern Sie Ihren Standpunkt.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Denken Sie, dass eine solche Überwachung durch Kameras an öffentlichen Plätzen notwendig ist? Begründen Sie Ihren Standpunkt.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Befürworten Sie die allgemeine Verwendung von Kreditkarten? Sehen Sie darin auch Gefahren? Legen Sie Argumente dar.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Sind Sie der Meinung, dass in der Schule immer noch traditionelle Rollenbilder von Mann und Frau vermittelt werden? Berichten Sie von Erfahrungen.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Sollte man seine Gemütsverfassung auch in der Öffentlichkeit zeigen? Begründen Sie Ihre Haltung.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Ist Altersvorsorge allein Aufgabe des Staates oder sollte jeder auch selbst dafür sorgen? Legen Sie Ihre Überlegungen dar.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Ist Sport in sensiblen Umgebungen zu verantworten? Erläutern Sie Ihre Meinung.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Ist Fitness-Training eitle Selbstoptimierung oder berechtigter Wunsch nach guter körperlicher Verfassung? Erläutern Sie Ihre Meinung.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
  { prompt: "Brauchen Kinder Märchen? Glauben Sie, dass Kinder fantasievolle Geschichten brauchen? Erzählen Sie von Ihrer Erfahrung.", usefulPhrases: ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"] },
];

const discussionPrompts = [
  { prompt: "Wege entstehen dadurch, dass man sie geht.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Lügen ist immer besser als die Wahrheit.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Über Geschmack muss man nicht streiten.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Höflichkeit ist eine Kunst, die wir zeigen sollten.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Wir brauchen Ernährungserziehung.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Glück ist kostenlos, aber unbezahlbar.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Freunde sind auch Familie, die man aussuchen kann.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Jedes Kind ist gewissermaßen ein Genie, und jedes Genie ist gewissermaßen ein Kind.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Es gibt eine Menge Menschen, aber noch viel mehr Gesichter.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Träume nicht von deinem Leben, lebe deinen Traum.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Das Handy bedeutet Verlust an Freiheit.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Stärke bedeutet Wissen, nicht immer stark sein.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Wenn zwei sich streiten, freut sich der Dritte.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Statt die Gleichheit zu holen, sollte man zur Vielfalt raten.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Erfahrung ist etwas, was man bekommt, nachdem man es gebraucht hätte.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Konkurrenz ist gesund.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Im Internet kann man mehr Informationen finden als in Büchern.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Die Schule ist nur für Bildung, nicht für Erziehung.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Nur tote Fische schwimmen mit dem Strom.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Es ist nicht leicht, andere von seiner Meinung zu überzeugen.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Hat die Mehrheit immer Recht?", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Die Zeit ist wertvoller als Geld.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Ein nebliger Morgen ist noch kein wolkiger Tag.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Genug ist besser als zu viel.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Kein Mensch ist so reich, dass er nicht seinen Nachbarn bräuchte.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Man kann im Leben alles erreichen, was man sich vornimmt.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Papier ist geduldig.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Spielen ist nur für Kinder.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Wer nicht kann, will auch nicht.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Bildung ist die mächtigste Waffe, um die Welt zu verändern.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Wissen ist Macht.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Schönheit ist der Schlüssel zum Erfolg.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Jeder will länger leben, aber nicht älter werden.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Das Leben ist komisch ohne Freude, aber schön mit Ernst.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Eine Reise von tausend Meilen fängt mit dem ersten Schritt an.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Die Hoffnung führt uns weiter als die Furcht.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Das Gras wächst nicht schneller, wenn man daran zieht.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Man kann nicht denken, wenn man es eilig hat.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Erziehen heißt vorleben, alles andere ist höchstens Dressur.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Was dem Schwarm nicht nützt, nützt auch der einzelnen Biene nicht.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Die Familie ist vor allen eine solidarische Gemeinschaft.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Beziehungen sind wichtiger als Können.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Man kann das Leben ändern, wenn man seine Denkweise ändert.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Soziale Netzwerke machen einsame Menschen einsamer.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Fernsehen ist Zeitverschwendung.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Der Kluge gibt nach – eine traurige Wahrheit, sie begründet die Weltherrschaft der Dummheit.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Das Geld macht Menschen attraktiv.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
  { prompt: "Geld verschafft Unabhängigkeit, aber zu wissen, dass man auch ohne leben kann, verschafft Freiheit.", usefulPhrases: ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"] },
];

const bildbeschreibungPrompts = [
  {
    prompt: "Beschreiben und interpretieren Sie die Grafik zum Thema \"Anteil erneuerbarer Energien in Deutschland 2010–2025\".",
    stimulus: "Grafik: Anteil erneuerbarer Energien in Deutschland von 2010 bis 2025.",
    usefulPhrases: ["Die Grafik veranschaulicht…", "Zu erkennen ist ein deutlicher Anstieg/Rückgang…", "Dies lässt sich vermutlich damit erklären, dass…", "Meiner Einschätzung nach…"],
  },
];

function makeExercise(
  index: number,
  part: "präsentation" | "diskussion" | "bildbeschreibung" | "meinung",
  item: { prompt: string; usefulPhrases: string[]; stimulus?: string },
  order: number
) {
  const id = uuid(index);
  const rubric = part === "diskussion" ? discussionRubric : part === "meinung" ? opinionRubric : baseRubric;
  const instructions =
    part === "präsentation"
      ? "Sie haben 3 Minuten Zeit. Strukturieren Sie Ihren Vortrag in Einleitung, Hauptteil und Schluss."
      : part === "diskussion"
      ? "Nehmen Sie Stellung und diskutieren Sie das Zitat. Sie haben 1 Minute Vorbereitungszeit und ca. 2 Minuten Sprechzeit."
      : part === "bildbeschreibung"
      ? "Beschreiben Sie die Grafik sachlich, interpretieren Sie sie und geben Sie eine kurze persönliche Einschätzung ab."
      : "Äußern Sie Ihre Meinung zum Thema, begründen Sie diese mit Beispielen und gehen Sie auf Einschränkungen ein.";

  return {
    id,
    part,
    prompt: item.prompt,
    stimulus: item.stimulus ?? null,
    instructions,
    prepTimeSeconds: part === "präsentation" ? 180 : 60,
    responseTimeSeconds: part === "präsentation" ? 180 : 120,
    modelAnswer: "[Musterantwort folgt in einer späteren Version. Sprechen Sie frei und strukturiert über das Thema.]",
    usefulPhrases: item.usefulPhrases,
    hints: ["Begründen Sie Ihre Position mit Beispielen.", "Gehen Sie auf Gegenargumente ein."],
    rubric,
    order,
  };
}

let index = 1;
const exercises: unknown[] = [];

presentationPrompts.forEach((item, i) => exercises.push(makeExercise(index++, "präsentation", item, i + 1)));
discussionPrompts.forEach((item, i) => exercises.push(makeExercise(index++, "diskussion", item, i + 1)));
opinionPrompts.forEach((item, i) => exercises.push(makeExercise(index++, "meinung", item, i + 1)));
bildbeschreibungPrompts.forEach((item, i) => exercises.push(makeExercise(index++, "bildbeschreibung", item, i + 1)));

const output = { exercises };

writeFileSync(
  join(process.cwd(), "src", "data", "speaking-exercises.json"),
  JSON.stringify(output, null, 2)
);

console.log(`Generated ${exercises.length} exercises.`);
