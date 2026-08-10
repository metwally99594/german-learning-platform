import json
import re

presentationsA = [
    "Bücher geben Anleitungen zum Glücklich sein, und von manchen Menschen wird behauptet, sie hätten das Glück gepachtet. Was ist für Sie Glück, und welchen Stellenwert hat es in Ihrem Leben? Erläutern Sie Ihre Vorstellungen.",
    "Würden Sie auch arbeiten, wenn Sie finanziell nicht darauf angewiesen wären? Schildern Sie Ihre Gedanken zum Thema arbeitsfreies Leben.",
    "Halloween oder das indische Frühlingsfest Holi – in Deutschland werden Bräuche aus anderen Kulturkreisen immer populärer. Schildern Sie Ihre Überlegungen zur Übernahme von fremden Bräuchen. Berichten Sie auch von eigenen Erfahrungen.",
    "Unsere Eltern und Großeltern können aus eigener Erfahrung von historischen Ereignissen berichten. Erachten Sie persönliche Schilderungen als vertrauenswürdige Quelle für Geschichtswissen? Legen Sie Ihre Überlegungen zu dieser Frage dar.",
    "Heutzutage werden im Spitzensport sehr hohe Gagen bezahlt. Finden Sie es richtig, dass Spitzensportler so viel Geld verdienen? Erläutern Sie Ihren Standpunkt.",
    "Sind Sie gegen das Spiel Lotto und für die Entfernung dieses Spiels und seiner Arten? Was sind die Gründe? Erklären Sie Ihre Sichtweise und Meinung.",
    "Wie kann Architektur das Aussehen von Städten prägen? Geben Sie Beispiele.",
    "Welche Berufsgruppe halten Sie für besonders wichtig? Begründen Sie Ihre Meinung.",
    "Welche Berufe haben ein besonders hohes, welche ein besonders niedriges Prestige in Ihrem Herkunftsland (oder einem anderen Land Ihrer Wahl)? Wie kommen solche Prestigeunterschiede Ihrer Meinung nach zustande?",
    "Wie sind Abfallentsorgung und Recycling in Ihrem Herkunftsland organisiert? Welche Unterschiede gibt es zu Deutschland? Berichten Sie.",
    "Welche Rolle spielt der Tierschutz in einem Land Ihrer Wahl? Erläutern Sie dies anhand von Beispielen.",
    "Wie informieren die Medien in einem Land Ihrer Wahl über aktuelle Themen? Inwieweit vertrauen Sie der Berichterstattung? Erläutern Sie Ihre Haltung zu dieser Frage.",
    "Manche Menschen behaupten, der medizinische Fortschritt sei mehr Fluch als Segen. Teilen Sie diese Ansicht? Begründen Sie Ihren Standpunkt anhand von Beispielen.",
    "Sind Sie der Meinung, dass jede oder jeder Jugendliche sich sozial engagieren sollte? Erläutern Sie Ihre Meinung. Sie können auch von eigenen Erfahrungen berichten.",
    "Mitunter wird der Vorwurf erhoben, unsere Gesellschaft sei kinderfeindlich. Entspricht das Ihrem persönlichen Empfinden? Schildern Sie Erfahrungen und Beobachtungen. Sie können auch mit der Einstellung gegenüber Kindern in einem Land Ihrer Wahl vergleichen.",
    "Viele Menschen vertrauen Heilpraktikern, während andere sie als Scharlatane abtun. Sind Sie der Ansicht, dass das Heilen allein Ärztinnen und Ärzten vorbehalten sein sollte? Erläutern Sie Ihre Haltung. Berichten Sie auch von eigenen Erfahrungen.",
    "Sind Sie der Meinung, dass Kinder auf dem Land eine schönere Kindheit haben als solche, die in einer Großstadt aufwachsen? Begründen Sie Ihre Ansicht und berichten Sie von eigenen Erfahrungen.",
    "Immer wieder gehen Menschen auf die Straße, um die Öffentlichkeit auf bestimmte Anliegen aufmerksam zu machen. Betrachten Sie Demonstrationen als wirksames Mittel zur Meinungsäußerung? Erläutern Sie Ihre Haltung zu dieser Frage.",
    "Was macht für Sie einen erfolgreichen Menschen aus? Schildern Sie Ihre Überlegungen zu dieser Frage.",
    "Sind Sie der Meinung, dass der Staat die Kunst fördern sollte? Begründen Sie Ihre Meinung.",
    "Welchen Stellenwert sollte das Spiel im Leben eines Menschen haben? Erläutern Sie Ihre Ansicht.",
    "Sind Sie der Ansicht, dass Kinder unter allen Umständen für die Pflege ihrer Eltern zuständig sind? Legen Sie Ihre Meinung dar.",
    "Wenn Sie einen anderen Menschen 24 Stunden lang sein könnten: Was würden Sie tun? Warum? Stellen Sie sich vor.",
    "Kunst ist jahrhundertelang von Mäzenen und nicht vom Staat gefördert worden. Sind Sie der Meinung, dass Kunstförderung eine private Angelegenheit ist? Begründen Sie Ihre Haltung zu dieser Frage.",
    "Soll es ein generelles Handyverbot an den Schulen geben? Erläutern Sie Ihre Haltung.",
    "Wie wichtig ist die Familie in Ihrem Leben? Welche Rolle spielt sie bei wichtigen Entscheidungen?",
    "Welche Bedeutung hat das Essen und Kochen in Ihrer Kultur? Berichten Sie von Traditionen und Gewohnheiten.",
    "Wie beeinflusst das Klima in Ihrem Herkunftsland den Alltag und die Lebensweise der Menschen?",
    "Was halten Sie von Homeoffice und flexiblen Arbeitszeiten? Schildern Sie Vor- und Nachteile.",
    "Sollten Reiche mehr Steuern zahlen? Begründen Sie Ihren Standpunkt.",
]

presentationsB = [
    "Fernsehserien und Serien zum Herunterladen liegen zurzeit sehr im Trend; manche Menschen schauen sie täglich. Wie erklären Sie sich die Faszination, die von Serien ausgeht? Berichten Sie von Ihren Erfahrungen und Beobachtungen.",
    "Heutzutage scheint es schick zu sein, sich extrem beschäftigt oder gestresst zu zeigen. Selbst Entspannungszeiten sind häufig durchorganisiert, und Nichtstun ist verpönt. Welchen Stellenwert sollte Untätigkeit haben? Erläutern Sie Ihre Ansicht.",
    "Manche Menschen möchten sich den Zwängen entziehen und suchen alternative Lebensformen in einer fremden Umgebung. Ist Aussteigen für Sie eine nachvollziehbare Haltung? Begründen Sie Ihre Meinung.",
    "Der Zeitpunkt, zu dem Frauen in Deutschland ihr erstes Kind bekommen, verschiebt sich immer weiter nach hinten. Sehen Sie darin eine positive Entwicklung? Erläutern Sie Ihre Meinung zu dieser Frage.",
    "Für jüngere Menschen ist das Duzen ganz normal, während ältere Menschen eher beim Sie bleiben. Sind Sie der Meinung, dass das Siezen überholt ist? Schildern Sie Ihre Meinung. Vergleichen Sie mit einem Land Ihrer Wahl.",
    "Tierversuche: Sollten Tierversuche verboten werden? Erläutern Sie Ihre Meinung.",
    "Welche positiven und negativen Funktionen hat Werbung? Erläutern Sie dies anhand von Beispielen.",
    "Beschreiben Sie ein Werk aus der Literatur. Wie schätzen Sie seine Bedeutung ein?",
    "Welche Bedeutung hat die Musik in Ihrem Herkunftsland (oder einem Land Ihrer Wahl)? Warum ist Musik wichtig für den einzelnen Menschen und für die Gesellschaft?",
    "Welche Rolle spielt der Naturschutz in Ihrem Herkunftsland (oder einem Land Ihrer Wahl)? Welche Maßnahmen werden ergriffen, um die Natur zu schützen, und wie effektiv sind sie?",
    "Wir leben immer länger, und die Pflege im Alter wird zu einem wichtigen Thema. Sind Sie der Auffassung, dass der Staat für die Betreuung alter Menschen verantwortlich ist? Legen Sie Ihre Ansichten dar und stellen Sie Vergleiche mit einem Land Ihrer Wahl.",
    "In vielen Industrieländern findet das Konzept des städtischen Gartenbaus immer mehr Anklang. Denken Sie, dass Selbstversorgung durch Anbau auf Dachgärten und an Fassaden sinnvoll ist? Schildern Sie Ihre Überlegungen zu diesem Thema.",
    "Beschreiben Sie das Bildungssystem in einem Land Ihrer Wahl. Was funktioniert gut, und wo sehen Sie Verbesserungsbedarf?",
    "Welche Rollen haben Männer und Frauen in einem Land Ihrer Wahl in der Gesellschaft und in der Familie? Erläutern Sie Ihre Beobachtungen.",
    "Vertreten Sie die Auffassung, dass Sportvereine dem Allgemeinwohl dienen und von der öffentlichen Hand staatlich gefördert werden sollten? Schildern Sie Ihre Gedanken zu dieser Frage.",
    "Für Konsumgüter gibt es heute fast überall bequeme Ratenzahlung. Ist Sparen für besondere Ankäufe wie zum Beispiel Möbel oder ein Auto noch zeitgemäß? Legen Sie Ihre Ansichten und Beobachtungen dar.",
    "Sollten Jungen und Mädchen gleich erzogen werden? Legen Sie Ihre Meinung zu diesem Thema dar. Berichten Sie auch von eigenen Erfahrungen.",
    "Oft hört man, dass die Mode dazu beitrage, die eigene Persönlichkeit zu betonen. Stimmen Sie der Aussage zu? Welchen Stellenwert hat Mode in Ihrem Leben?",
    "Sollten Politikerinnen und Politiker auf teure Statussymbole wie Rolex, Schmuck oder teure Autos und Kleidung verzichten? Begründen Sie Ihre Haltung.",
    "Die richtige Motivation gilt manchen als entscheidender Erfolgsfaktor. Was sind für Sie persönlich starke Motivationsfaktoren? Schildern Sie Ihre Überlegungen zu dieser Frage.",
    "Manche Eltern möchten ihre Kinder antiautoritär erziehen. Was halten Sie davon, Kinder ohne Zwänge aufwachsen zu lassen? Legen Sie Ihre Haltung zu dieser Frage dar.",
    "Zeitschriften und Bücher kann man über das Internet ausleihen. Denken Sie, dass wir offene Bibliotheken brauchen? Legen Sie Ihre Meinung dazu dar.",
    "Sollte man Prominente nur an ihrer beruflichen Leistung oder auch an ihren Einstellungen bzw. ihrem Verhalten messen? Begründen Sie Ihre Ansicht. Sie können auch bekannte Beispiele anführen.",
    "Wird in unseren Städten der Kontakt zu den Nachbarn vernachlässigt? Erläutern Sie Ihre Ansichten zum Thema Nachbarschaft. Vergleichen Sie auch mit einem Land Ihrer Wahl.",
    "Viele Städte leiden unter dem ständig zunehmenden Straßenverkehr. Manche Bürger fordern sogar ein vollständiges Verbot von Privatautos in Städten. Erläutern Sie Ihre Haltung zu dieser Position.",
    "Welche Person aus Ihrem persönlichen Umfeld (Familie, Freunde, Lehrer etc.) hat Ihr Leben am meisten geprägt? Was haben Sie von dieser Person gelernt, und welchen Einfluss hat das auf Ihr Leben heute? Erzählen Sie.",
    "Sollten wir aus Umweltschutzgründen auf Reisen verzichten? Legen Sie Ihre Ansichten zu dieser Frage dar.",
    "Selbstbewusstsein oder Überheblichkeit? Beim Begriff Stolz gehen die Meinungen auseinander. Würden Sie diesen Begriff persönlich auslegen? Nennen Sie Beispiele und vergleichen Sie auch mit einem Land Ihrer Wahl.",
    "Sollten junge Erwachsene, die länger zu Hause wohnen, sich an den Kosten für Unterkunft und Verpflegung beteiligen? Erläutern Sie Ihre Haltung und berichten Sie von Erfahrungen.",
    "Denken Sie, dass unsere Gesellschaften im Laufe der Geschichte gerechter geworden sind? Erläutern Sie Ihre Meinung und führen Sie konkrete Beispiele an.",
]

presentationsC = [
    "Veränderungen rufen bei manchen Menschen Verunsicherung hervor, während andere sie als Ansporn ansehen. Wie empfinden Sie Veränderungen? Legen Sie Ihre Überlegungen dar. Berichten Sie auch von Ihren Erfahrungen.",
    "In verschiedenen Ländern gibt es unterschiedliche Streikkulturen. Wie ist Ihre Haltung zum Thema Streiken? Berichten Sie von eigenen Erfahrungen. Denken Sie auch an historische Entwicklungen.",
    "Schlechte Laune hat jeder einmal. Doch in Gesellschaft reißen sich die meisten Menschen zusammen und versuchen, sich nichts anmerken zu lassen. Sollte man seine Gemütsverfassung auch in der Öffentlichkeit zeigen? Begründen Sie Ihre Haltung zu dieser Frage.",
    "Fitness-Training: eitle Selbstoptimierung oder berechtigter Wunsch nach guter körperlicher Verfassung? Erläutern Sie Ihre Meinung und berichten Sie von Ihren Erfahrungen und Beobachtungen.",
    "Welche historischen Ereignisse sind Ihrer Meinung nach besonders wichtig? Begründen Sie Ihre Meinung.",
    "Wie kann man eine Sprache gut lernen? Geben Sie Tipps und begründen Sie aus Ihrer Erfahrung.",
    "Junge Erwachsene ziehen immer später von zu Hause aus. Sollten sie sich an den Kosten für Unterkunft und Verpflegung beteiligen und ihren Eltern Geld dafür zahlen? Erläutern Sie Ihre Haltung und berichten Sie von eigenen Erfahrungen.",
    "Denken Sie, dass die Beurteilung in Schule und Beruf von persönlicher Sympathie beeinflusst wird? Schildern Sie Ihre Meinung.",
    "Welche gesellschaftliche Rolle spielt die Ehe in einem Land Ihrer Wahl? Wie hat sich die Bedeutung der Ehe im Lauf der Zeit verändert? Erläutern Sie Ihre Ansichten.",
    "Sollte Sport ein fester Bestandteil des Bildungsangebotes sein? Was kann man im Sportunterricht lernen? Erläutern Sie Ihren Standpunkt.",
    "Sind Sie der Meinung, dass in der Schule immer noch traditionelle Rollenbilder von Mann und Frau vermittelt werden? Berichten Sie von Ihren eigenen Erfahrungen mit diesem Thema.",
    "In vielen Städten sind an öffentlichen Plätzen Überwachungskameras installiert. Denken Sie, dass eine solche Überwachung notwendig ist? Begründen Sie Ihren Standpunkt und bringen Sie Beispiele.",
    "Sind Sie der Meinung, dass man eine Fremdsprache nur in dem jeweiligen Land richtig gut lernen kann? Schildern Sie Ihre Erfahrungen und Beobachtungen zu dieser Frage.",
    "Kreditkarten sind als bargeldloses Zahlungsmittel immer beliebter geworden. Befürworten Sie die allgemeine Verwendung von Kreditkarten? Sehen Sie darin auch Gefahren? Legen Sie Argumente dar.",
    "Traditionelle und religiöse Feste werden zunehmend kommerzialisiert. Sehen Sie darin einen Grund, solche Feste gar nicht mehr zu feiern? Erläutern Sie Ihre Ansicht. Führen Sie Beispiele aus Ihrem persönlichen Umfeld oder einem Land Ihrer Wahl an.",
    "Denken Sie, dass unsere Gesellschaften im Laufe der Geschichte gerechter geworden sind? Erläutern Sie Ihre Meinung und führen Sie konkrete Beispiele an.",
    "In den Mantel helfen, Frauen den Vortritt lassen, aufstehen, wenn eine Frau den Raum betritt – sind solche Benimmregeln noch zeitgemäß? Schildern Sie Ihre Ansichten zu diesem Thema. Sie können auch Vergleiche mit einem Land Ihrer Wahl anstellen.",
    "Fremdsprachen spielen eine große Rolle und sollten laut Studien in jungen Jahren erlernt werden. Wie stehen Sie dazu, dass Kinder im Vorschulalter Fremdsprachen lernen?",
    "Häufig klagen Menschen über Zeitdruck. Wie wichtig ist Zeit in Ihrem eigenen Leben? Erläutern Sie Ihre Haltung zu diesem Thema. Sie können auch Vergleiche mit einem Land Ihrer Wahl anstellen.",
    "Umfragen zufolge hören 90% aller Befragten in Deutschland regelmäßig Radio. Welche Bedeutung hat dieses Medium für Sie persönlich? Vergleichen Sie auch mit anderen Medien.",
    "Denken Sie, dass Schwierigkeiten vor allem Chancen sind? Begründen Sie Ihren Standpunkt.",
    "Brauchen Kinder Märchen? Glauben Sie, dass Kinder fantasievolle Geschichten brauchen? Erzählen Sie von Ihrer Erfahrung.",
    "Sollte man Frauen den Vortritt lassen, ihnen den Mantel reichen oder aufstehen, wenn sie einen Raum betreten? Sind solche Höflichkeitsregeln noch zeitgemäß? Schildern Sie Ihre Ansichten.",
    "Wie wichtig ist Intuition bei wichtigen Entscheidungen im Leben? Erläutern Sie Ihre Meinung anhand von Beispielen.",
    "Was bedeutet für Sie Freundschaft? Welche Eigenschaften sind Ihnen bei Freunden besonders wichtig?",
    "Wie kann man den Generationenkonflikt zwischen jungen und alten Menschen überwinden? Erläutern Sie Ihre Gedanken.",
    "Sollte man Prominente als Vorbilder für junge Menschen betrachten? Begründen Sie Ihre Meinung.",
    "Wie wichtig ist es, Fremdsprachen früh zu lernen? Erläutern Sie Ihre Ansichten.",
    "Wie können Städte den Kontakt zwischen den Nachbarn wieder stärken? Erläutern Sie Ihre Vorschläge.",
    "Was halten Sie von Ehrenamten und freiwilliger Arbeit? Sollte sich jeder einmal ehrenamtlich engagieren?",
]

discussions = [
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
]

opinions = [
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
]

bildbeschreibungen = [
    {
        "prompt": "Beschreiben und interpretieren Sie die Grafik zum Thema \"Anteil erneuerbarer Energien in Deutschland 2010–2025\".",
        "stimulus": "Grafik: Anteil erneuerbarer Energien in Deutschland von 2010 bis 2025.",
    },
]

def uuid(index):
    hex_str = format(index, '032x')
    return f"{hex_str[:8]}-{hex_str[8:12]}-4{hex_str[13:16]}-a{hex_str[17:20]}-{hex_str[20:32]}"

base_rubric = [
    {"criterion": "Struktur", "description": "Klare Einleitung, Hauptteil, Schluss", "maxPoints": 2},
    {"criterion": "Argumentation", "description": "Logische Argumente mit Beispielen", "maxPoints": 2},
    {"criterion": "Wortschatz", "description": "C1-typische Redemittel und Nuancen", "maxPoints": 2},
    {"criterion": "Satzstrukturen", "description": "Komplexe Sätze, Konnektoren, Konjunktiv", "maxPoints": 2},
    {"criterion": "Flüssigkeit", "description": "Wenige Pausen und Füllwörter", "maxPoints": 2},
]

discussion_rubric = [
    {"criterion": "Stellungnahme", "description": "Klare Positionierung", "maxPoints": 2},
    {"criterion": "Begründung", "description": "Logische Argumente mit Beispielen", "maxPoints": 2},
    {"criterion": "Gegenhaltung", "description": "Gegenargument einbringen", "maxPoints": 2},
    {"criterion": "Diskussionsredemittel", "description": "Einverständnis, Zweifel, Nachfragen", "maxPoints": 2},
    {"criterion": "Flüssigkeit", "description": "Natürlicher Dialogfluss", "maxPoints": 2},
]

opinion_rubric = [
    {"criterion": "Meinungsäußerung", "description": "Klare, nuancierte Position", "maxPoints": 2},
    {"criterion": "Begründung", "description": "Mehrere Argumente mit Beispielen", "maxPoints": 2},
    {"criterion": "Einschränkung", "description": "Gegenargument oder Differenzierung", "maxPoints": 2},
    {"criterion": "Meinungsredemittel", "description": "Ich bin der Auffassung, Es lässt sich darüber streiten", "maxPoints": 2},
    {"criterion": "Flüssigkeit", "description": "Natürliche, flüssige Rede", "maxPoints": 2},
]

bildbeschreibung_rubric = [
    {"criterion": "Beschreibung", "description": "Sachliche, chronologische Beschreibung", "maxPoints": 2},
    {"criterion": "Interpretation", "description": "Vermutungen und Ursachen nennen", "maxPoints": 2},
    {"criterion": "Wortschatz", "description": "Fachbegriffe, Prozentangaben, Steigerungen", "maxPoints": 2},
    {"criterion": "Struktur", "description": "Überleitungen zwischen Beschreibung und Deutung", "maxPoints": 2},
    {"criterion": "Flüssigkeit", "description": "Flüssige, selbstständige Rede", "maxPoints": 2},
]

def make_exercise(index, part, prompt, stimulus, order):
    rubric = discussion_rubric if part == "diskussion" else opinion_rubric if part == "meinung" else bildbeschreibung_rubric if part == "bildbeschreibung" else base_rubric
    
    if part in ("präsentation-a", "präsentation-b", "präsentation-c"):
        instructions = "Sie haben 3 Minuten Zeit. Strukturieren Sie Ihren Vortrag in Einleitung, Hauptteil und Schluss."
        prep = 180
        response = 180
    elif part == "diskussion":
        instructions = "Nehmen Sie Stellung und diskutieren Sie das Zitat. Sie haben 1 Minute Vorbereitungszeit und ca. 2 Minuten Sprechzeit."
        prep = 60
        response = 120
    elif part == "bildbeschreibung":
        instructions = "Beschreiben Sie die Grafik sachlich, interpretieren Sie sie und geben Sie eine kurze persönliche Einschätzung ab."
        prep = 60
        response = 120
    else:
        instructions = "Äußern Sie Ihre Meinung zum Thema, begründen Sie diese mit Beispielen und gehen Sie auf Einschränkungen ein."
        prep = 60
        response = 120
    
    useful_phrases = {
        "diskussion": ["Diese Behauptung ist meines Erachtens nur bedingt zutreffend.", "Zwar…, dennoch…", "Ein Gegenargument wäre…", "Worauf wollen Sie hinaus?"],
        "meinung": ["Ich bin der Auffassung, dass…", "Ein gewichtiges Argument dafür/dagegen ist…", "Allerdings stellt sich die Frage, ob…", "Meiner Ansicht nach sollte man…"],
        "bildbeschreibung": ["Die Grafik veranschaulicht…", "Zu erkennen ist ein deutlicher Anstieg/Rückgang…", "Dies lässt sich vermutlich damit erklären, dass…", "Meiner Einschätzung nach…"],
    }.get(part, ["Im Folgenden möchte ich darlegen, dass…", "Ein zentrales Argument ist…", "Andererseits muss man bedenken, dass…", "Zusammenfassend lässt sich sagen, dass…"])
    
    return {
        "id": uuid(index),
        "part": part,
        "prompt": prompt,
        "stimulus": stimulus,
        "instructions": instructions,
        "prepTimeSeconds": prep,
        "responseTimeSeconds": response,
        "modelAnswer": "[Musterantwort folgt in einer späteren Version. Sprechen Sie frei und strukturiert über das Thema.]",
        "usefulPhrases": useful_phrases,
        "hints": ["Begründen Sie Ihre Position mit Beispielen.", "Gehen Sie auf Gegenargumente ein."],
        "rubric": rubric,
        "order": order,
    }

index = 1
exercises = []

for i, prompt in enumerate(presentationsA):
    exercises.append(make_exercise(index, "präsentation-a", prompt, None, i + 1))
    index += 1

for i, prompt in enumerate(presentationsB):
    exercises.append(make_exercise(index, "präsentation-b", prompt, None, i + 1))
    index += 1

for i, prompt in enumerate(presentationsC):
    exercises.append(make_exercise(index, "präsentation-c", prompt, None, i + 1))
    index += 1

for i, prompt in enumerate(discussions):
    exercises.append(make_exercise(index, "diskussion", prompt, None, i + 1))
    index += 1

for i, prompt in enumerate(opinions):
    exercises.append(make_exercise(index, "meinung", prompt, None, i + 1))
    index += 1

for i, item in enumerate(bildbeschreibungen):
    exercises.append(make_exercise(index, "bildbeschreibung", item["prompt"], item["stimulus"], i + 1))
    index += 1

with open("src/data/speaking-exercises.json", "w", encoding="utf-8") as f:
    json.dump({"exercises": exercises}, f, ensure_ascii=False, indent=2)

counts = {}
for e in exercises:
    counts[e["part"]] = counts.get(e["part"], 0) + 1

print(f"Generated {len(exercises)} exercises")
print(counts)
