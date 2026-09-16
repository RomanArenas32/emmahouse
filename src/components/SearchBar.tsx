'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({ initialValue = '' }: { initialValue?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialValue)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setValue(q)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (q.trim()) {
        params.set('buscar', q.trim())
      } else {
        params.delete('buscar')
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, 350)
  }

  function handleClear() {
    setValue('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('buscar')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="relative flex items-center w-full max-w-xs">
      <Search className="absolute left-3 w-3.5 h-3.5 text-brand-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Buscar productos..."
        className="w-full pl-9 pr-8 py-2 text-xs tracking-wide bg-brand-50 border border-brand-100 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-brand-300 text-brand-700 transition-colors"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 text-brand-300 hover:text-brand-600 transition-colors cursor-pointer"
          type="button"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
