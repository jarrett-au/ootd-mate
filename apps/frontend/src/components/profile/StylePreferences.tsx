"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import {
  STYLE_OPTIONS,
  STYLE_LABELS,
  OCCASION_OPTIONS,
  OCCASION_LABELS,
  StyleOption,
  OccasionOption,
} from "@/lib/api/profile";

interface StylePreferencesProps {
  primaryStyle?: StyleOption;
  secondaryStyle?: StyleOption;
  occasions: OccasionOption[];
  onPrimaryStyleChange: (style: StyleOption | undefined) => void;
  onSecondaryStyleChange: (style: StyleOption | undefined) => void;
  onOccasionsChange: (occasions: OccasionOption[]) => void;
  errors?: {
    primaryStyle?: string;
    secondaryStyle?: string;
    occasions?: string;
  };
}

export function StylePreferences({
  primaryStyle,
  secondaryStyle,
  occasions,
  onPrimaryStyleChange,
  onSecondaryStyleChange,
  onOccasionsChange,
  errors,
}: StylePreferencesProps) {
  const availableSecondaryStyles = STYLE_OPTIONS.filter(
    (style) => style !== primaryStyle
  );

  const toggleOccasion = (occasion: OccasionOption) => {
    if (occasions.includes(occasion)) {
      onOccasionsChange(occasions.filter((o) => o !== occasion));
    } else {
      onOccasionsChange([...occasions, occasion]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Style Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="primary-style">Primary Style</Label>
          <Select
            value={primaryStyle ?? "none"}
            onValueChange={(value) =>
              onPrimaryStyleChange(value === "none" ? undefined : (value as StyleOption))
            }
          >
            <SelectTrigger
              id="primary-style"
              className={errors?.primaryStyle ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select primary style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {STYLE_OPTIONS.map((style) => (
                <SelectItem key={style} value={style}>
                  {STYLE_LABELS[style]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.primaryStyle && (
            <p className="text-sm text-destructive">{errors.primaryStyle}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondary-style">Secondary Style (Optional)</Label>
          <Select
            value={secondaryStyle ?? "none"}
            onValueChange={(value) =>
              onSecondaryStyleChange(value === "none" ? undefined : (value as StyleOption))
            }
            disabled={!primaryStyle}
          >
            <SelectTrigger
              id="secondary-style"
              className={errors?.secondaryStyle ? "border-destructive" : ""}
            >
              <SelectValue
                placeholder={
                  primaryStyle
                    ? "Select secondary style"
                    : "Select primary style first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {availableSecondaryStyles.map((style) => (
                <SelectItem key={style} value={style}>
                  {STYLE_LABELS[style]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.secondaryStyle && (
            <p className="text-sm text-destructive">{errors.secondaryStyle}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Occasions</Label>
          <div className="flex flex-wrap gap-2">
            {OCCASION_OPTIONS.map((occasion) => {
              const isSelected = occasions.includes(occasion);
              return (
                <Button
                  key={occasion}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleOccasion(occasion)}
                  className="relative"
                >
                  {OCCASION_LABELS[occasion]}
                  {isSelected && (
                    <X className="ml-2 h-3 w-3" />
                  )}
                </Button>
              );
            })}
          </div>
          {occasions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Select occasions that match your style needs
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
