'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import type { Json } from '@/lib/types'

export function EditorRenderer({ content }: { content: Json }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: true, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      Youtube.configure({ width: 640, height: 360 }),
    ],
    content: content as object,
    editable: false,
    immediatelyRender: false,
  })

  return (
    <div className="prose-maximus">
      <EditorContent editor={editor} />
    </div>
  )
}
