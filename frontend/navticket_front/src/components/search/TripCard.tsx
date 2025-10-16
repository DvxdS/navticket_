import { Clock, MapPin, Users, ArrowRight, Bus, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Trip } from '@/services/api';

interface TripCardProps {
  trip: Trip;
  onBook?: () => void;
}

function TripCard({ trip, onBook }: TripCardProps) {
  const navigate = useNavigate();
    
  const formatTime = (time: string) => time.slice(0, 5);
  
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('fr-FR').format(parseFloat(price));
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date);
  };
  
  const calculateDuration = () => {
    const hours = Math.floor(trip.route.duration_hours);
    const minutes = Math.round((trip.route.duration_hours - hours) * 60);
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}min`;
  };
  
  const getBusTypeBadge = () => {
    switch (trip.bus_type) {
      case 'vip': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'luxury': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };
  
  const getBusTypeLabel = () => {
    switch (trip.bus_type) {
      case 'vip': return 'VIP';
      case 'luxury': return 'Luxe';
      default: return 'Standard';
    }
  };

  // Handle reserve button click
  const handleReserveClick = () => {
    if (onBook) {
      // If parent provides custom handler, use it
      onBook();
    } else {
      // Otherwise, navigate to trip details page
      navigate(`/trip/${trip.id}`);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="p-6">
        {/* Header: Company, Bus Type & Date */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#73C8D2] to-[#0046FF]">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{trip.company_name}</h3>
              <p className="text-sm text-gray-500">Bus {trip.bus_number}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`${getBusTypeBadge()} border px-3 py-1`}>
              {getBusTypeLabel()}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Calendar className="h-3.5 w-3.5" />
              <span className="font-medium">{formatDate(trip.departure_date)}</span>
            </div>
          </div>
        </div>

        {/* Main Trip Info: Route & Time */}
        <div className="mb-4">
          <div className="relative flex items-center justify-between">
            {/* Departure */}
            <div className="flex-1 text-left">
              <p className="text-2xl font-bold text-gray-900">{formatTime(trip.departure_time)}</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4 text-[#73C8D2]" />
                {trip.route.origin_city.name}
              </p>
              {trip.departure_station && (
                <p className="mt-0.5 text-xs text-gray-500 pl-5">
                  {trip.departure_station.name}
                </p>
              )}
            </div>

            {/* Duration & Line */}
            <div className="flex flex-1 flex-col items-center px-4">
              <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {calculateDuration()}
              </div>
              <div className="relative w-full">
                <div className="h-0.5 w-full bg-gray-300"></div>
                <div className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#73C8D2]"></div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <ArrowRight className="h-4 w-4 text-[#73C8D2]" />
                </div>
                <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#FF9013]"></div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Direct</p>
            </div>

            {/* Arrival */}
            <div className="flex-1 text-right">
              <p className="text-2xl font-bold text-gray-900">{formatTime(trip.arrival_time)}</p>
              <p className="mt-1 flex items-center justify-end gap-1 text-sm font-medium text-gray-700">
                {trip.route.destination_city.name}
                <MapPin className="h-4 w-4 text-[#FF9013]" />
              </p>
              {trip.arrival_station && (
                <p className="mt-0.5 text-xs text-gray-500 pr-5">
                  {trip.arrival_station.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Seats Available */}
        <div className="mb-4 flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">
            {trip.available_seats > 10 ? (
              <span className="text-green-600 font-medium">{trip.available_seats} sièges disponibles</span>
            ) : trip.available_seats > 0 ? (
              <span className="text-orange-600 font-medium">Plus que {trip.available_seats} sièges !</span>
            ) : (
              <span className="text-red-600 font-medium">Complet</span>
            )}
          </span>
        </div>

        {/* Footer: Price & Book Button */}
        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <p className="text-sm text-gray-500">À partir de</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[#0046FF]">{formatPrice(trip.price)}</span>
              <span className="text-sm text-gray-500">FCFA</span>
            </div>
          </div>

          <Button
            onClick={handleReserveClick}
            disabled={!trip.can_be_booked}
            size="lg"
            className={`${trip.can_be_booked ? 'bg-[#FF9013] hover:bg-[#FF9013]/90 hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed'} px-8 font-semibold text-white transition-all duration-300`}
          >
            {trip.can_be_booked ? 'Réserver' : 'Complet'}
            {trip.can_be_booked && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="h-1 w-full bg-gradient-to-r from-[#73C8D2] via-[#0046FF] to-[#FF9013] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    </Card>
  );
}

export default TripCard;