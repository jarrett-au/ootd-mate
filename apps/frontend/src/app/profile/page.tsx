"use client";

import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { StylePreferences } from "@/components/profile/StylePreferences";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { profileApi, Profile, StyleOption, OccasionOption } from "@/lib/api/profile";
import { Loader2, Save, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    height?: string;
    weight?: string;
    primaryStyle?: string;
    secondaryStyle?: string;
    occasions?: string;
  }>({});

  // Form state
  const [height, setHeight] = useState<number | undefined>();
  const [weight, setWeight] = useState<number | undefined>();
  const [primaryStyle, setPrimaryStyle] = useState<StyleOption | undefined>();
  const [secondaryStyle, setSecondaryStyle] = useState<StyleOption | undefined>();
  const [occasions, setOccasions] = useState<OccasionOption[]>([]);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile();
      setProfile(data);
      setHeight(data.height ?? undefined);
      setWeight(data.weight ?? undefined);
      setPrimaryStyle(data.primaryStyle ?? undefined);
      setSecondaryStyle(data.secondaryStyle ?? undefined);
      setOccasions(data.occasions ?? []);
    } catch (error) {
      console.error("Failed to load profile:", error);
      // Profile doesn't exist yet, that's okay
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (height !== undefined && (height < 100 || height > 250)) {
      newErrors.height = "Height must be between 100 and 250 cm";
    }

    if (weight !== undefined && (weight < 30 || weight > 200)) {
      newErrors.weight = "Weight must be between 30 and 200 kg";
    }

    if (secondaryStyle && !primaryStyle) {
      newErrors.secondaryStyle =
        "Please select a primary style first";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setSaveSuccess(false);
      setErrors({});

      await profileApi.updateProfile({
        height,
        weight,
        primary_style: primaryStyle,
        secondary_style: secondaryStyle,
        occasions,
      });

      // Reload profile to get updated data
      await loadProfile();

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save profile";
      setErrors({
        primaryStyle: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your measurements and style preferences
          </p>
        </div>

        <div className="space-y-6">
          <ProfileForm
            height={height}
            weight={weight}
            onHeightChange={setHeight}
            onWeightChange={setWeight}
            errors={errors}
          />

          <StylePreferences
            primaryStyle={primaryStyle}
            secondaryStyle={secondaryStyle}
            occasions={occasions}
            onPrimaryStyleChange={(style) => {
              setPrimaryStyle(style);
              // Clear secondary style if it conflicts with new primary
              if (secondaryStyle === style) {
                setSecondaryStyle(undefined);
              }
            }}
            onSecondaryStyleChange={setSecondaryStyle}
            onOccasionsChange={setOccasions}
            errors={errors}
          />

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  size="lg"
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>

                {saveSuccess && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Saved successfully
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {profile && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profile ID:</span>
                  <span className="font-mono">{profile.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last updated:</span>
                  <span>{new Date(profile.updatedAt).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
