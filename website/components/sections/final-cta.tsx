import { interactionClasses } from "@/lib/interaction-classes";
import { WaitlistCta } from "@/components/WaitlistCta";

export function FinalCta() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://repo-doctor-two.vercel.app";
  return <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8"><div className="rounded-xl border border-accent/20 bg-background-elevated px-6 py-16 text-center shadow-2xl shadow-black/20 sm:px-12"><p className="font-mono text-xs uppercase tracking-[.16em] text-accent">Start with evidence</p><h2 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-[-.045em] sm:text-6xl">Move from guessing to a real diagnosis.</h2><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><a href={appUrl} className={`${interactionClasses.primaryButton} inline-block rounded-md bg-accent px-5 py-3 font-semibold text-background hover:bg-accent-secondary hover:text-text-primary`}>Launch Repo Doctor</a><WaitlistCta className="rounded-md border border-accent/35 bg-background px-5 py-3 font-semibold text-accent hover:border-accent hover:bg-accent/10" /></div></div></section>;
}
