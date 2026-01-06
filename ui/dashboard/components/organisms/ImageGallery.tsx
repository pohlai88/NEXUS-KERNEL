import React, { useState, useEffect, useCallback } from 'react';
import { IconClose } from '../atoms/icons';

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  thumbnail?: string;
}

export interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: number;
  gap?: string;
  aspectRatio?: string;
  onImageClick?: (image: GalleryImage, index: number) => void;
  className?: string;
}

export function ImageGallery({
  images,
  columns = 3,
  gap = 'var(--space-4)',
  aspectRatio = '1 / 1',
  onImageClick,
  className = '',
}: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    onImageClick?.(images[index], index);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToNext = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, goToNext, goToPrevious]);

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: gap,
  };

  const imageContainerStyles: React.CSSProperties = {
    position: 'relative',
    aspectRatio: aspectRatio,
    overflow: 'hidden',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    backgroundColor: 'var(--color-gray-100)',
  };

  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  };

  const overlayStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-4)',
    opacity: 0,
    transition: 'all 0.3s ease',
  };

  const overlayTextStyles: React.CSSProperties = {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 'var(--text-body-size)',
    fontWeight: 600,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  };

  // Lightbox styles
  const lightboxBackdropStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 'var(--space-8)',
  };

  const lightboxContentStyles: React.CSSProperties = {
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-4)',
  };

  const lightboxImageStyles: React.CSSProperties = {
    maxWidth: '100%',
    maxHeight: '80vh',
    objectFit: 'contain',
    borderRadius: 'var(--radius-lg)',
  };

  const lightboxInfoStyles: React.CSSProperties = {
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: '600px',
  };

  const lightboxTitleStyles: React.CSSProperties = {
    fontSize: 'var(--text-title-size)',
    fontWeight: 600,
    marginBottom: 'var(--space-2)',
  };

  const lightboxDescriptionStyles: React.CSSProperties = {
    fontSize: 'var(--text-body-size)',
    color: 'var(--color-gray-300)',
  };

  const closeButtonStyles: React.CSSProperties = {
    position: 'absolute',
    top: 'var(--space-4)',
    right: 'var(--space-4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    padding: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    zIndex: 10,
  };

  const navButtonStyles = (side: 'left' | 'right'): React.CSSProperties => ({
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: 'var(--text-title-size)',
    fontWeight: 600,
    transition: 'background-color 0.2s ease',
  });

  const counterStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: 'var(--space-4)',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: 'var(--space-2) var(--space-4)',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#FFFFFF',
    fontSize: 'var(--text-body-size)',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
  };

  const currentImage = lightboxOpen ? images[lightboxIndex] : null;

  return (
    <>
      {/* Gallery Grid */}
      <div className={className} style={gridStyles}>
        {images.map((image, index) => (
          <div
            key={image.id}
            style={imageContainerStyles}
            onClick={() => openLightbox(index)}
            onMouseEnter={(e) => {
              const img = e.currentTarget.querySelector('img') as HTMLImageElement;
              const overlay = e.currentTarget.querySelector('.overlay') as HTMLDivElement;
              if (img) img.style.transform = 'scale(1.1)';
              if (overlay) {
                overlay.style.opacity = '1';
                overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              const img = e.currentTarget.querySelector('img') as HTMLImageElement;
              const overlay = e.currentTarget.querySelector('.overlay') as HTMLDivElement;
              if (img) img.style.transform = 'scale(1)';
              if (overlay) {
                overlay.style.opacity = '0';
                overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
              }
            }}
          >
            <img
              src={image.thumbnail || image.src}
              alt={image.alt}
              style={imageStyles}
            />
            {(image.title || image.description) && (
              <div className="overlay" style={overlayStyles}>
                {image.title && <div style={overlayTextStyles}>{image.title}</div>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && currentImage && (
        <div
          style={lightboxBackdropStyles}
          onClick={closeLightbox}
        >
          <div
            style={lightboxContentStyles}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              style={lightboxImageStyles}
            />
            {(currentImage.title || currentImage.description) && (
              <div style={lightboxInfoStyles}>
                {currentImage.title && (
                  <div style={lightboxTitleStyles}>{currentImage.title}</div>
                )}
                {currentImage.description && (
                  <div style={lightboxDescriptionStyles}>{currentImage.description}</div>
                )}
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={closeLightbox}
            style={closeButtonStyles}
            aria-label="Close lightbox"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <IconClose size={24} />
          </button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                style={navButtonStyles('left')}
                aria-label="Previous image"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                style={navButtonStyles('right')}
                aria-label="Next image"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                ›
              </button>
            </>
          )}

          {/* Counter */}
          <div style={counterStyles}>
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

export default ImageGallery;
