import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, ShieldCheck, Users } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const AboutUsPage = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative py-24 px-6 md:px-12 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/5 dark:to-background overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] bg-[size:20px_20px]" />
                <div className="relative max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
                            Redefining Cricket Management
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            We are dedicated to modernizing the sport we love. cric.netrik brings professional-grade tools to every level of cricket, from local clubs to elite tournaments.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Mission & Vision Section */}
            <div className="py-20 px-6 md:px-12">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                <Target className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
                        </div>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            To empower cricket organizers, scorers, and players with intuitive, powerful technology that simplifies management and amplifies the excitement of the game. We strive to make every match feel like an international event.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-lg bg-accent/10 text-accent">
                                <Eye className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground">Our Vision</h2>
                        </div>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            A world where every cricket match, regardless of its scale, is digitally connected, data-driven, and accessible to fans everywhere. We envision a seamless ecosystem for the global cricket community.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Why Choose Us / Values Section */}
            <div className="py-24 px-6 md:px-12 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose cric.netrik?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Built by cricket lovers for cricket lovers, backed by enterprise-grade engineering.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "Reliability First",
                                color: "text-blue-500",
                                bg: "bg-blue-500/10",
                                desc: "Our platform is built on robust infrastructure to ensure zero downtime during your crucial matches."
                            },
                            {
                                icon: Users,
                                title: "Community Focused",
                                color: "text-green-500",
                                bg: "bg-green-500/10",
                                desc: "We build features that foster community, engagement, and fair play among all participants."
                            },
                            {
                                icon: Target, // Or another icon like 'Zap' for Innovation
                                title: "Innovation Driven",
                                color: "text-purple-500",
                                bg: "bg-purple-500/10",
                                desc: "Constantly evolving with the latest tech to bring you AI-driven insights and features."
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Card className="h-full border-muted/60 shadow-sm hover:shadow-md transition-shadow bg-card">
                                    <CardContent className="p-8 flex flex-col items-center text-center">
                                        <div className={`p-4 rounded-full ${item.bg} ${item.color} mb-6`}>
                                            <item.icon className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-4 text-foreground">{item.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;
