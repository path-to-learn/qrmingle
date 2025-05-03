import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

type CountryData = {
  country: string;
  countryCode: string;
  visitors: number;
};

interface CountryVisitorsGridProps {
  countryData: CountryData[];
}

const CountryVisitorsGrid: React.FC<CountryVisitorsGridProps> = ({ countryData }) => {
  // Sort countries by visitor count (descending)
  const sortedData = useMemo(() => {
    return [...countryData].sort((a, b) => b.visitors - a.visitors);
  }, [countryData]);

  // Function to get flag emoji from country code
  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return '🌐';
    
    // Convert country code to flag emoji
    // Country code is 'US', 'GB', etc - convert to regional indicator symbols
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    
    return String.fromCodePoint(...codePoints);
  };

  if (sortedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            Country Visitors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <p>No visitor data available yet.</p>
            <p className="mt-2 text-sm">Start sharing your QR code to gather visitor analytics.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="mr-2 h-5 w-5" />
          Country Visitors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Flag</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-right">Visitors</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow key={item.country}>
                <TableCell className="font-medium">
                  <span className="text-xl" role="img" aria-label={item.country}>
                    {getFlagEmoji(item.countryCode)}
                  </span>
                </TableCell>
                <TableCell>{item.country}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={index === 0 ? "default" : "outline"}>
                    {item.visitors}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CountryVisitorsGrid;