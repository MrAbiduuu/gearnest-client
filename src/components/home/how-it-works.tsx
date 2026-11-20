import Link from "next/link";
import {
  Search,
  CalendarCheck,
  CreditCard,
  PackageCheck,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Find Equipment",
    description:
      "Explore our collection and find the equipment that matches your needs.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Book Your Rental",
    description:
      "Select your rental dates, provide the required details, and confirm your booking.",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Pay Securely",
    description:
      "Complete your payment through our secure online checkout process.",
  },
  {
    number: "04",
    icon: PackageCheck,
    title: "Get Started",
    description: "Collect your equipment and get to work. It's that simple!",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="border-t border-[#E8EDE7] bg-white px-6 py-20 lg:px-12 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-green-800">
            Simple & Convenient
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#17251C] sm:text-4xl lg:text-[42px]">
            How It <span className="text-green-700">Works</span>
          </h2>

          <p className="mt-4 text-base leading-8 text-[#647067]">
            Getting the equipment you need has never been easier. Follow these
            four simple steps and get started with GearNest.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connecting line on desktop */}
          <div className="absolute left-[12%] right-[12%] top-10 hidden border-t-2 border-dashed border-[#DCE8D5] lg:block" />

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="group relative rounded-2xl border border-[#E2E9E2] bg-[#F8FAF8] p-7 transition-all duration-300 hover:-translate-y-2 hover:border-green-200 hover:bg-white hover:shadow-xl hover:shadow-green-900/5"
              >
                {/* Icon */}
                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#DCE8D5] bg-white text-[#166534] shadow-sm transition-all duration-300 group-hover:border-[#166534] group-hover:bg-[#166534] group-hover:text-white">
                  <Icon size={30} strokeWidth={1.7} />
                </div>

                {/* Step number */}
                <div className="mt-7 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">
                    Step {step.number}
                  </span>

                  <span className="h-px flex-1 bg-[#E2E9E2] ml-4" />
                </div>

                <h3 className="mt-4 text-xl font-bold text-[#17251C]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#647067]">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 flex flex-col items-center justify-between gap-5 rounded-2xl bg-[#166534] px-7 py-8 sm:flex-row sm:px-10">
          <div>
            <h3 className="text-xl font-bold text-white sm:text-2xl">
              Ready to find your equipment?
            </h3>

            <p className="mt-2 text-sm leading-6 text-green-100">
              Explore available equipment and start your next project today.
            </p>
          </div>

          <Link
            href="/equipment"
            className="group inline-flex shrink-0 items-center gap-3 rounded-lg bg-[#84CC16] px-6 py-3.5 text-sm font-bold text-[#17251C] transition-all duration-300 hover:bg-lime-300"
          >
            Browse Equipment
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
