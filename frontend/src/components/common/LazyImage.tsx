import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /**
   * Placeholder shown while image is loading
   * 'blur' - uses a blurred placeholder
   * 'skeleton' - shows animated skeleton
   * 'color' - solid color background
   */
  placeholder?: 'blur' | 'skeleton' | 'color';
  /**
   * Blur data URL for 'blur' placeholder type
   * Should be a tiny base64 encoded image
   */
  blurDataURL?: string;
  /**
   * Background color for 'color' placeholder type
   */
  placeholderColor?: string;
  /**
   * Aspect ratio to maintain while loading (e.g., '16/9', '1/1', '4/3')
   */
  aspectRatio?: string;
  /**
   * Enable native lazy loading (default: true)
   */
  lazy?: boolean;
  /**
   * Callback when image finishes loading
   */
  onLoadComplete?: () => void;
}

/**
 * LazyImage - Mobile-optimized image component
 *
 * Features:
 * - Native lazy loading
 * - Placeholder support (skeleton, blur, color)
 * - Aspect ratio preservation
 * - Fade-in animation on load
 * - Intersection Observer for precise loading control
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'skeleton',
  blurDataURL,
  placeholderColor = '#e2e8f0',
  aspectRatio,
  lazy = true,
  onLoadComplete,
  className = '',
  style,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);

  // Use Intersection Observer for more precise lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading slightly before image comes into view
        threshold: 0,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [lazy]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadComplete?.();
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...(aspectRatio && { aspectRatio }),
    ...style,
  };

  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.3s ease',
    opacity: isLoaded ? 0 : 1,
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.3s ease',
    opacity: isLoaded ? 1 : 0,
  };

  const renderPlaceholder = () => {
    if (placeholder === 'blur' && blurDataURL) {
      return (
        <img
          src={blurDataURL}
          alt=""
          aria-hidden="true"
          style={{
            ...placeholderStyle,
            filter: 'blur(10px)',
            transform: 'scale(1.1)', // Prevent blur edges from showing
          }}
        />
      );
    }

    if (placeholder === 'skeleton') {
      return (
        <div
          className="skeleton"
          style={{
            ...placeholderStyle,
            backgroundColor: placeholderColor,
          }}
        />
      );
    }

    // Color placeholder
    return (
      <div
        style={{
          ...placeholderStyle,
          backgroundColor: placeholderColor,
        }}
      />
    );
  };

  return (
    <div className={`lazy-image-container ${className}`} style={containerStyle}>
      {renderPlaceholder()}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        loading={lazy ? 'lazy' : undefined}
        decoding="async"
        onLoad={handleLoad}
        style={imageStyle}
        {...props}
      />
    </div>
  );
};

export default LazyImage;
