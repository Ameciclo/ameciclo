import Banner from "~/components/Commom/Banner";
import SectionCallToAction from "~/components/Home/SectionCallToAction";
import SectionCarousel from "~/components/Home/SectionCarousel";
import { useLoaderData } from "@remix-run/react";
import { loader } from "../loader/home"
import SectionData from "~/components/Home/SectionData";
import bannerImage from "/backgroundImage.webp";
import HomeBanner from "~/components/Home/HomeBanner";
export { loader };


export default function Index() {
  const { home, projects } = useLoaderData<any>();
  return (
    <>
      <HomeBanner image={bannerImage} alt="Várias mulheres (11) de bicicleta andando na rua ocupando duas faixas e atravessando um cruzamento"/>
      <SectionCallToAction home={home} />
      <SectionCarousel projects={projects} />
      <SectionData projects={projects} />
    </>
  )
}