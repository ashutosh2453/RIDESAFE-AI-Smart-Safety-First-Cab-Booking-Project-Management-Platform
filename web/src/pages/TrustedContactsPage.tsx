import React, { useState, useEffect } from 'react';
import { PhoneCall, Plus, Trash2, Edit2, Phone, UserCheck, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { TrustedContact, ContactRelationship } from '../types';
import { Modal } from '../components/Modal';

export const TrustedContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relationship, setRelationship] = useState<ContactRelationship>('PARENT');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/trusted-contacts');
      if (res.data.success) {
        setContacts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleOpenAdd = () => {
    setEditingContact(null);
    setName('');
    setPhoneNumber('');
    setRelationship('PARENT');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: TrustedContact) => {
    setEditingContact(c);
    setName(c.name);
    setPhoneNumber(c.phoneNumber);
    setRelationship(c.relationship);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phoneNumber.trim()) {
      setErrorMessage('Name and phone number are required.');
      return;
    }

    try {
      if (editingContact) {
        await api.put(`/trusted-contacts/${editingContact.id}`, {
          name,
          phoneNumber,
          relationship,
        });
      } else {
        await api.post('/trusted-contacts', {
          name,
          phoneNumber,
          relationship,
        });
      }
      setIsModalOpen(false);
      fetchContacts();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to save contact.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this trusted contact?')) return;
    try {
      await api.delete(`/trusted-contacts/${id}`);
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-black tracking-widest uppercase text-emerald-400">
            EMERGENCY SAFETY GUARDIANS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Trusted Contacts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Designate emergency contacts who receive automatic SOS alerts and live trip notifications
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-4 py-2 text-xs shadow-lg shadow-cyan-400/20 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
          <PhoneCall className="h-10 w-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-bold text-white">No trusted contacts added</p>
          <p className="text-xs text-slate-500 mt-1">Add a parent or friend to enable instant SOS notification.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 hover:border-slate-700 transition flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  {c.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{c.name}</h3>
                    <span className="text-[10px] font-bold uppercase text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                      {c.relationship}
                    </span>
                  </div>
                  <p className="text-xs text-cyan-400 font-mono mt-0.5">{c.phoneNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${c.phoneNumber}`}
                  className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition"
                  title="Direct Call"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:bg-rose-950 hover:text-rose-400 transition"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContact ? 'Edit Trusted Contact' : 'Add Trusted Contact'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 uppercase font-semibold mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Sharma"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 uppercase font-semibold mb-1">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 98765 11111"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 uppercase font-semibold mb-1">Relationship</label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value as ContactRelationship)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="PARENT">Parent</option>
              <option value="FRIEND">Friend</option>
              <option value="SIBLING">Sibling</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold px-5 py-2 shadow-lg shadow-cyan-400/20"
            >
              {editingContact ? 'Update Contact' : 'Save Contact'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
