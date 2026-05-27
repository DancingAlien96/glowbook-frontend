import Image from "next/image";

/**
 * Ecodama brand mark. The PNG is a full lockup (emblem + "ECODAMA" wordmark),
 * so we render it on its own without accompanying text.
 */
export default function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/ecodamalogo.png"
      alt="Ecodama"
      width={256}
      height={256}
      priority
      className={className}
    />
  );
}
