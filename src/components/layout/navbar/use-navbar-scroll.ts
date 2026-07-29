import { useEffect, useState } from "react";

export function useNavbarScroll() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    // Trigger sekali saat mount untuk memastikan state awal benar
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isScrolled;
}
