import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="page">
      <div className="page-inner">
        <section className="hero">
          <div className="hero-copy">
            <Badge variant="secondary" className="bg-primary/15 text-foreground">
              Streaming Control Center
            </Badge>
            <h1 className="mt-4 mb-3 font-display text-5xl">
              Dashboards and widgets for your stream universe.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              This starter includes a dashboard view plus OBS-friendly widgets.
              Wire in Twitch and YouTube credentials to replace the demo data.
            </p>
            <div className="hero-tags">
              <span className="pill">OBS overlays</span>
              <span className="pill">Live chat ready</span>
              <span className="pill">Realtime stats</span>
            </div>
            <div className="hero-actions">
              <Button asChild className="shadow-[0_10px_30px_rgba(125,207,255,0.25)]">
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="border-primary/30 bg-secondary/40 hover:border-primary/50"
              >
                <Link href="/widgets/stats">Preview Widgets</Link>
              </Button>
            </div>
          </div>
          <Card className="hero-preview card-glow">
            <CardContent className="p-6">
              <div className="hero-preview-header">
                <div>
                  <p className="hero-preview-label">Tonight at a glance</p>
                  <h2 className="hero-preview-title">Live session snapshot</h2>
                </div>
                <Badge variant="secondary" className="bg-accent/20 text-foreground">
                  On Air
                </Badge>
              </div>
              <div className="hero-preview-grid">
                <div>
                  <p className="hero-preview-metric">Viewers</p>
                  <p className="hero-preview-value">4,218</p>
                  <p className="hero-preview-sub">+12% vs last stream</p>
                </div>
                <div>
                  <p className="hero-preview-metric">Chat momentum</p>
                  <p className="hero-preview-value">312</p>
                  <p className="hero-preview-sub">messages/min</p>
                </div>
              </div>
              <div className="hero-preview-bar">
                <span>Follower goal</span>
                <span>72%</span>
              </div>
              <div className="bar">
                <div className="bar-fill" style={{ width: "72%" }} />
              </div>
            </CardContent>
          </Card>
        </section>
        <section className="hero-links">
          <h2 className="font-display text-2xl">Jump into the toolkit</h2>
          <div className="link-grid">
            <Link href="/dashboard" className="link-card">
              <strong className="text-lg text-foreground">Dashboard overview</strong>
              <p className="mt-2 text-sm text-muted-foreground">
                Monitor live stats, account status, and quick actions.
              </p>
            </Link>
            <Link href="/widgets/stats" className="link-card">
              <strong className="text-lg text-foreground">Stream stats widget</strong>
              <p className="mt-2 text-sm text-muted-foreground">
                OBS-ready overlay for viewers and subscribers.
              </p>
            </Link>
            <Link href="/widgets/goal" className="link-card">
              <strong className="text-lg text-foreground">Follower goal widget</strong>
              <p className="mt-2 text-sm text-muted-foreground">
                Animated progress bar for on-stream milestones.
              </p>
            </Link>
            <Link href="/widgets/chat" className="link-card">
              <strong className="text-lg text-foreground">Chat overlay widget</strong>
              <p className="mt-2 text-sm text-muted-foreground">
                Full-screen chat browser source for OBS scenes.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
