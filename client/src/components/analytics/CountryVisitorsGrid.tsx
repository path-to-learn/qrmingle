import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface CountryVisitor {
  country: string;
  countryCode: string;
  visitors: number;
}

interface CountryVisitorsGridProps {
  countryVisitors: CountryVisitor[];
}

// Function to get country flag emoji from country code
const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return "🌐";
  
  // Convert country code to regional indicator symbols
  // Each letter in the country code is converted to a regional indicator symbol (offset by 127397)
  const codePoints = countryCode.toUpperCase().split('')
    .map(char => char.charCodeAt(0) + 127397);
  
  // Convert code points to emoji
  return String.fromCodePoint(...codePoints);
};

export default function CountryVisitorsGrid({ countryVisitors }: CountryVisitorsGridProps) {
  // Sort countries by visitor count (highest first)
  const sortedVisitors = [...countryVisitors].sort((a, b) => b.visitors - a.visitors);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sortedVisitors.map((visitor) => (
        <Card key={visitor.country} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-4">
              <div className="mr-4 text-3xl">
                {getFlagEmoji(visitor.countryCode)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{visitor.country}</div>
                <div className="text-sm text-muted-foreground">
                  {visitor.visitors} visitor{visitor.visitors !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}