import HomeBanner from "@/components/home/banner";
import PopularCategories from "@/components/home/popular-categories";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans">
      <HomeBanner />
      <PopularCategories />
    </div>
  );
}
