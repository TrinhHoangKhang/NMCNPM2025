import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
	const { user, logout } = useAuth();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const getInitials = (name) => {
		if (!name) return "U"
		return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2)
	}

	return (
		<header className="p-5 px-9 flex bg-sky-50
            justify-between items-center row-start-1 border">
			<div className='flex md:flex-row flex-col'>
				<div className='text-4xl font-bold ml-2 flex flex-row gap-1'>
					<img src="/home.svg" alt="Logo" 
						className="h-10 w-10 text-blue-300 blue-300" />
					<p>MyShop</p>
				</div>
				<div className='Button ml-5 space-x-4 pt-2 
					text-xl cursor-pointer'>
					<Link to="/product" className='hover:text-blue-700'>Product</Link>
					<Link to="/dashboard" className='hover:text-blue-700'>Showcase</Link>
				</div>
			</div>
			<div className="relative border rounded-3xl p-3">
				<button className="flex items-center space-x-2 focus:outline-none" 
					onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
					<Avatar className="h-9 w-9">
						<AvatarImage src="" />
						<AvatarFallback className="bg-sky-100 text-black font-bold text-xl">
							{getInitials(user?.name) || "UN"}
						</AvatarFallback>
					</Avatar> 
					<span className="text-xl text-black hidden md:block font-bold">
						{user?.name || "Guest"}
					</span>
				</button>
				{isDropdownOpen ? (
					user ? (
						<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
							<button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
						</div>
					) : (
						<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
							<Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Login</Link>
							<Link to="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Register</Link>
						</div>
					)
				) : (<></>)
				}

			</div>

		</header>
	);
}
