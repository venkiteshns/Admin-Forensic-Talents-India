import { useState, useEffect } from 'react';
import { Edit2, Eye, EyeOff, HelpCircle, Plus } from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { useToast } from '../components/useToast';
import FormField, { inputClass } from '../components/FormField';

export default function Quizzes() {
  const [quiz, setQuiz]                = useState(null);
  const [isFormOpen, setIsFormOpen]    = useState(false);
  const [form, setForm]                = useState({ title: '', description: '', date: '', formLink: '', isVisible: false });
  const [saving, setSaving]            = useState(false);
  const [toggling, setToggling]        = useState(false);
  const { toasts, toast, removeToast } = useToast();

  useEffect(() => { fetchQuiz(); }, []);

  const fetchQuiz = async () => {
    try { setQuiz((await api.get('/quiz/latest')).data); }
    catch (err) { if (err.response?.status !== 404) toast({ message: 'Failed to load quiz', type: 'error' }); }
  };

  const openModal = () => {
    setForm(quiz
      ? { title: quiz.title, description: quiz.description, date: new Date(quiz.date).toISOString().split('T')[0], formLink: quiz.formLink, isVisible: quiz.isVisible }
      : { title: '', description: '', date: '', formLink: '', isVisible: false }
    );
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (quiz?._id) { await api.put(`/quiz/${quiz._id}`, form); toast({ message: 'Quiz updated' }); }
      else           { await api.post('/quiz', form);             toast({ message: 'Quiz created' }); }
      setIsFormOpen(false);
      fetchQuiz();
    } catch { toast({ message: 'Failed to save quiz', type: 'error' }); }
    finally { setSaving(false); }
  };

  const handleToggle = async () => {
    if (!quiz) return;
    setToggling(true);
    try {
      await api.put(`/quiz/${quiz._id}/toggle`);
      toast({ message: quiz.isVisible ? 'Quiz hidden' : 'Quiz published' });
      fetchQuiz();
    } catch { toast({ message: 'Toggle failed', type: 'error' }); }
    finally { setToggling(false); }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-700/20">
            <HelpCircle className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Monthly Quiz</h1>
            <p className="text-xs text-slate-500">Manage the quiz displayed to users</p>
          </div>
        </div>
        <button onClick={openModal} className="flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow transition-colors hover:bg-violet-600">
          {quiz ? <><Edit2 className="h-4 w-4" /> Edit Quiz</> : <><Plus className="h-4 w-4" /> Create Quiz</>}
        </button>
      </div>

      <div className="max-w-2xl">
        {!quiz ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/50 bg-[#1e293b] p-12 text-center">
            <HelpCircle className="mb-3 h-12 w-12 text-slate-600" />
            <p className="mb-4 text-sm text-slate-400">No quiz configured yet.</p>
            <button onClick={openModal} className="rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-600">
              Create First Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-5 rounded-2xl border border-slate-700/50 bg-[#1e293b] p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100">{quiz.title}</h2>
              <p className="mt-1 text-sm text-slate-400">{quiz.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-lg bg-slate-700/50 px-3 py-1.5 text-sm font-medium text-slate-300">
                📅 {new Date(quiz.date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
              </span>
              <a href={quiz.formLink} target="_blank" rel="noreferrer" className="rounded-lg bg-blue-900/30 px-3 py-1.5 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-900/50">
                🔗 View Form
              </a>
            </div>
            <div className="border-t border-slate-700/50 pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Visibility</p>
              <div className="flex flex-wrap items-center gap-4">
                <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${quiz.isVisible ? 'border-emerald-700/40 bg-emerald-900/20 text-emerald-400' : 'border-slate-700 bg-slate-800 text-slate-400'}`}>
                  {quiz.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {quiz.isVisible ? 'Visible to users' : 'Hidden from users'}
                </div>
                <button onClick={handleToggle} disabled={toggling}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${quiz.isVisible ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-700 hover:bg-emerald-600'}`}>
                  {toggling ? 'Updating…' : quiz.isVisible ? 'Hide Quiz' : 'Publish Quiz'}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">When hidden, the website shows a "Previous quiz was conducted" message.</p>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={quiz ? 'Edit Quiz' : 'Create Quiz'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title">
            <input required type="text" className={inputClass} placeholder="e.g. Forensics Monthly Quiz" value={form.title} onChange={set('title')} />
          </FormField>
          <FormField label="Description">
            <textarea required rows={3} className={inputClass} value={form.description} onChange={set('description')} />
          </FormField>
          <FormField label="Quiz Date">
            <input required type="date" className={inputClass} value={form.date} onChange={set('date')} />
          </FormField>
          <FormField label="Google Form Link">
            <input required type="url" className={inputClass} placeholder="https://forms.gle/…" value={form.formLink} onChange={set('formLink')} />
          </FormField>
          {!quiz && (
            <label className="flex cursor-pointer items-center gap-2.5">
              <input type="checkbox" className="h-4 w-4 accent-violet-500" checked={form.isVisible} onChange={e => setForm(f => ({ ...f, isVisible: e.target.checked }))} />
              <span className="text-sm font-medium text-slate-300">Publish immediately</span>
            </label>
          )}
          <div className="flex justify-end gap-3 border-t border-slate-700 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-violet-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-600 disabled:opacity-50">
              {saving ? 'Saving…' : quiz ? 'Save Changes' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
