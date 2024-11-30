'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface HistoryItem {
  id: string
  imageUrl: string
  timestamp: number
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('tryOnHistory') || '[]')
    setHistory(storedHistory)
  }, [])

  const clearHistory = () => {
    localStorage.removeItem('tryOnHistory')
    setHistory([])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Try-On History</h1>
      {history.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {history.map((item, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="aspect-[3/4] relative mb-2">
                    <Image
                      src={item.imageUrl}
                      alt={`Try-on for product ${item.id}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                  <Link href={`/product/${item.id}`}>
                    <Button variant="link" className="p-0">View Product</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button onClick={clearHistory} variant="destructive">Clear History</Button>
        </>
      ) : (
        <p>You haven't tried on any products yet. Start shopping to see your try-on history!</p>
      )}
    </div>
  )
}

