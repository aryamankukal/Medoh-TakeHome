'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPhone, FiMail, FiCheckCircle, FiClock } from 'react-icons/fi';
import { supabase } from '@/utils/supabaseClient';
import Papa from 'papaparse';

function formatPhoneNumber(value: string) {
  // remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (!match) return value;
  let formatted = '';
  if (match[1]) {
    formatted = `(${match[1]}`;
  }
  if (match[2]) {
    formatted += match[2].length === 3 ? `) ${match[2]}` : match[2];
  }
  if (match[3]) {
    formatted += match[3] ? `-${match[3]}` : '';
  }
  return formatted;
}

function slugifyName(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function Modal({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="bg-white rounded-2xl shadow-xl w-full h-full p-10 relative border border-gray-200 animate-fade-in">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
        aria-label="Close"
      >
        ×
      </button>
      <div className="max-h-80 overflow-y-auto pr-2">
        {children}
      </div>
    </div>
  );
}

function generateRef() {
  return Math.random().toString(36).substring(2, 8);
}

function formatPhoneDisplay(phone: string) {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (!match) return phone;
  return `(${match[1]}) ${match[2]}-${match[3]}`;
}

export default function DoctorInvitePage() {
  const [doctorName, setDoctorName] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteHistory, setInviteHistory] = useState<{ doctor_id: string; phone: string; sent_at: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [csvResult, setCsvResult] = useState<string | null>(null);
  const [csvPhones, setCsvPhones] = useState<string[]>([]);
  const [csvSentCount, setCsvSentCount] = useState(0);

  const doctorId = slugifyName(doctorName) || 'doctor';

  // fetch invite history on mount (all invites, no filter)
  useEffect(() => {
    const fetchInvites = async () => {
      const { data, error } = await supabase
        .from('invites')
        .select('doctor_id, phone, sent_at')
        .order('sent_at', { ascending: false });
      if (!error && data) setInviteHistory(data);
    };
    fetchInvites();
  }, []);

  // load doctor name from localStorage on mount
  useEffect(() => {
    const savedDoctorName = typeof window !== 'undefined' ? localStorage.getItem('doctorName') : '';
    if (savedDoctorName) setDoctorName(savedDoctorName);
  }, []);

  // save doctor name to localStorage whenever it changes
  useEffect(() => {
    if (doctorName.trim().length > 0 && typeof window !== 'undefined') {
      localStorage.setItem('doctorName', doctorName);
    }
  }, [doctorName]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setPhone(formatPhoneNumber(input));
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: (results: Papa.ParseResult<any>) => {
        const rows = results.data as { phone?: string }[];
        const validPhones = rows
          .map(row => row.phone?.replace(/[^0-9]/g, ''))
          .filter(phone => phone && phone.length === 10) as string[];
        setCsvPhones(validPhones);
        setCsvResult(null);
      },
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let sentCount = 0;
    if (csvPhones.length > 0) {
      for (const phone of csvPhones) {
        const ref = generateRef();
        const profileUrl = `http://localhost:3000/visit/${doctorId}?ref=${ref}`;
        const smsText = `Hi! Dr ${doctorName} has invited you to view their Medoh profile: ${profileUrl}`;
        if (typeof window !== 'undefined') {
          await fetch('/api/mock-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, smsText }),
          });
        }
        await supabase.from('invites').insert([
          { doctor_id: doctorId, phone }
        ]);
        sentCount++;
      }
      setCsvResult(`Sent invites to ${sentCount} phone number${sentCount === 1 ? '' : 's'}.`);
      setCsvPhones([]);
      setCsvSentCount(sentCount); // track how many were sent
      setSent(true); // show confirmation
    } else {
      // single invite
      const ref = generateRef();
      const profileUrl = `http://localhost:3000/visit/${doctorId}?ref=${ref}`;
      const smsText = `Hi! Dr ${doctorName} has invited you to view their Medoh profile: ${profileUrl}`;
      if (typeof window !== 'undefined') {
        await fetch('/api/mock-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, smsText }),
        });
      }
      await supabase.from('invites').insert([
        { doctor_id: doctorId, phone }
      ]);
      setSent(true);
      setCsvSentCount(0); // reset csv count
    }
    // refresh invite history
    const { data } = await supabase
      .from('invites')
      .select('doctor_id, phone, sent_at')
      .order('sent_at', { ascending: false });
    if (data) setInviteHistory(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fff] flex flex-col">
      <header className="w-full mt-2 mb-8 sticky top-0 z-30">
        <nav className="w-full max-w-7xl flex items-center justify-between px-8 py-1 mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#fb8500]" style={{ fontFamily: 'inherit' }}>medoh</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="#" className="text-gray-700 font-medium hover:underline hover:underline-offset-4 transition">Contact Us</Link>
            <Link href="#" className="text-gray-700 font-medium hover:underline hover:underline-offset-4 transition">Log In</Link>
            <Link href="#" className="bg-[#fb8500] hover:bg-orange-500 text-white font-bold px-5 py-2 rounded-lg shadow transition" style={{ fontFamily: 'inherit' }}>Get Started</Link>
          </div>
        </nav>
      </header>
      <main className="flex flex-1 flex-col items-center justify-start pt-8 px-2 bg-[#f7f8fa] min-h-screen">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold mb-2" style={{ color: '#374151' }}>Doctor Invite Tool</h1>
          <p className="text-lg text-gray-500 font-medium">Send your profile to patients with a simple text message</p>
        </div>
        <div className="w-full max-w-2xl mx-auto relative mb-32">
          {!showHistory ? (
            <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center relative">
              <button
                className="absolute top-4 right-4 text-[#fb8500] hover:text-orange-500 transition cursor-pointer hover:scale-110 hover:shadow-lg bg-transparent focus:outline-none border-none p-0"
                style={{ fontSize: '2rem', width: '2rem', height: '2rem' }}
                onClick={() => setShowHistory(true)}
                type="button"
                aria-label="View Invite History"
              >
                <FiClock style={{ width: '2rem', height: '2rem' }} />
              </button>
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                <FiMail className="w-8 h-8 text-[#fb8500]" />
              </div>
              <h2 className="text-xl font-bold mb-1 text-center" style={{ color: '#374151' }}>Send Patient Invite</h2>
              <p className="text-gray-500 text-center mb-6">Enter the patient's phone number to send them your profile</p>
              {!sent ? (
                <form onSubmit={handleSend} className="w-full flex flex-col gap-4">
                  <label htmlFor="doctorName" className="text-sm font-medium mb-1 w-full" style={{ color: '#374151' }}>Doctor Name</label>
                  <div className="relative w-full mb-4">
                    <input
                      id="doctorName"
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={doctorName}
                      onChange={e => setDoctorName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 text-lg placeholder-gray-400 transition shadow-sm"
                      autoComplete="off"
                    />
                    {doctorName.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(doctorName.trim()) && (
                      <FiCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 w-6 h-6" />
                    )}
                  </div>
                  <label htmlFor="phone" className="text-sm font-medium mb-1" style={{ color: '#374151' }}>Patient Phone Number</label>
                  <div className="relative w-full">
                    <input
                      id="phone"
                      type="tel"
                      required={csvPhones.length === 0}
                      maxLength={14}
                      placeholder="Patient Phone Number"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 text-lg placeholder-gray-400 transition shadow-sm"
                      style={{ letterSpacing: '0.05em' }}
                      autoComplete="tel"
                    />
                    {phone.replace(/\D/g, '').length === 10 && (
                      <FiCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 w-6 h-6" />
                    )}
                  </div>
                  <div className="flex flex-col items-start w-full mb-2">
                    <label htmlFor="csv-upload" className="text-sm font-medium mb-1" style={{ color: '#374151' }}>Bulk Upload (CSV)</label>
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#fb8500] file:text-white hover:file:bg-orange-500 transition"
                    />
                    {csvResult && <div className="mt-2 text-green-600 text-sm">{csvResult}</div>}
                  </div>
                  <button
                    type="submit"
                    className={`w-full font-semibold py-2 rounded-lg transition shadow text-lg ${((csvPhones.length > 0 && doctorName.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(doctorName.trim())) || (phone.replace(/\D/g, '').length === 10 && doctorName.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(doctorName.trim()))) && !loading ? 'bg-[#fb8500] hover:bg-orange-500 text-white cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    disabled={((csvPhones.length > 0 && !(doctorName.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(doctorName.trim()))) || (csvPhones.length === 0 && (phone.replace(/\D/g, '').length !== 10 || !doctorName || loading)))}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2 text-white inline-block align-middle" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                        Sending...
                      </>
                    ) : csvPhones.length > 0 ? (
                      `Send Invites (${csvPhones.length})`
                    ) : (
                      'Send Invite'
                    )}
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-3 shadow w-full justify-center">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span className="font-bold">{csvSentCount > 0 ? 'Invites sent!' : 'Invite sent!'}</span>
                  </div>
                  <div className="text-gray-700 mb-4 text-center w-full">
                    {csvSentCount > 0
                      ? `A link to your profile was sent to ${csvSentCount} number${csvSentCount === 1 ? '' : 's'}.`
                      : <>A link to your profile was sent to <span className="font-mono">{phone}</span>.</>}
                  </div>
                  <button
                    className="mt-2 px-6 py-2 bg-[#fb8500] hover:bg-orange-500 text-white font-semibold rounded-lg shadow transition cursor-pointer"
                    onClick={() => {
                      setSent(false);
                      setPhone('');
                      setCsvPhones([]);
                      setCsvResult(null);
                      setCsvSentCount(0);
                    }}
                  >
                    Send more invites
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Modal open={showHistory} onClose={() => setShowHistory(false)}>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#374151' }}>Invite History</h3>
              {inviteHistory.length > 0 ? (
                <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  {inviteHistory.map((invite, idx) => (
                    <li key={idx} className="py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center text-gray-700">
                      <span className="font-mono">{formatPhoneDisplay(invite.phone)}</span>
                      <span className="text-xs text-gray-400">{invite.doctor_id}</span>
                      <span className="text-xs text-gray-400">{new Date(invite.sent_at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500">No invites sent yet.</div>
              )}
            </Modal>
          )}
        </div>
      </main>
    </div>
  );
}
