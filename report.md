# FileCard RetroUI Inspection Report

## Legacy Component Status

The following components are active and are not dead code:

- `src/components/files/file-upload.tsx`
  - Imported by `src/app/dashboard/dashboard-content.tsx`
  - Rendered as `<FileUpload onUpload={handleUpload} />`
- `src/components/files/file-grid.tsx`
  - Imported by `src/app/dashboard/dashboard-content.tsx`
  - Rendered as `<FileGrid files={files} onDelete={handleDelete} />`
- `src/components/files/file-card.tsx`
  - Imported by `src/components/files/file-grid.tsx`
  - Imported directly by `src/app/dashboard/recent/recent-content.tsx`
  - Rendered in both locations

These components are separate from the local `FileCard` component defined inside `src/components/vault/FileExplorer.tsx`.

## `pixelIcon` Usage

`pixelIcon` appears only in `src/components/vault/FileExplorer.tsx`:

1. Declared on `CategoryStyle`:

```ts
pixelIcon?: string
```

2. Destructured in the local `FileCard`:

```ts
const { Icon, iconClass, label, pixelIcon } =
  getCategoryStyle(item.mimeType, item.isFolder)
```

3. Used in the conditional icon branch:

```tsx
{pixelIcon ? (
  <img
    src={pixelIcon}
    alt={label}
    width={48}
    height={48}
    className="w-9 h-9 sm:w-11 sm:h-11 object-contain"
    style={{ imageRendering: "pixelated" }}
  />
) : (
  <span>
    <Icon className={cn("block h-full w-full shrink-0", iconClass)} />
  </span>
)}
```

No `categoryStyles` entry sets `pixelIcon`, so it is always `undefined` with the current data. The image branch never fires.

## Current Icon Container

The icon currently renders inside:

```tsx
<div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden leading-none transition-transform group-hover:scale-105 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
```

The fallback icon is wrapped by:

```tsx
<span className="grid h-8 w-8 place-items-center sm:h-9 sm:w-9 lg:h-10 lg:w-10">
  <Icon className={cn("block h-full w-full shrink-0", iconClass)} />
</span>
```

There is currently no category-colored background, border, or shadow around the icon.

## RetroUI Outer Card Classes

The following selectors are defined in `src/app/globals.css`:

- `.retroui-file-card`
- `.retroui-file-card-folder:hover`
- `.retroui-file-card-folder`
- `.retroui-file-card .text-text`
- `.retroui-file-card .text-text-muted`
- `.retroui-file-card .text-text-muted\\/70`
- `.retroui-file-card-file:hover`

They are applied in `src/components/vault/FileExplorer.tsx` to the outer row `Card`:

```tsx
className={cn(
  "...",
  item.isFolder
    ? "retroui-file-card-folder"
    : "retroui-file-card-file",
  "retroui-file-card",
  isActioning && "opacity-50 pointer-events-none"
)}
```

The outer row `Card` uses hardcoded neutral values:

```tsx
<Card
  bg="#16161f"
  textColor="#e4e4e7"
  borderColor="#2a2a3a"
  shadowColor="#2b0057"
>
```

No other files reference the `retroui-file-card*` classes.

## CategoryStyle Mismatch

Current interface fields:

```ts
interface CategoryStyle {
  Icon: React.ElementType
  box: string
  iconClass: string
  label: string
  pixelIcon?: string
}
```

Actual fields present in every `categoryStyles` entry:

```ts
Icon
bg
borderColor
shadowColor
iconClass
label
```

Missing from the interface:

- `bg`
- `borderColor`
- `shadowColor`

Declared but absent from category objects:

- `box`
- `pixelIcon`

DA