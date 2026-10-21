"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Badge } from "@/components/reui/badge"
import {
  DataGrid,
  dataGridFeatures,
} from "@/components/reui/data-grid/data-grid"
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination"
import { DataGridScrollArea } from "@/components/reui/data-grid/data-grid-scroll-area"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
import { Filters } from "@/components/reui/filters/filters"
import {
  createFilterQuery,
  createFilterRule,
  flattenFilterConditions,
} from "@/components/reui/filters/filters-query"
import type { FilterCondition } from "@/components/reui/filters/filters-query"
import type {
  FilterField,
  FilterQuery,
} from "@/components/reui/filters/filters-types"
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame"
import {
  PaginationState,
  RowPinningState,
  SortingState,
  useTable,
  type ColumnVisibilityState,
} from "@tanstack/react-table"
import { cn } from "cn"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Item, ItemMedia } from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CategoryTags, columns, PriorityBadge, StatusBadge } from "./columns"
import {
  CATEGORY_LABELS,
  CONTACTS,
  type CategoryLabel,
  type ContactPriority,
  type ContactStage,
  type ContactStatus,
  type IContact,
} from "./data"
import { UserIcon, MailIcon, Building2Icon, MapPinIcon, CircleDotIcon, FlagIcon, GitBranchIcon, TagIcon, UserPlusIcon, FilterIcon, PinOffIcon, FunnelXIcon, MoreHorizontalIcon, FileDownIcon, SettingsIcon } from "lucide-react"

// ── Helpers ──

function getActiveFilters(filters: FilterCondition[]) {
  return filters.filter((filter) => {
    // `is empty` and `is not empty` carry no value at all, so the blank-value
    // checks below would drop them and the rule would silently match everything.
    if (filter.operator === "empty" || filter.operator === "not_empty")
      return true
    const { values } = filter
    if (!values || values.length === 0) return false
    if (
      values.every((value) => typeof value === "string" && value.trim() === "")
    )
      return false
    if (values.every((value) => value === null || value === undefined))
      return false
    if (values.every((value) => Array.isArray(value) && value.length === 0))
      return false
    return true
  })
}

// `negated` is part of the key: negating a rule keeps the same field, operator
// and values, so leaving it out makes the chip's Negate action a no-op for the
// data even though the chip reads "not starts with".
function serializeActiveFiltersKey(active: FilterCondition[]) {
  return JSON.stringify(
    active.map((f) => ({
      field: f.field,
      operator: f.operator,
      values: f.values,
      negated: f.negated,
    }))
  )
}

function filterFieldValue(item: IContact, field: string): unknown {
  if (field === "tags") return item.tags.join(" ")
  return item[field as keyof IContact]
}

function applyFiltersToData(
  data: IContact[],
  filters: FilterCondition[]
): IContact[] {
  const active = getActiveFilters(filters)
  let result = [...data]
  active.forEach((filter) => {
    const { field, operator, values, negated } = filter
    const matches = (item: IContact) => {
      if (field === "tags") {
        const selected = values.map(String)
        switch (operator) {
          case "is":
            return (
              selected.length > 0 &&
              item.tags.includes(selected[0] as CategoryLabel)
            )
          case "is_not":
            return !selected.some((v) => item.tags.includes(v as CategoryLabel))
          case "is_any_of":
            return selected.some((v) => item.tags.includes(v as CategoryLabel))
          case "is_none_of":
            return !selected.some((v) => item.tags.includes(v as CategoryLabel))
          case "contains": {
            const tokens = values.map((v) => String(v).trim()).filter(Boolean)
            if (tokens.length === 0) return true
            return tokens.some((token) =>
              item.tags.some((t) =>
                t.toLowerCase().includes(token.toLowerCase())
              )
            )
          }
          case "not_contains":
            return !values.some((v) =>
              item.tags.some((t) =>
                t.toLowerCase().includes(String(v).toLowerCase())
              )
            )
          case "empty":
            return item.tags.length === 0
          case "not_empty":
            return item.tags.length > 0
          default:
            return true
        }
      }

      const raw = filterFieldValue(item, field)
      const fieldValue = raw != null ? raw : ""

      switch (operator) {
        case "is":
          return values.includes(fieldValue)
        case "is_not":
          return !values.includes(fieldValue)
        case "is_any_of":
          return values.some((v) => fieldValue === v)
        case "is_none_of":
          return !values.some((v) => fieldValue === v)
        case "contains": {
          const tokens = values.map((v) => String(v).trim()).filter(Boolean)
          if (tokens.length === 0) return true
          return tokens.some((token) =>
            String(fieldValue).toLowerCase().includes(token.toLowerCase())
          )
        }
        case "not_contains":
          return !values.some((v) =>
            String(fieldValue).toLowerCase().includes(String(v).toLowerCase())
          )
        case "starts_with":
          return values.some((v) =>
            String(fieldValue).toLowerCase().startsWith(String(v).toLowerCase())
          )
        case "ends_with":
          return values.some((v) =>
            String(fieldValue).toLowerCase().endsWith(String(v).toLowerCase())
          )
        case "eq":
          return fieldValue === values[0]
        case "neq":
          return fieldValue !== values[0]
        case "gt":
          return Number(fieldValue) > Number(values[0])
        case "lt":
          return Number(fieldValue) < Number(values[0])
        case "gte":
          return Number(fieldValue) >= Number(values[0])
        case "lte":
          return Number(fieldValue) <= Number(values[0])
        case "between":
          if (values.length >= 2) {
            const min = Number(values[0])
            const max = Number(values[1])
            return Number(fieldValue) >= min && Number(fieldValue) <= max
          }
          return true
        case "not_between":
          if (values.length >= 2) {
            const min = Number(values[0])
            const max = Number(values[1])
            return Number(fieldValue) < min || Number(fieldValue) > max
          }
          return true
        case "empty":
          return fieldValue === "" || fieldValue == null
        case "not_empty":
          return fieldValue !== "" && fieldValue != null
        default:
          return true
      }
    }

    // Negate flips a rule whose operator declares no opposite of its own
    // (starts with, ends with), so the inversion belongs here rather than as
    // another branch in the switch.
    result = result.filter((item) => (negated ? !matches(item) : matches(item)))
  })
  return result
}

const STATUS_OPTIONS: { value: ContactStatus; label: string }[] = [
  { value: "Active", label: "Active" },
  { value: "Lead", label: "Lead" },
  { value: "Prospect", label: "Prospect" },
  { value: "Churned", label: "Churned" },
]

const PRIORITY_OPTIONS: { value: ContactPriority; label: string }[] = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
]

const STAGE_OPTIONS: { value: ContactStage; label: string }[] = [
  { value: "Awareness", label: "Awareness" },
  { value: "Consideration", label: "Consideration" },
  { value: "Decision", label: "Decision" },
  { value: "Retention", label: "Retention" },
]

const stageToneClass: Record<ContactStage, string> = {
  Awareness: "bg-sky-500",
  Consideration: "bg-amber-500",
  Decision: "bg-emerald-500",
  Retention: "bg-violet-500",
}

function renderSelectedCount(values: unknown[]) {
  if (values.length === 0) return "Select..."
  if (values.length > 1) return `${values.length} selected`
  return null
}

function createDefaultContactFilters(): FilterQuery {
  return createFilterQuery([
    createFilterRule({
      id: "name-1",
      path: ["name"],
      operator: "contains",
      value: "",
    }),
  ])
}

// ── Main ──

export function ContactsGridView() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ])
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({
      jobTitle: false,
      location: false,
      priority: false,
      lastContact: false,
    })
  const [rowPinning, setRowPinning] = useState<RowPinningState>({
    top: ["1", "2"],
    bottom: [],
  })
  const [filterQuery, setFilterQuery] = useState<FilterQuery>(
    createDefaultContactFilters
  )
  const filters = useMemo(
    () => flattenFilterConditions(filterQuery),
    [filterQuery]
  )
  const [isLoading, setIsLoading] = useState(false)
  const [filteredData, setFilteredData] = useState<IContact[]>(CONTACTS)
  const isInitialLoad = useRef(true)
  const lastAppliedActiveKey = useRef<string>(
    serializeActiveFiltersKey(
      getActiveFilters(flattenFilterConditions(createDefaultContactFilters()))
    )
  )

  const resolvedRowPinning = useMemo(() => {
    const availableIds = new Set(filteredData.map((contact) => contact.id))

    return {
      top: (rowPinning.top ?? []).filter((id) => availableIds.has(id)),
      bottom: (rowPinning.bottom ?? []).filter((id) => availableIds.has(id)),
    }
  }, [filteredData, rowPinning.bottom, rowPinning.top])

  const companyOptions = useMemo(() => {
    return [
      ...new Map(
        CONTACTS.map((contact) => [contact.company, contact])
      ).values(),
    ]
      .sort((a, b) => a.company.localeCompare(b.company))
      .map((contact) => ({
        value: contact.company,
        label: contact.company,
        icon: (
          <Item
            render={<span />}
            className="w-auto shrink-0 border-0 p-0 [&_svg]:size-4"
          >
            <ItemMedia variant="icon" className="size-auto">
              {contact.companyLogo}
            </ItemMedia>
          </Item>
        ),
      }))
  }, [])

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        id: "name",
        label: "Name",
        icon: (
          <UserIcon className="size-3.5" aria-hidden />
        ),
        type: "text",
        placeholder: "Search...",
      },
      {
        id: "email",
        label: "Email",
        icon: (
          <MailIcon className="size-3.5" aria-hidden />
        ),
        type: "text",
        placeholder: "Search...",
      },
      {
        id: "company",
        label: "Company",
        icon: (
          <Building2Icon className="size-3.5" aria-hidden />
        ),
        type: "select",
        searchable: true,
        options: companyOptions,
        renderValue: ({ values, options }) => {
          const state = renderSelectedCount(values)
          if (state) return state

          const option = options.find((item) => item.value === values[0])
          if (!option) return String(values[0])

          return (
            <div className="flex items-center gap-2">
              {option.icon}
              <span className="truncate">{option.label}</span>
            </div>
          )
        },
      },
      {
        id: "location",
        label: "Location",
        icon: (
          <MapPinIcon className="size-3.5" aria-hidden />
        ),
        type: "text",
        placeholder: "City / region...",
      },
      {
        id: "status",
        label: "Status",
        icon: (
          <CircleDotIcon className="size-3.5" aria-hidden />
        ),
        type: "select",
        searchable: false,
        options: STATUS_OPTIONS,
        renderValue: ({ values }) => {
          const state = renderSelectedCount(values)
          if (state) return state

          return <StatusBadge status={values[0] as ContactStatus} />
        },
      },
      {
        id: "priority",
        label: "Priority",
        icon: (
          <FlagIcon className="size-3.5" aria-hidden />
        ),
        type: "select",
        searchable: false,
        options: PRIORITY_OPTIONS,
        renderValue: ({ values }) => {
          const state = renderSelectedCount(values)
          if (state) return state

          return <PriorityBadge priority={values[0] as ContactPriority} />
        },
      },
      {
        id: "stage",
        label: "Stage",
        icon: (
          <GitBranchIcon className="size-3.5" aria-hidden />
        ),
        type: "select",
        searchable: false,
        options: STAGE_OPTIONS.map((stage) => ({
          ...stage,
          icon: (
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                stageToneClass[stage.value]
              )}
              aria-hidden="true"
            />
          ),
        })),
        renderValue: ({ values }) => {
          const state = renderSelectedCount(values)
          if (state) return state

          const stage = values[0] as ContactStage
          return (
            <Badge variant="outline">
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  stageToneClass[stage]
                )}
                aria-hidden="true"
              />
              {stage}
            </Badge>
          )
        },
      },
      {
        id: "tags",
        label: "Category",
        icon: (
          <TagIcon className="size-3.5" aria-hidden />
        ),
        type: "select",
        searchable: true,
        options: CATEGORY_LABELS.map((category) => ({
          value: category,
          label: category,
        })),
        renderValue: ({ values }) => {
          const state = renderSelectedCount(values)
          if (state) return state

          return <CategoryTags tags={[values[0] as CategoryLabel]} />
        },
      },
    ],
    [companyOptions]
  )

  const applyFilters = useCallback((newFilters: FilterCondition[]) => {
    return applyFiltersToData(CONTACTS, newFilters)
  }, [])

  const simulateAsyncFiltering = useCallback(
    async (newFilters: FilterCondition[]) => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 400))
      setFilteredData(applyFilters(newFilters))
      setIsLoading(false)
    },
    [applyFilters]
  )

  const handleFiltersChange = useCallback(
    (nextQuery: FilterQuery) => {
      const newFilters = flattenFilterConditions(nextQuery)

      setFilterQuery(nextQuery)
      const newActive = getActiveFilters(newFilters)
      const nextKey = serializeActiveFiltersKey(newActive)
      if (nextKey === lastAppliedActiveKey.current) return
      lastAppliedActiveKey.current = nextKey
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
      simulateAsyncFiltering(newFilters)
    },
    [simulateAsyncFiltering]
  )

  useEffect(() => {
    if (isInitialLoad.current) {
      setFilteredData(applyFilters(filters))
      isInitialLoad.current = false
    }
  }, [filters, applyFilters])

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((c) => c.id as string)
  )

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: filteredData,
    pageCount: Math.ceil(filteredData.length / pagination.pageSize),
    getRowId: (row) => row.id,
    state: {
      pagination,
      sorting,
      columnOrder,
      columnVisibility,
      rowPinning: resolvedRowPinning,
    },
    enableRowPinning: true,
    keepPinnedRows: true,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowPinningChange: setRowPinning,
  })

  const showClearButton = filters.length > 0

  return (
    <TooltipProvider delay={200}>
      {/* Table */}
      <DataGrid
        table={table}
        isLoading={isLoading}
        loadingMode="skeleton"
        recordCount={filteredData.length}
        emptyMessage={
          !isLoading && filteredData.length === 0
            ? "No contacts match your filters. Clear filters or adjust operators."
            : undefined
        }
        tableLayout={{
          rowsPinnable: true,
          columnsPinnable: true,
          columnsResizable: true,
          columnsMovable: true,
          columnsVisibility: true,
          dense: true,
        }}
      >
        <Frame spacing="sm" className="w-full">
          <FrameHeader className="flex-row items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <FrameTitle id="page-heading" className="text-balance">
                Contacts
              </FrameTitle>
              <FrameDescription className="text-xs text-pretty">
                {CONTACTS.length} CRM pipeline
              </FrameDescription>
            </div>
            <Button
              type="button"
              size="default"
              onClick={() =>
                toast.info("Add contact", {
                  description: "Connect your CRM or signup flow. Demo only.",
                })
              }
            >
              <UserPlusIcon aria-hidden="true" />
              Add contact
            </Button>
          </FrameHeader>
          <FramePanel className="p-0 shadow-none">
            {/* customize: py-2.5 gives the filter row more breathing room than the tighter frame header token */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-(--frame-panel-header-px) py-2.5">
              <Filters
                query={filterQuery}
                fields={filterFields}
                onQueryChange={handleFiltersChange}
                size="default"
                trigger={
                  <Button
                    type="button"
                    size="default"
                    variant="outline"
                    aria-label="Filters"
                  >
                    <FilterIcon aria-hidden />
                    Filters
                  </Button>
                }
              />
              <div className="flex flex-wrap items-center gap-2">
                {(resolvedRowPinning.top?.length ?? 0) > 0 && (
                  <ButtonGroup>
                    <Button
                      type="button"
                      size="default"
                      variant="outline"
                      onClick={() => setRowPinning({ top: [], bottom: [] })}
                    >
                      <PinOffIcon aria-hidden />
                      Unpin all
                    </Button>
                    <ButtonGroupText className="text-muted-foreground px-3 text-sm">
                      {resolvedRowPinning.top?.length}{" "}
                      {resolvedRowPinning.top?.length === 1
                        ? "contact"
                        : "contacts"}{" "}
                      pinned
                    </ButtonGroupText>
                  </ButtonGroup>
                )}
                {showClearButton && (
                  <Button
                    type="button"
                    size="default"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => {
                      const nextQuery = createDefaultContactFilters()
                      const next = flattenFilterConditions(nextQuery)
                      lastAppliedActiveKey.current = serializeActiveFiltersKey(
                        getActiveFilters(next)
                      )
                      setFilterQuery(nextQuery)
                      simulateAsyncFiltering(next)
                    }}
                    disabled={isLoading}
                  >
                    <FunnelXIcon aria-hidden />
                    Clear
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type="button"
                        size="default"
                        variant="outline"
                        aria-label="Table actions"
                      >
                        <MoreHorizontalIcon aria-hidden="true" />
                        Actions
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() =>
                          toast.success("Export ready", {
                            description: "Wire to your API. Demo only.",
                          })
                        }
                      >
                        <FileDownIcon aria-hidden="true" />
                        Export CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          toast.message("Bulk email", {
                            description: "Connect your ESP. Demo only.",
                          })
                        }
                      >
                        <MailIcon aria-hidden="true" />
                        Bulk email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          toast.info("Column settings", {
                            description:
                              "Use column headers to show or hide fields.",
                          })
                        }
                      >
                        <SettingsIcon aria-hidden="true" />
                        Column settings
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <Separator />
            <DataGridScrollArea>
              <DataGridTable />
            </DataGridScrollArea>
            <Separator />
            <FrameFooter>
              <DataGridPagination />
            </FrameFooter>
          </FramePanel>
        </Frame>
      </DataGrid>
    </TooltipProvider>
  )
}

export { ContactsGridView as DataGridView }