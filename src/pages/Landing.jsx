import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import QRScanner from "../components/QRScanner";
import {
  Users,
  Truck,
  Store,
  QrCode,
  Smartphone,
  X,
  ArrowRight,
  Eye,
  Camera,
  FolderOpen,
  Shield,
  Leaf,
  Zap,
  Sparkles,
  CheckCircle,
  Star,
  Globe,
  Target,
  BarChart3,
  Clock,
  MapPin,
} from "lucide-react";

// QR Scanner imported from shared component — no duplicate code

// Enhanced StyledUserTypeCard with better animations and design
// In your Landing.jsx - Find the StyledUserTypeCard component and update it:

const StyledUserTypeCard = ({
  Icon,
  title,
  description,
  link,
  color,
  role,
  features,
}) => {
  const navigate = useNavigate();

  const colorConfig = {
    emerald: {
      bg: "from-emerald-50 to-green-50",
      border: "border-emerald-200",
      hover: "hover:border-emerald-400",
      iconBg: "bg-gradient-to-br from-emerald-100 to-green-100",
      iconColor: "text-emerald-600",
      accent: "text-emerald-600",
      button: "text-emerald-700 hover:text-emerald-800",
    },
    blue: {
      bg: "from-blue-50 to-cyan-50",
      border: "border-blue-200",
      hover: "hover:border-blue-400",
      iconBg: "bg-gradient-to-br from-blue-100 to-cyan-100",
      iconColor: "text-blue-600",
      accent: "text-blue-600",
      button: "text-blue-700 hover:text-blue-800",
    },
    purple: {
      bg: "from-purple-50 to-violet-50",
      border: "border-purple-200",
      hover: "hover:border-purple-400",
      iconBg: "bg-gradient-to-br from-purple-100 to-violet-100",
      iconColor: "text-purple-600",
      accent: "text-purple-600",
      button: "text-purple-700 hover:text-purple-800",
    },
  }[color];

  const handleCardClick = () => {
    localStorage.setItem("selectedRole", role);
    navigate("/login");
  };

  return (
    <motion.div
      whileHover={{
        y: -12,
        scale: 1.02,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-8 rounded-3xl border-2 ${colorConfig.border} ${colorConfig.hover} bg-gradient-to-br ${colorConfig.bg} transition-all duration-500 shadow-xl hover:shadow-2xl backdrop-blur-sm overflow-hidden group cursor-pointer`}
      onClick={handleCardClick} // Changed to handleCardClick
    >
      {/* Animated background elements */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          color === "emerald"
            ? "from-emerald-500/5"
            : color === "blue"
            ? "from-blue-500/5"
            : "from-purple-500/5"
        } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <div className="relative z-10">
        <div
          className={`w-20 h-20 ${colorConfig.iconBg} rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}
        >
          <Icon
            className={`w-10 h-10 ${colorConfig.iconColor}`}
            strokeWidth={1.5}
          />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          {title}
        </h3>
        <p className="text-gray-600 mb-6 text-center leading-relaxed">
          {description}
        </p>

        {/* Features list */}
        <div className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center text-sm text-gray-500"
            >
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              {feature}
            </motion.div>
          ))}
        </div>

        <motion.div
          whileHover={{ x: 5 }}
          className={`flex items-center justify-center font-semibold transition duration-300 group ${colorConfig.button} space-x-2`}
        >
          <span>Login as {role}</span>{" "}
          {/* Changed text from "Join as" to "Login as" */}
          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// New Component: FeatureCard for the how-it-works section
const FeatureCard = ({
  step,
  title,
  description,
  icon: Icon,
  color,
  delay,
}) => {
  const colorStyles = {
    emerald: "from-emerald-400 to-green-500",
    blue: "from-blue-400 to-cyan-500",
    purple: "from-purple-400 to-violet-500",
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="relative group"
    >
      <div className="relative p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl shadow-black/5 hover:shadow-3xl transition-all duration-500">
        {/* Gradient border effect */}
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${colorStyles} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />

        {/* Step indicator */}
        <div
          className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r ${colorStyles} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}
        >
          {step}
        </div>

        {/* Icon */}
        <div
          className={`w-16 h-16 bg-gradient-to-r ${colorStyles} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}
        >
          <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>

        {/* Animated underline */}
        <div
          className={`w-0 group-hover:w-16 h-1 bg-gradient-to-r ${colorStyles} rounded-full mt-4 transition-all duration-500`}
        />
      </div>
    </motion.div>
  );
};

// New Component: Stats counter
const StatCard = ({ number, label, icon: Icon, color }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepValue = number / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setCount(Math.min(Math.floor(stepValue * currentStep), number));

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [number]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center p-6"
    >
      <div
        className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-2">
        {count.toLocaleString()}+
      </div>
      <div className="text-gray-600 font-medium">{label}</div>
    </motion.div>
  );
};

export default function Landing() {
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const { user } = useAuth();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleScan = (batchOrText) => {
    setShowScanner(false);
    // Extract batch number from any format and navigate to track page
    let batch = batchOrText.trim();
    try {
      const parsed = JSON.parse(batch);
      batch = parsed.batch || parsed.batchNumber || parsed.id || batch;
    } catch {
      const urlMatch = batch.match(/\/track\/([A-Z0-9-]+)/i);
      if (urlMatch) batch = urlMatch[1];
    }
    navigate(`/track/${batch}`);
  };

  const handleScannerClose = () => {
    setShowScanner(false);
  };

  // Enhanced data arrays
  const userTypes = [
    {
      Icon: Users,
      title: "For Farmers",
      description:
        "Digitize your harvest, generate tamper-proof QR codes, and prove the organic journey from the very first seed.",
      link: "/signup?role=farmer",
      color: "emerald",
      role: "Farmer",
      features: [
        "QR Code Generation",
        "Crop Tracking",
        "Organic Certification",
        "Supply Chain Visibility",
      ],
    },
    {
      Icon: Truck,
      title: "For Logistics",
      description:
        "Efficiently track and update product locations in real-time. Ensure cold-chain integrity and accountability during transport.",
      link: "/signup?role=logistics",
      color: "blue",
      role: "Logistics",
      features: [
        "Real-time Tracking",
        "Temperature Monitoring",
        "Route Optimization",
        "Delivery Verification",
      ],
    },
    {
      Icon: Store,
      title: "For Retailers",
      description:
        "Verify authenticity instantly, reduce spoilage, and provide customers with the full product story to build unparalleled trust.",
      link: "/signup?role=retailer",
      color: "purple",
      role: "Retailer",
      features: [
        "Authenticity Verification",
        "Inventory Management",
        "Customer Insights",
        "Brand Trust Building",
      ],
    },
  ];

  const features = [
    {
      step: 1,
      title: "Scan QR Code",
      description:
        "Use your phone camera or upload an image to scan any product QR code on packaging.",
      icon: QrCode,
      color: "emerald",
      delay: 0.1,
    },
    {
      step: 2,
      title: "See Journey",
      description:
        "View the complete, tamper-proof farm-to-table story instantly on the blockchain ledger.",
      icon: MapPin,
      color: "blue",
      delay: 0.2,
    },
    {
      step: 3,
      title: "Build Trust",
      description:
        "Verify organic certifications, origin details, and product authenticity with unchangeable data.",
      icon: Shield,
      color: "purple",
      delay: 0.3,
    },
  ];

  const stats = [
    {
      number: 50,
      label: "Verified Farms",
      icon: Leaf,
      color: "bg-emerald-500",
    },
    {
      number: 100,
      label: "Products Tracked",
      icon: BarChart3,
      color: "bg-blue-500",
    },
    {
      number: 25,
      label: "Partner Stores",
      icon: Store,
      color: "bg-purple-500",
    },
    {
      number: 1000,
      label: "Happy Customers",
      icon: Star,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-cyan-50/30 font-inter overflow-hidden">
      {/* Enhanced global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        body { 
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 50%, #faf5ff 100%);
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Enhanced Navigation */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
        className="fixed top-0 w-full z-50 glass-effect shadow-lg shadow-black/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <QrCode className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <Sparkles
                  className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400"
                  fill="currentColor"
                />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                OrganicTrace
              </span>
            </motion.div>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-2 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowScanner(true)}
                className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 font-medium py-2 px-4 rounded-xl transition duration-200 glass-effect hover:shadow-md"
              >
                <Smartphone className="w-5 h-5" />
                <span className="hidden sm:inline">Scan QR</span>
              </motion.button>

              <Link
                to="/login"
                className="text-gray-700 hover:text-emerald-600 font-medium py-2 px-4 rounded-xl transition duration-200 hidden sm:block hover:bg-white/50"
              >
                Login
              </Link>

              <motion.div
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-green-600 transition duration-300 shadow-lg shadow-emerald-500/25 flex items-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Get Started</span>
                </Link>
              </motion.div>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Enhanced Hero Section */}
      <div className="relative pt-32 pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200 shadow-lg mb-8"
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">
              Trusted by 1000+ Customers Worldwide
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-6 leading-tight"
          >
            From Farm to Table,
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-400 animate-gradient-x">
              Instantly Transparent.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Scan any product QR code to see its complete,{" "}
            <span className="font-semibold text-emerald-600">
              verified journey
            </span>{" "}
            from the soil to your table. Empowering trust with every tap through
            blockchain technology.
          </motion.p>

          {/* Enhanced CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.button
              onClick={() => setShowScanner(true)}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              className="group relative bg-white border-2 border-emerald-500 text-emerald-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-500/20 hover:shadow-3xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <div className="flex items-center space-x-3 relative z-10">
                <QrCode className="w-6 h-6" />
                <span>Scan Product QR Code</span>
              </div>
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse" />
              <Link
                to="/signup"
                className="relative bg-gradient-to-r from-emerald-500 to-green-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-500/30 hover:shadow-3xl transition duration-300 flex items-center space-x-3"
              >
                <span>Join as Business</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Enhanced User Types Section */}
      <div className="relative py-28 bg-gradient-to-b from-white/50 to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              Connecting Every Step of the{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-500">
                Supply Chain
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of businesses already transforming their supply
              chain with transparent, blockchain-verified tracking.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.2 } },
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {userTypes.map((userType, index) => (
              <StyledUserTypeCard key={index} {...userType} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Enhanced How It Works Section */}
      <div className="relative py-28 bg-gradient-to-br from-emerald-50/50 via-blue-50/30 to-purple-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              How OrganicTrace{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-500">
                Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to complete supply chain transparency and build
              unbreakable consumer trust.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center space-x-3 mb-6"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <QrCode className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black">OrganicTrace</span>
          </motion.div>

          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Revolutionizing supply chain transparency with blockchain
            technology. From farm to table, we're building a more trustworthy
            world.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <Link
              to="/track"
              className="text-gray-400 hover:text-emerald-400 transition duration-300 hover:underline"
            >
              Track Product
            </Link>
            <Link
              to="/login"
              className="text-gray-400 hover:text-emerald-400 transition duration-300 hover:underline"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-gray-400 hover:text-emerald-400 transition duration-300 hover:underline"
            >
              Sign Up
            </Link>
          </div>

          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} OrganicTrace. All rights reserved.
          </p>
        </div>

        {/* Footer background elements */}
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </footer>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <QRScanner onScan={handleScan} onClose={handleScannerClose} />
        )}
      </AnimatePresence>
    </div>
  );
}
