import { Search, Upload, CheckCircle } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";

const HowItWorks = () => {
    const steps = [
        {
            icon: <Upload className="w-6 h-6" />,
            title: "Report an Item",
            description: "Found something? Snap a photo and upload details in seconds."
        },
        {
            icon: <Search className="w-6 h-6" />,
            title: "Search & Match",
            description: "Lost something? Browse the digital catalog or get notified of matches."
        },
        {
            icon: <CheckCircle className="w-6 h-6" />,
            title: "Verify & Claim",
            description: "Prove ownership through our secure process and get your item back."
        }
    ];

    return (
        <section id="how-it-works" className="py-24 bg-secondary/30">
            <div className="container px-6 mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="md:w-1/2">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
                            Simple steps to <br />
                            <span className="text-gray-400">recovery.</span>
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-md">
                            We've streamlined the process to be as frictionless as possible.
                            Get back to what matters, faster.
                        </p>
                    </div>

                    <div className="md:w-1/2 space-y-4">
                        {steps.map((step, index) => (
                            <GlassCard
                                key={index}
                                className="group p-6 flex items-start gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors">
                                    {step.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                                    <p className="text-gray-500 text-sm">{step.description}</p>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
