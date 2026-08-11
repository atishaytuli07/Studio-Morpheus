"use client";

import { useState } from "react";
import Preloader, { isInitialLoad } from "@/components/Preloader/Preloader";
import Hero from "@/components/Hero/Hero";
import Founder from "@/components/Founder/Founder";
import Services from "@/components/Services/Services";
import Work from "@/components/Work/Work";
import Testimonials from "@/components/Testimonials/Testimonials";
import Footer from "@/components/Footer/Footer";

const PRELOADER_HOLD = 4.4;

export default function Home() {
  const [showPreloader] = useState(isInitialLoad);

  const introDelay = showPreloader ? PRELOADER_HOLD : 0.5;

  return (
    <>
      {showPreloader && <Preloader />}
      <Hero introDelay={introDelay} />
      <Founder />
      <Services />
      <Work />
      <Testimonials />
      <Footer />
    </>
  );
}
