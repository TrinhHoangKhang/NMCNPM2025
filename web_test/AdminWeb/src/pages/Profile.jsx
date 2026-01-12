
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

function Profile() {
  const {user} = useAuth()
  return (
    <div className="flex justify-center items-center w-full min-h-[calc(100vh-6rem)] bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg p-8 shadow-xl rounded-lg bg-white">
        <CardHeader className="text-center">
          <Avatar className="mx-auto h-24 w-24 mb-4 border-4 border-blue-400 shadow-md">
            <AvatarImage src="" alt="User Avatar" />
            <AvatarFallback className="bg-blue-500 text-white text-4xl font-semibold">
              {user?.username?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-4xl font-extrabold text-gray-800">Your Profile</CardTitle>
          <CardDescription className="text-gray-600 text-lg mt-2">Manage your account details and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (<>
            <p className="text-xl text-gray-700"><span className="font-bold text-gray-800">Username:</span> {user.username}</p>
            <p className="text-xl text-gray-700"><span className="font-bold text-gray-800">Full name:</span> {user.name}</p>
            <p className="text-xl text-gray-700"><span className="font-bold text-gray-800">Email:</span> {user.email}</p>
          </>
          ) : (
            <p className="text-red-500 text-center">Please log in to view your profile.</p>
          )}
        <div className="flex justify-between mt-20">
          <Button variant="outline">Change Username</Button>
          <Button variant="outline">Change Password</Button>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default Profile;
