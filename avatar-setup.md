# Avatar Component Setup

## Option 1: Install via shadcn/ui (Recommended)

```bash
npx shadcn-ui@latest add avatar
```

This will:
- Install `@radix-ui/react-avatar`
- Create `components/ui/avatar.tsx`

## Option 2: Manual Installation

### Step 1: Install Radix UI Avatar
```bash
npm install @radix-ui/react-avatar
```

### Step 2: Add Avatar Component
Copy the `avatar.tsx` file to `components/ui/avatar.tsx`

## Verification

After installation, you should be able to import:
```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
```

## Usage in Comments

The Avatar component is used in `noticeboard-comments.tsx` like this:

```tsx
<Avatar>
  <AvatarFallback className="bg-blue-100 text-blue-700">
    JD
  </AvatarFallback>
</Avatar>
```

If you want to use profile images later:
```tsx
<Avatar>
  <AvatarImage src={user.imageUrl} alt={user.name} />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```
