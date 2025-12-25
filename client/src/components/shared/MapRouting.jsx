import React, { useEffect } from 'react';
import { useMap, Polyline } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';

const MapRouting = ({ start, end, setRoute }) => {
    const map = useMap();

    useEffect(() => {
        if (setRoute) setRoute(null); // Clear previous route when inputs change

        if (start && end) {
            // Prevent routing to same location
            if (start.lat === end.lat && start.lon === end.lon) {
                console.warn("Start and End locations are identical.");
                return;
            }

            const fetchRoute = async () => {
                try {
                    // OSRM expects: lon,lat;lon,lat
                    const url = `http://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`;
                    const response = await axios.get(url);

                    if (response.data.routes.length > 0) {
                        const routeData = response.data.routes[0];
                        const coordinates = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Flip to lat,lon for Leaflet

                        // Pass route info up
                        if (setRoute) {
                            setRoute({
                                distance: routeData.distance,
                                duration: routeData.duration,
                                coordinates: coordinates
                            });
                        }

                        // Fit bounds to show full route
                        const bounds = L.latLngBounds(coordinates);
                        map.fitBounds(bounds, { padding: [50, 50] });
                    }
                } catch (error) {
                    console.error("Error fetching route", error);
                    // OSRM Demo server often returns 429 or 500. 
                    // We could fallback to a straight line (Euclidean) if strictly needed,
                    // but for now, we just leave route as null so user can't request.
                }
            };
            fetchRoute();
        } else if (start) {
            map.flyTo([start.lat, start.lon], 15);
        }
    }, [start, end, map, setRoute]);

    if (!start || !end || !setRoute) return null;

    // We can render Polyline here if the parent passes the coordinates back, 
    // OR we can manage local state for the polyline.
    // Ideally, parent manages 'route' state so it can display price etc.
    // But for viewing, we can render if we have the coords in the parent's state.
    // Let's assume parent passes 'routeData' if it wants us to render, 
    // OR we pass coords up and parent uses a Polyline.

    // Better pattern: This component fetches data and calls setRoute. 
    // The VISUALIZATION should be passed down or handled here if we had state.

    return null; // This component handles LOGIC (fetching and moving map). Polyline rendering should be done by parent with the data.
};

export default MapRouting;
