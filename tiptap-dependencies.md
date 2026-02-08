# Required TipTap Extensions for Description Editor

Add these dependencies to your `package.json`:

```json
{
  "dependencies": {
    "@tiptap/react": "^2.1.13",
    "@tiptap/starter-kit": "^2.1.13",
    "@tiptap/extension-underline": "^2.1.13",
    "@tiptap/extension-text-align": "^2.1.13",
    "@tiptap/extension-character-count": "^2.1.13"
  }
}
```

## Installation

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-character-count
```

Or with yarn:

```bash
yarn add @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-character-count
```

## What's Included

1. **@tiptap/react** - Core TipTap React integration
2. **@tiptap/starter-kit** - Basic formatting (bold, italic, lists, etc.)
3. **@tiptap/extension-underline** - Underline text support
4. **@tiptap/extension-text-align** - Text alignment (left, center, right)
5. **@tiptap/extension-character-count** - Character counting with limit

## Features

✅ Character limit enforcement (5000 chars)
✅ Visual character count indicator
✅ Warning at 90% capacity (yellow)
✅ Error state at 100% (red)
✅ Basic formatting (bold, italic, underline)
✅ Lists (bulleted, numbered)
✅ Text alignment
✅ Undo/Redo
✅ Clean, minimal toolbar
✅ No headings or code blocks (simplified for descriptions)
