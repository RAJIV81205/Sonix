"use client"

import React, { useState, useEffect } from 'react'
import { User, Mail, UserCircle, Edit2, Save, X, Camera } from 'lucide-react'
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
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="bg-zinc-900 rounded-xl p-6 max-w-md mx-auto shadow-xl">
          <p className="text-red-500 text-center">Failed to load profile data</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-20 md:p-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="bg-zinc-900 rounded-2xl p-4 md:p-8 shadow-xl">
          {/* Header Section - Responsive */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Profile Settings</h1>
              <p className="text-zinc-400 mt-1 text-sm md:text-base">Manage your account settings and preferences</p>
            </div>
            
            <div className="w-full sm:w-auto">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors w-full sm:w-auto"
                >
                  <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleSave}
                    className="flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex-1 sm:flex-initial"
                  >
                    <Save className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden xs:inline">Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-zinc-700 text-white rounded-xl hover:bg-zinc-600 transition-colors flex-1 sm:flex-initial"
                  >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden xs:inline">Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content - Responsive Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {/* Profile Picture and Basic Info */}
            <div className="md:col-span-1">
              <div className="bg-zinc-800 rounded-xl p-4 md:p-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-zinc-700 flex items-center justify-center mb-4 group">
                    <User className="w-12 h-12 md:w-16 md:h-16 text-zinc-400" />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold text-white text-center">{userData.name}</h2>
                  <p className="text-zinc-400 text-center text-sm md:text-base">@{userData.username}</p>
                  <div className="mt-4 text-center">
                    <p className="text-zinc-400 text-xs md:text-sm">Member since</p>
                    <p className="text-white text-sm md:text-base">{new Date(userData.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="md:col-span-2">
              <div className="bg-zinc-800 rounded-xl p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Account Information</h3>
                <div className="space-y-4 md:space-y-6">
                  {/* Full Name */}
                  <div className="space-y-1 md:space-y-2">
                    <label className="block text-xs md:text-sm font-medium text-zinc-400">Full Name</label>
                    {isEditing ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserCircle className="h-4 w-4 md:h-5 md:w-5 text-zinc-500" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={editedData.name || ''}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 md:py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <UserCircle className="h-4 w-4 md:h-5 md:w-5 text-zinc-500 mr-3" />
                        <p className="text-white text-sm md:text-lg">{userData.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <div className="space-y-1 md:space-y-2">
                    <label className="block text-xs md:text-sm font-medium text-zinc-400">Username</label>
                    {isEditing ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 md:h-5 md:w-5 text-zinc-500" />
                        </div>
                        <input
                          type="text"
                          name="username"
                          value={editedData.username || ''}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 md:py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <User className="h-4 w-4 md:h-5 md:w-5 text-zinc-500 mr-3" />
                        <p className="text-white text-sm md:text-lg">@{userData.username}</p>
                      </div>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1 md:space-y-2">
                    <label className="block text-xs md:text-sm font-medium text-zinc-400">Email Address</label>
                    {isEditing ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 md:h-5 md:w-5 text-zinc-500" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={editedData.email || ''}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 md:py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 md:h-5 md:w-5 text-zinc-500 mr-3" />
                        <p className="text-white text-sm md:text-lg">{userData.email}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Mobile-only save/cancel buttons for better accessibility */}
                {isEditing && isMobile && (
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={handleSave}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex-1"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-700 text-white rounded-xl hover:bg-zinc-600 transition-colors flex-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile