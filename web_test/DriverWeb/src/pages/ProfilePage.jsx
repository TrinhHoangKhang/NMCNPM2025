import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const ProfilePage = () => {
  const {user} = useAuth()
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardHeader className="text-center">
          <Avatar className="mx-auto h-20 w-20 mb-4">
            <AvatarImage src="" alt="User Avatar" />
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
              {user?.username?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold">Profile Page</CardTitle>
          <CardDescription className="text-gray-600">View and manage your profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (<>
            <p className="text-lg"><span className="font-semibold">Username:</span> {user.username}</p>
            <p className="text-lg"><span className="font-semibold">Full name:</span> {user.name}</p>
            <p className="text-lg"><span className="font-semibold">Email:</span> {user.email}</p>
          </>
          ) : (
            <p className="text-red-500 text-center">Please log in to view your profile.</p>
          )}
        <div className="flex justify-between mt-4">
          <Button variant="outline">Change Username</Button>
          <Button variant="outline">Change Password</Button>
        </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfilePage;
