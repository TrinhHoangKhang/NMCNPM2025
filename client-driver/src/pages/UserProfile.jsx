import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUserById, updateUserProfile } from '../services/userService';

// Components
import UserProfileHeader from '../components/profile/UserProfileHeader';
import UserStatsCard from '../components/profile/UserStatsCard';
import RideHistoryCard from '../components/profile/RideHistoryCard';
import UserActionsCard from '../components/profile/UserActionsCard';
import QuickAvatars from '../components/profile/QuickAvatars';
import PersonalInfoCard from '../components/profile/PersonalInfoCard';
import DriverVehicleCard from '../components/profile/DriverVehicleCard';
import SavedLocationsCard from '../components/profile/SavedLocationsCard';
import DriverRegistrationModal from '../components/profile/DriverRegistrationModal';

const UserProfile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [isRegisteringDriver, setIsRegisteringDriver] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?._id) {
                try {
                    const data = await getUserById(user._id);
                    const userData = data.user || data;
                    setProfileData(userData);
                } catch (error) {
                    console.error("Failed to fetch profile", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchProfile();
    }, [user]);

    // Check for query params to auto-trigger events (e.g. from Dashboard)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('action') === 'registerDriver') {
            setIsRegisteringDriver(true);
        }
    }, [location]);

    const handleUpdate = async (updatedFields) => {
        try {
            const updatedUser = await updateUserProfile(user._id, updatedFields);
            setProfileData(prev => ({ ...prev, ...updatedUser }));
            updateUser(updatedUser);
            return true;
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update: " + (error.response?.data?.message || error.message));
            return false;
        }
    };

    const handleAvatarSelect = async (url) => {
        handleUpdate({ profilePicture: url });
    };

    const handleRegistrationSuccess = () => {
        setIsRegisteringDriver(false);
        // Clear query param
        navigate('/profile', { replace: true });
        // Redirect to driver dashboard
        navigate('/driver');
    };

    if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">Loading Profile...</div>;
    if (!profileData) return <div className="p-10 text-center text-red-500">User not found</div>;

    const userInfo = profileData;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 relative">

            {isRegisteringDriver && (
                <DriverRegistrationModal
                    user={user}
                    onClose={() => setIsRegisteringDriver(false)}
                    onRegistrationSuccess={handleRegistrationSuccess}
                    updateUser={updateUser}
                />
            )}

            <UserProfileHeader
                username={userInfo.username}
                realName={userInfo.realName}
                role={userInfo.role}
                profilePicture={userInfo.profilePicture}
                onAvatarSelect={handleAvatarSelect}
            />

            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats, Actions, Avatars */}
                <div className="space-y-6">
                    <UserStatsCard
                        rating={userInfo.rating}
                        walletBalance={userInfo.walletBalance}
                        createdAt={userInfo.createdAt}
                    />

                    <RideHistoryCard />

                    <UserActionsCard
                        role={userInfo.role}
                        onBecomeDriver={() => setIsRegisteringDriver(true)}
                    />

                    <QuickAvatars onAvatarSelect={handleAvatarSelect} />
                </div>

                {/* Right Column: Detailed Forms */}
                <div className="lg:col-span-2 space-y-6">
                    <PersonalInfoCard
                        bio={userInfo.bio}
                        realName={userInfo.realName}
                        phone={userInfo.phone}
                        email={userInfo.email}
                        location={userInfo.location}
                        onSave={handleUpdate}
                    />

                    {userInfo.role === 'driver' && (
                        <DriverVehicleCard
                            vehicle={userInfo.vehicle}
                            status={userInfo.status}
                            earnings={userInfo.earnings}
                            onSave={handleUpdate}
                        />
                    )}

                    <SavedLocationsCard savedLocations={userInfo.savedLocations} />
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
