import React from 'react';
import { useAuth } from '../hooks/useAuth';
import BentoProfile from '../components/BentoProfile';
import { Clock, Star, ShieldCheck, CreditCard } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <div className="p-8 text-center text-slate-500">Please log in</div>;

  // Transform/Mock data for the Bento Profile (Rider Context)
  const bentoData = {
    name: user.name,
    role: "Premium Rider",
    location: "Ho Chi Minh City, VN",
    status: "Verified",
    avatar: user.avatar,
    initials: user.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2) : "RD",
    isOnline: true,
    stats: [
      { icon: Clock, label: "Total Rides", value: "42", trend: "Silver Tier", trendUp: true },
      { icon: Star, label: "Avg Rating", value: "4.8", trend: "High", trendUp: true },
      { icon: ShieldCheck, label: "Member Since", value: "2023", trend: null },
    ],
    skills: [
      "Gold Member",
      "Visa ••4242",
      "Preferred: Quiet Ride",
      "Verified ID"
    ],
    socials: {
      twitter: "#"
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-10">
      <BentoProfile userData={bentoData} />
    </div>
  );
}
