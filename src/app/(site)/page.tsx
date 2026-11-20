import HomeBanner from "@/components/home/banner";
import HowItWorks from "@/components/home/how-it-works";
import PopularCategories from "@/components/home/popular-categories";
import WhyChooseUs from "@/components/home/why-choose-us";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background font-sans">
      <HomeBanner />
      <PopularCategories />
      <WhyChooseUs />
      <HowItWorks />
    </div>
  );
}
