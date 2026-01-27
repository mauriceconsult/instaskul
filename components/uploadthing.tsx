// components/uploadthing.tsx
"use client"

import {
  UploadButton as UTUploadButton,
  UploadDropzone as UTUploadDropzone,
} from "@uploadthing/react"

export function UploadButton(props: any) {
  return <UTUploadButton {...props} />
}

export function UploadDropzone(props: any) {
  return <UTUploadDropzone {...props} />
}