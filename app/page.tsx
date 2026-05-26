import Navbar from "./_components/landing/Navbar";
import Hero from "./_components/landing/Hero";
import SocialProof from "./_components/landing/SocialProof";
import Features from "./_components/landing/Features";
import HowItWorks from "./_components/landing/HowItWorks";
import Mockups from "./_components/landing/Mockups";
import Testimonials from "./_components/landing/Testimonials";
import Pricing from "./_components/landing/Pricing";
import FAQ from "./_components/landing/FAQ";
import CTA from "./_components/landing/CTA";
import Footer from "./_components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <Mockups />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
