import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Activity, BarChart3, Globe, Smartphone, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ServicesPage = () => {
    const services = [
        {
            icon: Trophy,
            title: "Tournament Management",
            description: "End-to-end digital management of cricket tournaments. From team registrations and scheduling to automated points tables and net run rate calculations."
        },
        {
            icon: Activity,
            title: "Live Scoring",
            description: "Professional-grade, real-time ball-by-ball scoring. Broadcast live scores to audiences worldwide with our low-latency infrastructure."
        },
        {
            icon: BarChart3,
            title: "Performance Analytics",
            description: "Deep dive into player and team statistics. Advanced metrics, wagon wheels, and performance trends to help analyze and improve game strategies."
        },
        {
            icon: Globe,
            title: "Global Reach",
            description: "Connect with the global cricket community. Showcase your talent, find tournaments nearby, or organize international level events."
        },
        {
            icon: Smartphone,
            title: "Mobile First Experience",
            description: "A seamless experience across all devices. Score matches, track stats, and manage teams on the go with our responsive progressive web app."
        },
        {
            icon: Shield,
            title: "Secure & Verified",
            description: "Trust is paramount. We offer player verification systems and secure data handling to ensure fair play and integrity in every match."
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="py-20 px-6 text-center bg-muted/10 border-b border-border/40">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">Our Services</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Comprehensive solutions tailored for modern cricket. Elevating the game with cutting-edge technology.
                    </p>
                </motion.div>
            </div>

            {/* Services Grid */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 group bg-card">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <service.icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {service.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-primary/5 py-20 px-6 mt-12">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-6">Ready to Transform Your Game?</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Join thousands of teams and organizers who trust cric.netrik for their cricket management needs.
                    </p>
                    {/* Placeholder for action button if needed, or just informative */}
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;
