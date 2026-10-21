"use client"

import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox"

import type { ProfileCountryOption } from "./data"

interface ProfileCountryComboboxProps {
  id: string
  options: ProfileCountryOption[]
  defaultCode: string
}

function CountryFlag({ code }: { code: string }) {
  return (
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt=""
      width={16}
      height={12}
      className="shrink-0 rounded-xs"
      style={{ height: "auto" }}
    />
  )
}

export function ProfileCountryCombobox({
  id,
  options,
  defaultCode,
}: ProfileCountryComboboxProps) {
  const selectedCountry =
    options.find((country) => country.code === defaultCode) ?? options[0]

  return (
    <Combobox
      items={options}
      defaultValue={selectedCountry}
      itemToStringValue={(item: ProfileCountryOption) => item.label}
    >
      <ComboboxTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
          />
        }
      >
        <ComboboxValue>
          {(item: ProfileCountryOption | null) =>
            item ? (
              <span className="flex min-w-0 items-center gap-2">
                <CountryFlag code={item.code} />
                <span className="truncate">{item.label}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">Select country</span>
            )
          }
        </ComboboxValue>
      </ComboboxTrigger>

      <ComboboxContent className="max-w-(--anchor-width) min-w-(--anchor-width)">
        <ComboboxInput showTrigger={false} placeholder="Search country" />
        <ComboboxEmpty>No countries found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.code} value={item}>
              <CountryFlag code={item.code} />
              <span className="truncate">{item.label}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}