
import { Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">W</div>
                            <span className="text-xl font-bold text-white">Wait4Me Admin</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Administrative dashboard for platform management and monitoring.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
                            <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">System</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">API Status</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Logs</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Compliance</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Support</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Admin Support</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Incident Response</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Security</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">System Alerts</h3>
                        <p className="text-sm text-slate-400 mb-4">Subscribe to critical system notifications.</p>
                        <div className="flex gap-2">
                            <Input placeholder="Enter your email" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                            <Button size="icon" className="bg-indigo-600 hover:bg-indigo-700">
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>&copy; 2026 Wait4Me Inc. Internal Use Only.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Confidentiality</a>
                        <a href="#" className="hover:text-white transition-colors">Access Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}