import React, { useState } from 'react';

const EditableField = ({
    label,
    value,
    fieldKey,
    onSave,
    type = "text",
    placeholder = "Not set",
    validationRegex = null,
    validationMessage = "Invalid format"
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const [error, setError] = useState("");

    const handleSave = async () => {
        if (validationRegex && !validationRegex.test(localValue)) {
            setError(validationMessage);
            return;
        }
        setError("");

        const success = await onSave({ [fieldKey]: localValue });
        if (success) setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setLocalValue(value);
        setError("");
    };

    return (
        <div className="group">
            <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-gray-500 uppercase">{label}</label>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-indigo-500 opacity-0 group-hover:opacity-100 transition"
                    >
                        Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="mt-1">
                    <div className="flex items-start gap-2">
                        {type === 'textarea' ? (
                            <textarea
                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                                value={localValue}
                                onChange={e => setLocalValue(e.target.value)}
                                rows="3"
                            />
                        ) : (
                            <input
                                className="flex-1 w-full border rounded p-2 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                                value={localValue}
                                onChange={e => setLocalValue(e.target.value)}
                                placeholder={placeholder}
                            />
                        )}

                        <div className="flex flex-col gap-1">
                            <button onClick={handleSave} className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors" title="Save">
                                ✓
                            </button>
                            <button onClick={handleCancel} className="text-gray-400 hover:bg-gray-50 p-1 rounded transition-colors" title="Cancel">
                                ✕
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>
            ) : (
                <p className={`mt-1 text-gray-900 font-medium ${!value ? 'text-gray-400 italic' : ''}`}>
                    {value || placeholder}
                </p>
            )}
        </div>
    );
};

export default EditableField;
