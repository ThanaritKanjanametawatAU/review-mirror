import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

const products = [
  {
    id: 1,
    name: "Classic White T-Shirt",
    price: 29.99,
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 2,
    name: "Striped Polo Shirt",
    price: 39.99,
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 3,
    name: "Denim Jacket",
    price: 89.99,
    image: "/placeholder.svg?height=400&width=400",
  },
  // Add more products as needed
]

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <Link key={product.id} href={`/product/${product.id}`}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="aspect-square relative mb-3">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <h2 className="font-semibold mb-2">{product.name}</h2>
              <p className="text-primary">${product.price}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

