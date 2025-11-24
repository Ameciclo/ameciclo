import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Link } from "@remix-run/react";
import SectionCarouselLoading from "./SectionCarouselLoading";

export default function SectionCarousel({ featuredProjects = [], isLoading = false, hasApiError = false }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const autoplayIntervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const AUTOPLAY_DURATION = 5000;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const ProjectSlideWithPause = useCallback(({ project }) => (
    <ProjectSlide 
      project={project} 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    />
  ), []);

  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    loop: true,
    drag: true,
    mode: "free-snap",
    slides: {
      perView: 1,
      spacing: 0,
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  const startAutoplay = useCallback(() => {
    if (loaded && instanceRef.current && !autoplayIntervalRef.current) {
      setProgress(0);

      // Atualizar progresso a cada 100ms (reduzido de 50ms)
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / AUTOPLAY_DURATION) * 100;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 100);

      autoplayIntervalRef.current = setInterval(() => {
        instanceRef.current?.next();
        setProgress(0);
      }, AUTOPLAY_DURATION);
    }
  }, [loaded, AUTOPLAY_DURATION]);

  const stopAutoplay = useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (loaded && instanceRef.current) {
      if (!isPaused) {
        startAutoplay();
      } else {
        stopAutoplay();
      }
    }

    return () => {
      stopAutoplay();
    };
  }, [loaded, isPaused, startAutoplay, stopAutoplay]);

  if (isLoading || !featuredProjects || featuredProjects.length === 0) {
    return <SectionCarouselLoading />;
  }

  if (!isClient) {
    return (
      <section>
        <div className="mx-auto">
          <div className="navigation-wrapper">
            <div className="keen-slider" style={{ height: '400px' }}>
              <div className="keen-slider__slide">
                <ProjectSlideWithPause project={featuredProjects[0]} />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mx-auto">
        <div className="navigation-wrapper">
          <div
            ref={sliderRef}
            className="keen-slider"
            style={{ opacity: loaded ? 1 : 0 }}
          >
            {featuredProjects.map((project, index) => (
              <div key={`${project.id}-${index}`} className="keen-slider__slide">
                <ProjectSlide 
                  project={project} 
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                />
              </div>
            ))}
          </div>
          {loaded && instanceRef.current && (
            <>
              <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <Arrow
                  left
                  onClick={(e: any) => {
                    e.stopPropagation();
                    instanceRef.current?.prev();
                  }}
                  disabled={currentSlide === 0 && !instanceRef.current.options.loop}
                />
              </div>
              <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <Arrow
                  onClick={(e: any) => {
                    e.stopPropagation();
                    instanceRef.current?.next();
                  }}
                  disabled={
                    currentSlide === instanceRef.current.track.details.slides.length - 1 &&
                    !instanceRef.current.options.loop
                  }
                />
              </div>
            </>
          )}
          {loaded && instanceRef.current && (
            <div 
              className="dots-container"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="dots">
                {[...Array(instanceRef.current.track.details.slides.length)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      instanceRef.current?.moveToIdx(idx);
                      setProgress(0);
                    }}
                    className="dot-line"
                    style={{
                      width: '24px',
                      height: '3px',
                      backgroundColor: currentSlide === idx && isPaused ? '#00A870' : '#d1d5db',
                      border: 'none',
                      borderRadius: '2px',
                      margin: '0 4px',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#00A870';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#d1d5db';
                    }}
                  >
                    {currentSlide === idx && !isPaused && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          backgroundColor: '#00A870',
                          width: `${progress}%`,
                          transition: 'width 50ms linear'
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const ProjectSlide = memo(({ project, onMouseEnter, onMouseLeave }: any) => {
  const title = project.name || project.title || "";
  const description = project.description || "";
  const slug = project.slug || "";
  const imageUrl = project.media.url || "";

  useEffect(() => {
    console.log({
      name: project.name,
      description: project.description,
      slug: project.slug,
      imageUrl: project.media.url,
    })
  }, [])

  return (
    <div className="flex relative w-full h-full">
      <div className="w-full h-full">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>

        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div 
            className="rounded-lg shadow-xl bg-white bg-opacity-65 max-w-[320px] md:max-w-[800px] w-full"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <div className="flex items-center justify-center mt-3 md:mt-5 text-gray-800">
              <h1 className="text-xl md:text-3xl lg:text-6xl font-bold text-center px-2 leading-tight">{title}</h1>
            </div>
            <div className="mt-3 md:mt-5 text-center border-t border-gray-600">
              <div className="p-3 md:p-6 md:pr-24 md:pl-16 md:py-6">
                <p
                  className="text-base md:text-xl text-gray-800 leading-relaxed font-medium"
                  style={{
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {description}
                </p>
                {slug && (
                  <Link
                    to={`/projetos/${slug}`}
                    className="flex items-baseline justify-center mt-3 md:mt-3 text-ameciclo hover:text-red-600 focus:text-red-600 font-semibold"
                  >
                    <span className="text-base md:text-base">Conheça mais</span>
                    <span className="ml-1 text-sm">&#x279c;</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

function Arrow(props: any) {
  const disabledClass = props.disabled ? " arrow--disabled" : "";
  return (
    <svg
      onClick={props.onClick}
      className={`arrow ${props.left ? "arrow--left" : "arrow--right"
        } ${disabledClass}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      {props.left && (
        <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
      )}
      {!props.left && (
        <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
      )}
    </svg>
  );
}