import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return <div>Please log in</div>;

  return (
    <div className="flex justify-center w-full p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <Avatar className="mx-auto h-24 w-24 mb-4">
            <AvatarImage src={user.avatar} alt="User Avatar" />
            <AvatarFallback className="text-2xl">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{user.name}</CardTitle>
          <CardDescription>{user.role} Account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-sm border-b pb-4">
            <span className="font-semibold text-slate-500">Email</span>
            <span className="col-span-2">{user.email}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm border-b pb-4">
            <span className="font-semibold text-slate-500">Phone</span>
            <span className="col-span-2">{user.phone || "Not set"}</span>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <Button variant="outline" onClick={() => alert("Edit Profile Feature Coming Soon")}>
              Edit Profile
            </Button>
            <Button variant="destructive" onClick={logout}>
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
