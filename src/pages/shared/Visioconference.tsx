import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { db } from '../../../firebase-config';
import { ref, onValue, push, set, onDisconnect, remove } from 'firebase/database';
import {
  Mic, MicOff, Video as VideoIcon, VideoOff, Monitor, MessageSquare,
  Users, PhoneOff, Send, Edit3, Trash2
} from 'lucide-react';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';

interface ChatMessage {
  id?: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
}

interface ParticipantState {
  id: string;
  name: string;
  role: string;
  micActive: boolean;
  camActive: boolean;
  screenActive: boolean;
}

export default function Visioconference() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { liveMeetings, endLiveMeeting, loading } = useRealtimeDataStore();

  const currentMeeting = liveMeetings.find(m => m.id === meetingId);

  // Local media states
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
  const [whiteboardActive, setWhiteboardActive] = useState(false);

  // Streams
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});

  // Participants & Messages
  const [participants, setParticipants] = useState<ParticipantState[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const pcsRef = useRef<Record<string, RTCPeerConnection>>({});
  const drawStateRef = useRef({ lastX: 0, lastY: 0 });

  // Whiteboard Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#3b82f6');
  const [drawWidth, setDrawWidth] = useState(4);

  const myUserId = user?.id || 'guest';
  const myName = user?.name || 'Visiteur';
  const myRole = user?.role || 'STUDENT';
  const univId = user?.universityId || 'demo';

  // Redirect when meeting is ended
  useEffect(() => {
    if (!loading && !currentMeeting) {
      ToastError("La visioconférence a été arrêtée par l'enseignant.");
      navigate(user?.role === 'TEACHER' ? '/app/enseignant' : '/app/etudiant');
    }
  }, [loading, currentMeeting, navigate, user]);

  // Teacher Meeting Lifecycle Cleanup
  useEffect(() => {
    if (!meetingId || myRole !== 'TEACHER') return;

    const meetingRecordRef = ref(db, `universites/${univId}/cours_en_ligne/${meetingId}`);
    
    // Register onDisconnect to remove the meeting if the teacher closes the tab/browser
    onDisconnect(meetingRecordRef).remove();

    return () => {
      // When the teacher leaves the page (component unmounts), remove the meeting
      remove(meetingRecordRef).catch(err => console.error("Error removing meeting:", err));
    };
  }, [meetingId, univId, myRole]);

  // 1. Get User Media (Camera & Mic)
  useEffect(() => {
    if (!meetingId) return;

    const createFallbackStream = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      let angle = 0;
      const interval = setInterval(() => {
        if (!ctx) return;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#4f46e5';
        ctx.beginPath();
        const x = 320 + Math.cos(angle) * 50;
        const y = 240 + Math.sin(angle) * 50;
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(myName, 320, 220);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText("(Caméra simulée : Permission refusée)", 320, 260);
        angle += 0.05;
      }, 50);

      const stream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : (canvas as any).mozCaptureStream ? (canvas as any).mozCaptureStream(30) : new MediaStream();


      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const originalStop = videoTrack.stop;
        videoTrack.stop = () => {
          clearInterval(interval);
          if (originalStop) originalStop.call(videoTrack);
        };
      }

      return stream;
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.warn("Accès caméra/micro refusé ou non disponible. Utilisation du fallback simulé :", err);
        ToastError("Accès caméra/micro refusé. Activation du flux simulé.");
        const fallback = createFallbackStream();
        setLocalStream(fallback);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = fallback;
        }
      });

    return () => {
      // Cleanup local stream tracks
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, [meetingId]);

  // Handle local mute/unmute
  useEffect(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = micActive;
    }
  }, [micActive, localStream]);

  useEffect(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = camActive;
    }
  }, [camActive, localStream]);

  // Bind local webcam stream to video element on mount/remount
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, whiteboardActive, screenShareActive]);

  // Bind screen share stream to video element on mount/remount
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream, screenShareActive]);

  // 2. Presence & Participant Register
  useEffect(() => {
    if (!meetingId) return;

    const participantRef = ref(db, `universites/${univId}/cours_en_ligne/${meetingId}/participants/${myUserId}`);
    
    // Write presence state
    set(participantRef, {
      id: myUserId,
      name: myName,
      role: myRole,
      micActive,
      camActive,
      screenActive: screenShareActive
    });

    // Cleanup on disconnect
    onDisconnect(participantRef).remove();

    // Listen to all participants
    const participantsListRef = ref(db, `universites/${univId}/cours_en_ligne/${meetingId}/participants`);
    const unsubscribeParticipants = onValue(participantsListRef, (snap) => {
      const val = snap.val();
      if (val) {
        const parsed = Object.keys(val).map(key => val[key]);
        setParticipants(parsed);
      } else {
        setParticipants([]);
      }
    });

    return () => {
      remove(participantRef);
      unsubscribeParticipants();
    };
  }, [meetingId, micActive, camActive, screenShareActive]);

  // 3. WebRTC Mesh Signaling Logic
  useEffect(() => {
    if (!meetingId || !localStream) return;

    // Helper to setup a peer connection
    const getOrCreatePeerConnection = (otherUserId: string) => {
      if (pcsRef.current[otherUserId]) {
        return pcsRef.current[otherUserId];
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19002' },
          { urls: 'stun:stun1.l.google.com:19002' }
        ]
      });

      // Add local stream tracks
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });

      // Handle remote tracks
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setRemoteStreams(prev => ({
          ...prev,
          [otherUserId]: remoteStream
        }));
      };

      // Handle ICE candidates
      const signalingDir = myUserId < otherUserId ? `${myUserId}_to_${otherUserId}` : `${otherUserId}_to_${myUserId}`;
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candRef = ref(db, `universites/${univId}/cours_en_ligne/${meetingId}/signaling/${signalingDir}/candidates_${myUserId}`);
          push(candRef, event.candidate.toJSON());
        }
      };

      pcsRef.current[otherUserId] = pc;
      return pc;
    };

    // Watch participants to initiate connection
    participants.forEach((p) => {
      if (p.id === myUserId) return;

      const otherUserId = p.id;
      const signalingDir = myUserId < otherUserId ? `${myUserId}_to_${otherUserId}` : `${otherUserId}_to_${myUserId}`;

      if (myUserId < otherUserId) {
        // Initiator: Create PC and Offer
        const pc = getOrCreatePeerConnection(otherUserId);
        
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            const offerRef = ref(db, `universites/${univId}/cours_en_ligne/${meetingId}/signaling/${signalingDir}/offer`);
            set(offerRef, { sdp: pc.localDescription?.sdp, type: pc.localDescription?.type });
          });

        // Listen for Answer
        const answerRef = ref(db, `universites/${univId}/cours_en_ligne/${meetingId}/signaling/${signalingDir}/answer`);
        onValue(answerRef, (snap) => {
          const val = snap.val();
          if (val && pc.signalingState !== 'stable') {
            pc.setRemoteDescription(new RTCSessionDescription(val));
          }
        });

        // Listen for Remote ICE candidates
        const remoteCandRef = ref(db, `universites/${univId}/cours_en_ligne/${meetingId}/signaling/${signalingDir}/candidates_${otherUserId}`);
        onValue(remoteCandRef, (snap) => {
          const val = snap.val();
          if (val) {
            Object.keys(val).forEach((key) => {
              pc.addIceCandidate(new RTCIceCandidate(val[key])).catch(console.error);
            });
          }
        });

      } else {
        // Receiver: Listen for Offer
        const offerRef = ref(db, `universites/${univId}/cours_en_ligne/${meetingId}/signaling/${signalingDir}/offer`);
        onValue(offerRef, (snap) => {
          const val = snap.val();
          if (val && pcsRef.current[otherUserId]?.signalingState !== 'have-local-offer') {
            const pc = getOrCreatePeerConnection(otherUserId);
            pc.setRemoteDescription(new RTCSessionDescription(val))
              .then(() => pc.createAnswer())
              .then((answer) => pc.setLocalDescription(answer))
              .then(() => {
                const answerRef = ref(db, `universites/${univId}/cours_en_ligne/${meetingId}/signaling/${signalingDir}/answer`);
                set(answerRef, { sdp: pc.localDescription?.sdp, type: pc.localDescription?.type });
              });

            // Listen for Remote ICE candidates
            const remoteCandRef = ref(db, `universites/${univId}/cours_en_ligne/${meetingId}/signaling/${signalingDir}/candidates_${otherUserId}`);
            onValue(remoteCandRef, (snap) => {
              const val = snap.val();
              if (val) {
                Object.keys(val).forEach((key) => {
                  pc.addIceCandidate(new RTCIceCandidate(val[key])).catch(console.error);
                });
              }
            });
          }
        });
      }
    });

    return () => {
      // Clean peer connections of left users
      Object.keys(pcsRef.current).forEach((key) => {
        if (!participants.find(p => p.id === key)) {
          pcsRef.current[key].close();
          delete pcsRef.current[key];
          setRemoteStreams(prev => {
            const copy = { ...prev };
            delete copy[key];
            return copy;
          });
        }
      });
    };
  }, [participants, localStream]);

  // 4. Real Screen Sharing API
  const handleToggleScreenShare = async () => {
    if (screenShareActive) {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      setScreenShareActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(stream);
        setScreenShareActive(true);
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }

        // Handle stop sharing from browser bar
        stream.getVideoTracks()[0].onended = () => {
          setScreenShareActive(false);
          setScreenStream(null);
        };
      } catch (err) {
        console.error("Partage d'écran annulé ou impossible :", err);
        ToastError("Échec du partage d'écran.");
      }
    }
  };

  // 5. Whiteboard Drawing Sync via Firebase
  useEffect(() => {
    if (!meetingId) return;

    const whiteboardRef = ref(db, `universites/${univId}/cours_en_ligne/${meetingId}/whiteboard`);
    
    // Draw incoming paths
    const unsubscribeWhiteboard = onValue(whiteboardRef, (snap) => {
      const val = snap.val();
      if (val && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          Object.keys(val).forEach((key) => {
            const segment = val[key];
            ctx.strokeStyle = segment.color;
            ctx.lineWidth = segment.width;
            ctx.beginPath();
            ctx.moveTo(segment.x1, segment.y1);
            ctx.lineTo(segment.x2, segment.y2);
            ctx.stroke();
          });
        }
      }
    });

    return () => unsubscribeWhiteboard();
  }, [meetingId, whiteboardActive]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawStateRef.current = { lastX: x, lastY: y };
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !meetingId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { lastX, lastY } = drawStateRef.current;

    // Send drawing segment to Firebase
    const whiteboardRef = ref(db, `universites/${univId}/cours_en_ligne/${meetingId}/whiteboard`);
    const newSegmentRef = push(whiteboardRef);
    set(newSegmentRef, {
      x1: lastX,
      y1: lastY,
      x2: x,
      y2: y,
      color: drawColor,
      width: drawWidth
    });

    drawStateRef.current = { lastX: x, lastY: y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = async () => {
    if (!meetingId) return;
    const whiteboardRef = ref(db, `universites/${univId}/cours_en_ligne/${meetingId}/whiteboard`);
    await set(whiteboardRef, null);
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // 6. Chat Sync
  useEffect(() => {
    if (!meetingId) return;
    const chatRef = ref(db, `universites/${univId}/cours_en_ligne/${meetingId}/tchat`);
    
    const unsubscribeChat = onValue(chatRef, (snap) => {
      const val = snap.val();
      if (val) {
        const parsed = Object.keys(val).map(key => ({ id: key, ...val[key] }));
        setMessages(parsed);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribeChat();
  }, [meetingId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !meetingId) return;

    try {
      const chatRef = ref(db, `universites/${univId}/cours_en_ligne/${meetingId}/tchat`);
      const newMsgRef = push(chatRef);
      await set(newMsgRef, {
        senderName: myName,
        senderRole: myRole,
        message: newMsg.trim(),
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      });
      setNewMsg('');
    } catch (err) {
      ToastError("Échec de l'envoi du message.");
    }
  };

  const handleLeaveMeeting = async () => {
    if (!meetingId) return;

    if (myRole === 'TEACHER') {
      const confirmEnd = window.confirm("Fermer définitivement la visioconférence pour tous les participants ?");
      if (confirmEnd) {
        try {
          await endLiveMeeting(univId, meetingId);
          ToastSuccess("Visioconférence fermée.");
        } catch (err) {
          console.error(err);
        }
      }
      navigate('/app/enseignant');
    } else {
      navigate('/app/etudiant');
    }
  };

  const courseTitle = currentMeeting?.courseName || "Cours en Ligne";
  const className = currentMeeting?.className || "Classe Virtuelle";
  const teacherName = currentMeeting?.teacherName || "Enseignant";

  return (
    <div className="fixed inset-0 bg-slate-955 text-slate-100 flex flex-col z-[80] font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-900 px-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-650 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
            {courseTitle.charAt(0)}
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide flex items-center gap-2">
              {courseTitle}
              <span className="badge badge-error badge-xs text-[9px] font-bold text-white px-2 uppercase animate-pulse">DIRECT</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">{className} · Prof. {teacherName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-300">
            <Users size={14} className="text-indigo-400" />
            <span className="font-bold">{participants.filter(p => p.role !== 'TEACHER').length} connectés</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video stream panel */}
        <div className="flex-1 p-6 flex flex-col bg-slate-955 relative">
          
          <div className="relative flex-1 w-full max-h-[85%] rounded-3xl overflow-hidden bg-slate-900 border border-slate-850 shadow-2xl flex items-center justify-center group">
            
            {whiteboardActive ? (
              /* Synchronized whiteboard */
              <div className="absolute inset-0 bg-slate-900 flex flex-col">
                <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-950/40">
                  <span className="text-[11px] font-bold tracking-widest text-indigo-400 uppercase flex items-center gap-1.5">
                    <Edit3 size={14} /> Tableau blanc interactif
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#ffffff'].map(c => (
                        <button
                          key={c}
                          onClick={() => setDrawColor(c)}
                          className={`w-5 h-5 rounded-full border transition-all ${
                            drawColor === c ? 'scale-125 border-white' : 'border-transparent hover:scale-110'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    {myRole === 'TEACHER' && (
                      <button
                        onClick={clearCanvas}
                        className="btn btn-ghost btn-xs text-rose-400 hover:bg-rose-950/20 rounded-lg flex items-center gap-1 px-2 h-7"
                      >
                        <Trash2 size={12} /> Effacer
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 relative overflow-hidden bg-slate-900 cursor-crosshair">
                  <canvas
                    ref={canvasRef}
                    width={900}
                    height={550}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-full block bg-transparent"
                  />
                </div>
              </div>
            ) : screenShareActive ? (
              /* Real screen sharing element */
              <div className="absolute inset-0 bg-slate-955 flex flex-col items-center justify-center">
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-4 left-4 bg-slate-950/80 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-indigo-400">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> Partage d'écran actif
                </div>
              </div>
            ) : (
              /* Teacher/Main Stream Video display */
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-955 flex flex-col items-center justify-center">
                {myRole === 'TEACHER' ? (
                  <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 bg-slate-950/80 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-indigo-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Vous (Enseignant)
                    </div>
                  </div>
                ) : (
                  /* Display teacher's stream from remoteStreams */
                  (() => {
                    const teacherParticipant = participants.find(p => p.role === 'TEACHER');
                    const teacherStream = teacherParticipant ? remoteStreams[teacherParticipant.id] : null;

                    if (teacherStream && teacherParticipant?.camActive) {
                      return (
                        <div className="absolute inset-0 bg-slate-900">
                          <video
                            autoPlay
                            playsInline
                            ref={(el) => {
                              if (el) el.srcObject = teacherStream;
                            }}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-4 left-4 bg-slate-950/80 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-indigo-400">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> Prof. {teacherName}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="text-center space-y-6">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 border-4 border-indigo-500/20 flex items-center justify-center mx-auto relative shadow-2xl">
                          <span className="text-4xl font-extrabold text-white">{teacherName.charAt(0)}</span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-100 text-base">Prof. {teacherName}</h4>
                          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Caméra éteinte</p>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            )}
          </div>

          {/* Student remote streams feeds strip */}
          <div className="mt-4 grid grid-cols-3 gap-4 h-24 max-h-24">
            {participants
              .filter(p => p.role === 'STUDENT')
              .slice(0, 3)
              .map((p) => {
                const stream = remoteStreams[p.id] || (p.id === myUserId ? localStream : null);
                const hasCam = p.camActive;

                return (
                  <div key={p.id} className="bg-slate-900 border border-slate-850 rounded-2xl flex items-center gap-3 relative overflow-hidden p-2">
                    {hasCam && stream ? (
                      <video
                        autoPlay
                        playsInline
                        muted={p.id === myUserId}
                        ref={(el) => {
                          if (el && el.srcObject !== stream) el.srcObject = stream;
                        }}
                        className="w-16 h-full object-cover rounded-xl bg-slate-800 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-full rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-300 border border-slate-700 flex-shrink-0">
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">{p.name}</p>
                      <p className="text-[9px] text-slate-500">Étudiant</p>
                    </div>
                    <div className="absolute right-3 top-3">
                      {p.micActive ? (
                        <Mic size={12} className="text-emerald-400" />
                      ) : (
                        <MicOff size={12} className="text-slate-500" />
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Sidebar Panel (Chat & Participants) */}
        {sidebarOpen && (
          <aside className="w-80 border-l border-slate-900 flex flex-col bg-slate-900/30">
            <div className="flex border-b border-slate-950">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 tracking-wider uppercase transition-all ${
                  activeTab === 'chat'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-950/20'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Chat ({messages.length})
              </button>
              <button
                onClick={() => setActiveTab('participants')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 tracking-wider uppercase transition-all ${
                  activeTab === 'participants'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-955/20'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Participants ({participants.filter(p => p.role !== 'TEACHER').length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'chat' ? (
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      Aucun message. Envoyez le premier message !
                    </div>
                  ) : (
                    messages.map((m, i) => {
                      const isMe = m.senderName === myName;
                      return (
                        <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                           <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold text-slate-400">{m.senderName}</span>
                            <span className={`text-[8px] font-semibold px-1 rounded uppercase tracking-wider ${
                              m.senderRole === 'TEACHER' ? 'bg-indigo-955 text-indigo-400 border border-indigo-900/50' : 'bg-slate-850 text-slate-400'
                            }`}>
                              {m.senderRole === 'TEACHER' ? 'Prof' : 'Élève'}
                            </span>
                          </div>
                          <div className={`p-2.5 rounded-2xl max-w-[90%] text-xs leading-normal ${
                            isMe
                              ? 'bg-indigo-650 text-white rounded-tr-none'
                              : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-850'
                          }`}>
                            {m.message}
                          </div>
                          <span className="text-[8px] text-slate-500 mt-0.5">{m.timestamp}</span>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>
              ) : (
                <div className="space-y-3">
                  {participants
                    .filter(p => p.role !== 'TEACHER')
                    .map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-850">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-650 flex items-center justify-center font-bold text-xs text-white">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">{p.name}</p>
                            <p className="text-[8px] text-indigo-400 uppercase font-bold tracking-widest mt-0.5">{p.role === 'TEACHER' ? 'Enseignant' : 'Étudiant'}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-indigo-400 font-semibold px-2 py-0.5 rounded-full bg-indigo-955 border border-indigo-900/50">
                          {p.role === 'TEACHER' ? 'Hôte' : 'En ligne'}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {activeTab === 'chat' && (
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-950 bg-slate-955/20 flex gap-2">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-md shadow-indigo-500/10 active:scale-95"
                >
                  <Send size={12} />
                </button>
              </form>
            )}
          </aside>
        )}
      </div>

      {/* Toolbar */}
      <footer className="h-20 border-t border-slate-900 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="text-xs text-slate-400 font-medium">
          ID de réunion : <span className="font-mono text-slate-100 font-bold">{meetingId}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mic */}
          <button
            onClick={() => setMicActive(!micActive)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              micActive
                ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                : 'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-500/20'
            }`}
          >
            {micActive ? <Mic size={18} /> : <MicOff size={18} />}
          </button>

          {/* Camera */}
          <button
            onClick={() => setCamActive(!camActive)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              camActive
                ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                : 'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-500/20'
            }`}
          >
            {camActive ? <VideoIcon size={18} /> : <VideoOff size={18} />}
          </button>

          {/* Screen Share */}
          <button
            onClick={handleToggleScreenShare}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              screenShareActive
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 animate-pulse'
                : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
            }`}
            title="Partager l'écran"
          >
            <Monitor size={18} />
          </button>

          {/* Whiteboard */}
          <button
            onClick={() => {
              setWhiteboardActive(!whiteboardActive);
              if (screenShareActive) {
                if (screenStream) {
                  screenStream.getTracks().forEach(track => track.stop());
                  setScreenStream(null);
                }
                setScreenShareActive(false);
              }
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              whiteboardActive
                ? 'bg-indigo-650 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'
                : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
            }`}
            title="Tableau blanc"
          >
            <Edit3 size={18} />
          </button>

          {/* Chat toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              sidebarOpen
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
            }`}
            title="Discussion"
          >
            <MessageSquare size={18} />
          </button>
        </div>

        {/* Quit */}
        <button
          onClick={handleLeaveMeeting}
          className="btn btn-error text-white font-bold flex items-center gap-1.5 px-4 h-10 rounded-xl shadow-md shadow-rose-500/10 transition-transform active:scale-95"
        >
          <PhoneOff size={16} />
          Quitter
        </button>
      </footer>
    </div>
  );
}
