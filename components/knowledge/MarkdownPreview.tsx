'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

interface MarkdownPreviewProps {
  content: string
  className?: string
}

/**
 * Markdown Preview Component
 * 使用 react-markdown 渲染 Markdown 內容
 * 支援 GFM (GitHub Flavored Markdown)
 */
export default function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  return (
    <div
      className={`prose prose-sm max-w-none p-6 bg-white border border-gray-200 rounded-lg overflow-y-auto ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // 自訂標題樣式
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">{children}</h4>
          ),

          // 自訂段落樣式
          p: ({ children }) => <p className="text-gray-700 leading-7 mb-4">{children}</p>,

          // 自訂列表樣式
          ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="text-gray-700">{children}</li>,

          // 自訂程式碼區塊樣式
          code: ({ className, children }) => {
            const isInline = !className
            return isInline ? (
              <code className="px-1.5 py-0.5 bg-gray-100 text-red-600 rounded text-sm font-mono">
                {children}
              </code>
            ) : (
              <code className={`${className} block p-4 bg-gray-50 rounded-lg text-sm font-mono overflow-x-auto`}>
                {children}
              </code>
            )
          },

          // 自訂引用樣式
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic">
              {children}
            </blockquote>
          ),

          // 自訂表格樣式
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-gray-300">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-gray-200">{children}</tr>,
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold text-gray-900 border border-gray-300">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-gray-700 border border-gray-300">{children}</td>
          ),

          // 自訂連結樣式
          a: ({ href, children }) => (
            <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),

          // 自訂水平線樣式
          hr: () => <hr className="my-6 border-t-2 border-gray-200" />,
        }}
      >
        {content || '*預覽區域（目前無內容）*'}
      </ReactMarkdown>
    </div>
  )
}
