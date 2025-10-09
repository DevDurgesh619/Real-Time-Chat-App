"use client";

import { BACKEND_URL } from '@/config';
import React, { useRef, type SVGProps, type ComponentProps } from 'react';

// --- Re-styled UI Components to match the dark theme ---

// Icons
const ArrowRightIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);
const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);

// Button Component (Styled like the landing page)
type ButtonProps = ComponentProps<'button'> & {
    children: React.ReactNode;
};
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, children, ...props }, ref) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-8 bg-sky-500 text-white hover:bg-sky-600/90 shadow-[0_0_20px_theme(colors.sky.500)]';
  return <button className={`${baseClasses} ${className}`} ref={ref} {...props}>{children}</button>;
});
Button.displayName = 'Button';


// InputBox Component (Styled for the dark theme)
type InputBoxProps = ComponentProps<'input'> & {
    onEnter?: () => void;
};
const InputBox = React.forwardRef<HTMLInputElement, InputBoxProps>(({ className, onEnter, ...props }, ref) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && onEnter) {
            onEnter();
        }
    };
    const baseClasses = 'w-full h-12 px-4 bg-neutral-800 border-2 border-neutral-700 rounded-lg text-neutral-200 placeholder:text-neutral-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition-colors';
    return <input ref={ref} className={`${baseClasses} ${className}`} onKeyDown={handleKeyDown} {...props} />;
});
InputBox.displayName = 'InputBox';


// --- Main Dashboard Component ---
export default function DashboardPage() {
  const createRoomRef = useRef<HTMLInputElement>(null);
  const joinRoomRef = useRef<HTMLInputElement>(null);

  // NOTE: Hardcoded the backend URL to resolve the 'process is not defined' error.

  const handleCreateRoom = () => {
    const token = localStorage.getItem("token");
    const roomName = createRoomRef.current?.value.trim();
    
    if (roomName) {
      console.log("Request to CREATE room:", roomName);
      fetch(`${BACKEND_URL}/room`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `${token}` },
            body: JSON.stringify({ name: roomName }),
            cache: "no-store",
        })
        .then((res) => res.json())
        .then((data) => {
            const roomId = data.roomId;
            if(roomId) {
              console.log("Room created:", roomId);
              window.location.href = `canvas/${roomId}`;
            } else {
              console.error("Failed to create room:", data);
            }
        })
        .catch((err) => {
            console.error("Error creating room:", err);
        });
    }
  };

  const handleJoinRoom = () => {
    const token = localStorage.getItem("token");
    const roomSlug = joinRoomRef.current?.value.trim();
    
    if (roomSlug) {
      console.log("Request to JOIN room:", roomSlug);
      fetch(`${BACKEND_URL}/room/${roomSlug}`, {
            method: "get",
            headers: { "Content-Type": "application/json", "Authorization": `${token}` },
            cache: "no-store",
        })
        .then((res) => res.json())
        .then((data) => {
            const roomId = data.roomId;
             if(roomId) {
              console.log("Joining room:", roomId);
              window.location.href = `canvas/${roomId}`;
            } else {
               console.error("Failed to join room:", data);
            }
        })
        .catch((err) => {
            console.error("Error joining room:", err);
        });
    }
  };
  
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap');
        .font-kalam {
          font-family: 'Kalam', cursive;
        }
      `}</style>
      
      <main className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-4 font-kalam selection:bg-sky-500 selection:text-white">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-br from-white to-neutral-400 text-transparent bg-clip-text">
              Excalidraw
            </h1>
            <p className="text-neutral-400 mt-3 text-lg">Your Collaborative Whiteboard</p>
          </div>

          {/* Main actions card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Create Room Section */}
            <div className="relative flex flex-col p-8 bg-neutral-900/80 rounded-xl border border-neutral-800 shadow-lg hover:border-sky-500/50 transition-all duration-300 hover:-translate-y-1">
              <h2 className="text-3xl font-bold text-white mb-6">Start a New Canvas</h2>
              <div className="space-y-4">
                <InputBox 
                  ref={createRoomRef} 
                  type='text' 
                  placeholder='Enter a canvas name' 
                  onEnter={handleCreateRoom}
                />
                <Button onClick={handleCreateRoom}>
                  Create Canvas
                  <ArrowRightIcon className='w-5 h-5'/>
                </Button>
              </div>
            </div>

            {/* Join Room Section */}
            <div className="relative flex flex-col p-8 bg-neutral-900/80 rounded-xl border border-neutral-800 shadow-lg hover:border-sky-500/50 transition-all duration-300 hover:-translate-y-1">
              <h2 className="text-3xl font-bold text-white mb-6">Join an Existing Canvas</h2>
              <div className="space-y-4">
                <InputBox 
                  ref={joinRoomRef}
                  type='text'  
                  placeholder='Enter canvas ID or link' 
                  onEnter={handleJoinRoom}
                />
                <Button onClick={handleJoinRoom}>
                  Join Canvas
                  <PlusIcon className='w-5 h-5'/>
                </Button>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </>
  );
}
