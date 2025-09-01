import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import logo from '../assets/fav.png';

type Note = { _id: string; title: string; content: string };

export default function Dashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    try {
      const res = await axios.get('/api/notes');
      setNotes(res.data.notes);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load notes');
    }
  };

  useEffect(() => { load(); }, []);

  const createNote = async () => {
    setError('');
    try {
      const res = await axios.post('/api/notes', { title, content });
      setNotes([res.data.note, ...notes]);
      setTitle('');
      setContent('');
      setModalOpen(false);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create note');
    }
  };

  const deleteNote = async (id: string) => {
    setError('');
    try {
      await axios.delete(`/api/notes/${id}`);
      setNotes(notes.filter((n) => n._id !== id));
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to delete note');
    }
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    localStorage.removeItem('user');
    onLogout();
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <img src={logo} alt="logo" />
          <h1 className="text-lg md:text-2xl font-bold">Dashboard</h1>
        </div>
        <button onClick={logout} className="rounded-xl hidden md:block border px-3 py-2 hover:bg-gray-100">Sign Out</button>
        <a onClick={logout} className="text-[#367AFF] underline md:hidden">Sign Out</a>
      </header>

      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-col w-full max-w-md mx-auto border border-[#D9D9D9] px-3 py-5 shadow-md rounded-lg">
          <p className="text-xl font-semibold mb-2 text-[#232323]">Welcome, {user?.name || 'Guest User'}!</p>
          <h2 className="text-sm text-[#232323]">Email: {user?.email || 'Guest User'}</h2>
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={() => setModalOpen(true)} className="rounded-xl bg-blue-500 w-full text-white px-4 py-2 hover:bg-blue-600 transition">
          Create Note
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={() => setModalOpen(false)}>✕</button>
            <h3 className="font-semibold text-lg mb-3">Create a Note</h3>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border rounded-xl p-2 mb-3" />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write something..." className="w-full border rounded-xl p-2 h-28 mb-3" />
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <button onClick={createNote} className="w-full rounded-xl bg-black text-white px-4 py-2 hover:bg-gray-800">Add Note</button>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <h3 className="font-semibold text-lg text-[#232323]">Notes</h3>
        <div className="grid gap-3 grid-cols-1">
          {notes.map((n) => (
            <div key={n._id} className="bg-white rounded-2xl shadow p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{n.title}</h4>
                <button onClick={() => deleteNote(n._id)} className="text-lg hover:text-red-600">
                  <FaRegTrashAlt />
                </button>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{n.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
