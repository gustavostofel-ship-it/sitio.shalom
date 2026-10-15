'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fallbackIcon?: React.ReactNode;
  fallbackCategory?: string;
}

export function SafeImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  sizes,
  fallbackIcon,
  fallbackCategory = 'Sítio Shalom Xerém',
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#1B4332]/90 to-[#0F291E] text-stone-200 p-6 text-center select-none ${
          fill ? 'absolute inset-0 w-full h-full' : ''
        } ${className}`}
        style={{ width: !fill ? width : undefined, height: !fill ? height : undefined }}
      >
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2 text-amber-300">
          {fallbackIcon || (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>
        <span className="text-xs tracking-wider uppercase text-amber-200/80 font-medium">
          {fallbackCategory}
        </span>
        <p className="text-sm font-serif text-white/90 mt-1 max-w-xs">{alt}</p>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        className={className}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 600}
      height={height || 400}
      priority={priority}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  );
}
