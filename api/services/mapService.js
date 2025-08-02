import { config } from '../config/config.js';

class MapService {
  constructor() {
    // No validation needed for static config
  }

  // Get Mapbox configuration for frontend
  getMapboxConfig() {
    return {
      publicToken: config.apis.mapbox.publicToken,
      styles: {
        light: 'mapbox://styles/mapbox/light-v11',
        dark: 'mapbox://styles/mapbox/dark-v11',
        satellite: 'mapbox://styles/mapbox/satellite-v9',
        streets: 'mapbox://styles/mapbox/streets-v12'
      },
      defaultStyle: 'mapbox://styles/mapbox/dark-v11',
      projection: 'globe',
      zoom: 1.5,
      center: [30, 15],
      pitch: 45
    };
  }

  // Future: Add geocoding, reverse geocoding, and other Mapbox API features
  async geocode(query) {
    // This would use the secret token for server-side geocoding
    // For now, we'll let the frontend handle geocoding with the public token
    throw new Error('Server-side geocoding not implemented yet');
  }

  async reverseGeocode(longitude, latitude) {
    // This would use the secret token for server-side reverse geocoding
    throw new Error('Server-side reverse geocoding not implemented yet');
  }
}

export default MapService;