import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface RecommendationCardProps {
  recommendations: string[];
  className?: string;
}

export function RecommendationCard({
  recommendations,
  className,
}: RecommendationCardProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className={`p-4 bg-primary/5 border-primary/20 ${className ?? ""}`}>
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-sm mb-2">
            Recommendations
          </h3>
          <ul className="space-y-1.5">
            {recommendations.map((recommendation, index) => (
              <li
                key={index}
                className="text-sm text-muted-foreground flex items-start gap-2"
              >
                <span className="text-primary mt-0.5">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
