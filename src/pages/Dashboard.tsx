import axios from 'axios'
import { useEffect, useState } from 'react'

type Note = { _id: string; title: string; content: string }

export default function Dashboard({ user, onLogout }:{ user:any, onLogout: ()=>void }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const res = await axios.get('/api/notes')
      setNotes(res.data.notes)
    } catch (e:any) {
      setError(e.response?.data?.message || 'Failed to load notes')
    }
  }

  useEffect(() => { load() }, [])

  const createNote = async () => {
    setError('')
    try {
      const res = await axios.post('/api/notes', { title, content })
      setNotes([res.data.note, ...notes])
      setTitle('')
      setContent('')
    } catch (e:any) {
      setError(e.response?.data?.message || 'Failed to create note')
    }
  }

  const deleteNote = async (id: string) => {
    setError('')
    try {
      await axios.delete(`/api/notes/${id}`)
      setNotes(notes.filter(n => n._id !== id))
    } catch (e:any) {
      setError(e.response?.data?.message || 'Failed to delete note')
    }
  }

  const logout = async () => {
    await axios.post('/api/auth/logout')
    onLogout()
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user?.avatar && <img src={user.avatar} className="w-10 h-10 rounded-full" />}
          <div>
            <p className="text-sm text-gray-500">Welcome</p>
            <h2 className="text-xl font-semibold">{user?.email}</h2>
          </div>
        </div>
        <button onClick={logout} className="rounded-xl border px-3 py-2">Logout</button>
      </header>

      <section className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h3 className="font-semibold">Create a note</h3>
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" className="w-full border rounded-xl p-2" />
        <textarea value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Write something..." className="w-full border rounded-xl p-2 h-28" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button onClick={createNote} className="rounded-xl bg-black text-white px-4 py-2">Add Note</button>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Your notes</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {notes.map(n => (
            <div key={n._id} className="bg-white rounded-2xl shadow p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{n.title}</h4>
                <button onClick={()=>deleteNote(n._id)} className="text-sm text-red-600">Delete</button>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{n.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
