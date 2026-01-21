import { Filter } from 'lucide-react';

export function SelectionFilter({ title, value, name, onChange, items }: any) {
  const filterId = `filter-${name || title?.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="flex items-center gap-4">
      <label htmlFor={filterId} className="flex items-center gap-2 text-sm font-semibold text-gray-700 whitespace-nowrap">
        <Filter size={18} className="text-[#008080]" />
        {title}
      </label>
      <div className="relative group">
        <select
          id={filterId}
          className="appearance-none bg-white border-2 border-gray-200 rounded-lg px-5 py-3 pr-12 text-gray-800 font-medium shadow-sm hover:border-[#008080] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all duration-200 cursor-pointer min-w-[320px] text-sm"
          value={value}
          name={name}
          onChange={onChange}
          aria-label={title}
        >
          {items.map((s: any, index: number) => (
            <option key={s.value || index} value={s.value}>{s.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400 group-hover:text-[#008080] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
