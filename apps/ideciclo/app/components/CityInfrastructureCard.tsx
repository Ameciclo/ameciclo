import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@ameciclo/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ameciclo/ui/components/card";
import type { StoredCity } from "~/queries/assessment";

// Km of structural, feeder and local roads the city has, from the OpenStreetMap download.
export function CityInfrastructureCard({ city }: { city: StoredCity }) {
  const [open, setOpen] = useState(true);
  const items = [
    { label: "Vias estruturais", km: city.structuralKm },
    { label: "Vias alimentadoras", km: city.feederKm },
    { label: "Vias locais", km: city.localKm },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {city.name}, {city.state}
            </CardTitle>
            <CardDescription>Dados da infraestrutura viária</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setOpen(!open)} aria-label={open ? "Recolher" : "Expandir"}>
            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </CardHeader>
      {open && (
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {items.map((item) => (
              <div key={item.label} className="rounded-md bg-muted/50 p-4">
                <h4 className="text-sm font-semibold uppercase text-muted-foreground">{item.label}</h4>
                <p className="text-2xl font-bold">{item.km.toLocaleString("pt-BR")} km</p>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
