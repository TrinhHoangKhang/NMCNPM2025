

export default function Footer() {
  	return (
	<footer className="p-5 px-9 flex mb-3 bg-sky-50
            justify-between items-center row-start-3">
		<div className='flex md:flex-row space-x-2 flex-col'>
            <p className="text-lg">&copy; 2025 MyShop.</p>
            <p className="text-lg">All right reserved</p>
        </div>
		<div className='flex md:flex-row flex-col'>
            <p className="text-lg">Built with React </p>
            <p className="text-lg"> &#183; Vite</p>
            <p className="text-lg"> &#183; Tailwind</p>
            <p className="text-lg"> &#183; shadcn/ui</p>
        </div>
    </footer>
	);
}