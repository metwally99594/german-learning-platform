import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLessonById } from "@/server/actions/lesson-actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const lesson = await getLessonById(id);
  return {
    title: lesson ? lesson.title : "Lesson not found",
  };
}

export default async function LessonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lesson = await getLessonById(id);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="space-y-8 px-4 py-8">
      <div>
        <p className="text-sm text-muted-foreground">{lesson.cefrLevel.name}</p>
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        {lesson.description && <p className="mt-2 text-muted-foreground">{lesson.description}</p>}
      </div>

      {lesson.grammarTopics.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Grammar</h2>
          <div className="space-y-3">
            {lesson.grammarTopics.map((topic) => (
              <Card key={topic.id} className="border-border/50 bg-card/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-base">{topic.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{topic.explanation}</CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {lesson.vocabulary.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Vocabulary</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lesson.vocabulary.map((word) => (
              <Card key={word.id} className="border-border/50 bg-card/70 backdrop-blur-md">
                <CardContent className="pt-4">
                  <p className="font-medium">
                    {word.article ? `${word.article} ` : ""}
                    {word.german}
                  </p>
                  <p className="text-sm text-muted-foreground">{word.englishTranslation}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {lesson.quizzes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Quizzes</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {lesson.quizzes.map((quiz) => (
              <Link key={quiz.id} href={`/quizzes/${quiz.id}`}>
                <Card className="border-border/50 bg-card/70 backdrop-blur-md transition-colors hover:bg-accent/50">
                  <CardHeader>
                    <CardTitle className="text-base">{quiz.title}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {lesson.grammarTopics.length === 0 && lesson.vocabulary.length === 0 && lesson.quizzes.length === 0 && (
        <p className="text-muted-foreground">This lesson doesn&apos;t have any content yet.</p>
      )}
    </div>
  );
}
