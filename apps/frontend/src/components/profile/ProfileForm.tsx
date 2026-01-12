"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileFormProps {
  height?: number;
  weight?: number;
  onHeightChange: (height: number | undefined) => void;
  onWeightChange: (weight: number | undefined) => void;
  errors?: {
    height?: string;
    weight?: string;
  };
}

export function ProfileForm({
  height,
  weight,
  onHeightChange,
  onWeightChange,
  errors,
}: ProfileFormProps) {
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      onHeightChange(undefined);
      return;
    }

    const numValue = parseFloat(value);
    if (numValue >= 100 && numValue <= 250) {
      onHeightChange(numValue);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      onWeightChange(undefined);
      return;
    }

    const numValue = parseFloat(value);
    if (numValue >= 30 && numValue <= 200) {
      onWeightChange(numValue);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Body Measurements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="height">
            Height (cm)
            <span className="text-muted-foreground ml-2 text-sm">
              100-250 cm
            </span>
          </Label>
          <Input
            id="height"
            type="number"
            min={100}
            max={250}
            step={1}
            placeholder="170"
            value={height ?? ""}
            onChange={handleHeightChange}
            className={errors?.height ? "border-destructive" : ""}
          />
          {errors?.height && (
            <p className="text-sm text-destructive">{errors.height}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">
            Weight (kg)
            <span className="text-muted-foreground ml-2 text-sm">
              30-200 kg
            </span>
          </Label>
          <Input
            id="weight"
            type="number"
            min={30}
            max={200}
            step={0.1}
            placeholder="70"
            value={weight ?? ""}
            onChange={handleWeightChange}
            className={errors?.weight ? "border-destructive" : ""}
          />
          {errors?.weight && (
            <p className="text-sm text-destructive">{errors.weight}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
