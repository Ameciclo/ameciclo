import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

type SearchProjectProps = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
};

export default function SearchProject({
  searchTerm,
  setSearchTerm,
}: SearchProjectProps) {
  const [isSticky, setIsSticky] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [initialOffsetTop, setInitialOffsetTop] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after component mounts on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Use useLayoutEffect to ensure DOM is ready before measuring, only on client
  useLayoutEffect(() => {
    if (!isClient) return; // Only run on client

    const calculateOffset = () => {
      if (searchRef.current) {
        setInitialOffsetTop(searchRef.current.getBoundingClientRect().top + window.scrollY);
      }
    };

    calculateOffset(); // Calculate on mount

    // Recalculate on window resize
    window.addEventListener('resize', calculateOffset);
    return () => {
      window.removeEventListener('resize', calculateOffset);
    };
  }, [isClient]); // Dependency on isClient

  useEffect(() => {
    if (!isClient) return; // Only run on client

    const handleScroll = () => {
      if (searchRef.current) {
        if (window.scrollY > initialOffsetTop && !isSticky) {
          setIsSticky(true);
        } else if (window.scrollY <= initialOffsetTop && isSticky) {
          setIsSticky(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [initialOffsetTop, isSticky, isClient]); // Dependencies are correct here

  return (
    <div
      ref={searchRef}
      className={`w-[300px] px-4 py-2 border border-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white ${isSticky ? 'fixed top-[66px] right-4 z-[100]' : ''}`}
    >
      <input
        type="text"
        placeholder="Buscar projetos por título..."
        className="w-full bg-white outline-none font-bold"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
