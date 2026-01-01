import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
	LayoutDashboard,
	Package,
	ShoppingCart,
	Users,
	Navigation
} from 'lucide-react';

export default function Header() {
	const { user, logout } = useAuth();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const location = useLocation();

	const navItems = [
		{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
		{ label: 'Find Jobs', href: '/jobs', icon: Package },
		{ label: 'Trip History', href: '/history', icon: ShoppingCart },
		{ label: 'Profile', href: '/profile', icon: Users },
		{ label: 'Simulator', href: '/simulation', icon: Navigation },
	];

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
		<header className="px-6 py-4 flex bg-white justify-between items-center border-b sticky top-0 z-50 shadow-sm h-16">
			<div className='flex items-center gap-8'>
				<Link to="/" className='flex items-center gap-2'>
					<img src="/home.svg" alt="Logo" className="h-8 w-8" />
					<span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Wait4Me Driver</span>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center space-x-1">
					{navItems.map((item) => {
						const isActive = location.pathname === item.href;
						const Icon = item.icon;
						return (
							<Link
								key={item.href}
								to={item.href}
								className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive
										? 'bg-indigo-50 text-indigo-700'
										: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
									}`}
							>
								<Icon className="h-4 w-4" />
								{item.label}
							</Link>
						);
					})}
				</nav>
			</div>

			<div className="relative">
				<button className="flex items-center space-x-2 focus:outline-none hover:bg-slate-50 p-1 rounded-full px-2 transition-colors border"
					onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
					<Avatar className="h-8 w-8">
						<AvatarImage src="" />
						<AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-xs ring-2 ring-white">
							{getInitials(user?.name) || "U"}
						</AvatarFallback>
					</Avatar>
					<span className="text-sm font-medium text-slate-700 hidden md:block">
						{user?.name || "Guest"}
					</span>
				</button>
				{isDropdownOpen ? (
					user ? (
						<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border ring-1 ring-black ring-opacity-5">
							<div className="px-4 py-2 border-b">
								<p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
								<p className="text-xs text-slate-500 truncate">{user.email}</p>
							</div>
							<Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">Profile</Link>
							<button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Logout</button>
						</div>
					) : (
						<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border ring-1 ring-black ring-opacity-5">
							<Link to="/login" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Login</Link>
							<Link to="/register" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Register</Link>
						</div>
					)
				) : null}
			</div>
		</header>
	);
}
