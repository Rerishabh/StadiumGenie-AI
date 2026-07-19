import React from 'react';

export default function StadiumSearch({ value = '', onChange }) {
  return (
    <div>
      <input
        type="search"
        placeholder="Search stadiums..."
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full p-2 border rounded"
      />
    </div>
  );
}