export default function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-blush-300 via-nude-200 to-lavender-200 ${className}`}>
      <svg viewBox="0 0 24 24" className="h-[60%] w-[60%]" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M12 2.5c1.6 3 3.4 4.8 6.4 6.4-3 1.6-4.8 3.4-6.4 6.4-1.6-3-3.4-4.8-6.4-6.4 3-1.6 4.8-3.4 6.4-6.4Z"
          fill="#21161B"
        />
        <circle cx="12" cy="19" r="1.8" fill="#21161B" />
      </svg>
    </span>
  );
}
