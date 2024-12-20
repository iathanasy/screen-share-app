import { useState, useCallback, useEffect } from 'react';
import Peer from 'peerjs';

export function useScreenShare() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewers, setViewers] = useState<string[]>([]);

  const startSharing = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      setStream(mediaStream);

      const newPeer = new Peer();
      setPeer(newPeer);

      newPeer.on('open', (id) => {
        setPeerId(id);
        setError(null);
      });

      newPeer.on('connection', (conn) => {
        conn.on('open', () => {
          setViewers((prev) => [...prev, conn.peer]);
        //   conn.send({ peerId: peerId, type: 'stream', stream: mediaStream });
            // 将本地媒体流发送给远程 Peer
            const call = newPeer.call(conn.peer, mediaStream);
            // 应答
            call.answer()
            call.on('stream', remoteStream => {
                // 监听对端应答数据流
            });
        });

        conn.on('close', () => {
          setViewers((prev) => prev.filter((v) => v !== conn.peer));
        });
      });


      
      newPeer.on('error', (err) => {
        setError(`PeerJS error: ${err.type}`);
      });

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error("Error starting screen share:", err);
    }
  }, []);

  const stopSharing = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    setPeerId(null);
    setViewers([]);
    setError(null);
  }, [stream, peer]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peer) {
        peer.destroy();
      }
    };
  }, [stream, peer]);

  return { stream, peerId, error, viewers, startSharing, stopSharing };
}

