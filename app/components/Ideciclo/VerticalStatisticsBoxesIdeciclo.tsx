import React from "react";

export function VerticalStatisticsBoxesIdeciclo({ title, boxes }: any) {
    return (
        <section className="container mx-auto pt-10">
            <div className="mx-auto text-center my-12 md:my-6">
                <h3 className="text-4xl font-bold p-6 my-8 mb-[100px] rounded-[40px] bg-[#6DBFAC] mx-auto w-[300px] md:w-[600px] lg:w-[700px] text-black">
                    {title}
                </h3>
                <section className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-2 auto-rows-auto gap-10 my-10">
                    {boxes.map((param: any) => (
                        <VerticalBoxIdeciclo key={param.key} {...param} />
                    ))}
                </section>
            </div>
        </section>
    );
}

function VerticalBoxIdeciclo({ titulo, media, color, parametros }: any) {
    const getImageUrl = (titulo: string) => {
        switch (titulo) {
            case 'Qualidade do projeto':
                return '/ideciclo/icones/qualidade-do-projeto.svg';
            case 'Segurança viária':
                return '/ideciclo/icones/seguranca-viaria.svg';
            case 'Manutenção':
                return '/ideciclo/icones/manutencao.svg';
            case 'Urbanidade':
                return '/ideciclo/icones/urbanidade.svg';
            default:
                return '/ideciclo/icones/qualidade-do-projeto.svg';
        }
    };

    const imageUrl = getImageUrl(titulo);
    
    return (
        <div className="flex flex-col items-center gap-[80px]">
            <div
                className="flex flex-col rounded-[40px] justify-center font-semibold text-xl uppercase w-[234px] mt-10 p-6 text-center tracking-widest shadow-md relative md:min-h-[150px] text-black"
                style={{ background: color, boxShadow: '0px 6px 8px 0px rgba(0, 0, 0, 0.25)' }}
            >
                <img 
                    src={imageUrl} 
                    alt={`${titulo} image`} 
                    className="absolute top-[-80px] left-1/2 transform -translate-x-1/2"
                    style={{ height: '108px', width: '104px' }}
                />
                <h3>{titulo}</h3>
                <h3 className="text-4xl font-bold mt-1">{media}</h3>
            </div>
            <div className="flex flex-col gap-[80px] items-center">
                {parametros?.map((innerParam: any) => (
                    <StatisticBoxIdeciclo key={innerParam.key} color={color} {...innerParam} />
                ))}
            </div>
        </div>
    );
}

function StatisticBoxIdeciclo({ titulo, media, color }: any) {
    const getImageUrl = (titulo: string) => {
        const iconMap: { [key: string]: string } = {
            'Qualidade do projeto': '/ideciclo/icones/qualidade-do-projeto.svg',
            'Proteção contra a invasão': '/ideciclo/icones/protecao-contra-invasao.svg',
            'Sinalização vertical': '/ideciclo/icones/sinalizacao-vertical.svg',
            'Sinalização horizontal': '/ideciclo/icones/sinalizacao-horizontal.svg',
            'Conforto da estrutura': '/ideciclo/icones/conforto-da-estrutura.svg',
            'Segurança viária': '/ideciclo/icones/seguranca-viaria.svg',
            'Controle de velocidade': '/ideciclo/icones/controle-de-velocidade.svg',
            'Conflitos ao longo': '/ideciclo/icones/conflitos-ao-longo.svg',
            'Conflitos nos cruzamentos': '/ideciclo/icones/conflitos-nos-cruzamentos.svg',
            'Manutenção': '/ideciclo/icones/manutencao.svg',
            'Tipo de pavimento': '/ideciclo/icones/tipo-de-pavimento.svg',
            'Condição da sinalização horizontal': '/ideciclo/icones/condicao-da-sinalizacao-horizontal.svg',
            'Situação da proteção': '/ideciclo/icones/situacao-da-protecao.svg',
            'Urbanidade': '/ideciclo/icones/urbanidade.svg',
            'Obstáculos': '/ideciclo/icones/obstaculos.svg',
            'Sombreamento': '/ideciclo/icones/sombreamento.svg',
            'Acesso da estrutura': '/ideciclo/icones/acesso-da-estrutura.svg',
            'Iluminação': '/ideciclo/icones/iluminacao.svg'
        };
        return iconMap[titulo] || '/ideciclo/icones/qualidade-do-projeto.svg';
    };

    const imageUrl = getImageUrl(titulo);

    return (
        <div
            className="relative border-4 rounded-[40px] flex flex-col justify-center uppercase w-[234px] p-6 text-center tracking-widest text-black bg-white"
            style={{ borderColor: color, boxShadow: '0px 6px 8px 0px rgba(0, 0, 0, 0.25)' }}
        >
            <img 
                src={imageUrl} 
                alt={`${titulo} image`} 
                className="absolute top-[-80px] left-1/2 transform -translate-x-1/2"
                style={{ height: '108px', width: '104px' }}
            />
            <h3 className="text-sm">{titulo}</h3>
            <p className="text-4xl font-bold mt-1">{media}</p>
        </div>
    );
}