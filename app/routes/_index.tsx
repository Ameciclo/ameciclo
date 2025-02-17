import type { MetaFunction } from "@remix-run/node";
import Banner from "~/components/Banner";
import { redirect } from "@remix-run/node";
import SectionCallToAction from "~/components/Home/SectionCallToAction";
import SectionCarousel from "~/components/Home/SectionCarousel";
import { useLoaderData } from "@remix-run/react";
import { loader } from "../loader/home"
export { loader };

export default function Index() {
  const { home } = useLoaderData<any>();
  return (
    <main className="main-home">
      <Banner />
      <SectionCallToAction home={home} />
    </main>
  )
}