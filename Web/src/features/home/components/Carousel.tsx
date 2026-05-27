import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface CarouselSlide {
  id: string;
  title?: string;
  description?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  content?: React.ReactNode;
  link?: string;
}

interface CarouselProps {
  slides: CarouselSlide[];
  autoPlayInterval?: number;
  showArrows?: boolean;
  showIndicators?: boolean;
  height?: string;
  overlayOpacity?: string;
}

export const Carousel = ({
  slides,
  autoPlayInterval = 5000,
  showArrows = true,
  showIndicators = true,
  height = "500px",
  overlayOpacity = "bg-black/50",
}: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    if (autoPlayInterval > 0) {
      const interval = setInterval(nextSlide, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlayInterval, nextSlide]);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg`}
      style={{ height }}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 overflow-hidden">
            {slide.backgroundImage ? (
              <img
                src={slide.backgroundImage}
                alt=""
                className="w-full h-full object-cover"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: slide.backgroundColor || "bg-primary",
                }}
              />
            )}
          </div>
          <div className={`absolute inset-0 ${overlayOpacity}`} />
          {slide.content ? (
            slide.content
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              {slide.title && (
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-4xl">
                  {slide.title}
                </h2>
              )}
              {slide.description && (
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mb-6">
                  {slide.description}
                </p>
              )}
              {slide.link && (
                <Link
                  to={slide.link}
                  className="inline-flex z-10 items-center text-white gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm hover:scale-105 px-4 py-2 rounded-full font-semibold transition-all"
                >
                  Ver más
                  <ChevronRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          )}
        </div>
      ))}

      {showArrows && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {showIndicators && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
