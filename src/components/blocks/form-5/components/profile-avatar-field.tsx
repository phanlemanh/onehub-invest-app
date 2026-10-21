"use client"

import { useState } from "react"
import { useFileUpload } from "@/hooks/use-file-upload"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { XIcon, UploadIcon } from "lucide-react"

const PROFILE_IMAGE_ACCEPT = "image/png,image/jpeg,image/webp"
const PROFILE_IMAGE_MAX_SIZE = 4 * 1024 * 1024

interface ProfileAvatarFieldProps {
  inputId: string
  defaultImage: string
  alt: string
  initials: string
}

export function ProfileAvatarField({
  inputId,
  defaultImage,
  alt,
  initials,
}: ProfileAvatarFieldProps) {
  const [removedCurrentImage, setRemovedCurrentImage] = useState(false)
  const [
    { files, errors },
    { clearErrors, removeFile, openFileDialog, getInputProps },
  ] = useFileUpload({
    accept: PROFILE_IMAGE_ACCEPT,
    maxSize: PROFILE_IMAGE_MAX_SIZE,
  })

  const currentFile = files[0] ?? null
  const hasSavedImage = Boolean(defaultImage) && !removedCurrentImage
  const previewUrl =
    currentFile?.preview ?? (hasSavedImage ? defaultImage : null)
  const helperText =
    errors[0] ?? "Recommended size 1:1. PNG, JPEG, or WebP up to 4MB."

  const handleCancelUpload = () => {
    if (!currentFile) {
      return
    }

    removeFile(currentFile.id)
    clearErrors()
  }

  const handleRemoveImage = () => {
    if (currentFile) {
      removeFile(currentFile.id)
    }

    setRemovedCurrentImage(true)
    clearErrors()
  }

  const handleOpenFileDialog = () => {
    clearErrors()
    openFileDialog()
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Media */}
      <div className="relative shrink-0">
        <Avatar className="size-16">
          <AvatarImage src={previewUrl ?? undefined} alt={alt} />
          <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        {currentFile ? (
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={handleCancelUpload}
            className="absolute -top-1 -right-1 size-5 rounded-full"
            aria-label={`Cancel ${currentFile.file.name}`}
          >
            <XIcon aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative inline-flex">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenFileDialog}
              aria-haspopup="dialog"
            >
              <UploadIcon data-icon="inline-start" aria-hidden="true" />
              Replace image
            </Button>
            <input
              {...getInputProps({ id: inputId })}
              className="sr-only"
              aria-label="Upload profile image"
              tabIndex={-1}
            />
          </div>

          {previewUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveImage}
            >
              Remove
            </Button>
          ) : null}
        </div>
        <p className="text-muted-foreground text-xs leading-5">{helperText}</p>
      </div>
    </div>
  )
}