import { useState, useEffect, useRef } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Link } from "@remix-run/react";

export default function SectionCarousel({ featuredProjects = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayIntervalRef = useRef(null);
  
  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    loop: true,
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

  const startAutoplay = () => {
    if (loaded && instanceRef.current && !autoplayIntervalRef.current) {
      autoplayIntervalRef.current = setInterval(() => {
        instanceRef.current?.next();
      }, 5000);
    }
  };

  const stopAutoplay = () => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (loaded && instanceRef.current) {
      if (!isPaused) {
        startAutoplay();
      }
      
      return () => {
        stopAutoplay();
      };
    }
  }, [loaded, instanceRef, isPaused]);

  const demoProjects = [
    {
      id: "1",
      name: "Ciclomobilidade Inclusiva",
      description: "Promovendo o uso da bicicleta como meio de transporte para todos",
      slug: "ciclomobilidade-inclusiva",
      media: { url: "/a1.gif" }
    },
    {
      id: "2",
      name: "Bicicleta nas Escolas",
      description: "Educação sobre mobilidade sustentável para crianças e jovens",
      slug: "bicicleta-nas-escolas",
      media: { url: "/b1.gif" }
    }
  ];

  const projectsToShow = featuredProjects?.length > 0 ? featuredProjects : demoProjects;

  return (
    <section>
      <div className="mx-auto">
        <div className="navigation-wrapper">
          <div 
            ref={sliderRef} 
            className="keen-slider"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {projectsToShow.map((project, index) => (
              <div key={project.id || index} className="keen-slider__slide">
                <ProjectSlide project={project} />
              </div>
            ))}
          </div>
          {loaded && instanceRef.current && (
            <>
              <Arrow
                left
                onClick={(e: any) => {
                  e.stopPropagation();
                  instanceRef.current?.prev();
                }}
                disabled={currentSlide === 0 && !instanceRef.current.options.loop}
              />
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
            </>
          )}
          {loaded && instanceRef.current && (
            <div className="dots">
              {[...Array(instanceRef.current.track.details.slides.length)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => instanceRef.current?.moveToIdx(idx)}
                  className={`dot${currentSlide === idx ? " active" : ""}`}
                ></button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProjectSlide({ project }: any) {
  const title = project.name || project.title || "";
  const description = project.description || "";
  const slug = project.slug || "";
  
  let imageUrl = "/backgroundImage.webp";
  if (project.media && project.media.url) {
    imageUrl = project.media.url;
  } else if (project.image && project.image.url) {
    imageUrl = project.image.url;
  } else if (project.cover && project.cover.url) {
    imageUrl = project.cover.url;
  }

  return (
    <div className="flex min-h-[600px] relative w-full">
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
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-lg shadow-xl bg-white bg-opacity-80 max-w-[850px]"
          >
            <div className="flex items-center justify-center mt-5 text-gray-800">
              <h1 className="text-3xl lg:text-6xl">{title}</h1>
            </div>
            <div className="mt-5 text-center border-t border-gray-600">
              <div className="p-6 md:pr-24 md:pl-16 md:py-6">
                <p
                  className="text-xl text-gray-800"
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
                    className="flex items-baseline mt-3 text-ameciclo hover:text-red-600 focus:text-red-600"
                  >
                    <span>Conheça mais</span>
                    <span className="ml-1 text-xs">&#x279c;</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Arrow(props: any) {
  const disabledClass = props.disabled ? " arrow--disabled" : "";
  return (
    <svg
      onClick={props.onClick}
      className={`arrow ${
        props.left ? "arrow--left" : "arrow--right"
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