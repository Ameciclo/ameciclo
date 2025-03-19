import { useRouteError, isRouteErrorResponse } from "@remix-run/react";

export default function ErrorFallback({error}: any) {

    return (
        <div className="flex flex-col pt-16 items-center justify-start h-max text-gray-900">
            <h1 className="text-5xl font-bold pb-16">Ocorreu um erro 😢</h1>
            {isRouteErrorResponse(error) ? (
                <>
                    <p className="text-1xl font-bold pb-6">Tente mais tarde..</p>
                    <p className="text-5xl font-bold pb-6">{error.status}</p>
                    {error.data?.message && <p>Detalhes: {error.data.message}</p>}
                </>
            ) : (
                <p>Algo deu errado. Tente novamente mais tarde.</p>
            )}
        </div>
    );
}
