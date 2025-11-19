import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface WebhookResponse {
  [key: string]: any;
}

export const BoltFollowUp = () => {
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");
  const [myEmail, setMyEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<WebhookResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!domain || !domain.includes(".")) {
      toast({
        title: "Invalid domain",
        description: "Please enter a valid domain",
        variant: "destructive",
      });
      return;
    }

    if (!myEmail || !myEmail.includes("@")) {
      toast({
        title: "Invalid my email",
        description: "Please enter a valid email address for 'My Email'",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await fetch("https://intelhero.app.n8n.cloud/webhook/bolt-followup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, domain, myEmail }),
      });

      if (!result.ok) {
        throw new Error(`Request failed with status ${result.status}`);
      }

      const data = await result.json();
      setResponse(data);
      setError(null);
      
      toast({
        title: "Success!",
        description: "Follow-up sent successfully",
      });

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process request";
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFieldName = (key: string): string => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') {
      // Pretty print objects/arrays
      return JSON.stringify(value, null, 2);
    }
    // Check if it's a date string
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      try {
        const date = new Date(value);
        return date.toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const renderResponse = () => {
    if (!response) return null;

    // Handle array responses with text content
    if (Array.isArray(response) && response.length > 0 && response[0].text) {
      return (
        <Card className="p-6 bg-card border-border shadow-soft animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground mb-4">Analysis Results</h3>
            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground">
              <ReactMarkdown
                  components={{
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold text-foreground mt-6 mb-3 border-b border-border pb-2">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">
                        {children}
                      </h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 my-3 ml-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 my-3 ml-2">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-foreground leading-relaxed">
                        {children}
                      </li>
                    ),
                    p: ({ children }) => (
                      <p className="text-foreground leading-relaxed mb-3">
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">
                        {children}
                      </strong>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-accent pl-4 py-2 my-3 bg-muted/30 rounded-r">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {response[0].text}
                </ReactMarkdown>
              </div>
            </div>
        </Card>
      );
    }

    // Default object rendering for other response types
    return (
      <Card className="p-6 bg-card border-border shadow-soft animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground mb-2">Workflow Response</h3>
          <div className="space-y-4">
              {Object.entries(response).map(([key, value]) => (
                <div key={key} className="border-l-2 border-accent/30 pl-4 py-1">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    {formatFieldName(key)}
                  </div>
                  <div className="text-foreground whitespace-pre-wrap break-words">
                    {formatValue(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
      </Card>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <Card className="p-6 bg-destructive/5 border-destructive/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg text-destructive mb-1">Error</h3>
            <p className="text-destructive/90">{error}</p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-soft">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="bg-background border-input"
              required
            />

            <Input
              id="domain"
              type="text"
              placeholder="Domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={loading}
              className="bg-background border-input"
              required
            />

            <Input
              id="myEmail"
              type="email"
              placeholder="My Email"
              value={myEmail}
              onChange={(e) => setMyEmail(e.target.value)}
              disabled={loading}
              className="bg-background border-input"
              required
            />
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Response Display */}
      <div ref={resultsRef}>
        {response && (
          <Card className="mt-6 border-border bg-card/50">{renderResponse()}</Card>
        )}

        {/* Error Display */}
        {error && renderError()}
      </div>
    </div>
  );
};
