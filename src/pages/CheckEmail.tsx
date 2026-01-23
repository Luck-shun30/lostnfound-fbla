import { Link } from "react-router-dom";
import { GlassCard } from "@/components/GlassCard";
import { Mail } from "lucide-react";

const CheckEmail = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background blobs similar to Auth page */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] animate-blob" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />

            <div className="w-full max-w-md animate-scale-in relative z-10">
                <GlassCard className="p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center">
                            <Mail className="w-8 h-8 text-black" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold mb-4 tracking-tight">Check your email</h1>

                    <p className="text-muted-foreground mb-8 leading-relaxed">
                        We've sent a verification link to your email address.
                        Please click the link to verify your account and get started.
                    </p>

                    <div className="space-y-4">
                        <Link
                            to="/auth"
                            className="block w-full py-3 px-4 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all hover:scale-[1.02]"
                        >
                            Back to Sign In
                        </Link>

                        <p className="text-sm text-gray-500">
                            Didn't receive the email? <button className="text-black hover:underline font-medium">Click to resend</button>
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default CheckEmail;
