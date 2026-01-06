import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IconChevronLeft, IconChevronRight } from '../atoms/icons';

export interface CarouselSlide {
  id: string;
  content: React.ReactNode;
  alt?: string;
}

export interface CarouselProps {
  slides: CarouselSlide[];
  autoplay?: boolean;
  autoplayInterval?: number;
  showIndicators?: boolean;
  showNavigation?: boolean;
  loop?: boolean;
  height?: string;
  aspectRatio?: string;
  className?: string;
}

export function Carousel({
  slides,
  autoplay = false,
  autoplayInterval = 5000,
  showIndicators = true,
  showNavigation = true,
  loop = true,
  height = '400px',
  aspectRatio,
  className = '',
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = useCallback((index: number) => {
    if (index < 0) {
      setCurrentIndex(loop ? slides.length - 1 : 0);
    } else if (index >= slides.length) {
      setCurrentIndex(loop ? 0 : slides.length - 1);
    } else {
      setCurrentIndex(index);
    }
  }, [slides.length, loop]);

  const goToNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const goToPrevious = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Autoplay functionality
  useEffect(() => {
    if (autoplay && !isHovered) {
      autoplayTimerRef.current = setInterval(goToNext, autoplayInterval);
      return () => {
        if (autoplayTimerRef.current) {
          clearInterval(autoplayTimerRef.current);
        }
      };
    }
  }, [autoplay, isHovered, autoplayInterval, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: aspectRatio ? 'auto' : height,
    aspectRatio: aspectRatio || 'auto',
    overflow: 'hidden',
    backgroundColor: 'var(--color-gray-900)',
    borderRadius: 'var(--radius-lg)',
  };

  const slidesContainerStyles: React.CSSProperties = {
    display: 'flex',
    height: '100%',
    transition: 'transform 0.5s ease-in-out',
    transform: `translateX(-${currentIndex * 100}%)`,
  };

  const slideStyles: React.CSSProperties = {
    minWidth: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const navigationButtonStyles = (side: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    [side]: 'var(--space-4)',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    padding: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: 'var(--color-gray-900)',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    opacity: isHovered ? 1 : 0,
    transition: 'all 0.3s ease',
    zIndex: 10,
  });

  const indicatorsContainerStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: 'var(--space-4)',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 'var(--space-2)',
    zIndex: 10,
  };

  const indicatorStyles = (isActive: boolean): React.CSSProperties => ({
    width: isActive ? '32px' : '12px',
    height: '12px',
    backgroundColor: isActive ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.5)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  });

  const counterStyles: React.CSSProperties = {
    position: 'absolute',
    top: 'var(--space-4)',
    right: 'var(--space-4)',
    padding: 'var(--space-2) var(--space-3)',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#FFFFFF',
    fontSize: 'var(--text-caption-size)',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    zIndex: 10,
  };

  return (
    <div
      className={className}
      style={containerStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div style={slidesContainerStyles}>
        {slides.map((slide) => (
          <div key={slide.id} style={slideStyles}>
            {slide.content}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {showNavigation && slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            style={navigationButtonStyles('left')}
            aria-label="Previous slide"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <IconChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            style={navigationButtonStyles('right')}
            aria-label="Next slide"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <IconChevronRight size={24} />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && slides.length > 1 && (
        <div style={indicatorsContainerStyles}>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              style={indicatorStyles(index === currentIndex)}
              aria-label={`Go to slide ${index + 1}`}
              onMouseEnter={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      <div style={counterStyles}>
        {currentIndex + 1} / {slides.length}
      </div>
    </div>
  );
}

export default Carousel;
