"use client";

import { ButtonMain } from '@/components/ButtonMain';
import { InputBox } from '@/components/inputBox';
import { BACKEND_URL, defaultStyles, defaultStyles2, styleInputJoin } from "@/config"
import { ArrowRightIcon } from '@/Icons/ArrowRightIcon';
import { PlusIcon } from '@/Icons/PlucIcon';
import { useRouter } from 'next/navigation';
import React, { useRef } from 'react';

// --- Main Dashboard Component ---
export default function DashboardPage() {
  // 1. Use useRef to get direct access to the input elements
  const router = useRouter();
  const createRoomRef = useRef<HTMLInputElement>(null);
  const joinRoomRef = useRef<HTMLInputElement>(null);

  // 2. Handler for creating a new room
  const handleCreateRoom = () => {
    const token = localStorage.getItem("token")
    const roomName = createRoomRef.current?.value.trim();
    
    if (roomName) {
      console.log("Request to CREATE room:", roomName);
      fetch(`${BACKEND_URL}/room`, {
            method: "POST",
            headers: { "Content-Type": "application/json",
                "Authorization":`${token}`
            },
            body: JSON.stringify({ name: roomName }),
            cache: "no-store",
        })
        .then((res) => res.json())
        .then((data) => {
            const roomId = data.roomId;
            console.log("Room created:", roomId);
            router.push(`canvas/${roomId}`)
        })
        .catch((err) => {
            console.error("Error creating room:", err);
        });

    } else {
      
    }
  };

  // 3. Handler for joining an existing room
  const handleJoinRoom = () => {
     const token = localStorage.getItem("token")
    const roomSlug = joinRoomRef.current?.value.trim();
    
    if (roomSlug) {
      console.log("Request to join room:", roomSlug);
      fetch(`${BACKEND_URL}/room/${roomSlug}`, {
            method: "get",
            headers: { "Content-Type": "application/json",
                "Authorization":`${token}`
            },
            cache: "no-store",
        })
        .then((res) => res.json())
        .then((data) => {
            const roomId = data.roomId;
            console.log("Room created:", roomId);
            router.push(`canvas/${roomId}`)
        })
        .catch((err) => {
            console.error("Error creating room:", err);
        });

    } else {
      
    }
  };
  
  return (
    <>
      {/* We inject the custom font directly using a style tag for a self-contained component */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap');
        .font-kalam {
          font-family: 'Kalam', cursive;
        }
      `}</style>
      
      <main className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4 font-kalam">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800">
              Excali-Draw
            </h1>
            <p className="text-slate-500 mt-2 text-lg">Your Collaborative Whiteboard</p>
          </div>

          {/* Main actions card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Create Room Section */}
            <div className="bg-white p-8 border-2 border-slate-800 rounded-xl shadow-[8px_8px_0px_#1e293b] transition-transform hover:-translate-y-1 hover:-translate-x-1">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Start a New Canvas</h2>
              <div className="space-y-4">

                <InputBox ref={createRoomRef} className={styleInputJoin} type='text' 
                placeholder='Create your room ' onEnter={handleCreateRoom}/>

                <ButtonMain text='Create Room' startIcon={<ArrowRightIcon className='w-6 h-6'/>} 
                className={defaultStyles2} onClick={handleCreateRoom}/>
              </div>
            </div>

            {/* Join Room Section */}
            <div className="bg-white p-8 border-2 border-slate-800 rounded-xl shadow-[8px_8px_0px_#1e293b] transition-transform hover:-translate-y-1 hover:-translate-x-1">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Join an Existing Room</h2>
              <div className="space-y-4">
                <InputBox className={styleInputJoin} type='text'  ref={joinRoomRef}
                placeholder='Enter your room name' onEnter={handleJoinRoom}/>

                <ButtonMain text='Join Room' startIcon={<PlusIcon className='w-6 h-6'/>} 
                className={defaultStyles} onClick={handleJoinRoom}/>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </>
  );
}