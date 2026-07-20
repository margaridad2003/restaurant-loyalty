import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center space-y-6">
      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <ChefHat className="h-12 w-12 text-primary" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-serif font-bold text-foreground">404</h1>
        <p className="text-xl text-muted-foreground font-medium">Page not found in the kitchen</p>
        <p className="text-sm text-muted-foreground/80 max-w-md mx-auto pt-2">
          The requested route doesn't exist. Maybe the recipe was removed or you mistyped the URL.
        </p>
      </div>
      <Button asChild size="lg" className="mt-8">
        <Link href="/">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
