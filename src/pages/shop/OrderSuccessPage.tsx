import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import Confetti from 'react-confetti';

const OrderSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!orderId) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <p>Invalid Order ID</p>
                <Button onClick={() => navigate('/shop/products')}>Back to Shop</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={200} />

            <div className="max-w-md w-full bg-card p-8 rounded-3xl border border-border/50 shadow-xl text-center z-10">
                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>

                <h1 className="text-3xl font-extrabold mb-2 text-foreground">Order Placed!</h1>
                <p className="text-muted-foreground mb-8">Thank you for your purchase. Your order has been securely placed.</p>

                <div className="bg-muted/30 p-4 rounded-xl mb-8">
                    <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                    <p className="text-xl font-mono font-bold tracking-wider select-all">{orderId}</p>
                </div>

                <div className="space-y-3">
                    <Button className="w-full h-12 text-lg rounded-xl" onClick={() => navigate('/shop/products')}>
                        Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => navigate('/profile/orders')}>
                        View My Orders
                    </Button>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    Estimated delivery: 3-5 Business Days
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
