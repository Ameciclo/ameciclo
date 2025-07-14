
export function SelectionFilter({ title, value, name, onChange, items }: any) {
  return (
    <div className="relative inline-block">
      <label className="block text-sm font-medium text-gray-600 mb-2">{title}</label>
      <div className="relative">
        <select
          className="appearance-none bg-[#008080] border-0 rounded-xl px-6 py-3 pr-10 text-white font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-all duration-200 cursor-pointer min-w-[200px]"
          value={value}
          name={name}
          onChange={onChange}
        >
          {items.map((s: any, index: number) => (
            <option key={s.value || index} value={s.value}>{s.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
