import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop, Product } from '../../contexts/ShopContext';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Truck, ShieldCheck, RefreshCw, Heart, Share2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ProductCard from '../../components/shop/ProductCard';

// Mock Data (In a real app, this would be fetched from an API)
const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'MRF Genius Grand Edition Cricket Bat',
        description: 'Grade 1 English Willow, used by Virat Kohli. Massive edges and sweet spot. Handcrafted from selected Grade A English Willow. Designed for power hitters with a mid-to-low sweet spot for extended power play. Comes with a premium padded bat cover.',
        price: 45000,
        category: 'bats',
        image: 'https://images.unsplash.com/photo-1593341646261-0b5c171cc430?q=80&w=2670&auto=format&fit=crop',
        rating: 4.8,
        sizes: ['Harrow', 'SH', 'LH'],
    },
    {
        id: '2',
        name: 'Kookaburra Pace Cricket Ball (Red)',
        description: 'Official ball for Test cricket. High-quality alum tanned leather.',
        price: 3500,
        category: 'balls',
        image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2505&auto=format&fit=crop',
        rating: 4.9,
    },
    {
        id: '3',
        name: 'Asics Gel-Peake 2 Cricket Shoes',
        description: 'Designed for hard wicket cricket. GEL technology cushioning.',
        price: 6500,
        category: 'shoes',
        image: 'https://images.unsplash.com/photo-1556906781-9a412961d28c?q=80&w=2576&auto=format&fit=crop',
        rating: 4.5,
        sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
    },
    {
        id: '4',
        name: 'Team India ODI Jersey 2024',
        description: 'Official Adidas Team India jersey. Breathable fabric.',
        price: 4999,
        category: 'jerseys',
        image: 'https://plus.unsplash.com/premium_photo-1678835848523-281b37dd1515?q=80&w=2670&auto=format&fit=crop',
        rating: 4.7,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
        id: '5',
        name: 'DSC Intense Speed Cricket Kit Bag',
        description: 'Spacious kit bag with wheels. Separate compartment for shoes.',
        price: 3200,
        category: 'equipment',
        image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2667&auto=format&fit=crop',
        rating: 4.3,
    },
    {
        id: '6',
        name: 'SG Players Edition Batting Gloves',
        description: 'Professional grade protection with pittards leather palm.',
        price: 2800,
        category: 'equipment',
        image: 'https://images.unsplash.com/photo-1628109315849-c43917865c36?q=80&w=2670&auto=format&fit=crop',
        rating: 4.6,
        sizes: ['Men', 'Youth', 'Boys'],
    },
];

const ProductDetailsPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useShop();

    const product = MOCK_PRODUCTS.find(p => p.id === productId);

    // Suggested products (filter out current product)
    const relatedProducts = MOCK_PRODUCTS
        .filter(p => p.id !== productId && (p.category === product?.category || Math.random() > 0.5))
        .slice(0, 4);

    const [selectedSize, setSelectedSize] = React.useState<string>("");

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                <Button onClick={() => navigate('/shop/products')}>Back to Shop</Button>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (product.sizes && !selectedSize) {
            // Should ideally show error, but we'll handled it via button state
            return;
        }
        addToCart(product, selectedSize);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/shop/products">Products</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/shop/products?category=${product.category}`} className="capitalize">{product.category}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{product.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                {/* Product Image */}
                <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden bg-gray-100/50 border border-gray-200 aspect-square relative group">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                        />
                        <Button variant="outline" size="icon" className="absolute top-4 right-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Heart className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Product Info */}
                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary" className="text-sm px-3 py-1 capitalize mb-2">{product.category}</Badge>
                            <Button variant="ghost" size="icon" className="text-muted-foreground"><Share2 className="w-5 h-5" /></Button>
                        </div>

                        <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-4">{product.name}</h1>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center text-yellow-500">
                                <Star className="h-5 w-5 fill-current" />
                                <Star className="h-5 w-5 fill-current" />
                                <Star className="h-5 w-5 fill-current" />
                                <Star className="h-5 w-5 fill-current" />
                                <Star className="h-5 w-5 fill-current opacity-50" />
                            </div>
                            <span className="text-sm text-muted-foreground font-medium">{product.rating} (124 reviews)</span>
                        </div>
                    </div>

                    <div className="flex items-baseline gap-4">
                        <span className="text-5xl font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</span>
                        <span className="text-xl text-muted-foreground line-through">₹{(product.price * 1.2).toFixed(0).toLocaleString('en-IN')}</span>
                        <span className="text-green-600 font-bold text-sm bg-green-100 px-2 py-1 rounded">20% OFF</span>
                    </div>

                    <p className="text-muted-foreground text-lg leading-relaxed">
                        {product.description}
                    </p>

                    {/* Size Selector */}
                    {product.sizes && (
                        <div>
                            <h3 className="text-sm font-medium mb-3">Select Size</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map((size) => (
                                    <Button
                                        key={size}
                                        variant={selectedSize === size ? "default" : "outline"}
                                        className={`h-11 min-w-[3rem] ${selectedSize === size ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                        <Button
                            size="lg"
                            className="flex-1 text-lg h-14"
                            onClick={handleAddToCart}
                            disabled={!!product.sizes && !selectedSize}
                        >
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            {product.sizes && !selectedSize ? 'Select Size' : 'Add to Cart'}
                        </Button>
                        <Button size="lg" variant="outline" className="flex-1 text-lg h-14">
                            Buy Now
                        </Button>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-xl border border-border/50">
                            <Truck className="h-6 w-6 text-primary mb-2" />
                            <span className="font-semibold text-sm">Free Delivery</span>
                            <span className="text-xs text-muted-foreground">Orders &gt; ₹999</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-xl border border-border/50">
                            <ShieldCheck className="h-6 w-6 text-primary mb-2" />
                            <span className="font-semibold text-sm">1 Year Warranty</span>
                            <span className="text-xs text-muted-foreground">Brand authorized</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-xl border border-border/50">
                            <RefreshCw className="h-6 w-6 text-primary mb-2" />
                            <span className="font-semibold text-sm">Easy Returns</span>
                            <span className="text-xs text-muted-foreground">7 Days policy</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="description" className="mb-20">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                    <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 text-base">Description</TabsTrigger>
                    <TabsTrigger value="specifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 text-base">Specifications</TabsTrigger>
                    <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 text-base">Reviews (124)</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="pt-8">
                    <div className="prose prose-gray max-w-none">
                        <p className="text-lg text-muted-foreground leading-Relaxed">
                            Experience top-tier performance with this equipment. meticulous attention to detail ensures that every aspect of your game is enhanced.
                            Whether you are a professional player or an enthusiastic amateur, this product delivers reliability and excellence.
                        </p>
                        <div className="my-6 p-6 bg-muted/30 rounded-xl">
                            <h3 className="text-xl font-bold mb-4">Key Benefits</h3>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                <li>Premium quality materials for durability.</li>
                                <li>Ergonomic design for maximum comfort using extended play.</li>
                                <li>Tested by professionals in match conditions.</li>
                                <li>Superior finish and aesthetics.</li>
                            </ul>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="specifications" className="pt-8">
                    <Card>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium">Material</span>
                                        <span className="text-muted-foreground">Premium Grade</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium">Weight</span>
                                        <span className="text-muted-foreground">Lightweight</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium">Origin</span>
                                        <span className="text-muted-foreground">Imported</span>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium">Warranty</span>
                                        <span className="text-muted-foreground">1 Year Manufacturer</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium">In the Box</span>
                                        <span className="text-muted-foreground">1 Unit, Manual</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="reviews" className="pt-8">
                    <div className="text-center py-12 bg-muted/20 rounded-xl">
                        <h3 className="text-xl font-semibold mb-2">Customer Reviews</h3>
                        <div className="flex justify-center items-center gap-2 mb-4">
                            <div className="flex items-center text-yellow-500">
                                <Star className="h-6 w-6 fill-current" />
                                <Star className="h-6 w-6 fill-current" />
                                <Star className="h-6 w-6 fill-current" />
                                <Star className="h-6 w-6 fill-current" />
                                <Star className="h-6 w-6 fill-current opacity-50" />
                            </div>
                            <span className="text-2xl font-bold">4.8</span>
                        </div>
                        <p className="text-muted-foreground">Based on 124 ratings</p>
                        <Button variant="outline" className="mt-6">Write a Review</Button>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Related Products */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.map(product => (
                        <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
