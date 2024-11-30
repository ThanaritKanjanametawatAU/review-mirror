import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

interface GeneratingModalProps {
  open: boolean
}

export default function GeneratingModal({ open }: GeneratingModalProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (open) {
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval)
            return 100
          }
          return prevProgress + 2
        })
      }, 100)

      return () => clearInterval(interval)
    } else {
      setProgress(0)
    }
  }, [open])

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Generating Your Virtual Try-On</DialogTitle>
        <div className="space-y-4">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-gray-500">Please wait while we process your image...</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

