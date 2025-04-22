'use client';

import clsx from 'clsx';

interface ColourSelectorProps {
  colourMap: Record<string, string>;
  originalColour: string;
  selectedColour: string;
  onSelect: (colour: string) => void;
}

export const ColourSelector = ({
  colourMap,
  originalColour,
  selectedColour,
  onSelect,
}: ColourSelectorProps) => {
  return (
    <div className="flex gap-2 flex-wrap">
      <div
        className={clsx(
          'w-8 h-8 rounded-full border cursor-pointer',
          selectedColour === originalColour && 'ring-2 ring-black'
        )}
        style={{ backgroundColor: originalColour }}
        onClick={() => onSelect(originalColour)}
      />
      {Object.entries(colourMap).map(([label, hex]) => (
        <div
          key={label}
          className={clsx(
            'w-8 h-8 rounded-full border cursor-pointer',
            selectedColour === label && 'ring-2 ring-black'
          )}
          style={{ backgroundColor: `#${hex}` }}
          onClick={() => onSelect(label)}
        />
      ))}
    </div>
  );
};
