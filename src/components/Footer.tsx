import { Github, Twitter, Linkedin, Mail, Map, Phone, Youtube, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="py-20 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
      <div className="container px-6 mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2 space-y-6">
            <h3 className="text-2xl font-bold tracking-tighter">
              Lost<span className="text-gray-400">*</span>Found
            </h3>
            <p className="text-gray-500 max-w-sm leading-relaxed">
              Empowering students and staff to reclaim their lost belongings through a smart, community-driven platform. Developed for FBLA.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-gray-100 hover:bg-black hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-gray-100 hover:bg-black hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-gray-100 hover:bg-black hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
            <div className="pt-4">
              <h4 className="font-bold text-sm mb-2">Web Team</h4>
              <p className="text-sm text-gray-500">Lakshan Suresh</p>
              <p className="text-sm text-gray-500">Ankith Nayak</p>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-lg">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-500">
                <Map className="w-5 h-5 mt-1 shrink-0" />
                <span>Stevenson High School<br />1 Stevenson Dr,<br />Lincolnshire, IL 60089</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500">
                <Phone className="w-5 h-5 shrink-0" />
                <span>(630) 998-6671</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500">
                <Mail className="w-5 h-5 shrink-0" />
                <span>lostnfound@d125.org</span>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-lg">Website Sources</h4>
            <ul className="space-y-4">
              <li><a href="https://code.visualstudio.com/license" className="text-gray-500 hover:text-black transition-colors">VS Code Licensing</a></li>
              <li><a href="https://github.com/facebook/react/blob/main/LICENSE" className="text-gray-500 hover:text-black transition-colors">React Licensing</a></li>
              <li><a href="https://github.com/supabase/supabase/blob/master/LICENSE" className="text-gray-500 hover:text-black transition-colors">Supabase Licensing</a></li>
              <li><a href="https://docs.npmjs.com/policies/npm-license" className="text-gray-500 hover:text-black transition-colors">NPM Licensing</a></li>
              <li><a href="https://vercel.com/legal/notices-and-license-information" className="text-gray-500 hover:text-black transition-colors">Node.js Licensing</a></li>
              <li><a href="https://vercel.com/legal/notices-and-license-information" className="text-gray-500 hover:text-black transition-colors">Vercel Licensing</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2026 Stevenson High School - Lost & Found. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            {/* <a href="https://21st.dev" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              Components from <a href="https://21st.dev" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">21st.dev</a>
            </a> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
