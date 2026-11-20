import Link from "next/link";
import {
  FaFacebookSquare,
  FaLinkedin,
  FaPhoneAlt,
  FaYoutube,
} from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { RiMapPin2Fill } from "react-icons/ri";
import Image from "next/image";
import { cacheLife } from "next/cache";

async function getCopyrightYear() {
  "use cache";
  cacheLife("hours");

  return new Date().getFullYear();
}

const Footer = async () => {
  const year = await getCopyrightYear();

  return (
    <footer className="container mx-auto bg-[#062215] text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-360 px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-5">
            <Link href="/" className="inline-block">
              <h2 className="text-3xl font-extrabold tracking-tight">
                <Image
                  src="/GearNestLogo.png"
                  alt="GearNest Logo"
                  width={155}
                  height={50}
                  priority
                  className="h-auto w-30 object-contain sm:w-36.25"
                />
              </h2>
            </Link>

            <h3 className="text-lg font-semibold text-lime-400">
              Rent Smart. Work Better.
            </h3>

            <p className="max-w-xs text-sm leading-7 text-gray-300">
              Your trusted platform for renting high-quality construction,
              photography, electronics, and event equipment effortlessly.
            </p>

            <div className="space-y-3 pt-2 text-sm text-gray-300">
              <p className="flex items-center gap-3">
                <SiGmail size={17} className="text-lime-400" />
                support@gearnest.com
              </p>

              <p className="flex items-center gap-3">
                <FaPhoneAlt size={17} className="text-lime-400" />
                +880 1234-567890
              </p>

              <p className="flex items-center gap-3">
                <RiMapPin2Fill size={17} className="text-lime-400" />
                Dhaka, Bangladesh
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 text-lg font-bold">Quick Links</h3>

            <ul className="space-y-4 text-sm text-gray-300">
              <li>
                <Link href="/" className="transition hover:text-lime-400">
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/equipment"
                  className="transition hover:text-lime-400"
                >
                  All Equipment
                </Link>
              </li>

              <li>
                <Link href="/#about" className="transition hover:text-lime-400">
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/#contact"
                  className="transition hover:text-lime-400"
                >
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  href="/#how-it-works"
                  className="transition hover:text-lime-400"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h3 className="mb-6 text-lg font-bold">Our Services</h3>

            <ul className="space-y-4 text-sm text-gray-300">
              <li className="transition hover:text-lime-400">
                <Link href="/equipment">Equipment Rental</Link>
              </li>

              <li className="transition hover:text-lime-400">
                <Link href="/#how-it-works">Flexible Booking</Link>
              </li>

              <li className="transition hover:text-lime-400">
                <Link href="/#how-it-works">Secure Payment</Link>
              </li>

              <li className="transition hover:text-lime-400">
                <Link href="/#contact">24/7 Support</Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="mb-6 text-lg font-bold">Follow Us</h3>

            <p className="mb-6 text-sm leading-6 text-gray-300">
              Stay connected with GearNest and never miss our latest updates and
              offers.
            </p>

            <div className="flex items-center gap-3">
              <Link
                href="https://facebook.com"
                target="_blank"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10 border border-white/20 transition hover:border-lime-400 hover:bg-lime-400 hover:text-green-950"
              >
                <FaFacebookSquare size={18} />
              </Link>

              <Link
                href="https://youtube.com"
                target="_blank"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10 border border-white/20 transition hover:border-lime-400 hover:bg-lime-400 hover:text-green-950"
              >
                <FaYoutube size={18} />
              </Link>

              <Link
                href="https://linkedin.com"
                target="_blank"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10 border border-white/20 transition hover:border-lime-400 hover:bg-lime-400 hover:text-green-950"
              >
                <FaLinkedin size={18} />
              </Link>

              <Link
                href="https://x.com"
                target="_blank"
                aria-label="X"
                className="flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10 border border-white/20 text-sm font-bold transition hover:border-lime-400 hover:bg-lime-400 hover:text-green-950"
              >
                𝕏
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-360 flex-col items-center justify-between gap-4 px-4 py-6 text-center text-sm text-gray-400 sm:px-6 md:flex-row md:text-left lg:px-10">
          <p>© {year} . All rights reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
            <Link
              href="/privacy-policy"
              className="transition hover:text-lime-400"
            >
              Privacy Policy
            </Link>

            <span>|</span>

            <Link href="/terms" className="transition hover:text-lime-400">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
