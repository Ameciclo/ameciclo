export default function DevelopingComponent({ title, type = "default" }: { title: any, type: string }) {
    switch (type) {
        case "default":
            return (
                <>
                    <div className="p-6 bg-white h-full flex flex-col justify-center items-center">
                        <h2 className="text-center text-3xl" >{title}</h2>
                        <h1 className="text-center text-1xl" >Em desenvolvimento...</h1>
                        <img className="w-96 rounded-full m-10" src="/Cargo_bike_by_Martin_de_Rooij_on_Dribbble.gif" alt="bicicleta em movimento" />
                    </div>
                </>
            )

        default:
            break;
    }
}
