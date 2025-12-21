import React, { useState, useEffect } from 'react';

const LocationSearch = ({ placeholder, onSelect, initialValue }) => {
    const [query, setQuery] = useState(initialValue || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length > 2) {
                setLoading(true);
                setError(null);
                try {
                    // Using fetch to avoid potential axios interceptor issues and add standard headers
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
                        {
                            headers: {
                                "Accept-Language": "en-US,en;q=0.9"
                            }
                        }
                    );

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    const data = await response.json();
                    setSuggestions(data);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error("Error fetching location suggestions", error);
                    setError("Failed to fetch suggestions");
                    setSuggestions([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchSuggestions();
        }, 500); // Debounce

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Sync internal state with external initialValue changes
    useEffect(() => {
        if (initialValue && initialValue !== query) {
            setQuery(initialValue);
        }
    }, [initialValue]);

    const handleSelect = (sugg) => {
        setQuery(sugg.display_name);
        setShowSuggestions(false);
        onSelect({
            lat: parseFloat(sugg.lat),
            lon: parseFloat(sugg.lon),
            displayName: sugg.display_name
        });
    };

    return (
        <div className="relative mb-4 w-full">
            <input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
                🔍
            </div>

            <button
                onClick={() => {
                    if (navigator.geolocation) {
                        setLoading(true);
                        navigator.geolocation.getCurrentPosition(
                            async (position) => {
                                const { latitude, longitude } = position.coords;
                                try {
                                    const response = await fetch(
                                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                                    );
                                    const data = await response.json();
                                    const address = data.display_name;
                                    setQuery(address);
                                    onSelect({
                                        lat: latitude,
                                        lon: longitude,
                                        displayName: address
                                    });
                                } catch (err) {
                                    console.error("Reverse geocoding failed", err);
                                    setError("Could not find address");
                                } finally {
                                    setLoading(false);
                                }
                            },
                            (err) => {
                                console.error("Geolocation failed", err);
                                setError("Location access denied");
                                setLoading(false);
                            }
                        );
                    } else {
                        setError("Geolocation not supported");
                    }
                }}
                className="absolute right-3 top-3 text-gray-400 hover:text-blue-500"
                title="Use Current Location"
            >
                📍
            </button>

            {loading && (
                <div className="absolute right-3 top-3">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto shadow-lg text-left">
                    {suggestions.map((sugg) => (
                        <li
                            key={sugg.place_id}
                            onClick={() => handleSelect(sugg)}
                            className="p-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-900 border-b border-gray-100 last:border-none font-medium"
                        >
                            {sugg.display_name}
                        </li>
                    ))}
                </ul>
            )}

            {error && showSuggestions && (
                <div className="absolute z-50 w-full bg-red-50 border border-red-200 rounded mt-1 p-2 text-red-700 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};

export default LocationSearch;
