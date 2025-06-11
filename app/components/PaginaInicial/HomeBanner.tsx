export default function HomeBanner({image="backgroundImage.webp", alt = "image banner"}: any) {
    return (
        <section className="h-[70vh] w-full relative overflow-hidden py-[58px]">
            <img
                src={image}
                alt={alt}
                className="absolute inset-0 w-full h-full object-cover"
            />
        </section>
    )
}

