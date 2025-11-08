import { Calendar as CalendarIcon } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: string;
  onChange: (date: string) => void;
}

export const DateSelector = ({ selectedDate, onChange }: DateSelectorProps) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex items-center gap-3">
      <CalendarIcon className="w-5 h-5 text-slate-400" />
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
};