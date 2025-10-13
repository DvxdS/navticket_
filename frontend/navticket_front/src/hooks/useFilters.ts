import { useState, useMemo } from 'react';
import type { Trip } from '@/services/api';

export interface FilterState {
  priceRange: [number, number];
  timeSlots: ('morning' | 'afternoon' | 'evening')[];
  busTypes: ('standard' | 'vip' | 'luxury')[];
  departureStation: string | null;
  arrivalStation: string | null;
  sortBy: 'price' | 'time' | 'duration' | 'seats';
}

const DEFAULT_FILTERS: FilterState = {
  priceRange: [0, 50000],
  timeSlots: [],
  busTypes: [],
  departureStation: null,
  arrivalStation: null,
  sortBy: 'time',
};

export function useFilters(trips: Trip[]) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Get min and max prices from trips
  const priceRange = useMemo(() => {
    if (trips.length === 0) return [0, 50000] as [number, number];  // ✅ Type assertion
    const prices = trips.map(t => parseFloat(t.price));
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    return [min, max] as [number, number];  // ✅ Type assertion
  }, [trips]);

  // Filter and sort trips
  const filteredTrips = useMemo(() => {
    let result = [...trips];

    // Price filter
    result = result.filter(trip => {
      const price = parseFloat(trip.price);
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Time slot filter
    if (filters.timeSlots.length > 0) {
      result = result.filter(trip => {
        const hour = parseInt(trip.departure_time.split(':')[0]);
        if (filters.timeSlots.includes('morning') && hour >= 6 && hour < 12) return true;
        if (filters.timeSlots.includes('afternoon') && hour >= 12 && hour < 18) return true;
        if (filters.timeSlots.includes('evening') && hour >= 18 && hour < 24) return true;
        return false;
      });
    }

    // Bus type filter
    if (filters.busTypes.length > 0) {
      result = result.filter(trip => filters.busTypes.includes(trip.bus_type));
    }

    // Station filters
    if (filters.departureStation) {
      result = result.filter(trip => 
        trip.departure_station?.name === filters.departureStation
      );
    }

    if (filters.arrivalStation) {
      result = result.filter(trip => 
        trip.arrival_station?.name === filters.arrivalStation
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'time':
          return a.departure_time.localeCompare(b.departure_time);
        case 'duration':
          return a.route.duration_hours - b.route.duration_hours;
        case 'seats':
          return b.available_seats - a.available_seats;
        default:
          return 0;
      }
    });

    return result;
  }, [trips, filters]);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return {
    filters,
    filteredTrips,
    priceRange,
    updateFilter,
    resetFilters,
  };
}