import { FinalCta } from "../components/landing/FinalCta";
import { Hero } from "../components/landing/Hero";
import { HowItWorksStrip } from "../components/landing/HowItWorksStrip";
import { LandingFooter } from "../components/landing/LandingFooter";
import { PrivacyPanel } from "../components/landing/PrivacyPanel";
import { WhatWeCover } from "../components/landing/WhatWeCover";
import { WhyHard } from "../components/landing/WhyHard";

export default function Landing() {
  return (
    <>
      <Hero />
      <WhyHard />
      <HowItWorksStrip />
      <WhatWeCover />
      <PrivacyPanel />
      <FinalCta />
      <LandingFooter />
    </>
  );
}
