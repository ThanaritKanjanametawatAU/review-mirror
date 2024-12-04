import Link from "next/link"
import { History } from 'lucide-react'
import { Button } from "@/components/ui/button"
import ProductGrid from "@/components/product-grid"

// Define product data
const products = [
  {
    id: 1,
    name: "Classic White Tee",
    imagePath: "/assets/1.png"
  },
  {
    id: 2,
    name: "Vintage Denim Jacket",
    imagePath: "/assets/2.png"
  },
  {
    id: 3,
    name: "Striped Summer Dress",
    imagePath: "/assets/3.png"
  },
  {
    id: 4,
    name: "Urban Cargo Pants",
    imagePath: "/assets/4.png"
  },
  {
    id: 5,
    name: "Cozy Knit Sweater",
    imagePath: "/assets/5.png"
  },
  {
    id: 6,
    name: "Athletic Track Jacket",
    imagePath: "/assets/6.png"
  },
  {
    id: 7,
    name: "Casual Hoodie",
    imagePath: "/assets/7.png"
  }
]

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
        <ProductGrid products={products} />
      </main>
    </div>
  )
}

