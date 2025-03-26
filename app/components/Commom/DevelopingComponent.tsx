export default function DevelopingComponent({ title, type }: { title: any, type: "default" }) {
    switch (type) {
        case "default":
            return (
                <>
                    <div className="p-6 bg-white h-full flex flex-col justify-center items-center">
                        <h2 className="text-center text-3xl" >Área {title}</h2>
                        <h1 className="text-center text-1xl" >Em desenvolvimento...</h1>
                        <img className="" src="/d1.gif" alt="bicicleta em movimento" />
                    </div>
                </>
            )

        default:
            break;
    }
}
