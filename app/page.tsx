import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="page">
      <div className="page-inner">
        <Card className="border-primary/40 bg-gradient-to-br from-secondary/95 to-card/95 shadow-[0_0_0_1px_rgba(246,183,91,0.2),0_10px_30px_rgba(246,183,91,0.15)]">
          <CardContent className="pt-6">
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
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Button
                variant="outline"
                asChild
                className="h-auto flex-col items-start border-primary/20 bg-secondary/40 px-4 py-4 hover:border-primary/40 hover:bg-secondary/60"
              >
                <Link href="/dashboard">
                  <strong className="text-foreground">Open Dashboard</strong>
                  <p className="mt-2 text-sm font-normal text-muted-foreground">
                    Overview of live stats and quick links.
                  </p>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-auto flex-col items-start border-primary/20 bg-secondary/40 px-4 py-4 hover:border-primary/40 hover:bg-secondary/60"
              >
                <Link href="/widgets/stats">
                  <strong className="text-foreground">Stream Stats Widget</strong>
                  <p className="mt-2 text-sm font-normal text-muted-foreground">
                    Viewers, subs, and YouTube subscribers.
                  </p>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-auto flex-col items-start border-primary/20 bg-secondary/40 px-4 py-4 hover:border-primary/40 hover:bg-secondary/60"
              >
                <Link href="/widgets/goal">
                  <strong className="text-foreground">Follower Goal Widget</strong>
                  <p className="mt-2 text-sm font-normal text-muted-foreground">
                    Progress bar built for OBS overlays.
                  </p>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
