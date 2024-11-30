import Link from "next/link"
import { History } from 'lucide-react'
import { Button } from "@/components/ui/button"
import ProductGrid from "@/components/product-grid"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            TryOn Shop
          </Link>
          <Link href="/history">
            <Button variant="ghost" size="icon">
              <History className="h-5 w-5" />
              <span className="sr-only">View Try-On History</span>
            </Button>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Featured Products</h1>
        <ProductGrid />
      </main>
    </div>
  )
}

