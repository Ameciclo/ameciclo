import { useState, useRef, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: ReactNode[];
  cardWidth?: number;
  gap?: number;
}

export function Carousel({ children, cardWidth = 200, gap = 16 }: CarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => {
            const newPosition = Math.max(0, scrollPosition - (cardWidth + gap));
            setScrollPosition(newPosition);
            containerRef.current?.scrollTo({ left: newPosition, behavior: 'smooth' });
          }}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        
        <div 
          ref={containerRef}
          className={`flex gap-4 overflow-x-scroll flex-1 select-none hide-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x'
          }}
          onMouseDown={(e) => {
            setIsDragging(true);
            setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
            setScrollLeft(containerRef.current?.scrollLeft || 0);
          }}
          onMouseLeave={() => setIsDragging(false)}
          onMouseUp={() => setIsDragging(false)}
          onMouseMove={(e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - (containerRef.current?.offsetLeft || 0);
            const walk = (x - startX) * 2;
            if (containerRef.current) {
              containerRef.current.scrollLeft = scrollLeft - walk;
            }
          }}

          onScroll={(e) => setScrollPosition((e.target as HTMLElement).scrollLeft)}
        >
          {children}
        </div>
        
        <button 
          onClick={() => {
            const maxScroll = (children.length * (cardWidth + gap)) - (containerRef.current?.clientWidth || 0);
            const newPosition = Math.min(maxScroll, scrollPosition + (cardWidth + gap));
            setScrollPosition(newPosition);
            containerRef.current?.scrollTo({ left: newPosition, behavior: 'smooth' });
          }}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}