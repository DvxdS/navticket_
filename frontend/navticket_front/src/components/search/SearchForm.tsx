import { useState } from 'react';
import { MapPin, Calendar, ArrowRight, Repeat2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IVORIAN_CITIES } from '@/utils/constants.ts';

export default function SearchForm() {
  const [departure, setDeparture] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [passengers, setPassengers] = useState<string>('1');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  // Swap cities function
  const handleSwap = () => {
    const temp = departure;
    setDeparture(destination);
    setDestination(temp);
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!departure) {
      newErrors.departure = 'Veuillez sélectionner une ville de départ';
    }
    if (!destination) {
      newErrors.destination = 'Veuillez sélectionner une ville de destination';
    }
    if (departure && destination && departure === destination) {
      newErrors.destination = 'La destination doit être différente du départ';
    }
    if (!date) {
      newErrors.date = 'Veuillez sélectionner une date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Recherche:', { departure, destination, date, passengers });
      // TODO: Navigate to search results or call API
    }
  };

  return (
    <Card className="w-full max-w-5xl bg-white p-6 shadow-2xl">
      <form onSubmit={handleSearch}>
        {/* Desktop Layout */}
        <div className="hidden items-end gap-3 lg:flex">
          {/* Departure City */}
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Ville de départ
            </label>
            <Select value={departure} onValueChange={setDeparture}>
              <SelectTrigger className="h-12 border-gray-300">
                <SelectValue placeholder="Choisir une ville" />
              </SelectTrigger>
              <SelectContent>
                {IVORIAN_CITIES.map((city) => (
                  <SelectItem key={city.id} value={city.name}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#73C8D2]" />
                      <span>{city.name}</span>
                      <span className="text-xs text-gray-500">({city.region})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.departure && (
              <p className="text-xs text-red-500">{errors.departure}</p>
            )}
          </div>

          {/* Swap Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSwap}
            className="mb-7 h-12 w-12 rounded-full border border-gray-200 hover:border-[#73C8D2] hover:bg-[#73C8D2]/10"
          >
            <Repeat2 className="h-5 w-5 text-gray-600" />
          </Button>

          {/* Destination City */}
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Ville de destination
            </label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger className="h-12 border-gray-300">
                <SelectValue placeholder="Choisir une ville" />
              </SelectTrigger>
              <SelectContent>
                {IVORIAN_CITIES.map((city) => (
                  <SelectItem key={city.id} value={city.name}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#73C8D2]" />
                      <span>{city.name}</span>
                      <span className="text-xs text-gray-500">({city.region})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.destination && (
              <p className="text-xs text-red-500">{errors.destination}</p>
            )}
          </div>

          {/* Date */}
          <div className="w-48 space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Date de départ
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                className="h-12 border-gray-300 pl-10"
              />
            </div>
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Passengers */}
          <div className="w-32 space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Passagers
            </label>
            <Select value={passengers} onValueChange={setPassengers}>
              <SelectTrigger className="h-12 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{num}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            size="lg"
            className="mb-7 h-12 bg-[#FF9013] px-8 font-semibold text-white shadow-lg hover:bg-[#FF9013]/90 hover:shadow-xl"
          >
            Rechercher
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="space-y-4 lg:hidden">
          {/* Departure */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Ville de départ
            </label>
            <Select value={departure} onValueChange={setDeparture}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Choisir une ville" />
              </SelectTrigger>
              <SelectContent>
                {IVORIAN_CITIES.map((city) => (
                  <SelectItem key={city.id} value={city.name}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#73C8D2]" />
                      <span>{city.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.departure && (
              <p className="text-xs text-red-500">{errors.departure}</p>
            )}
          </div>

          {/* Swap Button - Centered */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleSwap}
              className="h-10 w-10 rounded-full border border-gray-200"
            >
              <Repeat2 className="h-5 w-5 text-gray-600" />
            </Button>
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Ville de destination
            </label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Choisir une ville" />
              </SelectTrigger>
              <SelectContent>
                {IVORIAN_CITIES.map((city) => (
                  <SelectItem key={city.id} value={city.name}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#73C8D2]" />
                      <span>{city.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.destination && (
              <p className="text-xs text-red-500">{errors.destination}</p>
            )}
          </div>

          {/* Date & Passengers Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={today}
                  className="h-12 pl-10"
                />
              </div>
              {errors.date && (
                <p className="text-xs text-red-500">{errors.date}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Passagers
              </label>
              <Select value={passengers} onValueChange={setPassengers}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{num}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button - Full Width */}
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full bg-[#FF9013] font-semibold text-white shadow-lg hover:bg-[#FF9013]/90"
          >
            Rechercher
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </form>
    </Card>
  );
}