import { BoltFollowUp } from "@/components/BoltFollowUp";
import { LastEmailFollowUp } from "@/components/LastEmailFollowUp";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            APIsec Automator
          </h1>
        </header>

        {/* Main Content */}
        <main className="space-y-12">
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Bolt Follow-Up
              </h2>
            </div>
            
            <BoltFollowUp />
          </section>

          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Last Email Follow-Up
              </h2>
            </div>
            
            <LastEmailFollowUp />
          </section>
        </main>

      </div>
    </div>
  );
};

export default Index;
