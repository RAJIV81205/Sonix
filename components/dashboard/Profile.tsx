"use client"

import React, { useState, useEffect } from 'react'
import { User, Mail, UserCircle, Edit2, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface UserData {
  id: number;
  name: string;
  username: string;
  email: string;
  createdAt: string;
}

const Profile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<UserData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login to view your profile');
          return;
        }

        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data.user);
        setEditedData(data.user);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedData(userData || {});
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to update your profile');
        return;
      }

      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setUserData(data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-zinc-900 rounded-2xl p-8 shadow-xl">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
              <p className="text-zinc-400 mt-1">Manage your account settings and preferences</p>
            </div>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-700 text-white rounded-xl hover:bg-zinc-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Picture and Basic Info */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-800 rounded-xl p-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-zinc-700 flex items-center justify-center mb-4">
                    <User className="w-16 h-16 text-zinc-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white text-center">{userData.name}</h2>
                  <p className="text-zinc-400 text-center">@{userData.username}</p>
                  <div className="mt-4 text-center">
                    <p className="text-zinc-400 text-sm">Member since</p>
                    <p className="text-white">{new Date(userData.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Detailed Information */}
            <div className="lg:col-span-2">
              <div className="bg-zinc-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Account Information</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-400">Full Name</label>
                    {isEditing ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserCircle className="h-5 w-5 text-zinc-500" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={editedData.name || ''}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                    ) : (
                      <p className="text-white text-lg">{userData.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-400">Username</label>
                    {isEditing ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-zinc-500" />
                        </div>
                        <input
                          type="text"
                          name="username"
                          value={editedData.username || ''}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                    ) : (
                      <p className="text-white text-lg">@{userData.username}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-400">Email Address</label>
                    {isEditing ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-zinc-500" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={editedData.email || ''}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                    ) : (
                      <p className="text-white text-lg">{userData.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile