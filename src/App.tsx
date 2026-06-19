import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import About from "./components/About";
import Collection from "./components/Collection";
import WhyChooseUs from "./components/WhyChooseUs";
import Testimonials from "./components/Testimonials";
import Commitment from "./components/Commitment";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

const App: React.FC = () => (
  <>
    <Navbar />
    <Hero />
    <StatsBar />
    <About />
    <Collection />
    <WhyChooseUs />
    <Testimonials />
    <Commitment />
    <Newsletter />
    <Footer />
  </>
);

export default App;