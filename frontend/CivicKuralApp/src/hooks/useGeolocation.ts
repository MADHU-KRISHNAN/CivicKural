import { useState, useCallback } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  isManual?: boolean;
}

export interface UseGeolocationResult {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  getLocation: () => void;
  setManualLocation: (latitude: number, longitude: number, address?: string) => void;
}

export const useGeolocation = (): UseGeolocationResult => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: { 'Accept-Language': 'en' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          return data.display_name;
        }
      }
    } catch {
      console.warn('Reverse geocoding network request failed, using coordinate fallback');
    }
    return `Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const address = await reverseGeocode(latitude, longitude);

        setLocation({
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          address,
          isManual: false,
        });
        setLoading(false);
      },
      (geoError) => {
        setLoading(false);
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError('Location permission denied. Please allow access or enter address manually.');
            break;
          case geoError.POSITION_UNAVAILABLE:
            setError('Location information is unavailable. Please enter address manually.');
            break;
          case geoError.TIMEOUT:
            setError('Location request timed out. Please try again or enter address manually.');
            break;
          default:
            setError('An unknown error occurred while retrieving location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const setManualLocation = useCallback((latitude: number, longitude: number, address?: string) => {
    setLocation({
      latitude,
      longitude,
      address: address || `Location near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      isManual: true,
    });
    setError(null);
  }, []);

  return {
    location,
    loading,
    error,
    getLocation,
    setManualLocation,
  };
};

export default useGeolocation;
