interface BannerProps {
  image?: string;
  alt?: string;
}

export default function Banner({ 
  image = "/projetos.webp", 
  alt = "Imagem de Banner da página" 
}: BannerProps) {
  return (
    <div className="relative py-24 w-full h-[52vh]">
      <img
        src={image}
        alt={alt}
        className="absolute inset-0 object-cover w-full h-full"
        loading="lazy"
      />
    </div>
  );
}