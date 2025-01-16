'use client'

import { ChangeEvent, useState } from "react";

type Message = {
  from:string,
  message:string
}

type User = {
  id:string,
  name:string
}

const Home = () => {
  
  const [users] = useState<User[]>([
    {
      id:"user-1",
      name:"User 1"
    },
    {
      id:"user-2",
      name:"User 2"
    }
  ])
  const [selectedUser, setSelectedUser] = useState<User|null>(null)
  const [target, setTarget] = useState<User|null>(null)
  const [msg, setMsg] = useState('')

  const [messages, setMessages] =  useState<Message[]>([])

  const socket = new WebSocket('ws://localhost:3002');
  socket.onopen = () => {
    console.log('Terhubung ke WebSocket server');
  };
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if(data.type == 'receive'){
      const m = data.message
      setMessages((prev) => [...prev, {from:target?.id || '', message:m}] )
    }
  };
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  socket.onclose = () => {
    console.log('Koneksi WebSocket ditutup');
  };

  const handleChange = (e:ChangeEvent<HTMLInputElement>)=>{
    setMsg(e.target.value)
  }

  const onSubmit = () => {
    socket.send(
      JSON.stringify({
        type:'send',
        message:msg,
        target:target?.id
      })
    )

    setMessages((prev) => [...prev, {from:'me', message:msg}] )
    setMsg('')
  }

  const selectUser = (userId:string) => {
    setSelectedUser(()=> users.find(i => i.id == userId) || null)
    socket.send(JSON.stringify({ type: 'register', userId: userId }));
  }

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="w-1/2 rounded border p-4 mx-auto">
        {selectedUser && target ? (
          <>
            <div className="border-b mb-5 pb-3">
              {target.name}
            </div>
            <div className="min-h-[50vh]">
              {messages.map((item, index) => {
                return (
                  <div className={`${item.from == 'me' ? 'text-right':''}`} key={`${item.message.replace(/ /g, '-')}-${index}`}>
                    <span>{item.message}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-x-2 mb-2">
              <input 
                type="text"
                className="border px-3 py-1 rounded w-full"
                value={msg}
                onChange={handleChange} 
              />
              <button
                className="border px-3 rounded"
                onClick={onSubmit}
              >
                Send
              </button>
            </div>
          </>
        ):(
          !selectedUser ? (
            <div>
              <h1 className="mb-3">Pilih User</h1>
              <div className="flex gap-x-2">
                {users.map(item => {
                  return (
                    <button
                      key={item.id}
                      className="border px-3 rounded"
                      onClick={() => selectUser(item.id)}
                    >
                      {item.name}
                    </button>
                  )
                })}
              </div>

            </div>
          ):(
            <div>
              <h1 className="mb-3">Pilih Target</h1>
              <div className="flex gap-x-2">
                {users.map(item => {
                  return (
                    <button
                      key={`${item.id}-target`}
                      className="border px-3 rounded"
                      onClick={() => setTarget(()=> users.find(i => i.id == item.id) || null)}
                    >
                      {item.name}
                    </button>
                  )
                })}
              </div>

            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Home
