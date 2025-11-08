interface StatusBadgeProps {
  status: 'active' | 'cancelled' | 'completed' | 'confirmed' | 'pending' | string;
  type?: 'trip' | 'booking';
}

export const StatusBadge = ({ status, type = 'trip' }: StatusBadgeProps) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    // Trip statuses
    active: {
      label: 'Actif',
      className: 'bg-green-50 text-green-700 border-green-200',
    },
    scheduled: {
      label: 'Programmé',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    completed: {
      label: 'Terminé',
      className: 'bg-gray-50 text-gray-700 border-gray-200',
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

  // ✅ Fallback for unknown statuses
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
};