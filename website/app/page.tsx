import { BeforeAfter } from "@/components/sections/before-after";
import { ExampleReport } from "@/components/sections/example-report";
import { FinalCta } from "@/components/sections/final-cta";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Navbar } from "@/components/sections/navbar";
import { Outcomes } from "@/components/sections/outcomes";
import { Privacy } from "@/components/sections/privacy";
import { TechMarquee } from "@/components/sections/tech-marquee";
import { WhatWeDo } from "@/components/sections/what-we-do";
import { WhoItsFor } from "@/components/sections/who-its-for";

export default function Home() {
  return <div className="overflow-hidden bg-background text-text-primary"><Navbar /><main><Hero /><TechMarquee /><WhatWeDo /><Outcomes /><HowItWorks /><ExampleReport /><BeforeAfter /><WhoItsFor /><Privacy /><FinalCta /></main><Footer /></div>;
}
