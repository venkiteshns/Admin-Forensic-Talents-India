import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserCheck } from 'lucide-react';
import api from '../utils/api';
import Modal, { ConfirmModal } from '../components/Modal';
import Toast from '../components/Toast';
import { useToast } from '../components/useToast';
import FormField, { inputClass, selectClass } from '../components/FormField';

const EMPTY = { type: 'Online', duration: '', price: '', description: '', benefits: '', isActive: true };

export default function Internships() {
  const [internships, setInternships]   = useState([]);
  const [isFormOpen, setIsFormOpen]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editing, setEditing]           = useState(null);
  const [form, setForm]                 = useState(EMPTY);
  const [saving, setSaving]             = useState(false);
  const { toasts, toast, removeToast }  = useToast();

  useEffect(() => { fetchInternships(); }, []);

  const fetchInternships = async () => {
    try { setInternships((await api.get('/internships')).data); }
    catch { toast({ message: 'Failed to load internships', type: 'error' }); }
  };

  const openAdd = () => { setEditing(null); setForm(EMPTY); setIsFormOpen(true); };
  const openEdit = (i) => {
    setEditing(i);
    setForm({ type: i.type, duration: i.duration, price: i.price, description: i.description, benefits: i.benefits.join(', '), isActive: i.isActive });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, benefits: form.benefits.split(',').map(b => b.trim()), price: Number(form.price) };
    try {
      if (editing) { await api.put(`/internships/${editing._id}`, payload); toast({ message: 'Internship updated' }); }
      else         { await api.post('/internships', payload);               toast({ message: 'Internship added' }); }
      setIsFormOpen(false);
      fetchInternships();
    } catch { toast({ message: 'Failed to save', type: 'error' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/internships/${deleteTarget._id}`);
      toast({ message: 'Internship deleted' });
      setDeleteTarget(null);
      fetchInternships();
    } catch { toast({ message: 'Failed to delete', type: 'error' }); }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-700/20">
            <UserCheck className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Internships</h1>
            <p className="text-xs text-slate-500">{internships.length} plan{internships.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow transition-colors hover:bg-indigo-600">
          <Plus className="h-4 w-4" /> Add Internship
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#1e293b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/40">
                {['Type', 'Duration', 'Price', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {internships.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">No internship plans yet.</td></tr>
              ) : internships.map(i => (
                <tr key={i._id} className="transition-colors hover:bg-slate-700/20">
                  <td className="px-5 py-4 font-medium text-slate-100">{i.type}</td>
                  <td className="px-5 py-4 text-slate-400">{i.duration}</td>
                  <td className="px-5 py-4 font-medium text-slate-200">₹{i.price.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${i.isActive ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {i.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(i)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 text-slate-300 transition-colors hover:bg-slate-600 hover:text-white">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(i)} title="Delete" className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-900/30 text-red-400 transition-colors hover:bg-red-900/60 hover:text-red-300">
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

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editing ? 'Edit Internship' : 'Add Internship'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Type">
            <select className={selectClass} value={form.type} onChange={set('type')}>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Duration">
              <input required type="text" className={inputClass} placeholder="e.g. 2 months" value={form.duration} onChange={set('duration')} />
            </FormField>
            <FormField label="Price (₹)">
              <input required type="number" className={inputClass} placeholder="0" value={form.price} onChange={set('price')} />
            </FormField>
          </div>
          <FormField label="Description">
            <textarea required rows={3} className={inputClass} value={form.description} onChange={set('description')} />
          </FormField>
          <FormField label="Benefits" hint="Comma-separated">
            <textarea required rows={3} className={inputClass} placeholder="Benefit 1, Benefit 2, …" value={form.benefits} onChange={set('benefits')} />
          </FormField>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" className="h-4 w-4 accent-indigo-500" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
            <span className="text-sm font-medium text-slate-300">Mark as Active</span>
          </label>
          <div className="flex justify-end gap-3 border-t border-slate-700 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-indigo-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:opacity-50">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Internship'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Internship" message={`Delete the "${deleteTarget?.type}" internship plan? This cannot be undone.`} />
    </div>
  );
}
