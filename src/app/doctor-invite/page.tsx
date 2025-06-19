import React, { useState } from 'react';
import Link from 'next/link';

const DOCTOR_ID = 'dr-tracey-didinger'; // Mock doctor ID
const DOCTOR_NAME = 'Dr Tracey Didinger';

export default function DoctorInvitePage() {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [sms, setSms] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profileUrl = `http://localhost:3000/doctor-profile/${DOCTOR_ID}`;
    const smsText = `Hi! ${DOCTOR_NAME} has invited you to view their Medoh profile: ${profileUrl}`;
    setSms(smsText);
    setSent(true);
    // Print SMS to terminal (mock)
    if (typeof window !== 'undefined') {
      fetch('/api/mock-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, smsText }),
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg border border-orange-200 bg-white">
        <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">Invite Patient to Profile</h1>
        <p className="mb-6 text-gray-700 text-center">Enter your patient's phone number to send them your Medoh profile link.</p>
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="tel"
              required
              pattern="[0-9]{10,15}"
              placeholder="Patient's phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded transition"
            >
              Send Invite
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="text-green-600 font-semibold mb-2">Invite sent!</div>
            <div className="text-gray-700 mb-4">A link to your profile was sent to <span className="font-mono">{phone}</span>.</div>
            <Link href={`/doctor-profile/${DOCTOR_ID}`} className="text-orange-500 underline">View your profile page</Link>
          </div>
        )}
      </div>
    </div>
  );
} 