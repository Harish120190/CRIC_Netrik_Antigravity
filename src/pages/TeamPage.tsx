import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Mock Team Data - In a real app, this might come from an API or config
const teamMembers = [
    {
        name: "Harish Kumar",
        role: "Founder & Lead Developer",
        bio: "Passionate about cricket and technology. Building the future of digital sports management.",
        socials: { twitter: "#", linkedin: "#", github: "#" },
        imageUrl: "/placeholder-user.jpg" // Replace with actual images if available
    },
    {
        name: "Alex Morgan",
        role: "Product Designer",
        bio: "Crafting intuitive and beautiful user experiences. Believes in design that solves problems.",
        socials: { twitter: "#", linkedin: "#", dribbble: "#" },
        imageUrl: "/placeholder-user.jpg"
    },
    {
        name: "Sarah Chen",
        role: "Head of Operations",
        bio: "Ensuring smooth execution of tournaments and customer success. dedicated to operational excellence.",
        socials: { twitter: "#", linkedin: "#" },
        imageUrl: "/placeholder-user.jpg"
    },
    // Add more team members as needed
];

const TeamPage = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="py-24 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">Meet the Team</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        The passionate individuals behind cric.netrik, working together to revolutionize cricket management.
                    </p>
                </motion.div>
            </div>

            {/* Team Grid */}
            <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group"
                        >
                            <div className="relative bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300">
                                <div className="aspect-square overflow-hidden bg-muted relative">
                                    {/* Placeholder specific logic can be improved */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-secondary/30 text-secondary-foreground">
                                        <UsersIcon className="w-20 h-20 opacity-20" />
                                    </div>
                                    <img
                                        src={member.imageUrl}
                                        alt={member.name}
                                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500 opacity-0 group-hover:opacity-100 absolute inset-0 mix-blend-overlay"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                    <Avatar className="w-full h-full rounded-none">
                                        <AvatarImage src={member.imageUrl} className="object-cover" />
                                        <AvatarFallback className="text-4xl font-light rounded-none bg-secondary/20">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-2xl font-bold text-foreground mb-1">{member.name}</h3>
                                    <p className="text-primary font-medium mb-4">{member.role}</p>
                                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                                        {member.bio}
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10 rounded-full w-9 h-9">
                                            <Linkedin className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10 rounded-full w-9 h-9">
                                            <Twitter className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10 rounded-full w-9 h-9">
                                            <Mail className="w-4 h-4" />
                                        </Button>

                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Join Us Section */}
            <div className="bg-muted/20 py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
                    <p className="text-muted-foreground text-lg mb-8">
                        We are always looking for talented individuals to join our team. If you are passionate about sports and technology, we'd love to hear from you.
                    </p>
                    <Button size="lg" className="rounded-full px-8">
                        View Open Positions
                    </Button>
                </div>
            </div>
        </div>
    );
};

const UsersIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
)

export default TeamPage;
