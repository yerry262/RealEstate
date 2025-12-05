import React, { useState } from 'react';
import { 
  Layers, 
  Map as MapIcon, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Eye,
  EyeOff,
  Settings,
  X
} from 'lucide-react';
import useStore, { HEATMAP_METRICS, PROPERTY_FILTERS } from '../store/useStore';

export default function ControlPanel() {
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('heatmap'); // 'heatmap' | 'filters' | 'map'

  const {
    heatmapEnabled,
    setHeatmapEnabled,
    activeHeatmapMetric,
    setActiveHeatmapMetric,
    heatmapOpacity,
    setHeatmapOpacity,
    mapStyle,
    setMapStyle,
    filters,
    setFilter,
    resetFilters,
    getFilteredProperties,
    properties,
  } = useStore();

  const filteredCount = getFilteredProperties().length;

  return (
    <div className="absolute top-4 left-4 z-40">
      {/* Main Panel */}
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 overflow-hidden w-72">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Map Controls
          </h2>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {expanded && (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              <TabButton
                active={activeTab === 'heatmap'}
                onClick={() => setActiveTab('heatmap')}
                icon={<Layers className="w-4 h-4" />}
                label="Heatmap"
              />
              <TabButton
                active={activeTab === 'filters'}
                onClick={() => setActiveTab('filters')}
                icon={<Filter className="w-4 h-4" />}
                label="Filters"
                badge={filteredCount !== properties.length ? filteredCount : null}
              />
              <TabButton
                active={activeTab === 'map'}
                onClick={() => setActiveTab('map')}
                icon={<MapIcon className="w-4 h-4" />}
                label="Style"
              />
            </div>

            {/* Tab Content */}
            <div className="p-3">
              {activeTab === 'heatmap' && (
                <HeatmapTab
                  enabled={heatmapEnabled}
                  setEnabled={setHeatmapEnabled}
                  activeMetric={activeHeatmapMetric}
                  setActiveMetric={setActiveHeatmapMetric}
                  opacity={heatmapOpacity}
                  setOpacity={setHeatmapOpacity}
                />
              )}

              {activeTab === 'filters' && (
                <FiltersTab
                  filters={filters}
                  setFilter={setFilter}
                  resetFilters={resetFilters}
                  totalCount={properties.length}
                  filteredCount={filteredCount}
                />
              )}

              {activeTab === 'map' && (
                <MapStyleTab
                  mapStyle={mapStyle}
                  setMapStyle={setMapStyle}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Property Count Badge */}
      <div className="mt-3 bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-white">
        <span className="text-gray-400">Showing</span>{' '}
        <span className="font-bold text-green-400">{filteredCount}</span>{' '}
        <span className="text-gray-400">of {properties.length} properties</span>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors relative ${
        active 
          ? 'text-green-400 border-b-2 border-green-400 bg-gray-800/50' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
      }`}
    >
      {icon}
      {label}
      {badge !== null && (
        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] px-1.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

function HeatmapTab({ enabled, setEnabled, activeMetric, setActiveMetric, opacity, setOpacity }) {
  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">Show Heatmap</span>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`p-2 rounded-lg transition-colors ${
            enabled ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
          }`}
        >
          {enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      {enabled && (
        <>
          {/* Metric Selection */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
              Heatmap Metric
            </label>
            <div className="space-y-1">
              {Object.values(HEATMAP_METRICS).map((metric) => (
                <button
                  key={metric.id}
                  onClick={() => setActiveMetric(metric.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeMetric === metric.id
                      ? 'bg-green-600/20 text-green-400 border border-green-600'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <div className="font-medium">{metric.label}</div>
                  <div className="text-xs text-gray-500">{metric.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Opacity Slider */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Opacity</span>
              <span className="text-gray-300">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.1}
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>
        </>
      )}
    </div>
  );
}

function FiltersTab({ filters, setFilter, resetFilters, totalCount, filteredCount }) {
  const hasFilters = filteredCount !== totalCount;

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div>
        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          {PROPERTY_FILTERS.status.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Property Type Filter */}
      <div>
        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
          Property Type
        </label>
        <select
          value={filters.homeType}
          onChange={(e) => setFilter('homeType', e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          {PROPERTY_FILTERS.homeType.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Min Beds */}
      <div>
        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
          Minimum Bedrooms
        </label>
        <select
          value={filters.bedsMin}
          onChange={(e) => setFilter('bedsMin', e.target.value === 'Any' ? 'Any' : parseInt(e.target.value))}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          {PROPERTY_FILTERS.bedsMin.options.map((opt) => (
            <option key={opt} value={opt}>{opt === 'Any' ? 'Any' : `${opt}+`}</option>
          ))}
        </select>
      </div>

      {/* Min Deal Score */}
      <div>
        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
          Minimum Deal Score
        </label>
        <select
          value={filters.dealScoreMin}
          onChange={(e) => setFilter('dealScoreMin', e.target.value === 'Any' ? 'Any' : parseInt(e.target.value))}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          {PROPERTY_FILTERS.dealScoreMin.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt === 'Any' ? 'Any' : `${opt}+ (${opt >= 70 ? 'Excellent' : opt >= 50 ? 'Good' : 'Fair'})`}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Max Price</span>
          <span className="text-gray-300">${(filters.priceMax / 1000000).toFixed(1)}M</span>
        </div>
        <input
          type="range"
          min={100000}
          max={2000000}
          step={50000}
          value={filters.priceMax}
          onChange={(e) => setFilter('priceMax', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
      </div>

      {/* Reset Button */}
      {hasFilters && (
        <button
          onClick={resetFilters}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
          Clear All Filters
        </button>
      )}
    </div>
  );
}

function MapStyleTab({ mapStyle, setMapStyle }) {
  const styles = [
    { id: 'satellite', label: 'Satellite', description: 'Aerial imagery with labels' },
    { id: 'streets', label: 'Streets', description: 'Standard street map' },
    { id: 'dark', label: 'Dark', description: 'Dark theme for night viewing' },
    { id: 'light', label: 'Light', description: 'Light theme' },
  ];

  return (
    <div className="space-y-2">
      {styles.map((style) => (
        <button
          key={style.id}
          onClick={() => setMapStyle(style.id)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            mapStyle === style.id
              ? 'bg-green-600/20 text-green-400 border border-green-600'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-transparent'
          }`}
        >
          <div className="font-medium">{style.label}</div>
          <div className="text-xs text-gray-500">{style.description}</div>
        </button>
      ))}
    </div>
  );
}
