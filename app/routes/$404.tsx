import { Link } from "@remix-run/react";
import image from "/crash.webp";

export default function NotFound() {
    return (
        <div className="flex flex-col pt-16 items-center justify-start min-h-screen bg-gray-100 text-gray-900">
            <img className="pr-24" src={image} alt="bicicleta quebrada" />
            <h1 className="text-4xl font-bold">404 - Página não encontrada</h1>
            <p className="mt-4 text-lg">Oops! Parece que esta página não existe.</p>
            <Link to="/" className="mt-6 px-4 py-2 bg-ameciclo text-white rounded-md">
                Voltar para a página inicial
            </Link>
        </div>
    )
}