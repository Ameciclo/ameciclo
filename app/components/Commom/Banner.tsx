export default function Banner({ image = "backgroundImage.webp", alt = "image banner" }: any) {
  return (
    <div className="relative py-24 w-full h-[52vh]">
      <img
        src={image || "projetos.webp"} // Fallback caso image seja undefined
        alt={alt}
        className="absolute inset-0 object-cover w-full h-full"
        loading="lazy"
      />
    </div>
  );
}