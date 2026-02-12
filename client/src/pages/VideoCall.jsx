import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

const VideoCall = () => {
    const { roomId } = useParams();
    const { userId, getToken } = useAuth();
    const { user } = useUser();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isVoiceCall = searchParams.get('type') === 'voice';

    const containerRef = React.useRef(null);

    React.useEffect(() => {
        const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
        const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

        if (!containerRef.current) return;

        console.log("Initializing Zego Channel...", { appID, roomId });

        if (!appID || !serverSecret) {
            console.error("Zego Cloud credentials missing!");
            toast.error("Video Call Config Missing! Check console.");
            return;
        }

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            roomId,
            userId || Date.now().toString(),
            user?.fullName || "User"
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
            container: containerRef.current,
            scenario: {
                mode: ZegoUIKitPrebuilt.OneONoneCall,
            },
            turnOnCameraWhenJoining: !isVoiceCall,
            showMyCameraToggleButton: !isVoiceCall,
            showAudioVideoSettingsButton: true,
            showScreenSharingButton: false,
            onLeaveRoom: async () => {
                // Determine partner ID from roomId (roomId = [id1, id2].sort().join('_'))
                const partnerId = roomId.split('_').find(id => id !== userId);
                if (partnerId) {
                    try {
                        const toastId = toast.loading('Ending Call...');
                        const token = await window.Clerk?.session?.getToken();

                        if (token) {
                            await api.post("/api/message/send", {
                                to_user_id: partnerId,
                                text: isVoiceCall ? `🚫 Voice Call Ended||${roomId}` : `🚫 Video Call Ended||${roomId}`
                            }, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            // Debug alert
                            // alert("Debug: Call Ended Message Sent!");
                        }
                        toast.success('Call Ended', { id: toastId });
                    } catch (err) {
                        console.error("Failed to send call end message", err);
                        alert("Debug Error: Failed to send message. " + err.message);
                    }
                }

                // Deliberate delay to ensure toast is seen and request completes
                setTimeout(() => {
                    navigate('/messages');
                }, 1500);
            }
        });

        return () => {
            zp.destroy();
        };
    }, [roomId, userId, user, navigate, isVoiceCall]);

    return (
        <div
            className="myCallContainer fixed inset-0 z-50 bg-black"
            ref={containerRef}
            style={{ width: '100vw', height: '100vh' }}
        ></div>
    );
};

export default VideoCall;
