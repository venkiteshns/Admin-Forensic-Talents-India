import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import api from '../utils/api';
import Modal, { ConfirmModal } from '../components/Modal';
import Toast from '../components/Toast';
import { useToast } from '../components/useToast';
import FormField, { inputClass } from '../components/FormField';

const EMPTY = { title: '', category: 'General Forensics', duration: '', price: '', mode: 'Online', description: '', topics: '' };

export default function Courses() {
  const [courses, setCourses]           = useState([]);
  const [isFormOpen, setIsFormOpen]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editing, setEditing]           = useState(null);
  const [form, setForm]                 = useState(EMPTY);
  const [saving, setSaving]             = useState(false);
  const { toasts, toast, removeToast }  = useToast();

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try { setCourses((await api.get('/courses')).data); }
    catch { toast({ message: 'Failed to load courses', type: 'error' }); }
  };

  const openAdd = () => { setEditing(null); setForm(EMPTY); setIsFormOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ title: c.title, category: c.category || 'General Forensics', duration: c.duration, price: c.price, mode: c.mode.join(', '), description: c.description, topics: c.topics.join(', ') });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, mode: form.mode.split(',').map(m => m.trim()), topics: form.topics.split(',').map(t => t.trim()), price: Number(form.price) };
    try {
      if (editing) { await api.put(`/courses/${editing._id}`, payload); toast({ message: 'Course updated successfully' }); }
      else         { await api.post('/courses', payload);               toast({ message: 'Course added successfully' }); }
      setIsFormOpen(false);
      fetchCourses();
    } catch { toast({ message: 'Failed to save course', type: 'error' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/courses/${deleteTarget._id}`);
      toast({ message: 'Course deleted' });
      setDeleteTarget(null);
      fetchCourses();
    } catch { toast({ message: 'Failed to delete', type: 'error' }); }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700/20">
            <BookOpen className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Courses</h1>
            <p className="text-xs text-slate-500">{courses.length} course{courses.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow transition-colors hover:bg-blue-600">
          <Plus className="h-4 w-4" /> Add Course
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#1e293b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/40">
                {['Title', 'Category', 'Duration', 'Price', 'Mode', 'Actions'].map(h => (
                  <th key={h} className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {courses.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">No courses yet. Add your first one.</td></tr>
              ) : courses.map(c => (
                <tr key={c._id} className="transition-colors hover:bg-slate-700/20">
                  <td className="px-5 py-4 font-medium text-slate-100">{c.title}</td>
                  <td className="px-5 py-4 text-slate-400">{c.category}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-400">{c.duration}</td>
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-200">₹{c.price.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {c.mode.map(m => (
                        <span key={m} className="rounded-full bg-blue-900/40 px-2 py-0.5 text-xs font-medium text-blue-300">{m}</span>
                      ))}
                    </div>
                  </td>
                  {/* Always-visible action buttons */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        title="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 text-slate-300 transition-colors hover:bg-slate-600 hover:text-white"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        title="Delete"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-900/30 text-red-400 transition-colors hover:bg-red-900/60 hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editing ? 'Edit Course' : 'Add Course'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Title">
              <input required type="text" className={inputClass} placeholder="Course name" value={form.title} onChange={set('title')} />
            </FormField>
            <FormField label="Category">
              <input required type="text" className={inputClass} placeholder="e.g. General Forensics" value={form.category} onChange={set('category')} />
            </FormField>
            <FormField label="Duration">
              <input required type="text" className={inputClass} placeholder="e.g. 3 months" value={form.duration} onChange={set('duration')} />
            </FormField>
            <FormField label="Price (₹)">
              <input required type="number" className={inputClass} placeholder="0" value={form.price} onChange={set('price')} />
            </FormField>
          </div>
          <FormField label="Mode" hint="Comma-separated: Online, Offline">
            <input required type="text" className={inputClass} placeholder="Online, Offline" value={form.mode} onChange={set('mode')} />
          </FormField>
          <FormField label="Description">
            <textarea required rows={3} className={inputClass} placeholder="Short description…" value={form.description} onChange={set('description')} />
          </FormField>
          <FormField label="Topics" hint="Comma-separated list">
            <textarea required rows={3} className={inputClass} placeholder="Topic 1, Topic 2, …" value={form.topics} onChange={set('topics')} />
          </FormField>
          <div className="flex justify-end gap-3 border-t border-slate-700 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Course'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Course"
        message={`Delete "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
