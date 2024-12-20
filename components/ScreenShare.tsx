"use client"
// npx shadcn@latest add button input alert card
import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Share2, Copy, Check, AlertCircle, Users } from 'lucide-react'
import { useScreenShare } from "../hooks/useScreenShare"

export default function ScreenShare() {
  const { stream, peerId, error, viewers, startSharing, stopSharing } = useScreenShare();
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null)

  const shareLink = peerId ? `${window.location.origin}/view/${peerId}` : "";

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

  }, [shareLink]);

  useEffect(()=>{
    if(shareLink){
        if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play()
        }
      }
  },[videoRef.current])

  return (
    <div>
<Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>屏幕共享</CardTitle>
        <CardDescription>与他人分享您的屏幕或应用程序窗口</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!stream ? (
          <Button onClick={startSharing} className="w-full">
            <Share2 className="mr-2 h-4 w-4" /> 共享我的屏幕
          </Button>
        ) : (
          <Button onClick={stopSharing} variant="destructive" className="w-full">
            停止共享
          </Button>
        )}
        {shareLink && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Input value={shareLink} readOnly />
              <Button onClick={copyLink} variant="outline" size="icon">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-2 h-4 w-4" />
              当前观看人数: {viewers.length}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          点击"共享我的屏幕"开始,然后选择要共享的内容。
        </p>
      </CardFooter>
    </Card>

    {
        stream &&
        (    <Card className="w-full max-w-3xl mx-auto mt-10">
            <CardHeader>
              <CardTitle>屏幕共享</CardTitle>
            </CardHeader>
            <CardContent>
              <video ref={videoRef} className="w-full aspect-video bg-gray-200" controls />
            </CardContent>
          </Card>
          )
    }
    </div>
    
  )
}

