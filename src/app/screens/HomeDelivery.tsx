import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Phone,
  CreditCard,
  Loader2,
  CheckCircle,
  Package,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface CartItem {
  id: string;
  name: string;
  farm: string;
  price: number;
  quantity: number;
  image: string;
  inStock: boolean;
}

export default function HomeDelivery() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"products" | "cart" | "checkout" | "success">(
    "products"
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderId, setOrderId] = useState("");

  // Mock products data
  const products = [
    {
      id: "1",
      name: "Organic Tomatoes",
      farm: "Green Valley Farm",
      price: 40,
      image:
        "https://images.unsplash.com/photo-1767978529638-ff1faefa00c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwdG9tYXRvZXMlMjBoYXJ2ZXN0fGVufDF8fHx8MTc3MjI5OTUzOXww&ixlib=rb-4.1.0&q=80&w=1080",
      inStock: true,
      unit: "kg",
    },
    {
      id: "2",
      name: "Fresh Milk",
      farm: "Sunrise Dairy",
      price: 60,
      image:
        "https://images.unsplash.com/photo-1719532520242-a809140b313d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMG1pbGslMjBkYWlyeSUyMGZhcm18ZW58MXx8fHwxNzcyMzM5NjMzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      inStock: true,
      unit: "L",
    },
    {
      id: "3",
      name: "Organic Eggs",
      farm: "Sunrise Dairy",
      price: 80,
      image:
        "https://images.unsplash.com/photo-1669669420238-7a4be2e3eac6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwZWdncyUyMGNoaWNrZW58ZW58MXx8fHwxNzcyMzM5NjMzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      inStock: true,
      unit: "dozen",
    },
    {
      id: "4",
      name: "Basmati Rice",
      farm: "Golden Fields",
      price: 120,
      image:
        "https://images.unsplash.com/photo-1651981350249-6173caeeb660?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwcGFkZHklMjBmaWVsZCUyMGZhcm1pbmd8ZW58MXx8fHwxNzcyMzM5NjMzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      inStock: false,
      unit: "kg",
    },
  ];

  const availableProducts = products.filter((p) => p.inStock);

  const addToCart = (product: typeof products[0]) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          id: product.id,
          name: product.name,
          farm: product.farm,
          price: product.price,
          quantity: 1,
          image: product.image,
          inStock: product.inStock,
        },
      ]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(
      cartItems
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = () => {
    if (!address || !phone || !paymentMethod) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newOrderId = "AGRI" + Math.floor(100000 + Math.random() * 900000);
      setOrderId(newOrderId);
      setIsLoading(false);
      setStep("success");
      setCartItems([]);
    }, 2000);
  };

  const isCheckoutValid = address && phone && paymentMethod;

  // Success Screen
  if (step === "success") {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-green-600 mb-6">
            Your order has been confirmed and will be delivered soon
          </p>
          <div className="bg-green-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-green-700 mb-2">Order ID</p>
            <p className="text-2xl font-bold text-green-800">{orderId}</p>
          </div>
          <Button
            onClick={() => navigate("/home")}
            className="w-full bg-green-600 hover:bg-green-700 rounded-xl py-6"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Checkout Screen
  if (step === "checkout") {
    return (
      <div className="min-h-screen bg-green-50 pb-20">
        <div className="bg-green-600 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-md">
          <button onClick={() => setStep("cart")} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Checkout</h1>
        </div>

        <div className="px-6 py-6 max-w-2xl mx-auto space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
            <h3 className="font-semibold text-green-800 mb-4">
              Delivery Details
            </h3>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-green-800">
                Delivery Address *
              </Label>
              <div className="relative">
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full address"
                  className="rounded-xl border-green-200 pr-10"
                />
                <MapPin className="w-5 h-5 text-green-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-green-800">
                Phone Number *
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="rounded-xl border-green-200 pr-10"
                />
                <Phone className="w-5 h-5 text-green-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
            <h3 className="font-semibold text-green-800 mb-4">
              Payment Method
            </h3>
            <div className="space-y-3">
              {["Cash on Delivery", "UPI Payment", "Card Payment"].map(
                (method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === method
                        ? "border-green-600 bg-green-50"
                        : "border-green-200 hover:border-green-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      <span className="text-green-800">{method}</span>
                    </div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="font-semibold text-green-800 mb-4">
              Order Summary
            </h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-green-700">Subtotal:</span>
                <span className="text-green-800">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Delivery Fee:</span>
                <span className="text-green-800">₹30</span>
              </div>
              <div className="border-t border-green-100 pt-2 flex justify-between font-semibold">
                <span className="text-green-800">Total:</span>
                <span className="text-green-800">₹{totalAmount + 30}</span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={!isCheckoutValid || isLoading}
              className="w-full py-6 bg-green-600 hover:bg-green-700 rounded-xl disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Placing Order...
                </span>
              ) : (
                `Place Order - ₹${totalAmount + 30}`
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Cart Screen
  if (step === "cart") {
    return (
      <div className="min-h-screen bg-green-50 pb-20">
        <div className="bg-green-600 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-md">
          <button onClick={() => setStep("products")} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Your Cart</h1>
          <Badge className="ml-auto bg-white text-green-600">
            {cartItems.length}
          </Badge>
        </div>

        <div className="px-6 py-6 max-w-2xl mx-auto">
          {cartItems.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Your Cart is Empty
              </h3>
              <p className="text-green-600 mb-4">
                Add products to your cart to continue
              </p>
              <Button
                onClick={() => setStep("products")}
                className="bg-green-600 hover:bg-green-700 rounded-xl"
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-md p-4"
                  >
                    <div className="flex gap-3 mb-3">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-800">
                          {item.name}
                        </h3>
                        <p className="text-sm text-green-600">{item.farm}</p>
                        <p className="text-lg font-semibold text-green-700 mt-1">
                          ₹{item.price} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 h-fit bg-red-100 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-2 bg-green-100 rounded-lg hover:bg-green-200"
                        >
                          <Minus className="w-4 h-4 text-green-600" />
                        </button>
                        <span className="w-12 text-center font-semibold text-green-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-2 bg-green-100 rounded-lg hover:bg-green-200"
                        >
                          <Plus className="w-4 h-4 text-green-600" />
                        </button>
                      </div>
                      <p className="font-semibold text-green-800">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-green-800 font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-green-800">
                    ₹{totalAmount}
                  </span>
                </div>
                <Button
                  onClick={() => setStep("checkout")}
                  className="w-full py-6 bg-green-600 hover:bg-green-700 rounded-xl"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Products Screen (Default)
  return (
    <div className="min-h-screen bg-green-50 pb-20">
      <div className="bg-green-600 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold">Home Delivery</h1>
        <button
          onClick={() => setStep("cart")}
          className="ml-auto relative p-2 bg-white/20 rounded-full"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </button>
      </div>

      <div className="px-6 py-6 max-w-2xl mx-auto">
        <p className="text-green-700 mb-4">
          Fresh products with home delivery available
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-2xl shadow-md overflow-hidden ${
                !product.inStock ? "opacity-60" : ""
              }`}
            >
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-green-800 mb-1">
                  {product.name}
                </h3>
                <p className="text-xs text-green-600 mb-2">{product.farm}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold text-green-700">
                    ₹{product.price}/{product.unit}
                  </span>
                  {!product.inStock && (
                    <Badge className="bg-red-100 text-red-700 text-xs">
                      Out of Stock
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={() => addToCart(product)}
                  disabled={!product.inStock}
                  className="w-full bg-green-600 hover:bg-green-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  size="sm"
                >
                  {product.inStock ? (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
                      Add to Cart
                    </>
                  ) : (
                    "Out of Stock"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
