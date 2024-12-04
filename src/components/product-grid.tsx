import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: number
  name: string
  imagePath: string
}

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        console.log('Image path:', product.imagePath);
        return (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="group"
          >
            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={product.imagePath}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={product.id <= 4}
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="mt-4 text-lg font-medium">{product.name}</h3>
          </Link>
        )
      })}
    </div>
  )
}

