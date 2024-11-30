'use client'

import { useState, use } from "react"
import Image from "next/image"
import { Camera } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CameraModal from "@/components/camera-modal"
import GeneratingModal from "@/components/generating-modal"

// Add proper typing for the page props
interface ProductPageProps {
  params: {
    id: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ProductPage({ params, searchParams }: ProductPageProps) {
  const unwrappedParams = use(params)
  const productId = unwrappedParams.id

  const [showCamera, setShowCamera] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const handleImageCapture = async (imageData: string) => {
    setIsGenerating(true)
    
    // Simulating AI processing time
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    const generatedImageUrl = "/placeholder.svg?height=600&width=400"
    setGeneratedImage(generatedImageUrl)
    setIsGenerating(false)
    
    // Save to history
    const history = JSON.parse(localStorage.getItem('tryOnHistory') || '[]')
    history.unshift({ id: productId, imageUrl: generatedImageUrl, timestamp: Date.now() })
    localStorage.setItem('tryOnHistory', JSON.stringify(history.slice(0, 10)))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square relative">
            <Image
              src="/placeholder.svg?height=600&width=600"
              alt="Product Image"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Classic White T-Shirt</h1>
            <p className="text-2xl font-semibold text-primary">$29.99</p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => setShowCamera(true)} 
              className="w-full"
              variant="outline"
            >
              <Camera className="mr-2 h-4 w-4" />
              Try It Yourself
            </Button>
          </div>
          
          <div className="prose">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p>
              A comfortable and versatile classic white t-shirt made from 100% cotton. 
              Perfect for any casual occasion.
            </p>
          </div>
        </div>
      </div>

      <CameraModal 
        open={showCamera} 
        onClose={() => setShowCamera(false)}
        onCapture={handleImageCapture}
      />

      <GeneratingModal open={isGenerating} />

      {generatedImage && (
        <div className="mt-8">
          <Card className="p-4 max-w-md mx-auto">
            <h3 className="font-semibold mb-3 text-center">Virtual Try-On Result</h3>
            <div className="aspect-[3/4] relative">
              <Image
                src={generatedImage}
                alt="Virtual Try-On"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

