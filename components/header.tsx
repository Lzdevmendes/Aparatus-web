import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-background/95 border-border sticky top-0 z-30 flex items-center justify-between border-b px-5 py-4 backdrop-blur-sm">
      <Link href="/">
        <Image src="/logo.svg" alt="BarberSync" width={110} height={28} />
      </Link>
    </header>
  );
};

export default Header;
