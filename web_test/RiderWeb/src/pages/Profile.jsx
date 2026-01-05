import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import BentoProfile from '../components/BentoProfile';
import { Clock, Star, ShieldCheck, Edit2, Save, X, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { toast } from 'sonner';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '' // Usually read-only but let's see
  });

  // Initialize form when entering edit mode, or on mount if we wanted
  const handleEditClick = () => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateUser({
        name: formData.name,
        phone: formData.phone
        // Email usually not editable directly without verification
      });

      if (res.success) {
        // toast.success("Profile updated!");
        alert("Profile updated!");
        setIsEditing(false);
      } else {
        alert(res.error || "Update failed");
      }
    } catch (error) {
      console.error("Update error", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8 text-center text-slate-500">Please log in</div>;

  // Uber-style Profile Design
  const menuItems = [
    { icon: ShieldCheck, label: "Safety Checkup", desc: "Manage trusted contacts" },
    { icon: CreditCard, label: "Payment", desc: "Visa ••4242" },
    { icon: Clock, label: "Trips", desc: "Past and upcoming rides" },
  ];

  return (
    <div className="bg-white min-h-screen pb-10 relative">
      {/* Header Section */}
      <div className="bg-white p-6 pt-10 flex flex-col items-center border-b border-slate-100">
        <div className="relative mb-4">
          <div className="h-24 w-24 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-500 shadow-md">
            {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : (user.name?.charAt(0) || "U")}
          </div>
          {!isEditing && (
            <button onClick={handleEditClick} className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full shadow hover:bg-slate-700 transition">
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
        <div className="flex items-center gap-1 mt-1 bg-slate-100 px-3 py-1 rounded-full text-sm font-medium text-slate-700">
          <Star className="w-4 h-4 fill-slate-900 text-slate-900" /> 4.8 Rating
        </div>
      </div>

      {/* Main Content */}
      {!isEditing ? (
        <div className="max-w-xl mx-auto mt-4 px-4 space-y-2">
          {/* Menu Items */}
          <div className="grid gap-3">
            {menuItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-100">
                <div className="p-3 bg-slate-100 rounded-full text-slate-900">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{item.label}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links List */}
          <div className="border-t border-slate-100 my-4 pt-4">
            <div className="space-y-1 px-1">
              {["Messages", "Send a Gift", "Settings", "Legal"].map((link) => (
                <div key={link} className="flex justify-between items-center py-3 px-3 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors">
                  <span className="text-slate-700 font-medium text-lg">{link}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Edit Form (Minimalist)
        <div className="max-w-xl mx-auto mt-4 px-6">
          <div className="flex items-center gap-4 mb-8 pt-4 cursor-pointer text-slate-500 hover:text-slate-900 transition-colors" onClick={handleCancel}>
            <X className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900">Edit Account</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <Label className="text-slate-500 uppercase text-xs font-semibold tracking-wider">Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-x-0 border-t-0 border-b-2 border-slate-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black text-xl font-medium placeholder:text-slate-300"
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-500 uppercase text-xs font-semibold tracking-wider">Phone Number</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-x-0 border-t-0 border-b-2 border-slate-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black text-xl font-medium placeholder:text-slate-300"
                  placeholder="Enter phone"
                />
              </div>
              <div className="space-y-1 opacity-60">
                <Label className="text-slate-500 uppercase text-xs font-semibold tracking-wider">Email</Label>
                <div className="py-2 border-b-2 border-slate-200 text-xl font-medium text-slate-700">
                  {formData.email}
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white h-14 text-lg font-bold rounded-lg mt-8 shadow-xl shadow-slate-200">
              {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : "Save Changes"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
