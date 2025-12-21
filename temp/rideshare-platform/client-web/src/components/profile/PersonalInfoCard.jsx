import React, { useState } from 'react';
import EditableField from './EditableField';

const PersonalInfoCard = ({ bio, realName, phone, location, email, onSave }) => {
    // We lift the state handling to EditableField, we just need to pass the save handler wrapper if needed
    // But since onSave from UserProfile handles partial updates, we can pass it directly or wrap it.

    // Wrapper to handle the promise and boolean return for EditableField
    const handleFieldSave = async (data) => {
        try {
            await onSave(data);
            return true;
        } catch (e) {
            return false;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
            </div>

            <div className="p-6 space-y-6">
                {/* Bio Section */}
                <div>
                    <EditableField
                        label="Bio"
                        value={bio}
                        fieldKey="bio"
                        onSave={handleFieldSave}
                        type="textarea"
                        placeholder="Tell us about yourself..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Real Name */}
                    <EditableField
                        label="Full Name"
                        value={realName}
                        fieldKey="realName"
                        onSave={handleFieldSave}
                    />

                    {/* Phone */}
                    <EditableField
                        label="Phone"
                        value={phone}
                        fieldKey="phone"
                        onSave={handleFieldSave}
                        validationRegex={/^\+?[0-9]{7,15}$/}
                        validationMessage="Invalid format. Use 7-15 digits."
                        placeholder="+123456789"
                    />

                    {/* Email (Read-only) */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                        <p className="mt-1 text-gray-900 font-medium flex items-center gap-2">
                            {email}
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Verified</span>
                        </p>
                    </div>

                    {/* Location */}
                    <EditableField
                        label="City / Location"
                        value={location}
                        fieldKey="location"
                        onSave={handleFieldSave}
                    />
                </div>
            </div>
        </div>
    );
};

export default PersonalInfoCard;
