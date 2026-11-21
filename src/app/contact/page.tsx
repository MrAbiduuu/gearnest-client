import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  MessageCircle,
  Headphones,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  ShieldCheck,
  ArrowUpRight,
  Plus,
} from "lucide-react";

const contactOptions = [
  {
    icon: Mail,
    title: "Email Support",
    description:
      "Have a question? Send us a message and we&apos;ll be happy to help.",
    action: "Send an email",
    href: "mailto:your-email@example.com",
  },
  {
    icon: MessageCircle,
    title: "General Enquiries",
    description:
      "Questions about GearNest, rentals, or how our platform works?",
    action: "Contact our team",
    href: "mailto:your-email@example.com",
  },
  {
    icon: Headphones,
    title: "Customer Assistance",
    description: "Need help with a booking, payment, or equipment listing?",
    action: "Get assistance",
    href: "mailto:your-email@example.com",
  },
];

const faqs = [
  {
    question: "How can I rent equipment through GearNest?",
    answer:
      "Browse available equipment, open a listing to review its details, and follow the booking process to request a rental.",
  },
  {
    question: "How can I list my equipment?",
    answer:
      "Create an owner account, visit your owner dashboard, and use the Add Equipment section to publish your equipment listing.",
  },
  {
    question: "Can I modify or cancel a booking?",
    answer:
      "Booking changes depend on the booking status and applicable rental terms. Check your booking details or contact our support team.",
  },
  {
    question: "How do I report an issue?",
    answer:
      "Send us a message using the contact form with your account and booking details so our team can understand the issue.",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* HERO */}
      <section className="relative px-5 pb-16 pt-16 sm:px-8 lg:px-12 lg:pb-24 lg:pt-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-green-800 dark:border-green-800 dark:bg-green-900/40 dark:text-lime-200">
              <span className="h-2 w-2 rounded-full bg-green-700 dark:bg-lime-400" />
              Contact GearNest
            </div>

            <h1 className="mt-7 max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Let&apos;s Talk About
              <span className="block text-green-700 dark:text-lime-400">
                Your Next Project.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              Whether you need help finding equipment, managing a rental, or
              listing your own machinery, we&apos;re here to make your GearNest
              experience easier.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#contact-form"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-green-900/15 transition duration-300 hover:-translate-y-1 hover:bg-[#14532D]"
              >
                Send Us a Message
                <ArrowRight size={17} />
              </a>

              <Link
                href="/equipments"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-7 py-4 text-sm font-bold text-foreground transition duration-300 hover:border-green-700 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/40 dark:hover:text-lime-300"
              >
                Browse Equipment
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-3 border-t border-border pt-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
                <ShieldCheck size={21} />
              </div>

              <div>
                <p className="text-sm font-bold text-foreground">
                  We&apos;re here to help.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your questions and feedback matter to us.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-lime-300/25 blur-3xl dark:bg-lime-500/10" />

            <div className="relative h-[390px] overflow-hidden rounded-[2rem] border-[8px] border-background shadow-2xl shadow-green-900/10 sm:h-[480px]">
              <Image
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=85"
                alt="Team members communicating and working together"
                fill
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />

              <div className="absolute bottom-8 left-8 right-8">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
                  We&apos;re listening
                </span>
                <h2 className="mt-3 max-w-sm text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Every great connection starts with a conversation.
                </h2>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl sm:-left-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
                <MessageCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Let&apos;s Connect
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  GearNest Support
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT OPTIONS */}
      <section className="border-t border-border bg-card px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-green-700 dark:text-lime-400">
              Get in Touch
            </span>

            <h2 className="mt-4 text-3xl font-extrabold text-foreground sm:text-4xl">
              How Can We Help You?
            </h2>

            <p className="mt-4 leading-7 text-muted-foreground">
              Choose the type of assistance you need and get in touch with our
              team.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {contactOptions.map((option) => {
              const Icon = option.icon;

              return (
                <div
                  key={option.title}
                  className="group rounded-3xl border border-border bg-background p-7 transition duration-300 hover:-translate-y-2 hover:border-green-400 hover:shadow-xl hover:shadow-green-900/5 dark:hover:bg-green-950/30"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100 text-green-700 transition group-hover:bg-[#166534] group-hover:text-white dark:bg-green-900/40 dark:text-lime-300">
                    <Icon size={26} />
                  </div>

                  <h3 className="mt-7 text-xl font-bold text-foreground">
                    {option.title}
                  </h3>

                  <p className="mt-3 min-h-14 text-sm leading-7 text-muted-foreground">
                    {option.description}
                  </p>

                  <a
                    href={option.href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-green-700 transition hover:gap-3 dark:text-lime-400"
                  >
                    {option.action}
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section
        id="contact-form"
        className="bg-background px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          {/* LEFT INFORMATION */}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-green-700 dark:text-lime-400">
              Send a Message
            </span>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              We&apos;d Love to Hear From You.
            </h2>

            <p className="mt-5 max-w-md leading-8 text-muted-foreground">
              Tell us what&apos;s on your mind. Whether it&apos;s a question, suggestion,
              or an issue, send us a message and we&apos;ll get back to you.
            </p>

            <div className="mt-10 space-y-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
                  <Mail size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Email Support</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Reach us through your registered support email.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
                  <Clock size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    Support Requests
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Include relevant booking or equipment information to help us
                    understand your request.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Our Platform</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Connecting equipment owners and renters through GearNest.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mt-10 h-52 overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&q=85"
                alt="Modern professional workspace"
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 35vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <p className="absolute bottom-5 left-5 text-sm font-bold text-white">
                Better connections. Better experiences.
              </p>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-9">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground">
                Send Us a Message
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Fill in the details below to get in touch.
              </p>
            </div>

            <form action="#" method="post" className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    className="mb-2 block text-sm font-semibold text-foreground"
                    htmlFor="firstName"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder="Enter your first name"
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/15"
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-semibold text-foreground"
                    htmlFor="lastName"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    placeholder="Enter your last name"
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/15"
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-foreground"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/15"
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-foreground"
                  htmlFor="subject"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  defaultValue=""
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/15"
                >
                  <option value="" disabled>
                    Select a subject
                  </option>
                  <option value="general">General Enquiry</option>
                  <option value="booking">Booking Assistance</option>
                  <option value="payment">Payment Issue</option>
                  <option value="equipment">Equipment Listing</option>
                  <option value="technical">Technical Support</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-foreground"
                  htmlFor="message"
                >
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  placeholder="Tell us how we can help you..."
                  className="min-h-36 w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/15"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#166534] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-green-900/15 transition hover:bg-[#14532D]"
              >
                Send Message
                <Send size={17} />
              </button>

              <p className="text-center text-xs leading-6 text-muted-foreground">
                By submitting this form, you agree that GearNest may use your
                information to respond to your enquiry.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-card px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
              <HelpCircle size={27} />
            </div>

            <h2 className="mt-5 text-3xl font-extrabold text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>

            <p className="mt-4 text-muted-foreground">
              Quick answers to some common questions about GearNest.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                name="contact-faq"
                open={index === 0}
                className="group rounded-2xl border border-border bg-background open:border-green-400"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-foreground marker:hidden sm:text-base [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <Plus
                    size={18}
                    className="shrink-0 text-green-700 transition-transform group-open:rotate-45 dark:text-lime-400"
                  />
                </summary>

                <div className="px-5 pb-5 text-sm leading-7 text-muted-foreground">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bg-background px-5 py-20 sm:px-8 lg:px-12">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#166534] px-7 py-14 text-white sm:px-12 lg:px-16">
          <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full border-45 border-lime-300/15" />
          <div className="absolute -bottom-32 right-40 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
                Explore GearNest
              </span>

              <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
                Have a Project in Mind?
                <span className="block text-lime-300">
                  Find the Right Equipment.
                </span>
              </h2>

              <p className="mt-5 leading-8 text-green-100">
                Explore equipment listings and discover a smarter way to rent
                what you need.
              </p>
            </div>

            <Link
              href="/equipments"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-7 py-4 text-sm font-bold text-[#17251C] transition duration-300 hover:-translate-y-1 hover:bg-lime-300"
            >
              Explore Equipment
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
