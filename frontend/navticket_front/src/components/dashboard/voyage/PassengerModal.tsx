import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Users, Mail, Phone, CreditCard } from 'lucide-react';
import voyageService from '@/services/voyage';
import type { TripPassengersResponse } from '@/types/voyage.types';

interface PassengersModalProps {
  tripId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PassengersModal = ({ tripId, isOpen, onClose }: PassengersModalProps) => {
  const [data, setData] = useState<TripPassengersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tripId && isOpen) {
      fetchPassengers();
    }
  }, [tripId, isOpen]);

  const fetchPassengers = async () => {
    if (!tripId) return;
    
    setIsLoading(true);
    try {
      const response = await voyageService.getTripPassengers(tripId);
      setData(response);
    } catch (err) {
      console.error('Error fetching passengers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      completed: {
        label: 'Payé',
        className: 'bg-green-50 text-green-700 border-green-200',
      },
      pending: {
        label: 'En attente',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      },
      failed: {
        label: 'Échoué',
        className: 'bg-red-50 text-red-700 border-red-200',
      },
    };

    const statusConfig = config[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-800 border-gray-300',
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}
      >
        {statusConfig.label}
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Users className="w-6 h-6 text-blue-600" />
            Liste des passagers
          </DialogTitle>
          {data && (
            <DialogDescription className="text-slate-600">
              {data.data.trip.route} • {data.data.trip.departure_date} à {data.data.trip.departure_time}
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : data ? (
          <div className="space-y-6 mt-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 mb-1">Total passagers</p>
                <p className="text-2xl font-bold text-blue-900">
                  {data.data.total_passengers}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 mb-1">Sièges occupés</p>
                <p className="text-2xl font-bold text-green-900">
                  {data.data.trip.total_seats - data.data.trip.available_seats}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Sièges disponibles</p>
                <p className="text-2xl font-bold text-slate-900">
                  {data.data.trip.available_seats}
                </p>
              </div>
            </div>

            {/* Passengers List */}
            {data.data.passengers.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <p className="text-slate-600">Aucun passager pour ce trajet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.data.passengers.map((passenger) => (
                  <div
                    key={passenger.id}
                    className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg text-slate-900">
                            {passenger.full_name}
                          </h4>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            Siège {passenger.seat_number}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{passenger.phone}</span>
                          </div>
                          {passenger.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{passenger.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <span className="text-xs text-slate-500">
                              Ref: {passenger.booking_reference}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {getPaymentStatusBadge(passenger.payment_status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};