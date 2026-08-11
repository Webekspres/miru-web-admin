'use client'

import { Fragment, type ReactNode } from 'react'

/**
 * Renderer Markdown sederhana untuk konten edukasi (Modul 4 / W6).
 *
 * Mendukung subset yang diizinkan backend (EDUKASI_MARKDOWN_SUBSET):
 * heading (#–###), bold/italic, unordered/ordered list, link, inline code,
 * dan fenced code block. Bukan parser penuh — cukup untuk artikel/panduan.
 */

interface InlineNode {
  type: 'text' | 'strong' | 'em' | 'code' | 'link'
  content: string
  href?: string
}

const INLINE_TOKEN_RE =
  /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g

function parseInline(text: string): InlineNode[] {
  const parts = text.split(INLINE_TOKEN_RE)
  const nodes: InlineNode[] = []

  for (const part of parts) {
    if (!part) continue
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      nodes.push({ type: 'strong', content: part.slice(2, -2) })
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      nodes.push({ type: 'em', content: part.slice(1, -1) })
    } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      nodes.push({ type: 'code', content: part.slice(1, -1) })
    } else {
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (linkMatch) {
        nodes.push({ type: 'link', content: linkMatch[1], href: linkMatch[2] })
      } else {
        nodes.push({ type: 'text', content: part })
      }
    }
  }

  return nodes
}

function renderInline(nodes: InlineNode[], keyPrefix: string): ReactNode[] {
  return nodes.map((node, idx) => {
    const key = `${keyPrefix}-${idx}`
    switch (node.type) {
      case 'strong':
        return <strong key={key} className="font-semibold text-foreground">{node.content}</strong>
      case 'em':
        return <em key={key} className="italic">{node.content}</em>
      case 'code':
        return (
          <code
            key={key}
            className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
          >
            {node.content}
          </code>
        )
      case 'link':
        return (
          <a
            key={key}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2 hover:text-primary-hover"
          >
            {node.content}
          </a>
        )
      default:
        return <Fragment key={key}>{node.content}</Fragment>
    }
  })
}

function MarkdownListItem({ text }: { text: string }) {
  return (
    <li className="leading-relaxed text-foreground">
      {renderInline(parseInline(text), `li-${text.slice(0, 16)}`)}
    </li>
  )
}

/** Parse konten Markdown ke elemen React (subset edukasi). */
export function MarkdownContent({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let inCodeBlock = false
  let codeLines: string[] = []
  let listStack: { ordered: boolean; items: ReactNode[] }[] = []
  let key = 0

  function flushLists() {
    for (const list of listStack) {
      blocks.push(
        list.ordered ? (
          <ol key={`ol-${key++}`} className="list-decimal space-y-1 pl-6">
            {list.items}
          </ol>
        ) : (
          <ul key={`ul-${key++}`} className="list-disc space-y-1 pl-6">
            {list.items}
          </ul>
        ),
      )
    }
    listStack = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()

    // Fenced code block
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        blocks.push(
          <pre
            key={`pre-${key++}`}
            className="overflow-x-auto rounded-lg border border-border bg-surface-muted p-3 font-mono text-sm text-foreground"
          >
            {codeLines.join('\n')}
          </pre>,
        )
        codeLines = []
        inCodeBlock = false
      } else {
        flushLists()
        inCodeBlock = true
      }
      continue
    }
    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    if (!line.trim()) {
      flushLists()
      continue
    }

    // Heading
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      flushLists()
      const level = headingMatch[1].length
      const content = headingMatch[2]
      const className = level === 1
        ? 'text-xl font-bold text-foreground'
        : level === 2
          ? 'text-lg font-semibold text-foreground'
          : 'text-base font-semibold text-foreground'
      blocks.push(
        <p key={`h-${key++}`} className={`${className} mt-2 first:mt-0`}>
          {renderInline(parseInline(content), `h${level}`)}
        </p>,
      )
      continue
    }

    // Horizontal rule
    if (/^(\s*[-*_]\s*){3,}$/.test(line)) {
      flushLists()
      blocks.push(<hr key={`hr-${key++}`} className="my-3 border-border" />)
      continue
    }

    // Unordered / ordered list
    const ulMatch = line.match(/^\s*[-*+]\s+(.+)$/)
    const olMatch = line.match(/^\s*\d+[.)]\s+(.+)$/)
    if (ulMatch || olMatch) {
      const isOrdered = Boolean(olMatch)
      const content = (olMatch ?? ulMatch)![1]
      const currentList = listStack[listStack.length - 1]
      if (currentList && currentList.ordered === isOrdered) {
        currentList.items.push(<MarkdownListItem key={currentList.items.length} text={content} />)
      } else {
        flushLists()
        listStack.push({ ordered: isOrdered, items: [<MarkdownListItem key={0} text={content} />] })
      }
      continue
    }

    // Paragraf biasa
    flushLists()
    blocks.push(
      <p key={`p-${key++}`} className="leading-relaxed text-foreground">
        {renderInline(parseInline(line), 'p')}
      </p>,
    )
  }

  // Flush trailing
  flushLists()
  if (inCodeBlock && codeLines.length > 0) {
    blocks.push(
      <pre
        key={`pre-${key++}`}
        className="overflow-x-auto rounded-lg border border-border bg-surface-muted p-3 font-mono text-sm text-foreground"
      >
        {codeLines.join('\n')}
      </pre>,
    )
  }

  if (blocks.length === 0) {
    return <p className="text-sm text-muted-foreground">Konten kosong.</p>
  }

  return (
    <div className="space-y-2 text-sm">
      {blocks}
    </div>
  )
}
