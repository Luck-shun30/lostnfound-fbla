import Navbar from "@/components/Navbar";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import HowItWorks from "@/components/home/HowItWorks";

const Home = () => {
  return (
    <div className="min-h-screen bg-background selection:bg-black selection:text-white overflow-x-hidden">
      <Navbar />
      <main className="space-y-0">
        <Hero />
        <About />
        <HowItWorks />
        <div className="pb-24"></div>
      </main>
    </div>
  );
};

export default Home;
