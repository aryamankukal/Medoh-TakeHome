'use client';
import React from 'react';
import { useParams } from 'next/navigation';

const doctorProfiles: Record<string, { name: string; bio: string }> = {
  'dr-tracey-didinger': {
    name: 'Dr Tracey Didinger',
    bio: 'Orthopedic Surgeon specializing in rotator cuff tears and shoulder injuries. Passionate about patient education and clear communication.'
  },
  'dr-jane-doe': {
    name: 'Dr Jane Doe',
    bio: 'Board-certified Family Medicine physician with a focus on holistic patient care and preventive medicine. Dedicated to empowering patients with knowledge and compassion.'
  },
  // Add more mock doctors here if needed
};

export default function DoctorProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const profile = doctorProfiles[id] || {
    name: 'Unknown Doctor',
    bio: 'No profile information available.'
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg border border-orange-200 bg-white">
        <h1 className="text-2xl font-bold text-orange-500 mb-2 text-center">{profile.name}</h1>
        <p className="text-gray-700 text-center mb-4">{profile.bio}</p>
        <div className="flex justify-center">
          <span className="inline-block bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold">Medoh Verified</span>
        </div>
      </div>
    </div>
  );
} 