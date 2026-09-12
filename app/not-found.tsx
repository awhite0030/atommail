import Link from 'next/link'
import { Navbar, Footer } from '@/components/ui/chrome'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/panel'

export default function NotFound() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <section className="mx-auto grid min-h-[60vh] max-w-[840px] place-items-center px-6 pb-24 pt-20">
        <div className="rise-in text-center">
          <p className="iris-flow bg-grad-iris bg-clip-text font-display text-hero font-light text-transparent">
            404
          </p>
          <h1 className="mt-6 font-display text-h2 font-light text-prism">
            This page dissolved <span className="text-iris italic">early</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-body leading-7 text-prism-dust">
            Fitting for a temporary-mail service — but the page you wanted
            is gone or never existed.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <Link href="/">
              <Button size="lg">Back to the inbox</Button>
            </Link>
            <Label className="text-prism-faint">everything here is temporary anyway</Label>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
