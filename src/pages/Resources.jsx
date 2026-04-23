import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderOpen, FileText, Image, Video, ExternalLink } from 'lucide-react';
import api from '../utils/api';
import Modal, { ConfirmModal } from '../components/Modal';
import Toast from '../components/Toast';
import { useToast } from '../components/useToast';
import FormField, { inputClass, selectClass } from '../components/FormField';

const EMPTY = { title: '', type: 'pdf', fileUrl: '', description: '' };

const TYPE_CFG = {
  pdf:     { label: 'PDF',     Icon: FileText, color: 'text-red-400',   bg: 'bg-red-900/20',   border: 'border-red-700/30'  },
  image:   { label: 'Image',   Icon: Image,    color: 'text-blue-400',  bg: 'bg-blue-900/20',  border: 'border-blue-700/30' },
  youtube: { label: 'YouTube', Icon: Video,    color: 'text-rose-400',  bg: 'bg-rose-900/20',  border: 'border-rose-700/30' },
};

const URL_LABEL = { pdf: 'PDF URL', image: 'Image URL', youtube: 'YouTube URL' };
const URL_PLACEHOLDER = { pdf: 'https://example.com/document.pdf', image: 'https://example.com/image.jpg', youtube: 'https://youtube.com/watch?v=…' };

export default function Resources() {
  const [resources, setResources]       = useState([]);
  const [isFormOpen, setIsFormOpen]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editing, setEditing]           = useState(null);
  const [form, setForm]                 = useState(EMPTY);
  const [saving, setSaving]             = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { toasts, toast, removeToast }  = useToast();

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    try { setResources((await api.get('/resources')).data); }
    catch { toast({ message: 'Failed to load resources', type: 'error' }); }
  };

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setSelectedFile(null); setIsFormOpen(true); };
  const openEdit = (r) => { setEditing(r); setForm({ title: r.title, type: r.type, fileUrl: r.fileUrl, description: r.description || '' }); setSelectedFile(null); setIsFormOpen(true); };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const getYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.type === 'youtube') {
      if (form.fileUrl.includes('<iframe') || form.fileUrl.includes('/embed/')) {
        toast({ message: 'Please enter a valid YouTube video link (not embed link)', type: 'error' });
        return;
      }
      if (!getYoutubeId(form.fileUrl)) {
        toast({ message: 'Invalid YouTube link format', type: 'error' });
        return;
      }
    }

    setSaving(true);
    try {
      let finalFileUrl = form.fileUrl;
      
      if (selectedFile && (form.type === 'pdf' || form.type === 'image')) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalFileUrl = uploadRes.data.url;
        setUploading(false);
      }

      const payload = { ...form, fileUrl: finalFileUrl };

      if (editing) { await api.put(`/resources/${editing._id}`, payload); toast({ message: 'Resource updated' }); }
      else         { await api.post('/resources', payload);               toast({ message: 'Resource added' }); }
      setIsFormOpen(false);
      fetchResources();
    } catch { 
      toast({ message: 'Failed to save resource', type: 'error' }); 
      setUploading(false);
    }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/resources/${deleteTarget._id}`);
      toast({ message: 'Resource deleted' });
      setDeleteTarget(null);
      fetchResources();
    } catch { toast({ message: 'Failed to delete', type: 'error' }); }
  };

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700/20">
            <FolderOpen className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Resources</h1>
            <p className="text-xs text-slate-500">{resources.length} resource{resources.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white shadow transition-colors hover:bg-amber-600">
          <Plus className="h-4 w-4" /> Add Resource
        </button>
      </div>

      {resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/50 bg-[#1e293b] p-14 text-center">
          <FolderOpen className="mb-3 h-12 w-12 text-slate-600" />
          <p className="text-sm text-slate-400">No resources yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map(r => {
            const cfg = TYPE_CFG[r.type] || TYPE_CFG.pdf;
            const { Icon } = cfg;
            return (
              <div key={r._id} className={`flex flex-col overflow-hidden rounded-2xl border ${cfg.border} bg-[#1e293b] transition-all duration-200 hover:border-slate-600 hover:shadow-lg hover:shadow-black/20`}>
                {/* Type header */}
                <div className={`flex items-center gap-3 px-5 py-3.5 ${cfg.bg}`}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 shadow-sm">
                    <Icon className={`h-5 w-5 ${cfg.color}`} />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-semibold text-slate-100 leading-snug">{r.title}</h3>
                  {r.description && <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">{r.description}</p>}
                  <a href={r.fileUrl} target="_blank" rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-200">
                    <ExternalLink className="h-3.5 w-3.5" />
                    {r.type === 'youtube' ? 'Watch Video' : r.type === 'image' ? 'View Image' : 'Open PDF'}
                  </a>
                </div>

                {/* Actions — always visible */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-700/50 px-5 py-3">
                  <button onClick={() => openEdit(r)} title="Edit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 text-slate-300 transition-colors hover:bg-slate-600 hover:text-white">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDeleteTarget(r)} title="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-900/30 text-red-400 transition-colors hover:bg-red-900/60 hover:text-red-300">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editing ? 'Edit Resource' : 'Add Resource'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title">
            <input required type="text" className={inputClass} placeholder="Resource title" value={form.title} onChange={set('title')} />
          </FormField>
          <FormField label="Resource Type">
            <select className={selectClass} value={form.type} onChange={set('type')}>
              <option value="pdf">PDF Document</option>
              <option value="image">Image</option>
              <option value="youtube">YouTube Video</option>
            </select>
          </FormField>
          {form.type === 'youtube' ? (
            <div className="space-y-3">
              <FormField label="YouTube URL" hint="Paste the full YouTube link (e.g. https://youtu.be/...)">
                <input required type="text" className={inputClass} placeholder="https://youtu.be/…" value={form.fileUrl} onChange={set('fileUrl')} />
              </FormField>
              {form.fileUrl && getYoutubeId(form.fileUrl) && (
                <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-inner">
                  <div className="relative pt-[56.25%] w-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYoutubeId(form.fileUrl)}`}
                      className="absolute inset-0 h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <FormField label={URL_LABEL[form.type]} hint={editing ? "Leave blank to keep existing file, or select a new one" : "Select a file to upload"}>
                <input 
                  type="file" 
                  required={!editing && !form.fileUrl}
                  accept={form.type === 'pdf' ? 'application/pdf' : 'image/*'}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-900/30 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-amber-400 hover:file:bg-amber-900/50 cursor-pointer" 
                />
              </FormField>
              
              {/* LIVE PREVIEW BLOCK */}
              {(selectedFile || form.fileUrl) && (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
                  
                  {form.type === 'image' ? (
                    <div className="flex justify-center">
                      <img 
                        src={selectedFile ? URL.createObjectURL(selectedFile) : form.fileUrl} 
                        alt="Preview" 
                        className="max-h-48 w-full rounded-lg object-cover shadow-md"
                      />
                    </div>
                  ) : form.type === 'pdf' ? (
                    <div className="flex items-center gap-4 rounded-lg bg-slate-900 p-4 shadow-inner border border-slate-700/50">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-900/20">
                        <FileText className="h-6 w-6 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-slate-200">
                          {selectedFile ? selectedFile.name : form.fileUrl.split('/').pop()}
                        </p>
                        <p className="text-xs text-slate-500">
                          {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'PDF Document'}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
          <FormField label="Description (optional)">
            <textarea rows={3} className={inputClass} placeholder="Short description…" value={form.description} onChange={set('description')} />
          </FormField>
          <div className="flex justify-end gap-3 border-t border-slate-700 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={saving || uploading} className="rounded-lg bg-amber-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50">
              {uploading ? 'Uploading…' : saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Resource'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Resource" message={`Delete "${deleteTarget?.title}"? This cannot be undone.`} />
    </div>
  );
}
