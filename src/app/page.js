import Loader from "@/components/layout/Loader/Loader";
import Nav from "@/components/layout/Nav/Nav";
import Cursor from "@/components/layout/Cursor/Cursor";
import Footer from "@/components/layout/Footer/Footer";
import Hero from "@/components/sections/Hero/Hero";
import WhatWeDo from "@/components/sections/WhatWeDo/WhatWeDo";
import Showreel from "@/components/sections/Showreel/Showreel";
import SelectedWork from "@/components/sections/SelectedWork/SelectedWork";
import Services from "@/components/sections/Services/Services";
import ClientLove from "@/components/sections/ClientLove/ClientLove";
import Close from "@/components/sections/Close/Close";

export default function Home() {
  return (
    <main>
      <Loader />
      <Hero />
      <Nav />
      <WhatWeDo />
      <Showreel />
      <SelectedWork />
      <Services />
      <ClientLove />
      <Close />
      <Footer />
      <Cursor />
    </main>
  );
}
