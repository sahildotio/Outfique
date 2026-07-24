import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";

const slides = [
  [
    {
      title: "NEW THIS WEEK",
      image:
        "https://d2d5n4ft74bagm.cloudfront.net/media/banners/c39322c5-ce8c-4a00-b351-ec19135e3a75/1784292515.png?w=90",
      path: "/shirts",
    },
    {
      title: "FOR THE FRIDAYS",
      image:
        "https://d2d5n4ft74bagm.cloudfront.net/media/shop-by-occasion/85c52675-d3ab-4a07-822e-127ab173e314/1780918798.jpeg?w=90",
      path: "/pants",
    },
    {
      title: "LINEN EDIT",
      subtitle: "SOFT ON SKIN. SHARP ON STYLE.",
      image:
        "https://i.pinimg.com/736x/f2/66/5d/f2665dd75ab5c2d27002a3adb9298a93.jpg",
      path: "/shoes",
    },
  ],
  [
    {
      title: "DENIM DROP",
      image:
        "https://i.pinimg.com/736x/94/bf/2f/94bf2f1dfcd45550da8df69cbba6dfe9.jpg",
      path: "/jeans",
    },
    {
      title: "OFFICE READY",
      image:
        "https://i.pinimg.com/vwebp/736x/48/c9/48/48c948f46d8691a7b4c717b934fba778.webp",
      path: "/trousers",
    },
    {
      title: "STREET CARGO",
      image:
        "https://i.pinimg.com/736x/36/6d/fd/366dfdd66097d9757313b1c1c9dc494e.jpg",
      path: "/cargos",
    },
  ],
];

const AUTO_DELAY = 4000;

/* ---------------- Lazy Image ---------------- */

const LazyImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
};

/* ---------------- Hero Carousel ---------------- */

const HeroCarousel = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const navigate = useNavigate();
  const total = slides.length;

  const goTo = useCallback(
    (idx) => {
      setActiveIdx((idx + total) % total);
    },
    [total],
  );

  // Auto Scroll
  useEffect(() => {
    if (total <= 1) return;

    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % total);
    }, AUTO_DELAY);

    return () => clearInterval(interval);
  }, [total]);

  // Preload next slide
  useEffect(() => {
    const nextSlide = slides[(activeIdx + 1) % total];

    nextSlide.forEach((banner) => {
      const img = new Image();
      img.src = banner.image;
    });
  }, [activeIdx, total]);

  const currentSlide = slides[activeIdx];

  return (
    <div className="w-full py-6 select-none">
      {/* Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-[420px] md:h-[520px]">
        {currentSlide.map((banner, i) => (
          <div
            key={i}
            onClick={() => navigate(banner.path)}
            className="relative overflow-hidden rounded-2xl cursor-pointer group h-full w-full"
          >
            {/* Image Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeIdx}-${i}-${banner.image}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <LazyImage
                  src={banner.image}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            </AnimatePresence>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* Text Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${activeIdx}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="absolute bottom-6 left-6 right-6"
              >
                <h2 className="text-white text-3xl md:text-4xl font-extrabold uppercase tracking-wider leading-none">
                  {banner.title}
                </h2>

                {banner.subtitle && (
                  <p className="text-white/90 text-xs md:text-sm mt-2 uppercase tracking-wide">
                    {banner.subtitle}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-6 gap-2">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            type="button"
            onClick={() => goTo(index)}
            animate={{
              width: index === activeIdx ? 28 : 8,
            }}
            transition={{ duration: 0.3 }}
            className={`h-2 rounded-full ${
              index === activeIdx
                ? "bg-black dark:bg-white"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
