import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Footer from '../components/Footer.jsx';

export default function MainLayout() {
  return (
    <div className="layout">
      <div className="grid grid-rows-[auto_1fr_auto] h-screen ">
        <Header/>
          <div className='flex flex-col md:flex-row row-start-2'>
            <Sidebar className=''/>
            <Outlet />
          </div>
        <Footer/>
      </div>
    </div>
  );
}