import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';

type Module = {
  id: number;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
};

type Lesson = {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  order: number;
};

export default function ModuleLessonBuilder() {
  const { id } = useParams<{ id: string }>();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');

  const [newLesson, setNewLesson] = useState({ title: '', content: '', imageUrl: '' });

  useEffect(() => {
    if (id) fetchTraining();
  }, [id]);

  const fetchTraining = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/trainings/${id}`);
      setModules(data.modules || []);
      if (data.modules?.length) setActiveModuleId(data.modules[0].id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load training');
    } finally {
      setLoading(false);
    }
  };

  const activeModule = modules.find((m) => m.id === activeModuleId);

  const addModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/trainings/${id}/modules`, { title: newModuleTitle, description: newModuleDesc });
      setModules([...modules, data]);
      setActiveModuleId(data.id);
      setNewModuleTitle('');
      setNewModuleDesc('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add module');
    } finally {
      setSaving(false);
    }
  };

  const deleteModule = async (moduleId: number) => {
    if (!confirm('Delete this module and all its lessons?')) return;
    try {
      await api.delete(`/trainings/modules/${moduleId}`);
      setModules(modules.filter((m) => m.id !== moduleId));
      if (activeModuleId === moduleId) setActiveModuleId(modules.find((m) => m.id !== moduleId)?.id || null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete module');
    }
  };

  const saveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModuleId) return;
    setSaving(true);
    try {
      if (editingLesson) {
        const { data } = await api.patch(`/trainings/lessons/${editingLesson.id}`, newLesson);
        setModules(
          modules.map((m) => (m.id === activeModuleId ? { ...m, lessons: m.lessons.map((l) => (l.id === editingLesson.id ? data : l)) } : m)),
        );
        setEditingLesson(null);
      } else {
        const { data } = await api.post(`/trainings/modules/${activeModuleId}/lessons`, newLesson);
        setModules(
          modules.map((m) => (m.id === activeModuleId ? { ...m, lessons: [...m.lessons, data] } : m)),
        );
      }
      setNewLesson({ title: '', content: '', imageUrl: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (lessonId: number) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/trainings/lessons/${lessonId}`);
      setModules(
        modules.map((m) => (m.id === activeModuleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m)),
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete lesson');
    }
  };

  const startEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setNewLesson({ title: lesson.title, content: lesson.content, imageUrl: lesson.imageUrl || '' });
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner className="h-10 w-10" /></div>;

  return (
    <Card className="p-6 mt-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Modules & Lessons</h2>
      {error && <p className="text-red-500 mb-3">{error}</p>}

      <div className="grid md:grid-cols-3 gap-4">
        {/* Modules list */}
        <div className="md:col-span-1 space-y-2">
          {modules.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-md cursor-pointer border ${activeModuleId === m.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-tech-border'}`}
              onClick={() => {
                setActiveModuleId(m.id);
                setEditingLesson(null);
                setNewLesson({ title: '', content: '', imageUrl: '' });
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{m.title}</p>
                  <p className="text-xs text-slate-500">{m.lessons.length} lessons</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteModule(m.id);
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          <form onSubmit={addModule} className="p-3 border border-dashed border-slate-300 dark:border-tech-border rounded-md space-y-2">
            <Input
              label="Title"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              required
            />
            <Input
              label="Description"
              value={newModuleDesc}
              onChange={(e) => setNewModuleDesc(e.target.value)}
            />
            <Button type="submit" size="sm" isLoading={saving}>
              Add Module
            </Button>
          </form>
        </div>

        {/* Lessons list */}
        <div className="md:col-span-2">
          {activeModule ? (
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900 dark:text-white">{activeModule.title}</h3>
              <ul className="space-y-2">
                {activeModule.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-tech-border rounded-md">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{lesson.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{lesson.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditLesson(lesson)} className="text-xs text-primary-600 hover:text-primary-700">
                        Edit
                      </button>
                      <button onClick={() => deleteLesson(lesson.id)} className="text-xs text-red-500 hover:text-red-700">
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
                {activeModule.lessons.length === 0 && <p className="text-sm text-slate-500">No lessons yet.</p>}
              </ul>

              <form onSubmit={saveLesson} className="p-4 border border-slate-200 dark:border-tech-border rounded-md space-y-3">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white">{editingLesson ? 'Edit Lesson' : 'Add Lesson'}</h4>
                <Input
                  label="Title"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                  <textarea
                    className="w-full rounded-md border border-slate-300 dark:border-tech-border bg-transparent p-2 text-slate-900 dark:text-white"
                    rows={3}
                    value={newLesson.content}
                    onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Image URL (optional)"
                  value={newLesson.imageUrl}
                  onChange={(e) => setNewLesson({ ...newLesson, imageUrl: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" isLoading={saving}>
                    {editingLesson ? 'Update Lesson' : 'Add Lesson'}
                  </Button>
                  {editingLesson && (
                    <Button variant="secondary" size="sm" type="button" onClick={() => { setEditingLesson(null); setNewLesson({ title: '', content: '', imageUrl: '' }); }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select a module or create a new one to manage lessons.</p>
          )}
        </div>
      </div>
    </Card>
  );
}