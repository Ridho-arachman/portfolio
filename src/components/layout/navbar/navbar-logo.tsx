import Image from "next/image";
import Link from "next/link";

export function NavbarLogo() {
  return (
    <div className="hover:scale-105 active:scale-95 transition-transform duration-200">
      <Link href="/" className="group flex items-center gap-2">
        <Image
          src="/logo-optimized.webp"
          alt="Ridho.dev Logo"
          width={240}
          height={300}
          className="w-10 h-10 rounded-sm object-cover shadow-sm"
          priority
          sizes="40px"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          Ridho.dev
        </span>
      </Link>
    </div>
  );
}