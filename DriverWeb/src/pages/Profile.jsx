import React from 'react';
import { useAuth } from '../hooks/useAuth';
import BentoProfile from '../components/BentoProfile';
import { Car, Star, TrendingUp, Award } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <div className="p-8 text-center text-slate-500">Please log in</div>;

  // Transform/Mock data for the Bento Profile
  const bentoData = {
    name: user.name,
    role: user.role || "Professional Driver",
    location: user.location || "Ho Chi Minh City, VN",
    status: user.status || "Available",
    avatar: user.avatar,
    initials: user.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2) : "DR",
    isOnline: user.status === 'Active' || user.status === 'Available',
    stats: [
      { icon: Car, label: "Total Trips", value: user.totalTrips || "1,248", trend: "+12%", trendUp: true },
      { icon: Star, label: "Rating", value: user.rating || "4.9", trend: "Top 5%", trendUp: true },
      { icon: Award, label: "Years Exp.", value: "3.5", trend: null },
    ],
    skills: [
      "Sedan 4-Seater",
      "Air Conditioning",
      "Free WiFi",
      "Child Seat",
      "English Speaker",
      "Safe Driver Certified"
    ],
    socials: {
      twitter: "#",
      linkedin: "#"
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-10">
      <BentoProfile userData={bentoData} />
    </div>
  );
}
