"use client";

import { signOutAction } from "@/app/actions/auth";
import { fetchLinkedInEmployeeCountAction } from "@/app/actions/linkedin";
import {
  deleteUserAction,
  updateOrganizationAction,
  updateUserAction,
} from "@/app/actions/user";
import { AvatarUploadDialog } from "@/components/dashboard/avatar-upload-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  Building2,
  Camera,
  Loader2,
  Trash2,
  User,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface SettingsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
  };
  organization: {
    id: string;
    name: string;
    headquarters: string | null;
    linkedinUrl: string | null;
    employeeCount: number | null;
    annualRevenue: number | null;
  };
}

export function SettingsSidebar({
  open,
  onOpenChange,
  user,
  organization,
}: SettingsSidebarProps) {
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userName, setUserName] = useState(user.name ?? "");
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState(organization.name);
  const [orgHeadquarters, setOrgHeadquarters] = useState(
    organization.headquarters ?? ""
  );
  const [orgLinkedinUrl, setOrgLinkedinUrl] = useState(
    organization.linkedinUrl ?? ""
  );
  const [orgEmployeeCount, setOrgEmployeeCount] = useState(
    organization.employeeCount?.toString() ?? ""
  );
  const [orgAnnualRevenue, setOrgAnnualRevenue] = useState(
    organization.annualRevenue?.toString() ?? ""
  );
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [linkedinError, setLinkedinError] = useState<string | null>(null);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoading(true);
    setUserError(null);

    const result = await updateUserAction({ name: userName });

    if ("error" in result) {
      setUserError(result.error);
      setUserLoading(false);
    } else {
      setUserLoading(false);
    }
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrgLoading(true);
    setOrgError(null);

    const result = await updateOrganizationAction({
      name: orgName,
      headquarters: orgHeadquarters,
      linkedinUrl: orgLinkedinUrl,
      employeeCount: orgEmployeeCount ? parseInt(orgEmployeeCount, 10) : null,
      annualRevenue: orgAnnualRevenue ? parseFloat(orgAnnualRevenue) : null,
    });

    if ("error" in result) {
      setOrgError(result.error);
      setOrgLoading(false);
    } else {
      setOrgLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);

    const result = await deleteUserAction();

    if ("error" in result) {
      setDeleteLoading(false);
      setUserError(result.error);
      setDeleteDialogOpen(false);
    } else {
      await signOutAction();
    }
  };

  const handleFetchEmployeeCount = async () => {
    if (!orgLinkedinUrl) {
      setLinkedinError("Please enter a LinkedIn URL first");
      return;
    }

    setLinkedinLoading(true);
    setLinkedinError(null);
    setEmployeeCount(null);

    const result = await fetchLinkedInEmployeeCountAction(orgLinkedinUrl);

    if (result.success && result.employeeCount) {
      const count = result.employeeCount;
      setEmployeeCount(count);
      setOrgEmployeeCount(count.toString());

      // Auto-save the employee count
      const saveResult = await updateOrganizationAction({
        name: orgName,
        headquarters: orgHeadquarters,
        linkedinUrl: orgLinkedinUrl,
        employeeCount: count,
        annualRevenue: orgAnnualRevenue ? parseFloat(orgAnnualRevenue) : null,
      });

      if ("error" in saveResult) {
        setLinkedinError(`Fetched but failed to save: ${saveResult.error}`);
      }
    } else {
      setLinkedinError(result.error ?? "Failed to fetch employee count");
    }

    setLinkedinLoading(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage your account and organization settings
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="user" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user" className="gap-2">
                <User className="h-4 w-4" />
                User Profile
              </TabsTrigger>
              <TabsTrigger value="organization" className="gap-2">
                <Building2 className="h-4 w-4" />
                Organization
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Profile Picture</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setAvatarDialogOpen(true)}
                    className="relative group cursor-pointer transition-transform hover:scale-105"
                    aria-label="Update profile picture"
                  >
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.name || "User avatar"}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-full object-cover ring-2 ring-border/50 ring-offset-2 ring-offset-background transition-all group-hover:ring-primary/50"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center ring-2 ring-border/50 ring-offset-2 ring-offset-background transition-all group-hover:ring-primary/50">
                        <span className="text-2xl font-semibold text-primary">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAvatarDialogOpen(true)}
                      className="gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Name</Label>
                  <Input
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your name"
                    disabled={userLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email</Label>
                  <Input
                    id="userEmail"
                    value={user.email ?? ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                {userError && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {userError}
                  </div>
                )}

                <Button type="submit" disabled={userLoading} className="w-full">
                  {userLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>

              <div className="pt-6 border-t space-y-4">
                <h3 className="text-sm font-semibold text-destructive">
                  Danger Zone
                </h3>
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-medium">Delete Account</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="organization" className="space-y-6 mt-6">
              <form onSubmit={handleUpdateOrganization} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Organization name"
                    disabled={orgLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgHeadquarters">Headquarters</Label>
                  <Input
                    id="orgHeadquarters"
                    value={orgHeadquarters}
                    onChange={(e) => setOrgHeadquarters(e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                    disabled={orgLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Location of your organization's headquarters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgLinkedinUrl">LinkedIn URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="orgLinkedinUrl"
                      value={orgLinkedinUrl}
                      onChange={(e) => {
                        setOrgLinkedinUrl(e.target.value);
                        setEmployeeCount(null);
                        setLinkedinError(null);
                      }}
                      placeholder="https://linkedin.com/company/your-org"
                      disabled={orgLoading || linkedinLoading}
                      type="url"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={handleFetchEmployeeCount}
                      disabled={linkedinLoading || !orgLinkedinUrl}
                      className="shrink-0"
                    >
                      {linkedinLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used for social KPI tracking
                  </p>
                  {linkedinError && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                      {linkedinError}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgEmployeeCount">Employee Count</Label>
                  <Input
                    id="orgEmployeeCount"
                    value={orgEmployeeCount || "Not set"}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Fetched from LinkedIn. Use the arrow button above to update.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgAnnualRevenue">Annual Revenue (USD)</Label>
                  <Input
                    id="orgAnnualRevenue"
                    value={orgAnnualRevenue}
                    onChange={(e) => setOrgAnnualRevenue(e.target.value)}
                    placeholder="e.g., 5000000"
                    disabled={orgLoading}
                    type="number"
                    step="0.01"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for calculating revenue-based KPIs and sustainability
                    metrics
                  </p>
                </div>

                {orgError && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {orgError}
                  </div>
                )}

                <Button type="submit" disabled={orgLoading} className="w-full">
                  {orgLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AvatarUploadDialog
        currentAvatarUrl={user.avatarUrl}
        userName={user.name}
        open={avatarDialogOpen}
        onOpenChange={setAvatarDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
