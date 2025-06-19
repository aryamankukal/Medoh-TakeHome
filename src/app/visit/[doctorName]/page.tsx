'use client';
import { useParams, useSearchParams } from 'next/navigation';
import React from 'react';

export default function VisitDoctorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const doctorName = params?.doctorName as string;
  const ref = searchParams.get('ref');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f8fa]">
      <div className="w-full max-w-xl bg-white p-10 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center mx-auto">
        <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
          <span className="text-3xl font-extrabold text-[#fb8500]">medoh</span>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-[#374151] text-center">Welcome to Dr {doctorName?.replace(/-/g, ' ')}'s Medoh Profile</h1>
        <p className="mb-4 text-gray-500 text-center">This is a unique invite link.</p>
        {ref && (
          <div className="mb-4 text-xs text-gray-400">Referral code: <span className="font-mono">{ref}</span></div>
        )}
        <div className="text-gray-700 text-center">Thank you for using Medoh. Here you can view the doctor's profile and get in touch for more information.</div>
      </div>
    </div>
  );
} 