import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="container mx-auto sticky top-0 z-50 w-full border-b border-green-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-360 items-center justify-between gap-6 px-6 lg:px-10">
        <div className="flex shrink-0 items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/GearNestLogo.png"
              alt="GearNest Logo"
              width={155}
              height={50}
              priority
              className="h-auto w-36.25 object-contain"
            />
          </Link>
        </div>

        <div className="hidden items-center gap-7 lg:flex">
          <Link
            href="/"
            className="text-sm font-semibold text-green-800 transition hover:text-lime-600"
          >
            Home
          </Link>

          <Link
            href="/equipment"
            className="text-sm font-medium text-gray-600 transition hover:text-green-700"
          >
            All Equipment
          </Link>

          <Link
            href="/#about"
            className="text-sm font-medium text-gray-600 transition hover:text-green-700"
          >
            About Us
          </Link>

          <Link
            href="/#contact"
            className="text-sm font-medium text-gray-600 transition hover:text-green-700"
          >
            Contact Us
          </Link>

          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-gray-600 transition hover:text-green-700"
          >
            How It Works
          </Link>
        </div>

        {/* 3. Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 xl:flex">
            <Button variant="ghost" size="sm" className="text-xs text-gray-600">
              Demo Admin
            </Button>

            <Button variant="ghost" size="sm" className="text-xs text-gray-600">
              Demo Owner
            </Button>
          </div>

          <Link href="/equipment">
            <Button variant="outline" size="icon" aria-label="Search equipment">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/signin">
            <Button variant="ghost" className="font-semibold">
              Login
            </Button>
          </Link>

          <Link href="/signup">
            <Button className="bg-green-700 font-semibold text-white hover:bg-green-800">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
