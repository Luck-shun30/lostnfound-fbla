import React from "react";

export const Footer = () => {
  return (
    <footer className="mt-12 bg-background border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-bold">Stevenson High School</h4>
            <p className="text-sm text-muted-foreground">1 Stevenson Dr, Lincolnshrie, IL 60089</p>
          </div>

          <div>
            <h4 className="font-bold">Contact</h4>
            <p className="text-sm text-muted-foreground">(630) 998-6671<br/>lostnfound@d125.org</p>

            <h4 className="font-bold mt-4">Web Team</h4>
            <p className="text-sm text-muted-foreground">Lakshan Suresh<br/>Ankith Nayak</p>
          </div>

          <div>
            <h4 className="font-bold">Find Us On</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><a aria-label="Instagram" href="#" className="hover:underline">Instagram</a></li>
              <li><a aria-label="Facebook" href="#" className="hover:underline">Facebook</a></li>
              <li><a aria-label="YouTube" href="#" className="hover:underline">YouTube</a></li>
            </ul>

            <h4 className="font-bold mt-4">Website Sources</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>VS Code Licensing</li>
              <li>React Licensing</li>
              <li>Supabase Licensing</li>
              <li>NPM Licensing</li>
            </ul>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground mt-6">
          <span>© {new Date().getFullYear()} Stevenson High School — Lost & Found</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
