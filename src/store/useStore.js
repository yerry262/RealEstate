import { create } from 'zustand';
import { fetchProperties, checkApiHealth } from '../services/api';

/**
 * Heatmap metric options
 */
export const HEATMAP_METRICS = {
  dealScore: {
    id: 'dealScore',
    label: 'Deal Score',
    description: 'Overall investment quality (0-100)',
    getValue: (p) => p.analysis?.dealScore || 0,
    colorRange: [[239, 68, 68], [234, 179, 8], [34, 197, 94]], // Red -> Yellow -> Green
  },
  cashOnCash: {
    id: 'cashOnCash',
    label: 'Cash-on-Cash Return',
    description: 'Annual return on cash invested',
    getValue: (p) => (p.analysis?.cashOnCash || 0) * 100,
    colorRange: [[239, 68, 68], [234, 179, 8], [34, 197, 94]],
  },
  capRate: {
    id: 'capRate',
    label: 'Cap Rate',
    description: 'Net Operating Income / Price',
    getValue: (p) => (p.analysis?.capRate || 0) * 100,
    colorRange: [[239, 68, 68], [234, 179, 8], [34, 197, 94]],
  },
  daysOnMarket: {
    id: 'daysOnMarket',
    label: 'Days on Market',
    description: 'Longer DOM = more negotiating power',
    getValue: (p) => p.daysOnMarket || 0,
    colorRange: [[34, 197, 94], [234, 179, 8], [239, 68, 68]], // Green -> Yellow -> Red (inverted)
  },
  pricePerSqft: {
    id: 'pricePerSqft',
    label: 'Price per Sq Ft',
    description: 'Price divided by square footage',
    getValue: (p) => p.pricePerSqft || 0,
    colorRange: [[34, 197, 94], [234, 179, 8], [239, 68, 68]], // Lower is better
  },
  monthlyCashFlow: {
    id: 'monthlyCashFlow',
    label: 'Monthly Cash Flow',
    description: 'Net income after all expenses',
    getValue: (p) => p.analysis?.monthlyCashFlow || 0,
    colorRange: [[239, 68, 68], [234, 179, 8], [34, 197, 94]],
  },
};

/**
 * Property filter options
 */
export const PROPERTY_FILTERS = {
  status: {
    label: 'Status',
    options: ['All', 'For Sale', 'Pending', 'Price Reduced', 'New Listing', 'Foreclosure', 'Off-Market'],
  },
  homeType: {
    label: 'Property Type',
    options: ['All', 'Single Family', 'Townhouse', 'Condo', 'Duplex', 'Triplex', 'Fourplex'],
  },
  priceRange: {
    label: 'Price Range',
    min: 0,
    max: 2000000,
    step: 50000,
  },
  bedsMin: {
    label: 'Min Beds',
    options: ['Any', 1, 2, 3, 4, 5],
  },
  dealScoreMin: {
    label: 'Min Deal Score',
    options: ['Any', 30, 50, 70],
  },
};

/**
 * Main application store
 */
const useStore = create((set, get) => ({
  // ============ MAP STATE ============
  viewport: {
    latitude: 32.7767,
    longitude: -96.7970,
    zoom: 10,
    pitch: 0,
    bearing: 0,
  },
  setViewport: (viewport) => set({ viewport }),
  
  mapStyle: 'satellite',
  setMapStyle: (style) => set({ mapStyle: style }),
  
  // ============ DATA SOURCE ============
  dataSource: 'loading', // 'api' | 'mock' | 'loading'
  setDataSource: (source) => set({ dataSource: source }),
  
  // ============ PROPERTIES ============
  properties: [],
  isLoading: false,
  error: null,
  
  setProperties: (properties) => set({ properties }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  // Load properties from API (database required)
  loadProperties: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Check if API is available
      const apiAvailable = await checkApiHealth();
      
      if (apiAvailable) {
        // Fetch from API
        const data = await fetchProperties();
        set({ 
          properties: data, 
          dataSource: 'api',
          isLoading: false 
        });
        console.log(`✅ Loaded ${data.length} properties from database`);
      } else {
        // No fallback - database is required
        set({ 
          properties: [], 
          dataSource: 'error',
          isLoading: false,
          error: 'Database unavailable. Please start the database with: .\\db.ps1 start'
        });
        console.error('❌ API unavailable. Start the database and backend server.');
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      set({ 
        properties: [], 
        dataSource: 'error',
        isLoading: false,
        error: `Failed to load properties: ${error.message}. Ensure database and backend are running.`
      });
    }
  },
  
  // Selected property for detail view
  selectedProperty: null,
  setSelectedProperty: (property) => set({ selectedProperty: property }),
  
  // Hovered property for tooltip
  hoveredProperty: null,
  setHoveredProperty: (property) => set({ hoveredProperty: property }),
  
  // ============ FILTERS ============
  filters: {
    status: 'All',
    homeType: 'All',
    priceMin: 0,
    priceMax: 2000000,
    bedsMin: 'Any',
    dealScoreMin: 'Any',
  },
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value },
  })),
  resetFilters: () => set({
    filters: {
      status: 'All',
      homeType: 'All',
      priceMin: 0,
      priceMax: 2000000,
      bedsMin: 'Any',
      dealScoreMin: 'Any',
    },
  }),
  
  // Get filtered properties
  getFilteredProperties: () => {
    const { properties, filters } = get();
    
    return properties.filter((p) => {
      if (filters.status !== 'All' && p.status !== filters.status) return false;
      if (filters.homeType !== 'All' && p.homeType !== filters.homeType) return false;
      if (p.price < filters.priceMin || p.price > filters.priceMax) return false;
      if (filters.bedsMin !== 'Any' && p.beds < filters.bedsMin) return false;
      if (filters.dealScoreMin !== 'Any' && (p.analysis?.dealScore || 0) < filters.dealScoreMin) return false;
      return true;
    });
  },
  
  // ============ HEATMAP ============
  heatmapEnabled: true,
  setHeatmapEnabled: (enabled) => set({ heatmapEnabled: enabled }),
  
  activeHeatmapMetric: 'dealScore',
  setActiveHeatmapMetric: (metric) => set({ activeHeatmapMetric: metric }),
  
  heatmapOpacity: 0.6,
  setHeatmapOpacity: (opacity) => set({ heatmapOpacity: opacity }),
  
  heatmapRadius: 1000, // meters
  setHeatmapRadius: (radius) => set({ heatmapRadius: radius }),
  
  // ============ UI STATE ============
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  controlPanelOpen: true,
  setControlPanelOpen: (open) => set({ controlPanelOpen: open }),
  
  // ============ CALCULATOR ASSUMPTIONS ============
  assumptions: {
    downPaymentPercent: 0.25,
    interestRate: 0.07,
    loanTermYears: 30,
    closingCostPercent: 0.03,
    rehabBudget: 0,
    vacancyRate: 0.08,
    maintenancePercent: 0.01,
    capexPercent: 0.01,
    managementPercent: 0.10,
  },
  setAssumption: (key, value) => set((state) => ({
    assumptions: { ...state.assumptions, [key]: value },
  })),
  resetAssumptions: () => set({
    assumptions: {
      downPaymentPercent: 0.25,
      interestRate: 0.07,
      loanTermYears: 30,
      closingCostPercent: 0.03,
      rehabBudget: 0,
      vacancyRate: 0.08,
      maintenancePercent: 0.01,
      capexPercent: 0.01,
      managementPercent: 0.10,
    },
  }),
}));

export default useStore;
