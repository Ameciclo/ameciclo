import { Link } from "@remix-run/react";

export function ImagesGrid({ title, images }: any) {
  return (
    <section className="bg-white">
      <div className="flex-1 container mx-auto p-10 text-center">
        <h3 className="font-bold text-3xl text-ameciclo py-8">{title}</h3>
        <div
          className="grid grid-flow-row grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          style={{ justifyItems: "center" }}
        >
          {images?.map((image: any, index: number) => (
            <div key={image.url || index} className="bg-white rounded-lg shadow-xl w-full">
              <ImageWithLink {...image} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImageWithLink({
    url,
    alt,
    src,
    aspectRatio = 16 / 9,
    width = 400,
    target = "_blank",
  }: any) {
    return (
      <Link to={url} target={target}>
        <div className="relative h-0" style={{ paddingBottom: `${100 / aspectRatio}%` }}>
          <img
            className="absolute top-0 left-0 w-full h-full"
            alt={alt}
            src={src}
            width={width}
            height={width/aspectRatio}
          />
        </div>
      </Link>
    );
  }
  

