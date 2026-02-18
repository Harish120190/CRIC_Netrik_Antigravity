import React from 'react';
import { useShop } from '../../contexts/ShopContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ShieldCheck } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useShop();
    const navigate = useNavigate();



    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
                <div className="bg-card rounded-3xl p-12 border border-border/50 shadow-sm">
                    <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <ShoppingBag className="h-10 w-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
                    <p className="text-muted-foreground mb-8 text-lg">Looks like you haven't added any premium gear to your cart yet.</p>
                    <Button size="lg" onClick={() => navigate('/shop/products')} className="px-8 rounded-full">
                        Start Shopping
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Breadcrumb className="mb-8">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Cart</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight">Shopping Cart ({cart.reduce((cnt, item) => cnt + item.quantity, 0)} Items)</h1>
                <Button variant="ghost" className="text-muted-foreground" onClick={clearCart}>
                    Clear Cart
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => (
                        <div key={item.id} className="bg-card rounded-xl border border-border/50 p-4 flex gap-4 transition-all hover:shadow-md">
                            <div className="h-28 w-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-border">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover mix-blend-multiply"
                                />
                            </div>

                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold line-clamp-2 pr-4">{item.name}</h3>
                                        <span className="font-bold text-lg text-primary">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {item.category}
                                        {item.selectedSize && <span className="ml-1">• Size: {item.selectedSize}</span>}
                                        <span className="mx-1">•</span>
                                        ₹{item.price.toLocaleString('en-IN')} each
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border rounded-lg overflow-hidden bg-background">
                                            <button
                                                className="px-3 py-1 hover:bg-muted transition-colors disabled:opacity-50"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-8 text-center font-medium text-sm border-x py-1">{item.quantity}</span>
                                            <button
                                                className="px-3 py-1 hover:bg-muted transition-colors"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                                        onClick={() => removeFromCart(item.id, item.selectedSize)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span className="text-foreground font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Tax (18%)</span>
                                <span className="text-foreground font-medium">₹{(cartTotal * 0.18).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="h-px bg-border my-4" />
                            <div className="flex justify-between font-bold text-xl">
                                <span>Total</span>
                                <span>₹{(cartTotal * 1.18).toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <Button size="lg" className="w-full mb-4 text-lg h-12 rounded-xl" onClick={() => navigate('/shop/checkout')}>
                            Proceed to Checkout
                        </Button>
                        <Button variant="outline" className="w-full rounded-xl" onClick={() => navigate('/shop/products')}>
                            Continue Shopping
                        </Button>

                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <ShieldCheck className="h-4 w-4" /> Secure Checkout
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
