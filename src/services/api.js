/**
 * API Service for Deal Finder
 * Handles all communication with the backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Fetch properties from the API
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Array of properties with analysis
 */
export async function fetchProperties(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.north) queryParams.append('north', params.north);
    if (params.south) queryParams.append('south', params.south);
    if (params.east) queryParams.append('east', params.east);
    if (params.west) queryParams.append('west', params.west);
    if (params.status && params.status !== 'All') queryParams.append('status', params.status);
    if (params.homeType && params.homeType !== 'All') queryParams.append('home_type', params.homeType);
    if (params.minPrice) queryParams.append('min_price', params.minPrice);
    if (params.maxPrice) queryParams.append('max_price', params.maxPrice);
    if (params.minBeds) queryParams.append('min_beds', params.minBeds);
    
    const url = `${API_BASE}/api/properties?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
}

/**
 * Fetch a single property by ID
 * @param {number} id - Property ID
 * @returns {Promise<Object>} Property with analysis
 */
export async function fetchPropertyById(id) {
  try {
    const response = await fetch(`${API_BASE}/api/properties/${id}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
}

/**
 * Analyze a property with custom assumptions
 * @param {Object} property - Property data
 * @param {Object} assumptions - Calculator assumptions
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeProperty(property, assumptions) {
  try {
    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ property, assumptions }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing property:', error);
    throw error;
  }
}

/**
 * Create a new property
 * @param {Object} propertyData - Property data
 * @returns {Promise<Object>} Created property with ID
 */
export async function createProperty(propertyData) {
  try {
    const response = await fetch(`${API_BASE}/api/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propertyData),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
}

/**
 * Get database statistics
 * @returns {Promise<Object>} Statistics
 */
export async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE}/api/stats`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

/**
 * Check if API is available
 * @returns {Promise<boolean>}
 */
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}
