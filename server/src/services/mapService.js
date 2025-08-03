import { config } from '../config/config.js';

class MapService {
  constructor() {
    this.validateConfiguration();
  }

  validateConfiguration() {
    if (!config.apis.mapbox.publicToken) {
      throw new Error('Mapbox public token not configured. Please set MAPBOX_PUBLIC_TOKEN environment variable.');
    }
  }

  // Get Mapbox configuration for frontend (only public information)
  getMapboxConfig() {
    return {
      publicToken: config.apis.mapbox.publicToken,
      styles: {
        light: 'mapbox://styles/mapbox/light-v11',
        dark: 'mapbox://styles/mapbox/dark-v11',
        satellite: 'mapbox://styles/mapbox/satellite-v9',
        streets: 'mapbox://styles/mapbox/streets-v12',
        outdoors: 'mapbox://styles/mapbox/outdoors-v12'
      },
      defaultStyle: 'mapbox://styles/mapbox/dark-v11',
      projection: 'globe',
      zoom: 1.5,
      center: [30, 15],
      pitch: 45,
      maxZoom: 18,
      minZoom: 0
    };
  }

  // Get sanitized config for API response (excludes sensitive data)
  getPublicConfig() {
    const config = this.getMapboxConfig();
    // Ensure we don't accidentally expose secret tokens
    const { publicToken, ...safeConfig } = config;
    
    return {
      ...safeConfig,
      hasPublicToken: Boolean(publicToken),
      // Only return the token if it exists and is properly formatted
      publicToken: publicToken && publicToken.startsWith('pk.') ? publicToken : null
    };
  }

  // Server-side geocoding using secret token (if available)
  async geocode(query) {
    if (!config.apis.mapbox.secretToken) {
      throw new Error('Server-side geocoding requires MAPBOX_SECRET_TOKEN environment variable');
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${config.apis.mapbox.secretToken}&limit=5`
      );

      if (!response.ok) {
        throw new Error(`Mapbox geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        results: data.features || []
      };
    } catch (error) {
      console.error('[MapService] Geocoding error:', error);
      throw new Error('Failed to geocode location');
    }
  }

  // Server-side reverse geocoding using secret token (if available)
  async reverseGeocode(longitude, latitude) {
    if (!config.apis.mapbox.secretToken) {
      throw new Error('Server-side reverse geocoding requires MAPBOX_SECRET_TOKEN environment variable');
    }

    if (!longitude || !latitude || isNaN(longitude) || isNaN(latitude)) {
      throw new Error('Valid longitude and latitude are required');
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${config.apis.mapbox.secretToken}&limit=1`
      );

      if (!response.ok) {
        throw new Error(`Mapbox reverse geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        results: data.features || []
      };
    } catch (error) {
      console.error('[MapService] Reverse geocoding error:', error);
      throw new Error('Failed to reverse geocode coordinates');
    }
  }

  // Validate coordinates
  validateCoordinates(longitude, latitude) {
    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);
    
    if (isNaN(lon) || isNaN(lat)) {
      return false;
    }
    
    return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
  }

  // Get service status
  getServiceStatus() {
    return {
      mapbox: {
        publicToken: Boolean(config.apis.mapbox.publicToken),
        secretToken: Boolean(config.apis.mapbox.secretToken),
        geocodingAvailable: Boolean(config.apis.mapbox.secretToken),
        reverseGeocodingAvailable: Boolean(config.apis.mapbox.secretToken)
      }
    };
  }
}

export default MapService;