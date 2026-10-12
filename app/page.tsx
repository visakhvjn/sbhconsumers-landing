import Footer from "./components/Footer";
import GuideSection from "./components/GuideSection";
import Hero from "./components/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <main>
        <GuideSection />
      </main>
      <Footer />
    </>
  );
}
