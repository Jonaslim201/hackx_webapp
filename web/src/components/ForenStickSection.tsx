import { Cpu, Zap, Battery, Wifi, HardDrive, Gauge } from 'lucide-react';
import { ForenStick3D } from './ForenStick3D';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export function ForenStickSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const techComponents = [
    {
      icon: Cpu,
      name: 'Raspberry Pi 4',
      description: 'Quad-core ARM processor with 4GB RAM for real-time data processing',
      specs: '1.5GHz CPU • 4GB RAM',
      color: 'from-red-400 to-pink-600',
    },
    {
      icon: Gauge,
      name: 'LiDAR Sensor',
      description: 'High-precision 360° laser ranging sensor with 12m range',
      specs: '12m Range • 5Hz Scan',
      color: 'from-cyan-400 to-blue-600',
    },
    {
      icon: Battery,
      name: 'Power System',
      description: 'Rechargeable 10,000mAh battery for 8+ hours of continuous scanning',
      specs: '10,000mAh • 8hr Runtime',
      color: 'from-green-400 to-emerald-600',
    },
    {
      icon: HardDrive,
      name: 'Storage Module',
      description: '128GB solid-state storage for local data capture and backup',
      specs: '128GB SSD • USB-C',
      color: 'from-purple-400 to-indigo-600',
    },
    {
      icon: Wifi,
      name: 'Connectivity',
      description: 'Dual-band WiFi and Bluetooth for wireless data transfer',
      specs: 'WiFi 5 • Bluetooth 5.0',
      color: 'from-orange-400 to-amber-600',
    },
    {
      icon: Zap,
      name: 'Processing Unit',
      description: 'Custom SLAM algorithm for real-time mapping and localization',
      specs: 'Real-time SLAM • Edge AI',
      color: 'from-yellow-400 to-orange-600',
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-[#0a0b1a] via-[#1a1352] to-[#0a0b1a] relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-purple-600/10 to-cyan-600/10 rounded-full blur-3xl"
          animate={{
            scale: isInView ? [1, 1.2, 1] : 1,
            opacity: isInView ? [0.3, 0.5, 0.3] : 0.3
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm mb-6"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm text-purple-400">The Hardware</span>
          </motion.div>
          
          <motion.h2 
            className="text-4xl sm:text-5xl lg:text-6xl text-white mb-6"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Meet the
            <span className="block mt-2 bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
              Foren-Stick
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            A portable, all-in-one evidence mapping device that combines cutting-edge LiDAR technology with powerful edge computing. Designed for crime scene investigators who demand precision, portability, and reliability in the field.
          </motion.p>
        </motion.div>

        {/* Product Showcase */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {/* 3D Product Model */}
          <motion.div 
            className="relative"
            variants={fadeInUp}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative rounded-2xl overflow-visible border border-white/20 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm p-8">
              <ForenStick3D />
            </div>
            
            {/* Gradient glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-3xl blur-2xl -z-10"></div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            variants={staggerContainer}
          >
            <div className="space-y-6">
              <motion.div 
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="text-2xl text-white mb-3">Portable & Powerful</h3>
                <p className="text-gray-300 leading-relaxed">
                  The Foren-Stick is a compact, handheld device weighing less than 2 lbs, making it easy to carry and deploy at any crime scene. Despite its small size, it packs the processing power of a full workstation.
                </p>
              </motion.div>

              <motion.div 
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h3 className="text-2xl text-white mb-3">Field-Ready Design</h3>
                <p className="text-gray-300 leading-relaxed">
                  Built for real-world conditions with IP65 water and dust resistance. Ruggedized casing protects sensitive components while maintaining optimal thermal performance during extended scanning sessions.
                </p>
              </motion.div>

              <motion.div 
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h3 className="text-2xl text-white mb-3">Instant Deployment</h3>
                <p className="text-gray-300 leading-relaxed">
                  One-button operation starts scanning immediately. No complex setup or calibration required. The device automatically handles initialization, spatial mapping, and data collection.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Technology Breakdown */}
        <div className="mb-12">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <h3 className="text-3xl sm:text-4xl text-white mb-4">
              Technology Breakdown
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Six integrated components working in harmony to deliver professional-grade crime scene documentation
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {techComponents.map((component, index) => {
              const Icon = component.icon;
              return (
                <motion.div
                  key={index}
                  className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:border-white/20 hover:-translate-y-1"
                  variants={fadeInUp}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  {/* Gradient effect on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${component.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}></div>
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${component.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="text-white" size={28} />
                    </div>
                    
                    {/* Content */}
                    <h4 className="text-xl text-white mb-2">{component.name}</h4>
                    <p className="text-gray-400 text-sm mb-3 leading-relaxed">{component.description}</p>
                    
                    {/* Specs Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                      <span className="text-xs text-gray-300">{component.specs}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Specifications Table */}
        <motion.div 
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <h3 className="text-2xl text-white mb-6">Technical Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <motion.div 
                className="flex justify-between items-center pb-3 border-b border-white/10"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: 1.6 }}
              >
                <span className="text-gray-400">Dimensions</span>
                <span className="text-white">180mm × 80mm × 45mm</span>
              </motion.div>
              <motion.div 
                className="flex justify-between items-center pb-3 border-b border-white/10"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: 1.7 }}
              >
                <span className="text-gray-400">Weight</span>
                <span className="text-white">850g (1.87 lbs)</span>
              </motion.div>
              <motion.div 
                className="flex justify-between items-center pb-3 border-b border-white/10"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: 1.8 }}
              >
                <span className="text-gray-400">Scanning Range</span>
                <span className="text-white">0.15m - 12m</span>
              </motion.div>
              <motion.div 
                className="flex justify-between items-center pb-3 border-b border-white/10"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: 1.9 }}
              >
                <span className="text-gray-400">Accuracy</span>
                <span className="text-white">±5mm at 5m</span>
              </motion.div>
            </div>
            <div className="space-y-4">
              <motion.div 
                className="flex justify-between items-center pb-3 border-b border-white/10"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: 2.0 }}
              >
                <span className="text-gray-400">Operating Temp</span>
                <span className="text-white">-10°C to 50°C</span>
              </motion.div>
              <motion.div 
                className="flex justify-between items-center pb-3 border-b border-white/10"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: 2.1 }}
              >
                <span className="text-gray-400">Protection Rating</span>
                <span className="text-white">IP65 (Dust/Water)</span>
              </motion.div>
              <motion.div 
                className="flex justify-between items-center pb-3 border-b border-white/10"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: 2.2 }}
              >
                <span className="text-gray-400">Battery Life</span>
                <span className="text-white">8+ hours continuous</span>
              </motion.div>
              <motion.div 
                className="flex justify-between items-center pb-3 border-b border-white/10"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: 2.3 }}
              >
                <span className="text-gray-400">Charge Time</span>
                <span className="text-white">2 hours (USB-C PD)</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}