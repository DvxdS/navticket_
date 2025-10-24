// Frontend/src/components/dashboard/StatusBadge.tsx

interface StatusBadgeProps {
    status: 'active' | 'cancelled' | 'completed' | 'confirmed' | 'pending';
    type?: 'trip' | 'booking';
  }
  
  export const StatusBadge = ({ status, type = 'trip' }: StatusBadgeProps) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      // Trip statuses
      active: {
        label: 'Actif',
        className: 'bg-green-50 text-green-700 border-green-200',
      },
      completed: {
        label: 'Terminé',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      cancelled: {
        label: 'Annulé',
        className: 'bg-red-50 text-red-700 border-red-200',
      },
      // Booking statuses
      confirmed: {
        label: 'Confirmé',
        className: 'bg-green-50 text-green-700 border-green-200',
      },
      pending: {
        label: 'En attente',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      },
    };
  
    const config = statusConfig[status];
  
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}
      >
        {config.label}
      </span>
    );
  };