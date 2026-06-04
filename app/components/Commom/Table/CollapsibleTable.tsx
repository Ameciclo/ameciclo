"use client";

import { useState } from "react";
import Table from "./Table";

interface CollapsibleTableProps {
  title: string;
  subtitle?: string;
  data: any[];
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  columns: any[];
}

export function CollapsibleTable({
  title,
  subtitle,
  data,
  showFilters,
  setShowFilters,
  columns,
}: CollapsibleTableProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span className="text-sm text-gray-400">
            {expanded ? "Ocultar" : "Exibir"}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100">
          <Table
            title=""
            data={data}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            columns={columns}
          />
        </div>
      )}
    </div>
  );
}

export default CollapsibleTable;
