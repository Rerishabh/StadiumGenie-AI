import React from 'react';
import Button from './Button';

export default function EmptyState({ title, description, actionText, onAction }) {
  return (
    <div className="p-6 text-center">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
      {actionText && onAction && (
        <Button onClick={onAction}>{actionText}</Button>
      )}
    </div>
  );
}