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

export const LastEmailFollowUp = () => {
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");
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

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await fetch("https://intelhero.app.n8n.cloud/webhook/last-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, domain }),
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

  // All string fields from the webhook are markdown, so we render them as such
  const isMarkdownContent = (value: any): boolean => typeof value === 'string';

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
    if (Array.isArray(response)) {
      return (
        <div className="space-y-4">
          {response.map((item, index) => (
            <Card key={index} className="bg-card">
              <CardContent className="pt-6">
                {typeof item === 'object' && item.text ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{item.text}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(item).map(([key, value]) => (
                      <div key={key} className="border-b border-border pb-3 last:border-0">
                        <dt className="text-sm font-semibold text-foreground mb-1">
                          {formatFieldName(key)}
                        </dt>
                        <dd className="text-sm">
                          {typeof value === 'string' ? (
                            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2 prose-p:text-base prose-p:leading-7 prose-p:mb-4 prose-ul:my-4 prose-ol:my-4 prose-li:text-base prose-li:leading-7 prose-li:mb-2 prose-strong:font-semibold prose-strong:text-foreground">
                              <ReactMarkdown>{value}</ReactMarkdown>
                            </div>
                          ) : (
                            <span className="whitespace-pre-wrap text-muted-foreground">{formatValue(value)}</span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    // Handle object response
    if (typeof response === 'object') {
      return (
        <Card className="bg-card">
          <CardContent className="pt-6">
            <dl className="space-y-3">
              {Object.entries(response).map(([key, value]) => (
                <div key={key} className="border-b border-border pb-3 last:border-0">
                  <dt className="text-sm font-semibold text-foreground mb-1">
                    {formatFieldName(key)}
                  </dt>
                  <dd className="text-sm">
                    {isMarkdownContent(value) ? (
                      <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2 prose-p:text-base prose-p:leading-7 prose-p:mb-4 prose-ul:my-4 prose-ol:my-4 prose-li:text-base prose-li:leading-7 prose-li:mb-2 prose-strong:font-semibold prose-strong:text-foreground">
                        <ReactMarkdown>{String(value)}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap text-muted-foreground">{formatValue(value)}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      );
    }

    // Handle string response
    return (
      <Card className="bg-card">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {String(response)}
          </p>
        </CardContent>
      </Card>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <Card className="bg-destructive/10 border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Error</h3>
              <p className="text-sm text-destructive/90">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />

              <Input
                type="text"
                placeholder="Domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
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

      {/* Results section */}
      {(response || error) && (
        <div ref={resultsRef} className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Results</h3>
          {error ? renderError() : renderResponse()}
        </div>
      )}
    </div>
  );
};
