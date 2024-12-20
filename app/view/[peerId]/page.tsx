"use client"

import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Peer from 'peerjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

export default function ViewSession() {
  const { peerId } = useParams()
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (typeof peerId !== 'string') {
      setError('无效的会话ID')
      return
    }

    const peer = new Peer()

    peer.on('open', () => {
      const conn = peer.connect(peerId)

      conn.on('open', () => {
        setConnected(true)
        
        conn.on('data', (data:any) => {
            console.log("接收到data数据,不能接收数据流：" + JSON.stringify(data))
        })
      })

      conn.on('error', (err) => {
        setError(`连接错误: ${err}`)
      })

    })

    // 媒体传输
    peer.on('call', async (call) => {
        // 应答
        call.answer()
        // 监听视频流，并更新到 videoRef 上
        call.on('stream', (stream) => {
            console.log("接收到call数据stream")
            setStream(stream)
        })
    })

    peer.on('error', (err) => {
      setError(`PeerJS错误: ${err.type}`)
    })

    return () => {
      peer.destroy()
    }
  }, [peerId])

  useEffect(()=>{
    if(stream){
        if (videoRef.current) {
            videoRef.current.srcObject = stream
            // 设置静音
            videoRef.current.muted = true
            videoRef.current.play()
        }
      }
  },[videoRef.current])

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>错误</CardTitle>
          <CardDescription>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>连接失败</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!connected) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>正在连接...</CardTitle>
          <CardDescription>请稍候,正在建立连接</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>观看屏幕共享</CardTitle>
        <CardDescription>您已成功连接到会话 {peerId}</CardDescription>
      </CardHeader>
      <CardContent>
        <video ref={videoRef} className="w-full aspect-video bg-gray-200" controls />
      </CardContent>
    </Card>
  )
}

