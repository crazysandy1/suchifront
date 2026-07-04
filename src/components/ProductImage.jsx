import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * ProductImage — displays a product image served from the backend.
 *
 * Props:
 *   productId   — string  — product UUID
 *   hasImage    — bool    — from API `has_image` flag (avoids unnecessary 404 requests)
 *   alt         — string  — alt text
 *   className   — string  — Tailwind classes for the <img> / placeholder container
 *   placeholderClass — string — extra classes on the placeholder
 *   size        — 'sm' | 'md' | 'lg' — preset sizes
 */
export default function ProductImage({
  productId,
  hasImage = false,
  alt = 'Product image',
  className = '',
  placeholderClass = '',
  size = 'md',
}) {
  const [error, setError] = useState(false);

  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-full h-52',
  };

  const baseSize = sizeMap[size] || sizeMap.md;

  if (!hasImage || error) {
    return (
      <div
        className={`${baseSize} ${placeholderClass} bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl flex items-center justify-center flex-shrink-0 ${className}`}
        title="No image available"
      >
        <ImageIcon className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6'} text-emerald-300`} />
      </div>
    );
  }

  return (
    <img
      src={`${API_BASE}/products/${productId}/image`}
      alt={alt}
      onError={() => setError(true)}
      className={`${baseSize} object-cover rounded-xl flex-shrink-0 ${className}`}
    />
  );
}
