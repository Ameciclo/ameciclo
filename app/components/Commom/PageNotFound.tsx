import { Link } from "@remix-run/react";
import image from "/crash.webp";

export default function PageNotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900 px-4 py-12 sm:px-6 sm:py-20">
            <img className="max-w-[300px] max-h-[300px] mx-auto mb-8" src={image} alt="bicicleta quebrada" />
            <h1 className="text-3xl sm:text-4xl font-bold text-center">404 - Página não encontrada</h1>
            <p className="mt-4 text-base sm:text-lg text-center">Oops! Parece que esta página não existe.</p>
            <Link to="/" className="mt-6 px-4 py-2 bg-ameciclo text-white rounded-md">
                Voltar para a página inicial
            </Link>
        </div>
    )
}