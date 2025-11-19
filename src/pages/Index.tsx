import { BoltFollowUp } from "@/components/BoltFollowUp";
import { Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <header className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-elevated mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            APIsec Automator
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Streamline your API security workflows with automated follow-ups and intelligent processing
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Bolt Follow-Up
              </h2>
              <p className="text-muted-foreground">
                Send automated follow-up emails through our secure workflow system
              </p>
            </div>
            
            <BoltFollowUp />
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>Powered by N8N Workflows • Secure & Reliable Automation</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
