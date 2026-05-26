import { Apple, Mail } from 'lucide-react';
import type { MouseEventHandler } from 'react';

type SocialProvider = 'google' | 'gmail' | 'microsoft' | 'apple';

type SocialButtonProps = {
  provider: SocialProvider;
  label: string;
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

const brandIcon = {
  google: <span className="text-3xl font-bold leading-none text-[#4285F4]">G</span>,
  gmail: <Mail size={31} className="text-[#EA4335]" fill="rgba(234,67,53,0.16)" />,
  microsoft: (
    <span className="grid size-8 grid-cols-2 gap-0.5">
      <span className="bg-[#F25022]" />
      <span className="bg-[#7FBA00]" />
      <span className="bg-[#00A4EF]" />
      <span className="bg-[#FFB900]" />
    </span>
  ),
  apple: <Apple size={30} fill="currentColor" />,
};

export default function SocialButton({ provider, label, href, onClick }: SocialButtonProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="group grid h-14 grid-cols-[1fr_auto_1fr] items-center rounded-lg border border-white/18 bg-[#06111d]/64 px-5 text-base font-medium text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition hover:border-emerald-300/55 hover:bg-white/[0.075] hover:text-white"
    >
      <span />
      <span className="flex min-w-0 items-center justify-center gap-5">
        <span className="flex size-9 shrink-0 items-center justify-center text-white transition group-hover:scale-105">
          {brandIcon[provider]}
        </span>
        <span className="truncate">{label}</span>
      </span>
      <span />
    </a>
  );
}
