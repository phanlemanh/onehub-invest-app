"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import { cn } from "cn"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Item, ItemMedia } from "@/components/ui/item"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  DEFAULT_FORM_VALUES,
  PROMPT_PRESETS,
  REGION_OPTIONS,
  REPOSITORIES,
  RUNTIME_OPTIONS,
  STARTER_TEMPLATES,
  type RegionValue,
  type RepositoryRecord,
  type RuntimeValue,
  type SelectOption,
  type StarterTemplate,
  type TemplateValue,
} from "./data"
import { RocketIcon } from "lucide-react"

const FORM_ID = "form-11-app-launch"
const dashedSeparatorClassName =
  "border-border bg-transparent data-horizontal:h-0 data-horizontal:border-t data-horizontal:border-dashed"

function getOptionLabel<TValue extends string>(
  options: SelectOption<TValue>[],
  value: TValue
) {
  return options.find((option) => option.value === value)?.label ?? value
}

function FormRow({
  title,
  description,
  htmlFor,
  align = "center",
  children,
}: {
  title: string
  description: string
  htmlFor: string
  align?: "center" | "start"
  children: ReactNode
}) {
  return (
    <Field
      className={cn(
        "grid gap-3 px-5 py-4 sm:px-6 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]",
        align === "start" ? "md:items-start" : "md:items-center"
      )}
    >
      <FieldContent className="gap-0.5 md:pt-0.5">
        <FieldLabel htmlFor={htmlFor}>{title}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
      <div className="min-w-0">{children}</div>
    </Field>
  )
}

function InsetSeparator() {
  return (
    <div className="px-5 sm:px-6">
      <DashedSeparator />
    </div>
  )
}

function DashedSeparator() {
  return <Separator className={dashedSeparatorClassName} />
}

function OptionSelect<TValue extends string>({
  id,
  value,
  options,
  onValueChange,
}: {
  id: string
  value: TValue
  options: SelectOption<TValue>[]
  onValueChange: (value: TValue) => void
}) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => nextValue && onValueChange(nextValue)}
    >
      <SelectTrigger id={id} className="w-full [&_small]:hidden">
        <SelectValue>{getOptionLabel(options, value)}</SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex min-w-0 flex-col items-start gap-px">
                <span className="font-medium">{option.label}</span>
                <small className="text-muted-foreground line-clamp-1 text-xs">
                  {option.description}
                </small>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function RepositorySelect({
  value,
  repositories,
  onValueChange,
}: {
  value: string
  repositories: RepositoryRecord[]
  onValueChange: (value: string) => void
}) {
  const selectedRepository =
    repositories.find((repository) => repository.id === value) ??
    repositories[0]

  return (
    <Select
      value={value}
      onValueChange={(nextValue) => nextValue && onValueChange(nextValue)}
    >
      <SelectTrigger
        id="form-11-repository"
        className="w-full [&_small]:hidden"
      >
        <SelectValue>{selectedRepository.name}</SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {repositories.map((repository) => (
            <SelectItem key={repository.id} value={repository.id}>
              <span className="flex min-w-0 flex-col items-start gap-px">
                <span className="font-medium">{repository.name}</span>
                <small className="text-muted-foreground line-clamp-1 text-xs">
                  {repository.owner} / {repository.branch} ·{" "}
                  {repository.description}
                </small>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function TemplateSelect({
  value,
  templates,
  onValueChange,
}: {
  value: TemplateValue
  templates: StarterTemplate[]
  onValueChange: (value: TemplateValue) => void
}) {
  const selectedTemplate =
    templates.find((template) => template.value === value) ?? templates[0]

  return (
    <Select
      value={value}
      onValueChange={(nextValue) =>
        nextValue && onValueChange(nextValue as TemplateValue)
      }
    >
      <SelectTrigger id="form-11-template" className="w-full [&_small]:hidden">
        <SelectValue>{selectedTemplate.title}</SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {templates.map((template) => (
            <SelectItem key={template.value} value={template.value}>
              <span className="flex min-w-0 flex-col items-start gap-px">
                <span className="font-medium">{template.title}</span>
                <small className="text-muted-foreground line-clamp-1 text-xs">
                  {template.description}
                </small>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function LaunchBanner({
  selectedTemplate,
  selectedRepository,
  runtime,
  region,
}: {
  selectedTemplate: StarterTemplate
  selectedRepository: RepositoryRecord
  runtime: RuntimeValue
  region: RegionValue
}) {
  return (
    <div className="relative isolate overflow-hidden rounded-md bg-[linear-gradient(155deg,oklch(0.24_0.15_258)_0%,oklch(0.37_0.18_282)_36%,oklch(0.68_0.19_318)_67%,oklch(0.86_0.13_48)_100%)] p-4 text-white sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,oklch(0.18_0.15_252)_0%,transparent_48%),linear-gradient(28deg,oklch(0.91_0.11_42)_0%,transparent_45%)] opacity-90" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,oklch(0.87_0.14_330)_100%)] opacity-50" />

      <div className="relative flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Item className="flex size-10 shrink-0 items-center justify-center border border-white/20 bg-white/15 p-0">
            <ItemMedia variant="icon" className="size-auto">
              <RocketIcon className="size-4" aria-hidden="true" />
            </ItemMedia>
          </Item>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white/70">Launch setup</p>
            <h2 className="truncate text-lg leading-6 font-semibold">
              {selectedTemplate.title}
            </h2>
            <p className="mt-1 line-clamp-1 text-sm text-white/75">
              {selectedTemplate.description}
            </p>
          </div>
        </div>

        <div className="bg-background/95 text-foreground w-full rounded-md p-3 text-sm shadow-lg shadow-black/15 backdrop-blur sm:w-64">
          <div className="grid gap-1.5">
            <BannerDetail label="Source" value={selectedRepository.name} />
            <BannerDetail
              label="Runtime"
              value={getOptionLabel(RUNTIME_OPTIONS, runtime)}
            />
            <BannerDetail
              label="Region"
              value={getOptionLabel(REGION_OPTIONS, region)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function BannerDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  )
}

export function AppLaunchForm() {
  const [prompt, setPrompt] = useState(PROMPT_PRESETS[0].prompt)
  const [selectedRepositoryId, setSelectedRepositoryId] = useState(
    REPOSITORIES[0].id
  )
  const [selectedTemplateValue, setSelectedTemplateValue] =
    useState<TemplateValue>("response-hub")
  const [runtime, setRuntime] = useState<RuntimeValue>("next-app")
  const [region, setRegion] = useState<RegionValue>("iad")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedRepository =
    REPOSITORIES.find((repository) => repository.id === selectedRepositoryId) ??
    REPOSITORIES[0]
  const selectedTemplate =
    STARTER_TEMPLATES.find(
      (template) => template.value === selectedTemplateValue
    ) ?? STARTER_TEMPLATES[0]

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)

    window.setTimeout(() => {
      setIsSubmitting(false)
      toast.success("App launch queued", {
        description: `${selectedTemplate.title} will deploy from ${selectedRepository.name} in ${getOptionLabel(
          REGION_OPTIONS,
          region
        )}.`,
      })
    }, 1100)
  }

  function handleCancel() {
    setPrompt(PROMPT_PRESETS[0].prompt)
    setSelectedRepositoryId(REPOSITORIES[0].id)
    setSelectedTemplateValue("response-hub")
    setRuntime("next-app")
    setRegion("iad")
  }

  return (
    <div className="bg-background flex min-h-svh w-full items-start justify-center px-4 py-6 sm:px-6 sm:py-10">
      <Card className="w-full max-w-3xl gap-0 p-0">
        <CardHeader className="border-border gap-1 border-b px-5 py-4 sm:px-6">
          <CardTitle>New App</CardTitle>
          <CardDescription>
            Create a launch-ready app from a brief, source, and starter.
          </CardDescription>
        </CardHeader>

        <form id={FORM_ID} onSubmit={handleSubmit}>
          <CardContent className="p-0">
            <div className="px-5 py-4 sm:px-6">
              <LaunchBanner
                selectedTemplate={selectedTemplate}
                selectedRepository={selectedRepository}
                runtime={runtime}
                region={region}
              />
            </div>

            <InsetSeparator />

            <FieldSet className="gap-0">
              <FieldLegend className="sr-only">New app launch</FieldLegend>
              <FieldDescription className="sr-only">
                Configure launch brief, starter, source, app name, route,
                runtime, and region.
              </FieldDescription>

              <FieldGroup className="gap-0">
                <FormRow
                  title="Launch Brief"
                  description="Describe the first version."
                  htmlFor="form-11-launch-prompt"
                  align="start"
                >
                  <Textarea
                    id="form-11-launch-prompt"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    className="min-h-24"
                  />
                </FormRow>

                <InsetSeparator />

                <FormRow
                  title="Starter"
                  description="Base app surface."
                  htmlFor="form-11-template"
                >
                  <TemplateSelect
                    value={selectedTemplateValue}
                    templates={STARTER_TEMPLATES}
                    onValueChange={setSelectedTemplateValue}
                  />
                </FormRow>

                <InsetSeparator />

                <FormRow
                  title="Source"
                  description="Repository to connect."
                  htmlFor="form-11-repository"
                >
                  <RepositorySelect
                    value={selectedRepositoryId}
                    repositories={REPOSITORIES}
                    onValueChange={setSelectedRepositoryId}
                  />
                </FormRow>

                <InsetSeparator />

                <FormRow
                  title="App Name"
                  description="Display name for the app."
                  htmlFor="form-11-app-name"
                >
                  <Input
                    id="form-11-app-name"
                    defaultValue={DEFAULT_FORM_VALUES.appName}
                    autoComplete="organization"
                  />
                </FormRow>

                <InsetSeparator />

                <FormRow
                  title="App URL"
                  description="Public route for previews."
                  htmlFor="form-11-app-slug"
                >
                  <InputGroup>
                    <InputGroupAddon className="pr-0 pl-3">
                      <InputGroupText className="text-muted-foreground">
                        studio.reui.dev/
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="form-11-app-slug"
                      defaultValue={DEFAULT_FORM_VALUES.appSlug}
                      autoComplete="off"
                    />
                  </InputGroup>
                </FormRow>

                <InsetSeparator />

                <FormRow
                  title="Runtime"
                  description="Where the app executes."
                  htmlFor="form-11-runtime"
                >
                  <OptionSelect
                    id="form-11-runtime"
                    value={runtime}
                    options={RUNTIME_OPTIONS}
                    onValueChange={setRuntime}
                  />
                </FormRow>

                <InsetSeparator />

                <FormRow
                  title="Region"
                  description="Deployment location."
                  htmlFor="form-11-region"
                >
                  <OptionSelect
                    id="form-11-region"
                    value={region}
                    options={REGION_OPTIONS}
                    onValueChange={setRegion}
                  />
                </FormRow>
              </FieldGroup>
            </FieldSet>
          </CardContent>

          <CardFooter className="justify-end gap-2 px-5 py-4 sm:px-6">
            <Button
              type="reset"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Spinner data-icon="inline-start" aria-hidden="true" />
              ) : (
                <RocketIcon data-icon="inline-start" aria-hidden="true" />
              )}
              Create App
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}