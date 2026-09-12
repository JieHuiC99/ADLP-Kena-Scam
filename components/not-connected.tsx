import { DatabaseZap } from "lucide-react";
import { Card, EmptyState } from "@/components/ui";

/**
 * Shown when Supabase is unconfigured or unreachable.
 *
 * Deliberately an honest empty state rather than a fallback dataset: a demo
 * that silently invents numbers when the database is down is worse than one
 * that says so.
 */
export function NotConnected({ what = "content" }: { what?: string }) {
  return (
    <div className="shell py-16">
      <Card>
        <EmptyState
          icon={DatabaseZap}
          title="Not connected to the story database"
          body={`Kena Scam reads its ${what} from Supabase. Copy .env.example to .env.local and add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then reload.`}
        />
      </Card>
    </div>
  );
}
