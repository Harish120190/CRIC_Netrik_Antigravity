import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/shop/ProductCard';
import { Product, useShop } from '../../contexts/ShopContext';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Mock Data
const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'MRF Genius Grand Edition Cricket Bat',
        description: 'Grade 1 English Willow, used by Virat Kohli. Massive edges and sweet spot.',
        price: 45000,
        category: 'bats',
        image: 'https://images.unsplash.com/photo-1593341646261-0b5c171cc430?q=80&w=2670&auto=format&fit=crop',
        rating: 4.8,
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
    },
    {
        id: '4',
        name: 'Team India ODI Jersey 2024',
        description: 'Official Adidas Team India jersey. Breathable fabric.',
        price: 4999,
        category: 'jerseys',
        image: 'https://plus.unsplash.com/premium_photo-1678835848523-281b37dd1515?q=80&w=2670&auto=format&fit=crop',
        rating: 4.7,
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
    },
];

const ProductListPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart } = useShop();
    const initialCategory = searchParams.get('category') || 'all';

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [sortBy, setSortBy] = useState('featured');

    const categories = ['all', 'bats', 'balls', 'shoes', 'jerseys', 'equipment'];

    // Filter products
    const filteredProducts = MOCK_PRODUCTS.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        return matchesSearch && matchesCategory && matchesPrice;
    }).sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // featured
    });

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-8">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Products</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col md:flex-row gap-8">

                {/* Filters - Sidebar for Desktop */}
                <div className="hidden md:block w-72 space-y-8 sticky top-24 self-start h-fit">
                    <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                        <h3 className="font-bold mb-4 text-lg">Categories</h3>
                        <div className="space-y-3">
                            {categories.map((cat) => (
                                <div key={cat} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={`cat-${cat}`}
                                        checked={selectedCategory === cat}
                                        onCheckedChange={() => setSelectedCategory(cat)}
                                    />
                                    <Label htmlFor={`cat-${cat}`} className="capitalize cursor-pointer text-sm font-medium">{cat}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                        <h3 className="font-bold mb-4 text-lg">Price Range</h3>
                        <Slider
                            defaultValue={[0, 50000]}
                            max={50000}
                            step={500}
                            value={priceRange}
                            onValueChange={setPriceRange}
                            className="mb-6"
                        />
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="bg-muted px-2 py-1 rounded">₹{priceRange[0]}</span>
                            <span className="text-muted-foreground">-</span>
                            <span className="bg-muted px-2 py-1 rounded">₹{priceRange[1]}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Header & Mobile Filters */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                className="pl-10 h-11 bg-card rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="md:hidden flex-1 h-11 rounded-xl">
                                        <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left">
                                    <SheetHeader>
                                        <SheetTitle>Filters</SheetTitle>
                                    </SheetHeader>
                                    {/* Mobile Filters Content */}
                                    <div className="space-y-8 mt-8">
                                        <div>
                                            <h3 className="font-bold mb-4">Categories</h3>
                                            <div className="space-y-3">
                                                {categories.map((cat) => (
                                                    <div key={cat} className="flex items-center space-x-3">
                                                        <Checkbox
                                                            id={`mobile-cat-${cat}`}
                                                            checked={selectedCategory === cat}
                                                            onCheckedChange={() => setSelectedCategory(cat)}
                                                        />
                                                        <Label htmlFor={`mobile-cat-${cat}`} className="capitalize">{cat}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-bold mb-4">Price Range</h3>
                                            <Slider
                                                defaultValue={[0, 50000]}
                                                max={50000}
                                                step={500}
                                                value={priceRange}
                                                onValueChange={setPriceRange}
                                                className="mb-4"
                                            />
                                            <div className="flex justify-between text-sm">
                                                <span className="bg-muted px-2 py-1 rounded">₹{priceRange[0]}</span>
                                                <span className="bg-muted px-2 py-1 rounded">₹{priceRange[1]}</span>
                                            </div>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl bg-card">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="featured">Featured</SelectItem>
                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                    <SelectItem value="rating">Top Rated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Product Grid */}
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold mb-1">No products found</h3>
                            <p className="text-muted-foreground mb-6">Try adjusting your filters or search query.</p>
                            <Button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('all');
                                    setPriceRange([0, 50000]);
                                }}
                            >
                                Clear all filters
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-sm text-muted-foreground">Showing {filteredProducts.length} results</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={addToCart}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;
