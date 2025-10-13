import { X, SlidersHorizontal, Clock, DollarSign, Bus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PriceRangeSlider from './PriceRangeSlider';
import type { FilterState } from '@/hooks/useFilters';
import type { Trip } from '@/services/api';

interface TripFiltersProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
  priceRange: [number, number];
  trips: Trip[];
  isMobile?: boolean;
  onClose?: () => void;
}

export default function TripFilters({
  filters,
  onFilterChange,
  onReset,
  priceRange,
  trips,
  isMobile = false,
  onClose,
}: TripFiltersProps) {
  
  // Get unique stations
  const departureStations = Array.from(
    new Set(trips.map(t => t.departure_station?.name).filter(Boolean))
  ) as string[];
  
  const arrivalStations = Array.from(
    new Set(trips.map(t => t.arrival_station?.name).filter(Boolean))
  ) as string[];

  const toggleTimeSlot = (slot: 'morning' | 'afternoon' | 'evening') => {
    const current = filters.timeSlots;
    const updated = current.includes(slot)
      ? current.filter(s => s !== slot)
      : [...current, slot];
    onFilterChange('timeSlots', updated);
  };

  const toggleBusType = (type: 'standard' | 'vip' | 'luxury') => {
    const current = filters.busTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onFilterChange('busTypes', updated);
  };

  const hasActiveFilters = 
    filters.priceRange[0] !== priceRange[0] ||
    filters.priceRange[1] !== priceRange[1] ||
    filters.timeSlots.length > 0 ||
    filters.busTypes.length > 0 ||
    filters.departureStation !== null ||
    filters.arrivalStation !== null;

  return (
    <Card className={`${isMobile ? 'rounded-t-2xl' : ''} p-6 space-y-6`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
        </div>
        {isMobile && onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Reset button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full text-[#73C8D2] border-[#73C8D2] hover:bg-[#73C8D2]/10"
        >
          Réinitialiser les filtres
        </Button>
      )}

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Prix</label>
        </div>
        <PriceRangeSlider
          min={priceRange[0]}
          max={priceRange[1]}
          value={filters.priceRange}
          onChange={(value) => onFilterChange('priceRange', value)}
        />
      </div>

      {/* Time Slots */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Heure de départ</label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filters.timeSlots.includes('morning') ? 'default' : 'outline'}
            className={`cursor-pointer ${
              filters.timeSlots.includes('morning')
                ? 'bg-[#73C8D2] hover:bg-[#73C8D2]/90'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => toggleTimeSlot('morning')}
          >
            Matin (6h-12h)
          </Badge>
          <Badge
            variant={filters.timeSlots.includes('afternoon') ? 'default' : 'outline'}
            className={`cursor-pointer ${
              filters.timeSlots.includes('afternoon')
                ? 'bg-[#73C8D2] hover:bg-[#73C8D2]/90'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => toggleTimeSlot('afternoon')}
          >
            Après-midi (12h-18h)
          </Badge>
          <Badge
            variant={filters.timeSlots.includes('evening') ? 'default' : 'outline'}
            className={`cursor-pointer ${
              filters.timeSlots.includes('evening')
                ? 'bg-[#73C8D2] hover:bg-[#73C8D2]/90'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => toggleTimeSlot('evening')}
          >
            Soir (18h-24h)
          </Badge>
        </div>
      </div>

      {/* Bus Types */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Bus className="h-4 w-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Type de bus</label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filters.busTypes.includes('standard') ? 'default' : 'outline'}
            className={`cursor-pointer ${
              filters.busTypes.includes('standard')
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => toggleBusType('standard')}
          >
            Standard
          </Badge>
          <Badge
            variant={filters.busTypes.includes('vip') ? 'default' : 'outline'}
            className={`cursor-pointer ${
              filters.busTypes.includes('vip')
                ? 'bg-purple-500 hover:bg-purple-600'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => toggleBusType('vip')}
          >
            VIP
          </Badge>
          <Badge
            variant={filters.busTypes.includes('luxury') ? 'default' : 'outline'}
            className={`cursor-pointer ${
              filters.busTypes.includes('luxury')
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => toggleBusType('luxury')}
          >
            Luxe
          </Badge>
        </div>
      </div>

      {/* Departure Station */}
      {departureStations.length > 1 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#73C8D2]" />
            <label className="text-sm font-medium text-gray-700">Gare de départ</label>
          </div>
          <select
            value={filters.departureStation || ''}
            onChange={(e) => onFilterChange('departureStation', e.target.value || null)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#73C8D2] focus:outline-none focus:ring-1 focus:ring-[#73C8D2]"
          >
            <option value="">Toutes les gares</option>
            {departureStations.map(station => (
              <option key={station} value={station}>{station}</option>
            ))}
          </select>
        </div>
      )}

      {/* Arrival Station */}
      {arrivalStations.length > 1 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#FF9013]" />
            <label className="text-sm font-medium text-gray-700">Gare d'arrivée</label>
          </div>
          <select
            value={filters.arrivalStation || ''}
            onChange={(e) => onFilterChange('arrivalStation', e.target.value || null)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#73C8D2] focus:outline-none focus:ring-1 focus:ring-[#73C8D2]"
          >
            <option value="">Toutes les gares</option>
            {arrivalStations.map(station => (
              <option key={station} value={station}>{station}</option>
            ))}
          </select>
        </div>
      )}

      {/* Sort By */}
      <div className="space-y-3 border-t pt-6">
        <label className="text-sm font-medium text-gray-700">Trier par</label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange('sortBy', e.target.value as FilterState['sortBy'])}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#73C8D2] focus:outline-none focus:ring-1 focus:ring-[#73C8D2]"
        >
          <option value="time">Heure de départ</option>
          <option value="price">Prix (croissant)</option>
          <option value="duration">Durée</option>
          <option value="seats">Sièges disponibles</option>
        </select>
      </div>
    </Card>
  );
}