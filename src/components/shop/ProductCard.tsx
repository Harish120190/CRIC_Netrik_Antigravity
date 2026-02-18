import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Eye, Heart } from "lucide-react";
import { Product } from "@/contexts/ShopContext";
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/shop/product/${product.id}`);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        // For quick add, we don't select size, so it might fail if size is required? 
        // Ideally quick add should open a modal if size is required.
        // For now, let's just add it and let context handle it (it will add without size).
        onAddToCart(product);
    };

    return (
        <div
            className="group relative bg-card rounded-[1.5rem] border border-border/40 overflow-hidden hover:shadow-elevated transition-all duration-500 cursor-pointer flex flex-col h-full hover:-translate-y-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCardClick}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50/50 p-4">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute top-3 left-3 flex gap-2 z-10">
                    <Badge className="bg-primary/90 backdrop-blur-sm text-white border-0 hover:bg-primary text-[10px] uppercase font-bold tracking-wider py-1 px-2.5 rounded-full shadow-sm">New</Badge>
                    {Math.random() > 0.7 && <Badge variant="destructive" className="text-[10px] font-bold py-1 px-2.5 rounded-full shadow-sm">-20%</Badge>}
                </div>

                {/* Quick Actions Overlay (Simplified) */}
                <div className={`absolute bottom-4 right-4 flex flex-col gap-2 transition-all duration-300 transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <Button
                        size="icon"
                        className="rounded-full shadow-lg h-10 w-10 bg-white text-black hover:bg-primary hover:text-white border border-gray-100 transition-colors"
                        onClick={handleAddToCart}
                        title="Add to Cart"
                    >
                        <ShoppingCart className="h-4 w-4" />
                    </Button>
                </div>

                <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-3 right-3 rounded-full h-8 w-8 bg-white/50 backdrop-blur-sm border border-transparent hover:border-gray-200 hover:bg-white text-gray-500 hover:text-red-500 transition-all"
                    onClick={(e) => { e.stopPropagation(); }}
                >
                    <Heart className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div className="mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">{product.category}</span>
                </div>

                <h3 className="font-bold text-foreground text-lg leading-tight line-clamp-2 mb-3 group-hover:text-primary transition-colors duration-300">{product.name}</h3>

                <div className="mt-auto flex items-end justify-between border-t border-border/40 pt-4">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-primary">₹{product.price.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground line-through font-medium">₹{Math.round(product.price * 1.2).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center text-yellow-500 gap-1 bg-yellow-50 px-2 py-1 rounded-md">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs font-bold text-yellow-700">{product.rating}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
