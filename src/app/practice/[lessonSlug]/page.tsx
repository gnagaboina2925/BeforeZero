import { LessonPlayer } from "@/components/LessonPlayer";
import { lessonIdFromSlug } from "@/lib/lesson/lessons";
import { notFound } from "next/navigation";

export default async function PracticeLessonPage({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}) {
  const { lessonSlug } = await params;
  const lessonId = lessonIdFromSlug(lessonSlug);
  if (!lessonId) notFound();
  return (
    <main id="main-content" className="app-main" tabIndex={-1}>
      <LessonPlayer lessonId={lessonId} />
    </main>
  );
}
