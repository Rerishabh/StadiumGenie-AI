import React from 'react';

export default function EventSearch({ value = '', onChange }) {
  return (
    <div>
      <input
        type="search"
        placeholder="Search events..."
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full p-2 border rounded"
      />
    </div>
  );
}