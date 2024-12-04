'use client'

import { useRef, useCallback, useState, useEffect } from "react"
import { Camera, CameraIcon as FlipCamera } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { use } from 'react'
import { Loader2 } from 'lucide-react'

interface CameraModalProps {
  open: boolean
  onClose: () => void
  onCapture: (imageData: string) => void
  productId: string
}

export default function CameraModal({ open, onClose, onCapture, productId }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)
  const router = useRouter()
  const [previewMode, setPreviewMode] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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


  const RUNPOD_ENDPOINT = process.env.RUNPOD_ENDPOINT
  
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

  const handleConfirm = async () => {
    if (previewImage) {
      try {
        setIsLoading(true)
        const base64Image = previewImage.split(',')[1]
        
        const modifiedBody = {
          "input": {
            "workflow": {
              "17": {
                "inputs": {
                  "image": "current.jpg",
                  "upload": "image"
                },
                "class_type": "LoadImage"
              },
              "23": {
                "inputs": {
                  "text": "",
                  "clip": [
                    "34",
                    0
                  ]
                },
                "class_type": "CLIPTextEncode"
              },
              "32": {
                "inputs": {
                  "vae_name": "ae.safetensors"
                },
                "class_type": "VAELoader"
              },
              "34": {
                "inputs": {
                  "clip_name1": "ViT-L-14-BEST-smooth-GmP-ft.safetensors",
                  "clip_name2": "t5xxl_fp8_e4m3fn.safetensors",
                  "type": "flux"
                },
                "class_type": "DualCLIPLoader"
              },
              "54": {
                "inputs": {
                  "image": `${productId}.png`,
                  "upload": "image"
                },
                "class_type": "LoadImage"
              },
              "113": {
                "inputs": {
                  "strength": 0.9,
                  "conditioning": [
                    "261",
                    0
                  ],
                  "style_model": [
                    "270",
                    0
                  ],
                  "clip_vision_output": [
                    "178",
                    0
                  ]
                },
                "class_type": "StyleModelApplyAdvanced"
              },
              "140": {
                "inputs": {
                  "image": [
                    "54",
                    0
                  ]
                },
                "class_type": "easy imageSize"
              },
              "141": {
                "inputs": {
                  "value": 0,
                  "width": [
                    "140",
                    0
                  ],
                  "height": [
                    "140",
                    1
                  ]
                },
                "class_type": "SolidMask"
              },
              "142": {
                "inputs": {
                  "mask": [
                    "141",
                    0
                  ]
                },
                "class_type": "MaskToImage"
              },
              "143": {
                "inputs": {
                  "overlay_resize": "None",
                  "resize_method": "nearest-exact",
                  "rescale_factor": 1,
                  "width": 512,
                  "height": 512,
                  "x_offset": 0,
                  "y_offset": 0,
                  "rotation": 0,
                  "opacity": 0,
                  "base_image": [
                    "142",
                    0
                  ],
                  "overlay_image": [
                    "54",
                    0
                  ]
                },
                "class_type": "Image Overlay"
              },
              "148": {
                "inputs": {
                  "model": "thwri/CogFlorence-2.2-Large",
                  "precision": "fp16",
                  "attention": "sdpa"
                },
                "class_type": "DownloadAndLoadFlorence2Model"
              },
              "178": {
                "inputs": {
                  "crop": "center",
                  "clip_vision": [
                    "179",
                    0
                  ],
                  "image": [
                    "232",
                    0
                  ]
                },
                "class_type": "CLIPVisionEncode"
              },
              "179": {
                "inputs": {
                  "clip_name": "siglip-so400m-patch14-384.safetensors"
                },
                "class_type": "CLIPVisionLoader"
              },
              "184": {
                "inputs": {
                  "image": [
                    "264",
                    0
                  ]
                },
                "class_type": "easy imageSize"
              },
              "191": {
                "inputs": {
                  "overlay_resize": "None",
                  "resize_method": "nearest-exact",
                  "rescale_factor": 1,
                  "width": 512,
                  "height": 512,
                  "x_offset": 0,
                  "y_offset": 0,
                  "rotation": 0,
                  "opacity": 0,
                  "base_image": [
                    "262",
                    0
                  ],
                  "overlay_image": [
                    "264",
                    0
                  ],
                  "optional_mask": [
                    "228",
                    0
                  ]
                },
                "class_type": "Image Overlay"
              },
              "224": {
                "inputs": {
                  "model": "sam2.1_hiera_large.safetensors",
                  "segmentor": "single_image",
                  "device": "cuda",
                  "precision": "fp16"
                },
                "class_type": "DownloadAndLoadSAM2Model"
              },
              "225": {
                "inputs": {
                  "text_input": "main subject's shirt",
                  "task": "caption_to_phrase_grounding",
                  "fill_mask": true,
                  "keep_model_loaded": false,
                  "max_new_tokens": 1024,
                  "num_beams": 3,
                  "do_sample": true,
                  "output_mask_select": "",
                  "seed": 486675245623988,
                  "image": [
                    "265",
                    0
                  ],
                  "florence2_model": [
                    "148",
                    0
                  ]
                },
                "class_type": "Florence2Run"
              },
              "226": {
                "inputs": {
                  "index": "",
                  "batch": false,
                  "data": [
                    "225",
                    3
                  ]
                },
                "class_type": "Florence2toCoordinates"
              },
              "227": {
                "inputs": {
                  "keep_model_loaded": false,
                  "individual_objects": false,
                  "sam2_model": [
                    "224",
                    0
                  ],
                  "image": [
                    "265",
                    0
                  ],
                  "bboxes": [
                    "226",
                    1
                  ]
                },
                "class_type": "Sam2Segmentation"
              },
              "228": {
                "inputs": {
                  "expand": 10,
                  "tapered_corners": true,
                  "mask": [
                    "227",
                    0
                  ]
                },
                "class_type": "GrowMask"
              },
              "231": {
                "inputs": {
                  "upscale_method": "nearest-exact",
                  "megapixels": 0.7000000000000001,
                  "image": [
                    "17",
                    0
                  ]
                },
                "class_type": "ImageScaleToTotalPixels"
              },
              "232": {
                "inputs": {
                  "upscale_method": "nearest-exact",
                  "megapixels": 0.7000000000000001,
                  "image": [
                    "143",
                    0
                  ]
                },
                "class_type": "ImageScaleToTotalPixels"
              },
              "234": {
                "inputs": {
                  "width": [
                    "282",
                    0
                  ],
                  "height": [
                    "237",
                    1
                  ],
                  "position": "top-left",
                  "x_offset": [
                    "236",
                    0
                  ],
                  "y_offset": 3,
                  "image": [
                    "254",
                    0
                  ]
                },
                "class_type": "ImageCrop+"
              },
              "235": {
                "inputs": {
                  "image": [
                    "231",
                    0
                  ]
                },
                "class_type": "easy imageSize"
              },
              "236": {
                "inputs": {
                  "image": [
                    "232",
                    0
                  ]
                },
                "class_type": "easy imageSize"
              },
              "237": {
                "inputs": {
                  "image": [
                    "191",
                    0
                  ]
                },
                "class_type": "easy imageSize"
              },
              "240": {
                "inputs": {
                  "conditioning": [
                    "113",
                    0
                  ]
                },
                "class_type": "ConditioningZeroOut"
              },
              "252": {
                "inputs": {
                  "number_of_faces": 1,
                  "scale_factor": 1.5,
                  "shift_factor": 0.45,
                  "start_index": 0,
                  "max_faces_per_image": 50,
                  "aspect_ratio": "1:1",
                  "image": [
                    "253",
                    0
                  ]
                },
                "class_type": "AutoCropFaces"
              },
              "253": {
                "inputs": {
                  "width": 512,
                  "height": 512,
                  "upscale_method": "bicubic",
                  "keep_proportion": false,
                  "divisible_by": 2,
                  "width_input": [
                    "237",
                    0
                  ],
                  "height_input": [
                    "237",
                    1
                  ],
                  "crop": "disabled",
                  "image": [
                    "264",
                    0
                  ]
                },
                "class_type": "ImageResizeKJ"
              },
              "254": {
                "inputs": {
                  "crop_blending": 0.25,
                  "crop_sharpening": 0,
                  "image": [
                    "191",
                    0
                  ],
                  "crop_image": [
                    "252",
                    0
                  ],
                  "crop_data": [
                    "252",
                    1
                  ]
                },
                "class_type": "Image Paste Face"
              },
              "259": {
                "inputs": {
                  "noise_mask": true,
                  "positive": [
                    "113",
                    0
                  ],
                  "negative": [
                    "240",
                    0
                  ],
                  "vae": [
                    "32",
                    0
                  ],
                  "pixels": [
                    "264",
                    0
                  ],
                  "mask": [
                    "228",
                    0
                  ]
                },
                "class_type": "InpaintModelConditioning"
              },
              "260": {
                "inputs": {
                  "model": [
                    "269",
                    0
                  ]
                },
                "class_type": "DifferentialDiffusion"
              },
              "261": {
                "inputs": {
                  "guidance": 30,
                  "conditioning": [
                    "23",
                    0
                  ]
                },
                "class_type": "FluxGuidance"
              },
              "262": {
                "inputs": {
                  "samples": [
                    "263",
                    0
                  ],
                  "vae": [
                    "32",
                    0
                  ]
                },
                "class_type": "VAEDecode"
              },
              "263": {
                "inputs": {
                  "seed": 639608335692025,
                  "steps": 20,
                  "cfg": 1,
                  "sampler_name": "euler",
                  "scheduler": "beta",
                  "denoise": 1,
                  "model": [
                    "260",
                    0
                  ],
                  "positive": [
                    "259",
                    0
                  ],
                  "negative": [
                    "259",
                    1
                  ],
                  "latent_image": [
                    "259",
                    2
                  ]
                },
                "class_type": "KSampler"
              },
              "264": {
                "inputs": {
                  "direction": "right",
                  "match_image_size": true,
                  "image1": [
                    "232",
                    0
                  ],
                  "image2": [
                    "231",
                    0
                  ]
                },
                "class_type": "ImageConcanate"
              },
              "265": {
                "inputs": {
                  "direction": "right",
                  "match_image_size": true,
                  "image1": [
                    "293",
                    0
                  ],
                  "image2": [
                    "231",
                    0
                  ]
                },
                "class_type": "ImageConcanate"
              },
              "269": {
                "inputs": {
                  "unet_name": "flux1-fill-dev.safetensors",
                  "weight_dtype": "fp8_e4m3fn"
                },
                "class_type": "UNETLoader"
              },
              "270": {
                "inputs": {
                  "style_model_name": "flux1-redux-dev.safetensors"
                },
                "class_type": "StyleModelLoader"
              },
              "282": {
                "inputs": {
                  "image": [
                    "17",
                    0
                  ]
                },
                "class_type": "GetImageSize+"
              },
              "289": {
                "inputs": {
                  "text": "3000",
                  "anything": [
                    "282",
                    0
                  ]
                },
                "class_type": "easy showAnything"
              },
              "291": {
                "inputs": {
                  "filename_prefix": "ComfyUI",
                  "images": [
                    "234",
                    0
                  ]
                },
                "class_type": "SaveImage"
              },
              "293": {
                "inputs": {
                  "brightness": 3,
                  "contrast": 0,
                  "saturation": 1,
                  "image": [
                    "232",
                    0
                  ]
                },
                "class_type": "LayerColor: Brightness & Contrast"
              }
            },
            "images": [
              {
                "name": "current.jpg",
                "image": base64Image
              }
            ]
          }
        }

      
        // Modify
        // endpoint_body["input"]["workflow"]["54"]["inputs"]["image"] = "{productId}.jpg"
        // endpoint_body["input"]["images"][0]["image"] = the the image from camera (base64)
      

        if (!RUNPOD_ENDPOINT) {
          throw new Error('RUNPOD_ENDPOINT environment variable is not set')
        }

        const response = await fetch('/api/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(modifiedBody)
        })

        // Handle streaming response
        const reader = response.body?.getReader()
        let result = ''
        
        if (reader) {
          while (true) {
            const {done, value} = await reader.read()
            if (done) break
            result += new TextDecoder().decode(value)
          }
        }

        const data = JSON.parse(result)

        if (data.output?.message) {
          const imageUrl = `data:image/jpeg;base64,${data.output.message}`
          onCapture(imageUrl)
          setPreviewMode(false)
          setPreviewImage(null)
          onClose()
        } else {
          throw new Error('Response missing expected image data')
        }

      } catch (error) {
        console.error('Error processing image:', error)
        alert('Failed to process image. Please try again.')
      } finally {
        setIsLoading(false)
      }
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
                <Button 
                  onClick={handleConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm'
                  )}
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

