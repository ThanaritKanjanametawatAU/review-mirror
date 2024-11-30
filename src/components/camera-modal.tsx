'use client'

import { useRef, useCallback, useState, useEffect } from "react"
import { Camera, CameraIcon as FlipCamera } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface CameraModalProps {
  open: boolean
  onClose: () => void
  onCapture: (imageData: string) => void
}

export default function CameraModal({ open, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)
  const router = useRouter()
  const [previewMode, setPreviewMode] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    async function checkCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        setHasMultipleCameras(videoDevices.length > 1)
      } catch (err) {
        console.error("Error checking cameras:", err)
      }
    }
    checkCameras()
  }, [])

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stopCamera()
      }

      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        try {
          await videoRef.current.play()
        } catch (err) {
          console.error("Error playing video:", err)
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      handleCameraError(err)
    }
  }, [facingMode])

  const handleCameraError = (err: any) => {
    let message = 'Error accessing camera. Please try again.'
    
    switch ((err as Error).name) {
      case 'NotAllowedError':
        message = 'Camera access denied. Please enable camera permissions in your browser settings.'
        break
      case 'NotFoundError':
        message = 'No camera found on your device.'
        break
      case 'NotReadableError':
        message = 'Camera is already in use by another application.'
        break
      case 'OverconstrainedError':
        message = 'Could not find a camera matching the requested constraints.'
        break
    }
    
    alert(message)
    onClose()
  }

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const handleCapture = () => {
    if (videoRef.current) {
      const video = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        if (facingMode === 'user') {
          ctx.scale(-1, 1)
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        }
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        setPreviewImage(imageData)
        setPreviewMode(true)
        stopCamera()
      }
    }
  }

  const handleConfirm = () => {
    if (previewImage) {
      onCapture(previewImage)
      setPreviewMode(false)
      setPreviewImage(null)
      onClose()
    }
  }

  const handleRetake = () => {
    setPreviewMode(false)
    setPreviewImage(null)
    startCamera()
  }

  const toggleCamera = useCallback(() => {
    if (!hasMultipleCameras) {
      alert('No additional cameras found on your device.')
      return
    }
    
    stopCamera()
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }, [hasMultipleCameras])

  useEffect(() => {
    if (open) {
      startCamera()
    }
    
    return () => {
      stopCamera()
    }
  }, [open, startCamera])

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        stopCamera()
        setPreviewMode(false)
        setPreviewImage(null)
        onClose()
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>{previewMode ? 'Confirm Your Image' : 'Take a Photo'}</DialogTitle>
        <div className="space-y-4">
          {previewMode ? (
            <>
              <div className="relative aspect-[3/4] bg-black rounded-lg overflow-hidden">
                <Image
                  src={previewImage!}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex justify-between gap-4">
                <Button onClick={handleRetake} variant="outline">
                  Retake
                </Button>
                <Button onClick={handleConfirm}>
                  Confirm
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="relative aspect-[3/4] bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={cn(
                    "w-full h-full object-cover",
                    facingMode === 'user' && "scale-x-[-1]"
                  )}
                />
              </div>
              <div className="flex justify-center gap-4">
                {hasMultipleCameras && (
                  <Button onClick={toggleCamera} variant="outline">
                    <FlipCamera className="h-4 w-4 mr-2" />
                    Flip Camera
                  </Button>
                )}
                <Button onClick={handleCapture}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

