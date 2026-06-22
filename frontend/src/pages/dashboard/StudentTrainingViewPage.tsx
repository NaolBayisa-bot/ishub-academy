import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

type TrainingResource = {
  id: number;
  title: string;
  type: string;
  fileUrl: string | null;
  linkUrl: string | null;
  createdAt: string;
  createdBy: { id: number; firstName: string; lastName: string };
};

type LessonType = {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  order: number;
};

type ModuleType = {
  id: number;
  title: string;
  description: string;
  order: number;
  lessons: LessonType[];
};

type TrainingType = {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  modules: ModuleType[];
};

export default function StudentTrainingViewPage() {
  const { id } = useParams<{ id: string }>();
  const [training, setTraining] = useState<TrainingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [resources, setResources] = useState<TrainingResource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTraining();
      fetchResources();
    }
  }, [id]);

  const fetchResources = async () => {
    if (!id) return;
    try {
      setLoadingResources(true);
      const { data } = await api.get(`/resources/training/${id}`);
      setResources(data);
    } catch (err: any) {
      // Silently fail - resources are optional
    } finally {
      setLoadingResources(false);
    }
  };

  const fetchTraining = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/trainings/${id}`);
      setTraining(data);
      if (data.modules?.length && data.modules[0].lessons?.length) {
        setActiveLessonId(data.modules[0].lessons[0].id);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load training';
      if (err.response?.status === 403) {
        setError(`🔒 ${message}`);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const flattenLessons = () => training ? training.modules.flatMap((m) => m.lessons) : [];
  const activeLesson = flattenLessons().find((l) => l.id === activeLessonId) || null;

  const markComplete = async (lessonId: number) => {
    setSaving(true);
    try {
      await api.post(`/progress/complete/${lessonId}`);
      setCompletedLessonIds((prev) => new Set(prev).add(lessonId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update progress');
    } finally {
      setSaving(false);
    }
  };

  const unmarkComplete = async (lessonId: number) => {
    setSaving(true);
    try {
      await api.patch(`/progress/complete/${lessonId}`);
      setCompletedLessonIds((prev) => {
        const next = new Set(prev);
        next.delete(lessonId);
        return next;
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update progress');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-12 w-12" /></div>;
  if (!training) return <p className="text-center text-red-500 mt-10">Training not found.</p>;

  const totalLessons = flattenLessons().length;
  const completedCount = flattenLessons().filter((l) => completedLessonIds.has(l.id)).length;
  const progressPercent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/dashboard" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 mb-2 inline-block">← Back to Dashboard</Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{training.title}</h1>
          <p className="text-slate-500 dark:text-slate-400">{training.description}</p>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 bg-slate-200 dark:bg-tech-border rounded-full">
          <div className="h-2 bg-green-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="text-xs text-slate-500">{progressPercent}% ({completedCount}/{totalLessons})</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Modules & Lessons</h2>
          <ul className="space-y-1">
            {training.modules.map((mod) => (
              <li key={mod.id}>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">{mod.title}</p>
                <ul className="space-y-1">
                  {mod.lessons.map((lesson) => {
                    const isActive = activeLessonId === lesson.id;
                    const isDone = completedLessonIds.has(lesson.id);
                    return (
                      <li key={lesson.id}>
                        <button
                          onClick={() => setActiveLessonId(lesson.id)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-tech-border'}`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-full border ${isDone ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-600'}`} />
                            {lesson.title}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          {activeLesson ? (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{activeLesson.title}</h3>
              {activeLesson.imageUrl && <img src={activeLesson.imageUrl} alt={activeLesson.title} className="rounded-md mb-4 max-h-[400px] w-full object-cover" />}
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{activeLesson.content}</p>
              <div className="flex gap-3 mt-6">
                {!completedLessonIds.has(activeLesson.id) ? (
                  <Button onClick={() => markComplete(activeLesson.id)} isLoading={saving}>Mark as complete</Button>
                ) : (
                  <Button variant="secondary" onClick={() => unmarkComplete(activeLesson.id)} isLoading={saving}>Unmark</Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-slate-500">Select a lesson to start learning.</p>
          )}
        </Card>

        {/* Training Resources */}
        <Card className="lg:col-span-3 p-6">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Training Resources</h2>
          {loadingResources ? (
            <div className="flex justify-center py-4"><Spinner className="h-6 w-6" /></div>
          ) : resources.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No additional resources for this training.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {resources.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-tech-border rounded-md">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">{resource.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {resource.fileUrl ? '📄 File' : '🔗 Link'} · Added by {resource.createdBy.firstName} {resource.createdBy.lastName}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {resource.fileUrl && (
                      <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="secondary">Download</Button>
                      </a>
                    )}
                    {resource.linkUrl && (
                      <a href={resource.linkUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="secondary">Open</Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
