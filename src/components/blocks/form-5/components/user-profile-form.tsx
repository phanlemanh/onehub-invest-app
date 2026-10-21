"use client"

import { Fragment, type FormEvent, type ReactNode } from "react"
import { Badge } from "@/components/reui/badge"
import { toast } from "sonner"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ActivityHeatmap } from "./activity-heatmap"
import {
  ACTIVITY_YEAR_OPTIONS,
  AUDIT_FACTS,
  CONNECTED_ACCOUNT_ROWS,
  COUNTRY_OPTIONS,
  EMAIL_ROWS,
  HEADER_ACTIONS,
  LOCALE_OPTIONS,
  MFA_OPTIONS,
  ORGANIZATION_ROLE_OPTIONS,
  ORGANIZATION_ROWS,
  PROFILE_IDENTITY,
  PROFILE_TABS,
  ROLE_OPTIONS,
  SECURITY_SETTINGS,
  SESSION_OPTIONS,
  TIMEZONE_OPTIONS,
  VISIBILITY_OPTIONS,
} from "./data"
import type { ProfileAccountRow as ProfileAccountRowData } from "./data"
import { ProfileAccountRow } from "./profile-account-row"
import { ProfileActionMenu } from "./profile-action-menu"
import { ProfileAvatarField } from "./profile-avatar-field"
import { ProfileCountryCombobox } from "./profile-country-combobox"
import { ProfileFieldRow } from "./profile-field-row"
import { ProfileSection } from "./profile-section"
import { ProfileSelectField } from "./profile-select-field"
import { InfoIcon, CopyIcon, PlusIcon, LockIcon, ArrowRightIcon, CircleCheckIcon, ArrowLeftIcon, SaveIcon } from "lucide-react"

const FORM_ID = "form-5-user-profile"

function MetadataDot() {
  return (
    <span
      aria-hidden="true"
      className="size-1 shrink-0 rounded-full bg-gray-400"
    />
  )
}

function ConnectedRows({ rows }: { rows: ProfileAccountRowData[] }) {
  return (
    <div className="flex flex-col">
      {rows.map((row, index) => (
        <Fragment key={row.id}>
          {index > 0 ? <Separator /> : null}
          <ProfileAccountRow account={row} />
        </Fragment>
      ))}
    </div>
  )
}

function AuditFactRow({ fact }: { fact: (typeof AUDIT_FACTS)[number] }) {
  return (
    <Item size="sm" className="px-4">
      {/* Media */}
      <ItemMedia variant="icon">{fact.icon}</ItemMedia>

      {/* Content */}
      <ItemContent className="min-w-0">
        <ItemDescription className="flex items-center gap-1.5">
          <span>{fact.label}</span>
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex shrink-0 rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2"
                  aria-label={`${fact.label}: ${fact.description}`}
                />
              }
            >
              <InfoIcon className="size-3.5" aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent className="max-w-56 p-2.5">
              <p className="text-xs opacity-80">{fact.description}</p>
            </TooltipContent>
          </Tooltip>
        </ItemDescription>
        <ItemTitle className="w-full min-w-0 gap-1.5">
          <span className="min-w-0 truncate">{fact.value}</span>
          {fact.copyable ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="shrink-0"
              aria-label={`Copy ${fact.label}`}
            >
              <CopyIcon aria-hidden="true" />
            </Button>
          ) : null}
        </ItemTitle>
      </ItemContent>
    </Item>
  )
}

function ActivitySection() {
  return (
    <ProfileSection
      title="User Activity"
      description="A lightweight trace of recent profile and workspace activity."
      contentClassName="p-5"
      action={
        <div className="w-28">
          <ProfileSelectField
            id="form-5-activity-year"
            options={ACTIVITY_YEAR_OPTIONS}
            defaultValue="2026"
          />
        </div>
      }
    >
      <ActivityHeatmap />
    </ProfileSection>
  )
}

function PersonalInformationSection() {
  return (
    <ProfileSection
      title="Personal Information"
      description="Edit the identity shown across assignments and handoffs."
    >
      <FieldGroup className="gap-0">
        <ProfileFieldRow
          title="Profile Image"
          description="Used in mentions, activity rows, and directory previews."
          align="start"
        >
          <ProfileAvatarField
            inputId="form-5-avatar"
            defaultImage={PROFILE_IDENTITY.avatar}
            alt={PROFILE_IDENTITY.displayName}
            initials={PROFILE_IDENTITY.initials}
          />
        </ProfileFieldRow>

        <ProfileFieldRow
          title="Name"
          description="Keep legal and display naming aligned."
          align="start"
        >
          <FieldGroup className="grid gap-3 sm:grid-cols-2">
            <Field className="gap-2">
              <FieldLabel htmlFor="form-5-first-name">First Name</FieldLabel>
              <Input
                id="form-5-first-name"
                defaultValue={PROFILE_IDENTITY.firstName}
              />
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="form-5-last-name">Last Name</FieldLabel>
              <Input
                id="form-5-last-name"
                defaultValue={PROFILE_IDENTITY.lastName}
              />
            </Field>
          </FieldGroup>
        </ProfileFieldRow>

        <ProfileFieldRow
          title="Public Handle"
          description="Used for mentions, profile links, and compact owner labels."
          labelFor="form-5-handle"
        >
          <InputGroup className="w-full">
            <InputGroupAddon align="inline-start">
              <InputGroupText>@</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="form-5-handle"
              defaultValue={PROFILE_IDENTITY.handle}
            />
          </InputGroup>
        </ProfileFieldRow>

        <ProfileFieldRow
          title="Role"
          description="Controls assignment labels and operational scope."
          labelFor="form-5-role"
        >
          <ProfileSelectField
            id="form-5-role"
            options={ROLE_OPTIONS}
            defaultValue="product-ops-lead"
          />
        </ProfileFieldRow>

        <ProfileFieldRow
          title="Country"
          description="Sets the regional profile context."
          labelFor="form-5-country"
        >
          <ProfileCountryCombobox
            id="form-5-country"
            options={COUNTRY_OPTIONS}
            defaultCode={PROFILE_IDENTITY.countryCode}
          />
        </ProfileFieldRow>

        <ProfileFieldRow
          title="Locale"
          description="Controls date, number, and interface formatting."
          labelFor="form-5-locale"
        >
          <ProfileSelectField
            id="form-5-locale"
            options={LOCALE_OPTIONS}
            defaultValue="en-ca"
          />
        </ProfileFieldRow>

        <ProfileFieldRow
          title="Time Zone"
          description="Used for activity timestamps and notifications."
          labelFor="form-5-timezone"
        >
          <ProfileSelectField
            id="form-5-timezone"
            options={TIMEZONE_OPTIONS}
            defaultValue={PROFILE_IDENTITY.timezone}
          />
        </ProfileFieldRow>

        <ProfileFieldRow
          title="Bio"
          description="Short internal context for admins and collaborators."
          align="start"
          labelFor="form-5-bio"
        >
          <Textarea
            id="form-5-bio"
            defaultValue={PROFILE_IDENTITY.bio}
            className="min-h-24 resize-none"
          />
        </ProfileFieldRow>

        <ProfileFieldRow
          title="Profile Visibility"
          description="Decide who can see extended profile details."
          labelFor="form-5-visibility"
        >
          <ProfileSelectField
            id="form-5-visibility"
            options={VISIBILITY_OPTIONS}
            defaultValue="workspace"
          />
        </ProfileFieldRow>
      </FieldGroup>
    </ProfileSection>
  )
}

function ContactSection() {
  return (
    <div className="flex flex-col gap-7">
      <ProfileSection
        title="Email Addresses"
        description="Verified addresses used for sign-in and notifications."
        action={
          <Button type="button" variant="ghost">
            <PlusIcon data-icon="inline-start" aria-hidden="true" />
            Add Email
          </Button>
        }
      >
        <ConnectedRows rows={EMAIL_ROWS} />
      </ProfileSection>

      <ProfileSection
        title="Connected Accounts"
        description="Identity sources and public destinations linked to this user."
      >
        <ConnectedRows rows={CONNECTED_ACCOUNT_ROWS} />
      </ProfileSection>
    </div>
  )
}

function AuditRail() {
  return (
    <aside className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
      <Card className="gap-0 p-0">
        {/* Header */}
        <CardHeader className="gap-1 px-4 py-4">
          <CardTitle>Audit Rail</CardTitle>
          <div className="text-muted-foreground text-sm">
            Stable identifiers and profile timestamps.
          </div>
        </CardHeader>

        <Separator />

        {/* Content */}
        <CardContent className="p-0">
          {AUDIT_FACTS.map((fact, index) => (
            <Fragment key={fact.id}>
              {index > 0 ? <Separator /> : null}
              <AuditFactRow fact={fact} />
            </Fragment>
          ))}
        </CardContent>
      </Card>

      <Card className="gap-0 p-0">
        {/* Header */}
        <CardHeader className="gap-1 px-4 py-4">
          <CardTitle>Profile Health</CardTitle>
          <div className="text-muted-foreground text-sm">
            Identity quality and access readiness.
          </div>
        </CardHeader>

        <Separator />

        {/* Content */}
        <CardContent className="flex flex-col gap-4 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Completion</span>
            <span className="text-sm font-medium">92%</span>
          </div>
          <Progress value={92} aria-label="Profile completion" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Identity Sync</span>
              <Badge variant="warning-light">
                <Spinner className="size-3" aria-hidden="true" />
                Syncing
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Access Review</span>
              <span className="font-medium">Due May 02</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Recovery</span>
              <span className="font-medium">Configured</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}

function ProfileTabContent() {
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="flex min-w-0 flex-col gap-7">
        <ActivitySection />
        <PersonalInformationSection />
        <ContactSection />
      </div>
      <AuditRail />
    </div>
  )
}

function OrganizationsTabContent() {
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="flex min-w-0 flex-col gap-7">
        <ProfileSection
          title="Organization Membership"
          description="Control workspace ownership, role, and operational scope."
        >
          <FieldGroup className="gap-0">
            <ProfileFieldRow
              title="Default Organization"
              description="Used when creating new records and reports."
              labelFor="form-5-default-org"
            >
              <Input id="form-5-default-org" defaultValue="Atlas Lane" />
            </ProfileFieldRow>

            <Separator />

            <ProfileFieldRow
              title="Membership Role"
              description="Sets admin access for billing, teams, and releases."
              labelFor="form-5-org-role"
            >
              <ProfileSelectField
                id="form-5-org-role"
                options={ORGANIZATION_ROLE_OPTIONS}
                defaultValue="owner"
              />
            </ProfileFieldRow>
          </FieldGroup>
        </ProfileSection>

        <ProfileSection
          title="Workspace Access"
          description="Active organizations and groups connected to this user."
        >
          <ConnectedRows rows={ORGANIZATION_ROWS} />
        </ProfileSection>
      </div>
      <AuditRail />
    </div>
  )
}

function SecuritySettingRow({
  setting,
}: {
  setting: (typeof SECURITY_SETTINGS)[number]
}) {
  return (
    <Field orientation="responsive" className="gap-4 px-5 py-4">
      <div className="flex min-w-0 flex-col gap-0.5 @md/field-group:max-w-md">
        <div className="flex flex-wrap items-center gap-2">
          <FieldLabel htmlFor={setting.id}>{setting.title}</FieldLabel>
        </div>
        <FieldDescription>{setting.description}</FieldDescription>
      </div>
      <div className="flex justify-start @md/field-group:ml-auto @md/field-group:justify-end">
        <Switch
          id={setting.id}
          defaultChecked={setting.defaultChecked}
          aria-label={setting.title}
        />
      </div>
    </Field>
  )
}

function SecurityTabContent() {
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="flex min-w-0 flex-col gap-7">
        <ProfileSection
          title="Sign-In Controls"
          description="Set recovery and session controls for this profile."
        >
          <FieldGroup className="gap-0">
            <ProfileFieldRow
              title="Recovery Email"
              description="Where admins can send secure reset notices."
              labelFor="form-5-recovery-email"
            >
              <Input
                id="form-5-recovery-email"
                type="email"
                defaultValue="recovery.iris@atlaslane.dev"
              />
            </ProfileFieldRow>

            <Separator />

            <ProfileFieldRow
              title="MFA Method"
              description="Required method for privileged actions."
              labelFor="form-5-mfa"
            >
              <ProfileSelectField
                id="form-5-mfa"
                options={MFA_OPTIONS}
                defaultValue="passkey"
              />
            </ProfileFieldRow>

            <Separator />

            <ProfileFieldRow
              title="Session Duration"
              description="Maximum session age before re-authentication."
              labelFor="form-5-session"
            >
              <ProfileSelectField
                id="form-5-session"
                options={SESSION_OPTIONS}
                defaultValue="30-days"
              />
            </ProfileFieldRow>
          </FieldGroup>
        </ProfileSection>

        <ProfileSection
          title="Security Notifications"
          description="Account alerts and privacy defaults for this user."
        >
          <FieldGroup className="gap-0">
            {SECURITY_SETTINGS.map((setting, index) => (
              <Fragment key={setting.id}>
                {index > 0 ? <Separator /> : null}
                <SecuritySettingRow setting={setting} />
              </Fragment>
            ))}
          </FieldGroup>
        </ProfileSection>
      </div>
      <AuditRail />
    </div>
  )
}

function PayloadAccessTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Profile payload preview"
          />
        }
      >
        <LockIcon aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent className="max-w-64 p-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Payload Preview</span>
            <span className="text-success text-xs font-medium">Pro plan</span>
          </div>
          <p className="text-xs opacity-80">
            Inspect raw profile payloads, sync diffs, and identity-provider
            fields before saving.
          </p>
          <Button type="button" size="sm" className="border-border/40 border">
            Request Access
            <ArrowRightIcon aria-hidden="true" />
          </Button>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

function getToastIcon() {
  return (
    <CircleCheckIcon className="text-success size-4 shrink-0" aria-hidden="true" />
  )
}

function ToastTitle({ icon, children }: { icon: ReactNode; children: string }) {
  return (
    <span className="flex items-center gap-2">
      {icon}
      <span className="min-w-0">{children}</span>
    </span>
  )
}

function ToastDescription({ children }: { children: string }) {
  return (
    <span className="grid grid-cols-[1rem_1fr] gap-2">
      <span aria-hidden="true" />
      <span>{children}</span>
    </span>
  )
}

function showProfileToast(title: string, description: string) {
  toast.success(<ToastTitle icon={getToastIcon()}>{title}</ToastTitle>, {
    description: <ToastDescription>{description}</ToastDescription>,
    icon: null,
  })
}

export function UserProfileForm() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    showProfileToast(
      "Profile saved",
      "Identity, access, and contact details were updated."
    )
  }

  return (
    <form
      id={FORM_ID}
      onSubmit={handleSubmit}
      className="flex w-full max-w-6xl flex-col gap-6"
    >
      {/* Header */}
      <header className="flex flex-col gap-5">
        <Button type="button" variant="link" className="w-fit px-0">
          <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
          Users
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-14">
              <AvatarImage
                src={PROFILE_IDENTITY.avatar}
                alt={PROFILE_IDENTITY.displayName}
              />
              <AvatarFallback>{PROFILE_IDENTITY.initials}</AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-col gap-0.5">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h2 className="text-2xl leading-tight font-semibold tracking-tight">
                  {PROFILE_IDENTITY.displayName}
                </h2>
              </div>
              <p className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm">
                <span>{PROFILE_IDENTITY.role}</span>
                <MetadataDot />
                <span>{PROFILE_IDENTITY.status}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PayloadAccessTooltip />
            <ProfileActionMenu
              label="Open profile actions"
              actions={HEADER_ACTIONS}
            />
            <Button type="submit" form={FORM_ID}>
              <SaveIcon data-icon="inline-start" aria-hidden="true" />
              Save Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="gap-6">
        <ScrollArea className="w-full whitespace-nowrap [&>[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:hidden">
          <div className="w-max min-w-max">
            <TabsList
              variant="line"
              aria-label="Profile form sections"
              className="h-auto w-max min-w-max justify-start gap-6 bg-transparent py-2"
            >
              {PROFILE_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  type="button"
                  className="flex-none justify-start gap-2 px-0 py-2"
                >
                  <span className="[&_svg]:size-4">{tab.icon}</span>
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </ScrollArea>

        <TabsContent value="profile" className="mt-0">
          <ProfileTabContent />
        </TabsContent>
        <TabsContent value="organizations" className="mt-0">
          <OrganizationsTabContent />
        </TabsContent>
        <TabsContent value="security" className="mt-0">
          <SecurityTabContent />
        </TabsContent>
      </Tabs>
    </form>
  )
}