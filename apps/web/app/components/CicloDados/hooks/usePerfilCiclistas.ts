import { useState, useEffect } from 'react';

interface CyclistProfileLocation {
  coordinates: {
    lat: number;
    lon: number;
  };
  location_info: {
    neighborhood: string;
    street: string;
    area: string;
    survey_year: string;
  };
  statistics: {
    total_responses: string;
    avg_age: number;
    avg_days_per_week: number;
    avg_trip_time_minutes: number;
    gender_distribution: {
      male_percentage: number;
      female_percentage: number;
    };
    private_bike_percentage: number;
    accidents_percentage: number;
    top_motivation: string;
    top_issue: string;
  };
}

interface CyclistProfileResponse {
  filters: Record<string, any>;
  total_locations: number;
  locations: CyclistProfileLocation[];
}

export function usePerfilCiclistas() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://cyclist-profile.atlas.ameciclo.org/v1/cyclist-profiles/survey-locations');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: CyclistProfileResponse = await response.json();
        
        // Convert to GeoJSON format for map rendering
        const geojsonData = {
          type: 'FeatureCollection',
          features: result.locations.map((location, index) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [location.coordinates.lon, location.coordinates.lat]
            },
            properties: {
              id: `profile_${index}`,
              name: location.location_info.street,
              neighborhood: location.location_info.neighborhood,
              area: location.location_info.area,
              survey_year: location.location_info.survey_year,
              total_responses: parseInt(location.statistics.total_responses),
              avg_age: location.statistics.avg_age,
              avg_days_per_week: location.statistics.avg_days_per_week,
              avg_trip_time_minutes: location.statistics.avg_trip_time_minutes,
              male_percentage: location.statistics.gender_distribution.male_percentage,
              female_percentage: location.statistics.gender_distribution.female_percentage,
              private_bike_percentage: location.statistics.private_bike_percentage,
              accidents_percentage: location.statistics.accidents_percentage,
              top_motivation: location.statistics.top_motivation,
              top_issue: location.statistics.top_issue,
              type: 'perfil'
            }
          }))
        };
        
        setData(geojsonData);
        setError(null);
      } catch (err) {
        console.error('Error fetching cyclist profile data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, error, loading };
}