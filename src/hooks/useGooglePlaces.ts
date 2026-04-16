import { useEffect, useState } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCK4D90FhV_f8dLCPNGTja1seudzU3fUgk';

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const useGooglePlaces = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setAutocompleteService(new window.google.maps.places.AutocompleteService());
      setIsLoaded(true);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setAutocompleteService(new window.google.maps.places.AutocompleteService());
        setIsLoaded(true);
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  const getPlacePredictions = (
    input: string,
    callback: (predictions: PlacePrediction[] | null) => void
  ) => {
    if (!autocompleteService || !input) {
      callback(null);
      return;
    }

    autocompleteService.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'in' }, // Restrict to India
        types: ['(cities)'], // Only cities
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          callback(predictions as PlacePrediction[]);
        } else {
          callback(null);
        }
      }
    );
  };

  return { isLoaded, getPlacePredictions };
};
