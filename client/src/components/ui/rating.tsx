import { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  max?: number;
  value: number;
  onChange: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Rating({
  max = 5,
  value,
  onChange,
  readOnly = false,
  size = 'md',
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const getStarSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-8 h-8';
      default: return 'w-6 h-6';
    }
  };

  return (
    <div className="flex">
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        const isActive = (hoverValue ?? value) >= starValue;
        
        return (
          <button
            key={index}
            type="button"
            className={`
              ${getStarSize()}
              ${isActive ? 'text-yellow-400' : 'text-gray-300'}
              ${!readOnly ? 'hover:scale-110 transition-transform' : ''}
              focus:outline-none
              p-0
              mr-1
            `}
            onClick={() => !readOnly && onChange(starValue)}
            onMouseEnter={() => !readOnly && setHoverValue(starValue)}
            onMouseLeave={() => !readOnly && setHoverValue(null)}
            disabled={readOnly}
          >
            <Star className="fill-current" />
          </button>
        );
      })}
    </div>
  );
}