import React from "react";
import { Mail, Phone, Ticket } from "lucide-react";

export default function ContactSection() {
  return (
    <section id="contact" className="w-full py-16 px-4 md:px-0 flex flex-col items-center bg-transparent text-black">
      {/* Section Title */}
      <h2 className="text-3xl font-bold mb-10 text-center">Contact Us</h2>
      <div className="max-w-5xl w-full flex flex-col md:flex-row shadow-2xl overflow-hidden rounded-2xl border border-gray-300">
        {/* Contact Card */}
        <div className="flex-1 bg-neutral-800 p-8 rounded-tl-2xl rounded-bl-2xl">
          <form className="space-y-4">
            <div className="flex gap-4">
              <input type="text" placeholder="First Name" className="flex-1 px-4 py-2 rounded bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-white" />
              <input type="text" placeholder="Last Name" className="flex-1 px-4 py-2 rounded bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-white" />
            </div>
            <input type="text" placeholder="Phone Number" className="w-full px-4 py-2 rounded bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-white" />
            <textarea placeholder="Message" className="w-full px-4 py-2 rounded bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-white min-h-[100px]" />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="privacy" className="accent-white" />
              <label htmlFor="privacy" className="text-white text-sm">You agree to our <span className="font-semibold underline">Privacy Policy</span>.</label>
            </div>
            <button type="submit" className="w-full py-2 rounded bg-white hover:bg-gray-200 text-black font-bold shadow transition">SEND MESSAGE</button>
          </form>
        </div>
        {/* Contact Info */}
        <div className="flex-1 p-8 bg-neutral-100">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="text-gray-700 mb-6">You need more information? Check what other persons are saying about our product. They are very happy with their purchase.</p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-black"><Phone className="w-5 h-5" /> +1(424) 535 3523</li>
            <li className="flex items-center gap-3 text-black"><Mail className="w-5 h-5" /> hello@mail.com</li>
            <li className="flex items-center gap-3 text-black"><Ticket className="w-5 h-5" /> <a href="#" className="underline font-semibold">Open Support Ticket</a></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
