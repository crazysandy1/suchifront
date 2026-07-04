import React from 'react'


export default function Card({title, value, children}){
return (
<div className="bg-white p-4 rounded-2xl shadow">
<div className="text-sm text-gray-500">{title}</div>
<div className="text-2xl font-bold mt-2">{value}</div>
{children}
</div>
)
}