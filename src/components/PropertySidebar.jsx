import React, { useMemo, useState } from 'react';
import { 
  X, 
  Home, 
  DollarSign, 
  Calendar, 
  Ruler, 
  Bed, 
  Bath, 
  Building, 
  TrendingUp,
  Calculator,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Tag
} from 'lucide-react';
import useStore from '../store/useStore';
import { analyzeProperty, formatCurrency, formatPercent, getDealScoreColor, getDealScoreLabel } from '../utils/calculations';

export default function PropertySidebar() {
  const { 
    selectedProperty, 
    setSelectedProperty, 
    assumptions, 
    setAssumption,
    resetAssumptions
  } = useStore();
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customRent, setCustomRent] = useState(null);

  // Recalculate analysis when assumptions change
  const analysis = useMemo(() => {
    if (!selectedProperty) return null;
    return analyzeProperty(selectedProperty, {
      ...assumptions,
      estimatedRent: customRent || selectedProperty.estimatedMonthlyRent,
    });
  }, [selectedProperty, assumptions, customRent]);

  if (!selectedProperty || !analysis) return null;

  const property = selectedProperty;
  const score = analysis.dealScore;
  const scoreColor = getDealScoreColor(score);
  const scoreLabel = getDealScoreLabel(score);

  const handleClose = () => {
    setSelectedProperty(null);
    setCustomRent(null);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-[420px] bg-gray-900 text-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                property.status === 'For Sale' ? 'bg-blue-500/20 text-blue-400' :
                property.status === 'Price Reduced' ? 'bg-yellow-500/20 text-yellow-400' :
                property.status === 'Foreclosure' ? 'bg-red-500/20 text-red-400' :
                property.status === 'Off-Market' ? 'bg-purple-500/20 text-purple-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {property.status}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {property.daysOnMarket} days
              </span>
            </div>
            <h2 className="text-2xl font-bold">{formatCurrency(property.price)}</h2>
            <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {property.address}
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deal Score */}
        <div className="mt-4 flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ backgroundColor: scoreColor + '30', color: scoreColor, border: `3px solid ${scoreColor}` }}
          >
            {score}
          </div>
          <div>
            <div className="text-lg font-semibold" style={{ color: scoreColor }}>{scoreLabel} Deal</div>
            <div className="text-sm text-gray-400">Investment Score</div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {/* Property Details */}
        <section>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Property Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <DetailCard icon={<Bed className="w-4 h-4" />} label="Bedrooms" value={property.beds} />
            <DetailCard icon={<Bath className="w-4 h-4" />} label="Bathrooms" value={property.baths} />
            <DetailCard icon={<Ruler className="w-4 h-4" />} label="Square Feet" value={property.sqft.toLocaleString()} />
            <DetailCard icon={<Home className="w-4 h-4" />} label="Lot Size" value={`${(property.lotSize / 43560).toFixed(2)} acres`} />
            <DetailCard icon={<Calendar className="w-4 h-4" />} label="Year Built" value={property.yearBuilt} />
            <DetailCard icon={<Building className="w-4 h-4" />} label="Type" value={property.homeType} />
            <DetailCard icon={<Tag className="w-4 h-4" />} label="$/Sq Ft" value={`$${property.pricePerSqft}`} />
            <DetailCard icon={<Building className="w-4 h-4" />} label="Units" value={property.units} />
          </div>
        </section>

        {/* Key Metrics */}
        <section>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Investment Metrics</h3>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard 
              label="Cap Rate" 
              value={analysis.formatted.capRate}
              good={analysis.capRate >= 0.06}
            />
            <MetricCard 
              label="Cash-on-Cash" 
              value={analysis.formatted.cashOnCash}
              good={analysis.cashOnCash >= 0.08}
            />
            <MetricCard 
              label="DSCR" 
              value={analysis.formatted.dscr}
              good={analysis.dscr >= 1.25}
            />
            <MetricCard 
              label="1% Rule" 
              value={analysis.passesOnePercent ? 'PASS' : 'FAIL'}
              good={analysis.passesOnePercent}
            />
          </div>
        </section>

        {/* Monthly Cash Flow Breakdown */}
        <section className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Monthly Cash Flow</h3>
          
          {/* Income */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Gross Rent</span>
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-medium">
                  +{formatCurrency(customRent || property.estimatedMonthlyRent)}
                </span>
                <input
                  type="number"
                  className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-right"
                  value={customRent || property.estimatedMonthlyRent}
                  onChange={(e) => setCustomRent(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Less Vacancy ({(assumptions.vacancyRate * 100)}%)</span>
              <span className="text-red-400">-{formatCurrency((customRent || property.estimatedMonthlyRent) * assumptions.vacancyRate)}</span>
            </div>
          </div>

          {/* Expenses */}
          <div className="space-y-2 border-t border-gray-700 pt-3 mb-4">
            <ExpenseRow label="Property Taxes" value={analysis.expenses.taxes} />
            <ExpenseRow label="Insurance" value={analysis.expenses.insurance} />
            {property.hoa > 0 && <ExpenseRow label="HOA" value={analysis.expenses.hoa} />}
            <ExpenseRow label="Maintenance" value={analysis.expenses.maintenance} />
            <ExpenseRow label="CapEx Reserve" value={analysis.expenses.capex} />
            <ExpenseRow label="Management (10%)" value={analysis.expenses.management} />
            <div className="flex justify-between font-medium pt-2 border-t border-gray-700">
              <span>Total Expenses</span>
              <span className="text-red-400">-{formatCurrency(analysis.expenses.total)}</span>
            </div>
          </div>

          {/* Mortgage */}
          <div className="border-t border-gray-700 pt-3 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-300">Mortgage (P&I)</span>
              <span className="text-red-400 font-medium">-{analysis.formatted.monthlyMortgage}</span>
            </div>
          </div>

          {/* Net Cash Flow */}
          <div className="border-t border-gray-700 pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Net Cash Flow</span>
              <span className={analysis.monthlyCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}>
                {analysis.formatted.monthlyCashFlow}/mo
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>Annual Cash Flow</span>
              <span>{analysis.formatted.annualCashFlow}/yr</span>
            </div>
          </div>
        </section>

        {/* Calculator Adjustments */}
        <section>
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3"
          >
            <span className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Adjust Assumptions
            </span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-4">
              <SliderInput
                label="Down Payment"
                value={assumptions.downPaymentPercent * 100}
                onChange={(v) => setAssumption('downPaymentPercent', v / 100)}
                min={5}
                max={100}
                step={5}
                suffix="%"
              />
              <SliderInput
                label="Interest Rate"
                value={assumptions.interestRate * 100}
                onChange={(v) => setAssumption('interestRate', v / 100)}
                min={3}
                max={12}
                step={0.25}
                suffix="%"
              />
              <SliderInput
                label="Loan Term"
                value={assumptions.loanTermYears}
                onChange={(v) => setAssumption('loanTermYears', v)}
                min={15}
                max={30}
                step={5}
                suffix=" years"
              />
              <SliderInput
                label="Rehab Budget"
                value={assumptions.rehabBudget}
                onChange={(v) => setAssumption('rehabBudget', v)}
                min={0}
                max={100000}
                step={5000}
                prefix="$"
              />
              <SliderInput
                label="Vacancy Rate"
                value={assumptions.vacancyRate * 100}
                onChange={(v) => setAssumption('vacancyRate', v / 100)}
                min={0}
                max={20}
                step={1}
                suffix="%"
              />

              <button
                onClick={resetAssumptions}
                className="w-full text-sm text-gray-400 hover:text-white py-2 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          )}
        </section>

        {/* Cash Required */}
        <section className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Cash Required to Close</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Down Payment ({assumptions.downPaymentPercent * 100}%)</span>
              <span>{analysis.formatted.downPayment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Closing Costs (3%)</span>
              <span>{formatCurrency(analysis.closingCosts)}</span>
            </div>
            {assumptions.rehabBudget > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-300">Rehab Budget</span>
                <span>{formatCurrency(assumptions.rehabBudget)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-700">
              <span>Total Cash Needed</span>
              <span className="text-yellow-400">{formatCurrency(analysis.totalCashInvested)}</span>
            </div>
          </div>
        </section>

        {/* Property History */}
        <section>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Property History</h3>
          <div className="bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Last Sold</span>
              <span>{property.lastSoldDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Sold Price</span>
              <span>{formatCurrency(property.lastSoldAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price Change</span>
              <span className={property.price > property.lastSoldAmount ? 'text-green-400' : 'text-red-400'}>
                {property.price > property.lastSoldAmount ? '+' : ''}
                {formatPercent((property.price - property.lastSoldAmount) / property.lastSoldAmount)}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 p-4 border-t border-gray-700 bg-gray-800">
        <div className="grid grid-cols-2 gap-3">
          <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors">
            Save Property
          </button>
          <button className="px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors">
            Contact Agent
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function DetailCard({ icon, label, value }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 flex items-center gap-3">
      <div className="text-gray-400">{icon}</div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, good }) {
  return (
    <div className={`rounded-lg p-3 text-center ${good ? 'bg-green-900/30 border border-green-800' : 'bg-gray-800'}`}>
      <div className={`text-xl font-bold ${good ? 'text-green-400' : 'text-gray-300'}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function ExpenseRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-red-400">-{formatCurrency(value)}</span>
    </div>
  );
}

function SliderInput({ label, value, onChange, min, max, step, prefix = '', suffix = '' }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="font-medium">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
      />
    </div>
  );
}
