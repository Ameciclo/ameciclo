import type { MetaFunction } from "@remix-run/node";
import Banner from "~/components/Banner";
import { redirect } from "@remix-run/node";
import SectionCallToAction from "~/components/Home/SectionCallToAction";

export async function loader() {
  const homeInfo = await fetch(`https://cms.ameciclo.org/home`);
  if (homeInfo.status !== 200) {
    throw redirect("/404");
  }

  return {
    home: homeInfo,
  };
}

export default function Index() {

  return (
    <main className="main-home">
      <Banner />
      <SectionCallToAction />
    </main>
  )
}