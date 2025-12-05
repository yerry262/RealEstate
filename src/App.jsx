import React, { useEffect } from 'react';
import MapView from './components/MapView';
import PropertySidebar from './components/PropertySidebar';
import ControlPanel from './components/ControlPanel';
import useStore from './store/useStore';
import { Database, Cloud, AlertCircle, Loader2 } from 'lucide-react';

function App() {
  const { selectedProperty, loadProperties, isLoading, dataSource, error } = useStore();

  // Load properties on mount
  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-gray-900">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/80 z-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Loading properties...</p>
          </div>
        </div>
      )}

      {/* Main Map */}
      <MapView />

      {/* Control Panel (top-left) */}
      <ControlPanel />

      {/* Property Detail Sidebar (right) */}
      {selectedProperty && <PropertySidebar />}

      {/* App Title (top-center) */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-gray-900/90 backdrop-blur-sm px-6 py-2 rounded-full border border-gray-700">
          <h1 className="text-white font-bold text-lg tracking-wide">
            🏠 Deal Finder
          </h1>
        </div>
      </div>

      {/* Data Source Indicator */}
      <DataSourceBadge dataSource={dataSource} error={error} />

      {/* Quick Stats Bar (top-right) */}
      <QuickStats />
    </div>
  );
}

function DataSourceBadge({ dataSource, error }) {
  if (dataSource === 'loading') return null;
  
  const isApi = dataSource === 'api';
  
  return (
    <div className="absolute bottom-4 right-4 z-30">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
        isApi 
          ? 'bg-green-900/90 border border-green-600 text-green-400' 
          : 'bg-yellow-900/90 border border-yellow-600 text-yellow-400'
      }`}>
        {isApi ? (
          <>
            <Database className="w-4 h-4" />
            <span>Connected to Database</span>
          </>
        ) : (
          <>
            <Cloud className="w-4 h-4" />
            <span>Using Mock Data</span>
          </>
        )}
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-900/90 border border-red-600 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="truncate max-w-[200px]">{error}</span>
        </div>
      )}
    </div>
  );
}

function QuickStats() {
  const { getFilteredProperties } = useStore();
  const properties = getFilteredProperties();

  // Calculate stats
  const avgScore = properties.length > 0
    ? Math.round(properties.reduce((acc, p) => acc + (p.analysis?.dealScore || 0), 0) / properties.length)
    : 0;
  
  const avgCashFlow = properties.length > 0
    ? Math.round(properties.reduce((acc, p) => acc + (p.analysis?.monthlyCashFlow || 0), 0) / properties.length)
    : 0;

  const excellentDeals = properties.filter(p => (p.analysis?.dealScore || 0) >= 70).length;

  return (
    <div className="absolute top-4 right-4 z-30 flex gap-2">
      <StatBadge 
        label="Avg Score" 
        value={avgScore} 
        color={avgScore >= 50 ? 'green' : avgScore >= 30 ? 'yellow' : 'red'} 
      />
      <StatBadge 
        label="Avg Cash Flow" 
        value={`$${avgCashFlow}`} 
        color={avgCashFlow >= 200 ? 'green' : avgCashFlow >= 0 ? 'yellow' : 'red'} 
      />
      <StatBadge 
        label="Hot Deals" 
        value={excellentDeals} 
        color="green" 
      />
    </div>
  );
}

function StatBadge({ label, value, color }) {
  const colorClasses = {
    green: 'text-green-400 border-green-600/50',
    yellow: 'text-yellow-400 border-yellow-600/50',
    red: 'text-red-400 border-red-600/50',
  };

  return (
    <div className={`bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg border ${colorClasses[color]}`}>
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-bold ${colorClasses[color].split(' ')[0]}`}>{value}</div>
    </div>
  );
}

export default App;
