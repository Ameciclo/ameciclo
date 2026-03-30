import { Filter } from 'lucide-react';
import { Select } from '~/components/ui/select';
import { Label } from '~/components/ui/label';
import { cn } from '~/lib/utils';

export function SelectionFilter({ title, value, name, onChange, items }: any) {
  const filterId = `filter-${name || title?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex items-center gap-4">
      <Label htmlFor={filterId} className="flex items-center gap-2 text-sm font-semibold text-gray-700 whitespace-nowrap">
        <Filter size={18} className="text-[#008080]" />
        {title}
      </Label>
      <Select
        id={filterId}
        className="min-w-[320px] border-2 border-gray-200 px-5 py-3 pr-12 text-gray-800 font-medium shadow-sm hover:border-[#008080] hover:shadow-md transition-all duration-200 cursor-pointer text-sm h-auto"
        value={value}
        name={name}
        onChange={onChange}
        aria-label={title}
      >
        {items.map((s: any, index: number) => (
          <option key={s.value || index} value={s.value}>{s.label}</option>
        ))}
      </Select>
    </div>
  );
}
