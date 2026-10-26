import Link from "next/link"; import SiteFooter from "@/components/SiteFooter"; import Breadcrumbs from "@/components/Breadcrumbs"; import JsonLd from "@/components/JsonLd"; import Turnstile from "@/components/Turnstile";
import { pageMeta, siteUrl } from "@/lib/seo"; import { LEGAL, legalReady } from "@/lib/legal"; import { submitContact } from "@/app/actions";
export const metadata = pageMeta({ title: "Contact us", description: "Questions about Direct2Hub, pricing or setting up your business? Send us a message and we'll reply by email, usually within one working day.", path: "/contact" });
const field = "mt-1 block min-h-11 w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";
export default async function Contact({ searchParams }: { searchParams: Promise<{ sent?: string; e?: string }> }) {
  const { sent, e } = await searchParams;
  return <div className="text-ink"><JsonLd data={{ "@context": "https://schema.org", "@type": "ContactPage", name: "Contact Direct2Hub", url: `${siteUrl()}/contact` }} />
    <header className="mx-auto max-w-3xl px-6 pt-6"><Link href="/" className="text-lg font-bold">Direct<span className="text-turmeric">2</span>Hub</Link></header>
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-8"><Breadcrumbs trail={[{ name: "Contact", path: "/contact" }]} />
      <div><h1 className="text-3xl font-bold md:text-4xl">Contact us</h1><p className="mt-2 text-ink/70">Questions about Direct2Hub, pricing or getting your products in? Send a message and we'll reply by email, usually within one working day.</p></div>
      {sent ? <div role="status" className="glass space-y-3 p-6"><h2 className="text-xl font-semibold text-brand">Thanks, we've got your message.</h2><p className="text-sm text-ink/70">We'll reply to the email address you gave. While you wait, you can look at the <Link href="/pricing" className="text-brand underline">plans</Link> or <Link href="/register" className="text-brand underline">create a free account</Link>.</p></div>
      : <form action={submitContact} className="glass space-y-4 p-6">
        {e && <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{e}</p>}
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Your name<input name="name" required minLength={2} maxLength={100} autoComplete="name" className={field} /></label>
          <label className="text-sm font-medium">Email<input name="email" type="email" required maxLength={200} autoComplete="email" className={field} /></label></div>
        <label className="block text-sm font-medium">Phone (optional)<input name="phone" type="tel" maxLength={20} autoComplete="tel" className={field} /></label>
        <label className="block text-sm font-medium">How can we help?<textarea name="message" required minLength={10} maxLength={2000} rows={6} className={field} /></label>
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <Turnstile /><button className="min-h-11 rounded-lg bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brandDark">Send message</button>
        <p className="text-xs text-ink/60">We use your details only to reply. See our <Link href="/privacy" className="underline">privacy policy</Link>.</p></form>}
      <section className="glass p-6 text-sm"><h2 className="font-semibold">Prefer email?</h2><p className="mt-1 text-ink/70">{legalReady ? <>Write to <a href={`mailto:${LEGAL.email}`} className="text-brand underline">{LEGAL.email}</a>. </> : null}{process.env.NEXT_PUBLIC_COMPANY_ADDRESS ? `${LEGAL.company}, ${LEGAL.address}.` : ""}</p></section>
    </main><SiteFooter /></div>;
}
