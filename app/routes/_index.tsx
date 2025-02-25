import Banner from "~/components/Commom/Banner";
import SectionCallToAction from "~/components/Home/SectionCallToAction";
import SectionCarousel from "~/components/Home/SectionCarousel";
import { useLoaderData } from "@remix-run/react";
import { loader } from "../loader/home"
import SectionData from "~/components/Home/SectionData";
export { loader };

export default function Index() {
  const { home, projects } = useLoaderData<any>();
  return (
    <main className="main-home">
      <Banner />
      <SectionCallToAction home={home} />
      <SectionCarousel projects={projects} />
      <SectionData projects={projects} />
    </main>
  )
}