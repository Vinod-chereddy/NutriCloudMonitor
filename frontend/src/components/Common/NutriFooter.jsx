import React from 'react';
import { ShieldCheck, Truck, RotateCcw, HelpCircle } from 'lucide-react';

const NutriFooter = () => {
  return (
    <footer className="w-full bg-[#172337] text-white pt-10 pb-6 mt-16 font-sans text-xs">
      {/* Value Props Row (Neomorphic Inset Bar) */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#212e44] shadow-[inset_2px_2px_6px_#101928,inset_-2px_-2px_6px_#2a3a54]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2874f0]/20 flex items-center justify-center text-[#ffe500]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">100% Authentic</p>
              <p className="text-gray-400 text-xs">Direct from verified brands</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2874f0]/20 flex items-center justify-center text-[#ffe500]">
              <RotateCcw size={22} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">14 Days Return</p>
              <p className="text-gray-400 text-xs">No questions asked guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2874f0]/20 flex items-center justify-center text-[#ffe500]">
              <Truck size={22} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Free Express Shipping</p>
              <p className="text-gray-400 text-xs">On all orders above ₹499</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2874f0]/20 flex items-center justify-center text-[#ffe500]">
              <HelpCircle size={22} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">24x7 Help Center</p>
              <p className="text-gray-400 text-xs">Dedicated health concierge</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-gray-700/60 pb-8 text-gray-400">
        <div>
          <p className="text-gray-200 font-bold uppercase tracking-wider mb-3 text-[11px]">ABOUT</p>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">About NutriKart</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-white transition-colors">NutriKart Health Stories</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Corporate Information</a></li>
          </ul>
        </div>

        <div>
          <p className="text-gray-200 font-bold uppercase tracking-wider mb-3 text-[11px]">HELP</p>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition-colors">Payments</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cancellation & Returns</a></li>
            <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Diet Consultation</a></li>
          </ul>
        </div>

        <div>
          <p className="text-gray-200 font-bold uppercase tracking-wider mb-3 text-[11px]">CONSUMER POLICY</p>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Sitemap</a></li>
            <li><a href="#" className="hover:text-white transition-colors">EPR Compliance</a></li>
          </ul>
        </div>

        <div>
          <p className="text-gray-200 font-bold uppercase tracking-wider mb-3 text-[11px]">SOCIAL</p>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Twitter (X)</a></li>
            <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-gray-700/60 pt-4 md:pt-0 md:pl-6">
          <p className="text-gray-200 font-bold uppercase tracking-wider mb-3 text-[11px]">REGISTERED OFFICE ADDRESS</p>
          <p className="text-gray-400 text-xs leading-relaxed">
            NutriKart Cloud Health India Private Limited,<br />
            Buildings Alyssa, Begonia & Clove Embassy Tech Village,<br />
            Outer Ring Road, Devarabeesanahalli Village,<br />
            Bengaluru, 560103, Karnataka, India<br />
            CIN: U51109KA2012PTC066107
          </p>
        </div>
      </div>

      {/* Bottom Bar with Partner links and copyright */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-xs">
        <div className="flex flex-wrap items-center gap-6">
          <span className="flex items-center gap-1.5 text-yellow-400 font-medium">
            <span>⭐</span> Become a Seller
          </span>
          <span className="flex items-center gap-1.5 text-yellow-400 font-medium">
            <span>🎯</span> Advertise
          </span>
          <span className="flex items-center gap-1.5 text-yellow-400 font-medium">
            <span>🎁</span> Gift Cards
          </span>
          <span className="flex items-center gap-1.5 text-yellow-400 font-medium">
            <span>❓</span> Help Center
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span>© 2026 NutriKart.com — Powered by SOC Telemetry</span>
        </div>
      </div>
    </footer>
  );
};

export default NutriFooter;

