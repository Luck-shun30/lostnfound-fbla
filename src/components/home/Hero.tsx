import { useState, useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const getLinkDestination = (target: string) => {
        if (!user) return "/auth";
        return target;
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="orb w-[500px] h-[500px] bg-orb-1 top-[-10%] left-[-10%] animate-float" />
                <div className="orb w-[400px] h-[400px] bg-orb-2 bottom-[10%] right-[-5%] animate-float-delayed" />
                <div className="orb w-[300px] h-[300px] bg-orb-3 top-[40%] left-[80%] animate-float-slow" />
            </div>

            <div className="container relative z-10 px-6 mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full glass-card animate-fade-in hover:scale-105 transition-transform cursor-default">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-sm font-medium text-gray-600">Reuniting lost items with owners</span>
                </div>

                <h1 className="max-w-4xl mx-auto text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl mb-8 animate-fade-in [animation-delay:200ms] text-balance">
                    Lost something? <br />
                    <span className="text-gray-400">We'll find it.</span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg text-gray-600 md:text-xl mb-10 animate-fade-in [animation-delay:400ms] text-balance">
                    The intelligent platform connecting lost items with their owners through community collaboration and smart matching.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in [animation-delay:600ms]">
                    <Link
                        to={getLinkDestination("/submit")}
                        className="group relative px-8 py-4 rounded-full bg-black text-white font-medium hover:bg-gray-800 transition-all hover:scale-105 flex items-center gap-2"
                    >
                        Report Lost Item
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        to={getLinkDestination("/items")}
                        className="px-8 py-4 rounded-full glass-card hover:bg-white/80 transition-all hover:scale-105 font-medium flex items-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        Browse Found Items
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;
