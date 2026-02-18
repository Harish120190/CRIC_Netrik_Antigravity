import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp, ShieldCheck } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const ShopPage = () => {
    const navigate = useNavigate();
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    const heroSlides = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2667&auto=format&fit=crop",
            title: "Elevate Your Game",
            description: "Professional grade equipment for the serious cricketer.",
            cta: "Shop Premium Gear"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2505&auto=format&fit=crop",
            title: "Match Ready Balls",
            description: "Kookaburra, SG, and Dukes balls for every format.",
            cta: "View Balls"
        },
        {
            id: 3,
            image: "https://plus.unsplash.com/premium_photo-1678835848523-281b37dd1515?q=80&w=2670&auto=format&fit=crop",
            title: "Team Jerseys",
            description: "Customizable kits for your entire squad.",
            cta: "Customize Now"
        }
    ];

    const categories = [
        { name: 'Bats', image: 'https://images.unsplash.com/photo-1593341646261-0b5c171cc430?q=80&w=2670&auto=format&fit=crop', path: '/shop/products?category=bats', count: '120+ Items' },
        { name: 'Balls', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2505&auto=format&fit=crop', path: '/shop/products?category=balls', count: '45+ Variants' },
        { name: 'Shoes', image: 'https://images.unsplash.com/photo-1556906781-9a412961d28c?q=80&w=2576&auto=format&fit=crop', path: '/shop/products?category=shoes', count: 'Top Brands' },
        { name: 'Jerseys', image: 'https://plus.unsplash.com/premium_photo-1678835848523-281b37dd1515?q=80&w=2670&auto=format&fit=crop', path: '/shop/products?category=jerseys', count: 'Custom Kits' },
        { name: 'Equipment', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2667&auto=format&fit=crop', path: '/shop/products?category=equipment', count: 'Full Kits' },
    ];

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
                <Carousel
                    plugins={[plugin.current]}
                    className="w-full h-full"
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                    opts={{ loop: true }}
                >
                    <CarouselContent className="h-full ml-0">
                        {heroSlides.map((slide) => (
                            <CarouselItem key={slide.id} className="relative w-full h-full p-0">
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="w-full h-full object-cover animate-scale-in"
                                />
                                <div className="absolute inset-0 z-20 flex flex-col justify-center px-4 md:px-20 container mx-auto">
                                    <div className="max-w-3xl space-y-6 animate-fade-in-up">
                                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-tight drop-shadow-xl">
                                            {slide.title}
                                        </h1>
                                        <p className="text-xl md:text-3xl text-gray-200 font-light max-w-2xl drop-shadow-md leading-relaxed">
                                            {slide.description}
                                        </p>
                                        <div className="pt-8">
                                            <Button
                                                size="lg"
                                                className="bg-white text-black hover:bg-primary hover:text-white border-2 border-white font-bold text-lg px-10 py-7 rounded-full transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                                onClick={() => navigate('/shop/products')}
                                            >
                                                {slide.cta} <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce hidden md:block">
                    <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center p-2">
                        <div className="w-1 h-3 bg-white/80 rounded-full" />
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-24">
                {/* Trust Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    {[
                        { icon: ShieldCheck, title: "Authentic Gear", desc: "100% genuine products directly from manufacturers." },
                        { icon: TrendingUp, title: "Best Prices", desc: "Competitive pricing with regular discounts and offers." },
                        { icon: Star, title: "Expert Reviews", desc: "Rated by professional players and coaches." }
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="group flex flex-col items-center text-center p-10 bg-card rounded-[2rem] shadow-sm border border-border/40 hover:shadow-elevated transition-all duration-500 hover:-translate-y-2"
                        >
                            <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-500 group-hover:bg-primary/10">
                                <item.icon className="h-10 w-10" />
                            </div>
                            <h3 className="font-bold text-2xl mb-3 tracking-tight">{item.title}</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="flex items-end justify-between mb-12">
                    <div>
                        <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Collections</span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Shop by Category</h2>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/shop/products')} className="hidden md:flex group rounded-full px-6 border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary">
                        View All Categories <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((category, index) => (
                        <div
                            key={category.name}
                            className={`group cursor-pointer overflow-hidden relative h-96 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 ${index === 0 ? 'md:col-span-2' : ''}`}
                            onClick={() => navigate(category.path)}
                        >
                            <div className="absolute inset-0 bg-gray-200 animate-pulse" /> {/* Placeholder */}
                            <img
                                src={category.image}
                                alt={category.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                            <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end h-full">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <span className="inline-block px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full mb-3 shadow-lg">
                                        {category.count}
                                    </span>
                                    <h3 className="text-4xl font-bold text-white mb-2 tracking-tight">{category.name}</h3>
                                    <div className="flex items-center text-white/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                        <span>Explore Collection</span>
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <Button variant="outline" onClick={() => navigate('/shop/products')} className="w-full rounded-full py-6">
                        View All Categories
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
