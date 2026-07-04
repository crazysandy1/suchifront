import React from 'react'


export default function Topbar(){
return (
<header className="flex items-center justify-between p-4 bg-white border-b">
<div className="flex items-center gap-4">
<button className="p-2 rounded bg-gray-100">☰</button>
<input placeholder="Search products..." className="px-3 py-2 border rounded" />
</div>
<div className="flex items-center gap-4">
<div className="text-sm">Shreyas</div>
<img src={`https://avatars.dicebear.com/api/identicon/shreyas.svg`} alt="avatar" className="w-8 h-8 rounded-full" />
</div>
</header>
)
}