// Home page: marketing / entry point for the app.
// Shows a hero, short feature list and links to sign in / sign up.
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Hero section: large visual with dark overlay and primary call-to-action */}
      <header className="relative h-[60vh] md:h-[70vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center rounded-2xl overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(rgba(4,6,8,0.6), rgba(4,6,8,0.6)), url('/hero.png')",
          }}
        />

        <div className="relative z-10 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Reconnect students with their belongings
              </h1>
              <p className="text-white text-lg max-w-xl mb-6">
                Report found items, browse lost items, and claim ownership securely.
                Built for schools to simplify lost & found workflows.
              </p>

              <div className="flex items-center gap-3">
                <Link to="/auth" state={{ isSignUp: true }}>
                  <Button aria-label="Sign up" variant="default" className="bg-accent-gold text-black border-black hover:bg-accent-gold/90 font-semibold px-6">Sign Up</Button>
                </Link>

                <Link to="/auth">
                  <Button aria-label="Sign in" variant="ghost" className="bg-white/90 text-black border border-black hover:bg-white">Sign In</Button>
                </Link>
              </div>
            </div>

            {/* Explainer card: brief 'how it works' steps */}
            <div>
              <GlassCard className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">How it works</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Report found items with a photo and location.</li>
                  <li>Search or browse items by category and date.</li>
                  <li>Claim items by providing matching details; admins verify claims.</li>
                </ol>
              </GlassCard>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Features section: three concise cards describing core flows */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="nb-card p-6 rounded-lg border-l-4 border-l-accent-green">
            <h4 className="font-semibold text-accent-green mb-2">Report Items</h4>
            <p className="text-muted-foreground">Quickly report found items with photos and details.</p>
          </div>
          <div className="nb-card p-6 rounded-lg border-l-4 border-l-accent-gold">
            <h4 className="font-semibold text-accent-gold mb-2">Search & Browse</h4>
            <p className="text-muted-foreground">Filter by date, category, or location to find matches.</p>
          </div>
          <div className="nb-card p-6 rounded-lg border-l-4 border-l-accent-green">
            <h4 className="font-semibold text-accent-green mb-2">Secure Claims</h4>
            <p className="text-muted-foreground">Claims are verified by staff to ensure items reach the rightful owner.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
