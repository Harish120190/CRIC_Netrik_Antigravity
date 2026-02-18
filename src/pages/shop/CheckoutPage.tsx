import React, { useState } from 'react';
import { useShop, ShippingAddress } from '../../contexts/ShopContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
    CheckCircle2,
    CreditCard,
    Truck,
    ShieldCheck,
    MapPin,
    User,
    Phone,
    ArrowLeft,
    ArrowRight
} from "lucide-react";
import { toast } from 'sonner';

const steps = [
    { id: 1, name: 'Shipping', icon: Truck },
    { id: 2, name: 'Payment', icon: CreditCard },
    { id: 3, name: 'Review', icon: CheckCircle2 },
];

const CheckoutPage = () => {
    const { cart, cartTotal, placeOrder, setShippingAddress, shippingAddress: savedAddress } = useShop();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form State
    const [formData, setFormData] = useState<ShippingAddress>(savedAddress || {
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        phone: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('card');

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Button onClick={() => navigate('/shop/products')}>Continue Shopping</Button>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateShipping = () => {
        if (!formData.fullName || !formData.addressLine1 || !formData.city || !formData.zipCode || !formData.phone) {
            toast.error("Please fill in all required fields");
            return false;
        }
        if (formData.phone.length < 10) {
            toast.error("Please enter a valid phone number");
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (validateShipping()) {
                setShippingAddress(formData);
                setCurrentStep(2);
            }
        } else if (currentStep === 2) {
            setCurrentStep(3);
        }
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        try {
            const orderId = await placeOrder();
            navigate(`/shop/order-success?orderId=${orderId}`);
        } catch (error) {
            toast.error("Failed to place order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Steps Indicator */}
            <div className="flex justify-between items-center mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -z-10" />
                <div className="absolute top-1/2 left-0 h-1 bg-primary -z-10 transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                />

                {steps.map((step) => (
                    <div key={step.id} className="flex flex-col items-center bg-background px-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                            ${currentStep >= step.id
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'bg-muted border-muted-foreground text-muted-foreground'}`
                        }>
                            <step.icon className="h-5 w-5" />
                        </div>
                        <span className={`text-sm font-medium mt-2 ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}>{step.name}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form Area */}
                <div className="lg:col-span-2">
                    {/* Step 1: Shipping */}
                    {currentStep === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Address</CardTitle>
                                <CardDescription>Where should we send your order?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input id="fullName" name="fullName" placeholder="John Doe" className="pl-9" value={formData.fullName} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input id="phone" name="phone" placeholder="+91 98765 43210" className="pl-9" value={formData.phone} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="addressLine1">Address Line 1</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="addressLine1" name="addressLine1" placeholder="Flat No., Building, Street" className="pl-9" value={formData.addressLine1} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                                    <Input id="addressLine2" name="addressLine2" placeholder="Landmark, Area" className="pl-9" value={formData.addressLine2} onChange={handleInputChange} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" name="city" placeholder="Mumbai" value={formData.city} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input id="state" name="state" placeholder="Maharashtra" value={formData.state} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="zipCode">Pincode</Label>
                                        <Input id="zipCode" name="zipCode" placeholder="400001" value={formData.zipCode} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Payment */}
                    {currentStep === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Method</CardTitle>
                                <CardDescription>Select a secure payment method.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup defaultValue="card" className="grid grid-cols-1 gap-4" onValueChange={setPaymentMethod}>
                                    <div>
                                        <RadioGroupItem value="card" id="card" className="peer sr-only" />
                                        <Label
                                            htmlFor="card"
                                            className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                            <div className="flex items-center gap-4">
                                                <CreditCard className="h-6 w-6" />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">Credit/Debit Card</span>
                                                    <span className="text-xs text-muted-foreground">Pay securely with Visa, Mastercard</span>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                                        <Label
                                            htmlFor="upi"
                                            className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                            <div className="flex items-center gap-4">
                                                <CreditCard className="h-6 w-6" />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">UPI</span>
                                                    <span className="text-xs text-muted-foreground">Google Pay, PhonePe, Paytm</span>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                                        <Label
                                            htmlFor="cod"
                                            className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                            <div className="flex items-center gap-4">
                                                <Truck className="h-6 w-6" />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">Cash on Delivery</span>
                                                    <span className="text-xs text-muted-foreground">Pay when your order arrives</span>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Review */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Shipping To</CardTitle>
                                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>Edit</Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm">
                                        <p className="font-semibold text-lg">{formData.fullName}</p>
                                        <p>{formData.addressLine1}</p>
                                        {formData.addressLine2 && <p>{formData.addressLine2}</p>}
                                        <p>{formData.city}, {formData.state} - {formData.zipCode}</p>
                                        <p className="mt-2 text-muted-foreground">Phone: {formData.phone}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Order Items</CardTitle>
                                        <Button variant="ghost" size="sm" onClick={() => navigate('/shop/cart')}>Edit Cart</Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded bg-muted overflow-hidden">
                                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <span className="font-medium text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex justify-between">
                        <Button variant="outline" onClick={() => currentStep === 1 ? navigate('/shop/cart') : setCurrentStep(prev => prev - 1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>

                        {currentStep < 3 ? (
                            <Button onClick={handleNext}>
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button size="lg" onClick={handlePlaceOrder} disabled={isProcessing} className="px-8">
                                {isProcessing ? 'Processing...' : `Pay ₹${(cartTotal * 1.18).toLocaleString('en-IN')}`}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>₹{cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span className="text-green-600">Free</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Tax (18%)</span>
                                <span>₹{(cartTotal * 0.18).toLocaleString()}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>₹{(cartTotal * 1.18).toLocaleString()}</span>
                            </div>

                            <div className="bg-muted/50 p-4 rounded-lg mt-4">
                                <div className="flex items-center gap-2 text-sm font-medium mb-1">
                                    <ShieldCheck className="h-4 w-4 text-green-600" />
                                    Secure Checkout
                                </div>
                                <p className="text-xs text-muted-foreground">Your transaction is secured with SSL encryption.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
