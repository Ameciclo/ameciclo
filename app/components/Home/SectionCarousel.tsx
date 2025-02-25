import { Link, useLoaderData } from "@remix-run/react";
import { useKeenSlider } from "keen-slider/react";
import { useState } from "react";

const SERVER_URL = "https://cms.ameciclo.org";

export default function SectionCarousel({ projects }: any) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
        initial: 0,
        loop: true,
        slideChanged(slider: any) {
            setCurrentSlide(slider.track.details.rel);
        },
        created() {
            setLoaded(true);
        },
    });

    return (
        <section>
            <div className="mx-auto">
                <div className="navigation-wrapper">
                    <div ref={sliderRef} className="keen-slider">
                        {projects?.map((project: any, i: any) => (
                            <div key={i} className="flex min-h-[600px] relative">
                                <div className="keen-slider__slide max-h-[600px]">
                                    <img
                                        src={project.media.url}
                                        alt={project.name}
                                        style={{ objectFit: "cover" }}
                                    />

                                    <div className="container flex justify-center h-full mx-auto my-auto">
                                        <div
                                            className="relative mx-auto my-auto rounded-lg shadow-xl bg-gray100Transparent max-h-[18rem] max-w-[850px]"
                                            key={project.id}
                                        >
                                            <div className="flex items-center justify-center mt-5 text-gray-800">
                                                <h1 className="text-3xl lg:text-6xl">{project.name}</h1>
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
                                                        {project.description}
                                                    </p>
                                                    <Link to={`/projetos/${project.slug}`}>
                                                        <a className="flex items-baseline mt-3 text-ameciclo hover:text-red-600 focus:text-red-600">
                                                            <span>Conheça mais</span>
                                                            <span className="ml-1 text-xs">&#x279c;</span>
                                                        </a>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {loaded && instanceRef.current && (
                        <>
                            <Arrow
                                left
                                onClick={(e: any) =>
                                    e.stopPropagation() || instanceRef.current?.prev()
                                }
                                disabled={currentSlide === 0}
                            />

                            <Arrow
                                onClick={(e: any) =>
                                    e.stopPropagation() || instanceRef.current?.next()
                                }
                                disabled={
                                    currentSlide ===
                                    instanceRef.current.track.details.slides.length - 1
                                }
                            />
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}


function Arrow(props: {
    disabled: boolean;
    left?: boolean;
    onClick: (e: any) => void;
}) {
    const disabeld = props.disabled ? " arrow--disabled" : "";
    return (
        <svg
            onClick={props.onClick}
            className={`arrow ${props.left ? "arrow--left" : "arrow--right"
                } ${disabeld}`}
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
