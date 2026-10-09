import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search patients by name or ID...',
}) => {
  return (
    <div className="search-bar-wrapper">
      <Search size={18} className="search-icon" />
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          className="search-clear-btn"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}

      <style>{`
        .search-bar-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 400px;
        }
        .search-icon {
          position: absolute;
          left: 0.875rem;
          color: var(--text-muted);
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          padding: 0.625rem 2.5rem 0.625rem 2.5rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-size: 0.9375rem;
          background-color: #ffffff;
          transition: all var(--transition-fast);
        }
        .search-input:focus {
          outline: none;
          border-color: var(--primary-600);
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
        }
        .search-clear-btn {
          position: absolute;
          right: 0.75rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          border-radius: 50%;
        }
        .search-clear-btn:hover {
          color: var(--text-primary);
          background-color: var(--border-subtle);
        }
      `}</style>
    </div>
  );
};
