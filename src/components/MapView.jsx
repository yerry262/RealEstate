import React, { useMemo, useCallback } from 'react';
import Map, { NavigationControl, ScaleControl } from 'react-map-gl';
import { DeckGL } from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import useStore, { HEATMAP_METRICS } from '../store/useStore';
import { getDealScoreColor } from '../utils/calculations';
import PropertyPopup from './PropertyPopup';

// You'll need to replace this with your own Mapbox token
// Get one free at https://mapbox.com
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE';

const MAP_STYLES = {
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  streets: 'mapbox://styles/mapbox/streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
};

export default function MapView() {
  const {
    viewport,
    setViewport,
    mapStyle,
    heatmapEnabled,
    activeHeatmapMetric,
    heatmapOpacity,
    selectedProperty,
    setSelectedProperty,
    hoveredProperty,
    setHoveredProperty,
    getFilteredProperties,
  } = useStore();

  const properties = getFilteredProperties();
  const metricConfig = HEATMAP_METRICS[activeHeatmapMetric];

  // Create the scatter plot layer for property pins
  const scatterLayer = useMemo(() => {
    return new ScatterplotLayer({
      id: 'properties',
      data: properties,
      pickable: true,
      opacity: 0.9,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 6,
      radiusMaxPixels: 20,
      lineWidthMinPixels: 2,
      getPosition: (d) => [d.longitude, d.latitude],
      getRadius: (d) => {
        // Larger radius for better deals
        const score = d.analysis?.dealScore || 0;
        return 100 + score * 5;
      },
      getFillColor: (d) => {
        const score = d.analysis?.dealScore || 0;
        const colorHex = getDealScoreColor(score);
        // Convert hex to RGB
        const r = parseInt(colorHex.slice(1, 3), 16);
        const g = parseInt(colorHex.slice(3, 5), 16);
        const b = parseInt(colorHex.slice(5, 7), 16);
        return [r, g, b, 200];
      },
      getLineColor: [255, 255, 255, 255],
      onHover: ({ object }) => {
        setHoveredProperty(object || null);
      },
      onClick: ({ object }) => {
        if (object) {
          setSelectedProperty(object);
        }
      },
      updateTriggers: {
        getFillColor: [properties],
        getRadius: [properties],
      },
    });
  }, [properties, setHoveredProperty, setSelectedProperty]);

  // Create the heatmap layer
  const heatmapLayer = useMemo(() => {
    if (!heatmapEnabled) return null;

    return new HeatmapLayer({
      id: 'heatmap',
      data: properties,
      getPosition: (d) => [d.longitude, d.latitude],
      getWeight: (d) => metricConfig.getValue(d),
      aggregation: 'MEAN',
      radiusPixels: 60,
      intensity: 1,
      threshold: 0.05,
      opacity: heatmapOpacity,
      colorRange: metricConfig.colorRange,
    });
  }, [properties, heatmapEnabled, activeHeatmapMetric, heatmapOpacity, metricConfig]);

  // Combine layers
  const layers = useMemo(() => {
    const result = [];
    if (heatmapLayer) result.push(heatmapLayer);
    result.push(scatterLayer);
    return result;
  }, [heatmapLayer, scatterLayer]);

  // Handle viewport changes
  const onMove = useCallback(
    (evt) => {
      setViewport(evt.viewState);
    },
    [setViewport]
  );

  // Get cursor style
  const getCursor = useCallback(({ isHovering, isDragging }) => {
    if (isDragging) return 'grabbing';
    if (isHovering) return 'pointer';
    return 'grab';
  }, []);

  return (
    <div className="w-full h-full relative">
      <DeckGL
        viewState={viewport}
        controller={true}
        layers={layers}
        getCursor={getCursor}
        onViewStateChange={onMove}
      >
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={MAP_STYLES[mapStyle]}
          reuseMaps
          attributionControl={false}
        >
          <NavigationControl position="bottom-right" />
          <ScaleControl position="bottom-left" />
        </Map>
      </DeckGL>

      {/* Property Popup on Hover */}
      {hoveredProperty && !selectedProperty && (
        <PropertyPopup property={hoveredProperty} />
      )}

      {/* Heatmap Legend */}
      {heatmapEnabled && (
        <div className="absolute bottom-12 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
          <div className="font-medium mb-2">{metricConfig.label}</div>
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-70">Low</span>
            <div className="w-24 h-3 rounded heatmap-legend"></div>
            <span className="text-xs opacity-70">High</span>
          </div>
        </div>
      )}
    </div>
  );
}
