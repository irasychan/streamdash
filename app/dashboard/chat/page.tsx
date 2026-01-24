"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatContainer } from "@/components/chat";

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Unified Chat</h2>
        <p className="mt-1 text-muted-foreground">
          View and manage chat from all connected platforms in one place.
        </p>
      </div>

      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Live Chat Feed</CardTitle>
        </CardHeader>
        <CardContent className="h-[600px]">
          <ChatContainer />
        </CardContent>
      </Card>
    </div>
  );
}
