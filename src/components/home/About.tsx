
import { GlassCard } from "@/components/GlassCard";

const About = () => {
    return (
        <section id="about" className="py-24 relative overflow-hidden">
            <div className="container px-6 mx-auto">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                        More than just a <br />
                        <span className="text-gray-400">Lost & Found box.</span>
                    </h2>
                    <p className="text-lg text-gray-600">
                        We've reimagined the traditional lost and found process. No more digging through dusty boxes.
                        Our digital platform makes it easy to report, search, and claim items instantly.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Smart Matching",
                            description: "Our system automatically suggests matches based on item descriptions, location, and time.",
                            gradient: "from-blue-50 to-indigo-50"
                        },
                        {
                            title: "Community Driven",
                            description: "Empowering the school community to help each other by reporting found items quickly.",
                            gradient: "from-purple-50 to-pink-50"
                        },
                        {
                            title: "Secure Claims",
                            description: "Verification process ensures items are returned to their rightful owners safely.",
                            gradient: "from-orange-50 to-yellow-50"
                        }
                    ].map((feature, index) => (
                        <GlassCard
                            key={index}
                            className={`p-8 hover:scale-[1.02] transition-transform duration-300 bg-gradient-to-br ${feature.gradient}`}
                        >
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default About;
