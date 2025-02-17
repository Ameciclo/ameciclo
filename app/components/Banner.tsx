export default function Banner() {
    return (
        <section className="h-[70vh] w-full relative overflow-hidden py-[58px]">
            <img
                src="/backgroundImage.webp"
                alt="Ameciclo Banner"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="w-96 h-96 bg-black"></div>
        </section>
    )
}

