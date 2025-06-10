interface BannerProps {
  image?: string;
  alt?: string;
  title?: string;
}

export default function Banner({ 
  image = "/projetos.webp", 
  alt = "Imagem de Banner da página",
  title
}: BannerProps) {
  return (
    <div className="relative py-24 w-full h-[52vh]">
      <img
        src={image}
        alt={alt}
        className="absolute inset-0 object-cover w-full h-full"
        loading="lazy"
      />
      {title && (
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-wide shadow-box">
            {title}
          </h1>
        </div>
      )}
    </div>
  );
}