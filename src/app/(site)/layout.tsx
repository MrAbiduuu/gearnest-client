import Footer from "@/components/shared/footer";

const SiteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
};

export default SiteLayout;
