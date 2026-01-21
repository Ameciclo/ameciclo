export default function CounterLoading({ label }: { label: string }) {
  return (
    <div className="p-2 m-2 md:p-4 md:m-4 text-center text-white uppercase">
      <div className="animate-pulse bg-white/20 rounded h-16 md:h-24 w-32 md:w-48 mx-auto mb-2" />
      <span className="text-xl md:text-3xl">{label}</span>
    </div>
  );
}