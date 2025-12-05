import React from 'react';
import { formatCurrency, formatCompact, getDealScoreColor, getDealScoreLabel } from '../utils/calculations';
import useStore from '../store/useStore';

export default function PropertyPopup({ property }) {
  const { viewport } = useStore();
  
  if (!property) return null;

  const score = property.analysis?.dealScore || 0;
  const scoreColor = getDealScoreColor(score);
  const scoreLabel = getDealScoreLabel(score);

  // Calculate screen position (simplified - works for basic cases)
  // In production, you'd use Mapbox's project() method
  const style = {
    position: 'absolute',
    left: '50%',
    top: '40%',
    transform: 'translate(-50%, -100%)',
    pointerEvents: 'none',
  };

  return (
    <div style={style} className="z-50">
      <div className="bg-gray-900/95 backdrop-blur-sm text-white rounded-lg shadow-xl p-4 min-w-[280px] border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{formatCompact(property.price)}</h3>
            <p className="text-sm text-gray-400 truncate max-w-[180px]">{property.street}</p>
            <p className="text-xs text-gray-500">{property.city}, {property.state}</p>
          </div>
          <div 
            className="px-3 py-1 rounded-full text-sm font-bold"
            style={{ backgroundColor: scoreColor + '20', color: scoreColor }}
          >
            {score}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="bg-gray-800 rounded p-2">
            <div className="text-lg font-semibold">{property.beds}</div>
            <div className="text-xs text-gray-400">Beds</div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-lg font-semibold">{property.baths}</div>
            <div className="text-xs text-gray-400">Baths</div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-lg font-semibold">{(property.sqft / 1000).toFixed(1)}k</div>
            <div className="text-xs text-gray-400">Sq Ft</div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Est. Rent</span>
            <span className="font-medium text-green-400">{formatCurrency(property.estimatedMonthlyRent)}/mo</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Cash Flow</span>
            <span className={`font-medium ${property.analysis?.monthlyCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(property.analysis?.monthlyCashFlow || 0)}/mo
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Cap Rate</span>
            <span className="font-medium">{((property.analysis?.capRate || 0) * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-3 flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded ${
            property.status === 'For Sale' ? 'bg-blue-500/20 text-blue-400' :
            property.status === 'Price Reduced' ? 'bg-yellow-500/20 text-yellow-400' :
            property.status === 'Foreclosure' ? 'bg-red-500/20 text-red-400' :
            property.status === 'Off-Market' ? 'bg-purple-500/20 text-purple-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {property.status}
          </span>
          <span className="text-xs text-gray-500">{property.daysOnMarket} days on market</span>
        </div>

        {/* Click hint */}
        <div className="mt-3 text-center text-xs text-gray-500 border-t border-gray-700 pt-2">
          Click for detailed analysis
        </div>
      </div>
      
      {/* Arrow pointing down */}
      <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900/95 mx-auto"></div>
    </div>
  );
}
