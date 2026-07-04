// src/components/dashboard/LogisticsDashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../config/supabase";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import {
  Truck,
  Package,
  MapPin,
  Clock,
  LogOut,
  RefreshCw,
  Plus,
  Navigation,
  Thermometer,
  Battery,
  AlertTriangle,
  CheckCircle,
  X,
  Search,
  Filter,
  Download,
  Zap,
  ArrowRight,
  ChevronDown,
  QrCode,
  Camera,
  Bell,
  Users,
  Route,
  Target,
  AlertCircle,
} from "lucide-react";

// Floating Background Component
const FloatingBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
    <div className="absolute top-60 right-10 w-96 h-96 bg-cyan-100/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
    <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-indigo-100/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
  </div>
);

// Success Message Component
const SuccessMessage = ({ message, onClose }) => (
  <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-2xl shadow-lg z-50 flex items-center space-x-3 animate-slide-in">
    <CheckCircle className="w-6 h-6" />
    <span className="font-bold">{message}</span>
    <button onClick={onClose} className="p-1 hover:bg-green-600 rounded-lg">
      <X className="w-4 h-4" />
    </button>
  </div>
);

// QR Scanner Modal Component with Camera
const QRScannerModal = ({ isOpen, onClose, onScan, scanType, user }) => {
  const [scanning, setScanning] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const qrRef = useRef(null);

  const getScanTitle = () => {
    switch(scanType) {
      case 'receive': return 'Receive Products from Farmer';
      case 'checkpoint': return 'Update Checkpoint Location';
      case 'delivery': return 'Deliver to Retailer';
      default: return 'Scan QR Code';
    }
  };

  const startQRScanner = async () => {
    try {
      setScanning(true);
      
      // Wait for DOM to be ready
      setTimeout(async () => {
        if (!qrRef.current) {
          console.error("QR scanner element not found");
          setScanning(false);
          return;
        }

        const qrScanner = new Html5Qrcode(qrRef.current.id);
        setHtml5QrCode(qrScanner);

        await qrScanner.start(
          { facingMode: "environment" },
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 } 
          },
          (decodedText) => {
            console.log("QR scanned:", decodedText);
            handleScanSuccess(decodedText);
          },
          (errorMessage) => {
            // Ignore scanning errors (they're normal during scanning)
          }
        ).catch(err => {
          console.error("QR Scanner start error:", err);
          setScanning(false);
        });
      }, 100);
    } catch (err) {
      console.error("QR Scanner error:", err);
      setScanning(false);
    }
  };

  const stopQRScanner = async () => {
    if (html5QrCode) {
      try {
        await html5QrCode.stop();
        setScanning(false);
      } catch (err) {
        console.error("Error stopping QR scanner:", err);
      }
    }
  };

  const handleScanSuccess = async (decodedText) => {
    try {
      const scanData = {
        productId: decodedText,
        productName: "Scanned Product",
        temperature: (2 + Math.random() * 6).toFixed(1),
        timestamp: new Date().toISOString(),
        scanType: scanType
      };

      // Save QR scan to database
      const { data, error } = await supabase
        .from('logistics_qr_scans')
        .insert([{
          user_id: user.id,
          scan_type: scanType,
          product_data: scanData,
          scanned_data: decodedText,
          location: 'Scanner Location',
          temperature: scanData.temperature,
          handler_name: user.email?.split('@')[0] || 'Handler'
        }])
        .select();

      if (error) throw error;

      onScan(scanData);
      await stopQRScanner();
      onClose();
      
    } catch (error) {
      console.error('Error saving QR scan:', error);
    }
  };

  useEffect(() => {
    if (isOpen && !scanning) {
      startQRScanner();
    }

    return () => {
      if (html5QrCode) {
        stopQRScanner();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">{getScanTitle()}</h3>
          <button onClick={() => {
            stopQRScanner();
            onClose();
          }} className="p-2 hover:bg-gray-100 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="bg-gray-100 rounded-2xl p-6 mb-6">
          {scanning ? (
            <div className="text-center">
              <div id="qr-reader" ref={qrRef} className="w-full h-80 border-4 border-blue-300 rounded-2xl bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg font-semibold text-blue-600">Initializing Camera...</p>
                  <p className="text-sm text-gray-500 mt-2">Position QR code within frame</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-600">Camera not available</p>
              <p className="text-sm text-gray-500 mt-2">Please check camera permissions</p>
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => {
              stopQRScanner();
              onClose();
            }}
            className="flex-1 bg-gray-500 text-white py-4 rounded-2xl font-bold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          {scanning && (
            <button
              onClick={stopQRScanner}
              className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-bold hover:bg-red-600 transition-colors"
            >
              Stop Scanner
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Vehicle Management Modal
const VehicleManagementModal = ({ isOpen, onClose, vehicles, user }) => {
  const [newVehicle, setNewVehicle] = useState({
    license_plate: '',
    vehicle_type: '',
    capacity: '',
    status: 'available'
  });

  const handleAddVehicle = async () => {
    try {
      const { data, error } = await supabase
        .from('logistics_vehicles')
        .insert([{
          user_id: user.id,
          license_plate: newVehicle.license_plate,
          vehicle_type: newVehicle.vehicle_type,
          capacity: newVehicle.capacity,
          status: newVehicle.status
        }])
        .select();

      if (error) throw error;

      setNewVehicle({ license_plate: '', vehicle_type: '', capacity: '', status: 'available' });
      onClose(true, "Vehicle added successfully!");
    } catch (error) {
      console.error('Error adding vehicle:', error);
      onClose(false, "Error adding vehicle");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Manage Vehicles</h3>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Add New Vehicle Form */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Add New Vehicle</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Plate</label>
              <input 
                type="text" 
                value={newVehicle.license_plate}
                onChange={(e) => setNewVehicle({...newVehicle, license_plate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., ABC123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
              <select 
                value={newVehicle.vehicle_type}
                onChange={(e) => setNewVehicle({...newVehicle, vehicle_type: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Type</option>
                <option value="Refrigerated Truck">Refrigerated Truck</option>
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
                <option value="Trailer">Trailer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
              <input 
                type="text" 
                value={newVehicle.capacity}
                onChange={(e) => setNewVehicle({...newVehicle, capacity: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 1000 kg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                value={newVehicle.status}
                onChange={(e) => setNewVehicle({...newVehicle, status: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="in_use">In Use</option>
              </select>
            </div>
          </div>
          <button 
            onClick={handleAddVehicle}
            className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors mt-4"
          >
            ADD VEHICLE
          </button>
        </div>

        {/* Vehicles List */}
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-4">Your Vehicles</h4>
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-2xl bg-white">
                <div className="flex items-center space-x-4">
                  <Truck className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-bold text-gray-900">{vehicle.license_plate}</p>
                    <p className="text-gray-600">{vehicle.vehicle_type} • {vehicle.capacity}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-xl font-bold text-sm ${
                  vehicle.status === 'available' ? 'bg-green-100 text-green-700' :
                  vehicle.status === 'maintenance' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {vehicle.status.toUpperCase()}
                </span>
              </div>
            ))}
            {vehicles.length === 0 && (
              <p className="text-gray-500 text-center py-4">No vehicles added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Route Planning Modal
const RoutePlanningModal = ({ isOpen, onClose, shipments }) => {
  const [selectedShipment, setSelectedShipment] = useState('');
  const [optimizedRoute, setOptimizedRoute] = useState(null);

  const handleOptimizeRoute = () => {
    if (!selectedShipment) return;

    const shipment = shipments.find(s => s.id === selectedShipment);
    if (!shipment) return;

    // Simulate route optimization
    const mockRoute = {
      shipment: shipment.shipment_id,
      origin: shipment.origin,
      destination: shipment.destination,
      totalDistance: `${Math.floor(Math.random() * 500) + 200} km`,
      estimatedTime: `${Math.floor(Math.random() * 8) + 4} hours`,
      waypoints: [
        `${shipment.origin} Warehouse`,
        'Distribution Center A',
        'Highway Checkpoint',
        `${shipment.destination} Terminal`
      ],
      fuelCost: `₹${Math.floor(Math.random() * 200) + 100}`,
      optimalSpeed: '65-75 km/h'
    };

    setOptimizedRoute(mockRoute);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Plan Delivery Route</h3>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Shipment Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Shipment</label>
            <select 
              value={selectedShipment}
              onChange={(e) => setSelectedShipment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a shipment</option>
              {shipments.filter(s => s.status === 'pending' || s.status === 'in_transit').map(shipment => (
                <option key={shipment.id} value={shipment.id}>
                  {shipment.shipment_id} - {shipment.origin} → {shipment.destination}
                </option>
              ))}
            </select>
          </div>

          {/* Optimize Route Button */}
          <button 
            onClick={handleOptimizeRoute}
            disabled={!selectedShipment}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            OPTIMIZE DELIVERY ROUTE
          </button>

          {/* Optimized Route Results */}
          {optimizedRoute && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                Route Optimized Successfully!
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-green-700 font-medium">Total Distance</p>
                  <p className="text-lg font-bold text-green-900">{optimizedRoute.totalDistance}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Estimated Time</p>
                  <p className="text-lg font-bold text-green-900">{optimizedRoute.estimatedTime}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Fuel Cost</p>
                  <p className="text-lg font-bold text-green-900">{optimizedRoute.fuelCost}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Optimal Speed</p>
                  <p className="text-lg font-bold text-green-900">{optimizedRoute.optimalSpeed}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-green-700 font-medium mb-2">Route Waypoints:</p>
                <div className="space-y-2">
                  {optimizedRoute.waypoints.map((waypoint, index) => (
                    <div key={index} className="flex items-center space-x-3 text-green-800">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span>{waypoint}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Route Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <h5 className="font-bold text-blue-900 mb-2">Route Optimization Tips</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Consider traffic patterns during planning</li>
              <li>• Account for rest stops every 4 hours</li>
              <li>• Check weather conditions along the route</li>
              <li>• Plan refueling stops for long distances</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Available Vehicles Section Component - FIXED VERSION
const AvailableVehiclesSection = ({ vehicles, user }) => {
  const [allVehicles, setAllVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch ALL vehicles from database
  const fetchAllVehicles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logistics_vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setAllVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllVehicles();
    }
  }, [user]);

  // Real-time subscription for vehicle updates
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('vehicles_updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'logistics_vehicles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Vehicle update:', payload);
          fetchAllVehicles(); // Refresh vehicles list
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Update vehicle status
  const handleUpdateVehicleStatus = async (vehicleId, newStatus) => {
    try {
      const { error } = await supabase
        .from('logistics_vehicles')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId);

      if (error) throw error;
      
      // Refresh the list
      await fetchAllVehicles();
      return { success: true };
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return { success: false, error };
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
        <h3 className="font-black text-gray-900 text-xl mb-4 flex items-center">
          <Truck className="w-6 h-6 text-green-500 mr-3" />
          ALL VEHICLES
        </h3>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          <p className="ml-3 text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black text-gray-900 text-xl flex items-center">
          <Truck className="w-6 h-6 text-green-500 mr-3" />
          ALL VEHICLES
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchAllVehicles}
            className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            title="Refresh vehicles"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
            {allVehicles.length} total
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {allVehicles.length === 0 ? (
          <div className="text-center py-6">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg font-medium">No vehicles found</p>
            <p className="text-gray-400 text-sm">Add vehicles to get started</p>
          </div>
        ) : (
          allVehicles.map((vehicle) => (
            <div 
              key={vehicle.id} 
              className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-2xl hover:border-green-300 transition-all duration-200 bg-white/50 group"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                  vehicle.status === 'available' ? 'bg-gradient-to-br from-green-100 to-emerald-100' :
                  vehicle.status === 'in_use' ? 'bg-gradient-to-br from-blue-100 to-cyan-100' :
                  'bg-gradient-to-br from-amber-100 to-orange-100'
                }`}>
                  <Truck className={`w-6 h-6 ${
                    vehicle.status === 'available' ? 'text-green-600' :
                    vehicle.status === 'in_use' ? 'text-blue-600' :
                    'text-amber-600'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <p className="font-bold text-gray-900 text-lg">{vehicle.license_plate}</p>
                    <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                      vehicle.status === 'available' ? 'bg-green-100 text-green-700' :
                      vehicle.status === 'in_use' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {vehicle.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {vehicle.vehicle_type}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Capacity:</span> {vehicle.capacity}
                    </p>
                    {vehicle.current_location && (
                      <p className="text-sm text-gray-600 col-span-2">
                        <span className="font-medium">Location:</span> {vehicle.current_location}
                      </p>
                    )}
                    {vehicle.fuel_level && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Fuel:</span> {vehicle.fuel_level}%
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateVehicleStatus(vehicle.id, 'in_use')}
                  className="px-3 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors"
                  title="Mark as in use"
                >
                  Use
                </button>
                <button
                  onClick={() => handleUpdateVehicleStatus(vehicle.id, 'maintenance')}
                  className="px-3 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors"
                  title="Send for maintenance"
                >
                  Maintenance
                </button>
                <button
                  onClick={() => handleUpdateVehicleStatus(vehicle.id, 'available')}
                  className="px-3 py-2 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors"
                  title="Mark as available"
                >
                  Available
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      {allVehicles.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-2xl font-black text-green-700">
                {allVehicles.filter(v => v.status === 'available').length}
              </p>
              <p className="text-xs text-green-600 font-medium">AVAILABLE</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-2xl font-black text-blue-700">
                {allVehicles.filter(v => v.status === 'in_use').length}
              </p>
              <p className="text-xs text-blue-600 font-medium">IN USE</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-2xl font-black text-amber-700">
                {allVehicles.filter(v => v.status === 'maintenance').length}
              </p>
              <p className="text-xs text-amber-600 font-medium">MAINTENANCE</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, change, trend, color, onClick }) => {
  const colors = {
    blue: { bg: "bg-blue-50", iconBg: "bg-blue-500", text: "text-blue-700", change: "text-blue-600" },
    green: { bg: "bg-green-50", iconBg: "bg-green-500", text: "text-green-700", change: "text-green-600" },
    purple: { bg: "bg-purple-50", iconBg: "bg-purple-500", text: "text-purple-700", change: "text-purple-600" },
    amber: { bg: "bg-amber-50", iconBg: "bg-amber-500", text: "text-amber-700", change: "text-amber-600" },
  };

  const colorSet = colors[color] || colors.blue;

  return (
    <div onClick={onClick} className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-lg font-semibold text-gray-600 mb-2">{label}</p>
          <p className="text-5xl font-bold text-gray-900 mb-3">{value}</p>
          {change && (
            <div className="flex items-center space-x-2">
              <span className={`text-base font-semibold ${colorSet.change}`}>{change}</span>
            </div>
          )}
        </div>
        <div className={`w-16 h-16 ${colorSet.iconBg} rounded-2xl flex items-center justify-center shadow-xl`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
};

// Temperature Alert Component
const TemperatureAlert = ({ currentTemp, optimalRange }) => {
  const [min, max] = optimalRange;
  const isCritical = currentTemp < min - 2 || currentTemp > max + 2;
  const isWarning = (currentTemp < min || currentTemp > max) && !isCritical;

  if (!isCritical && !isWarning) return null;

  return (
    <div className={`p-4 rounded-2xl border ${
      isCritical ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
    } flex items-center space-x-3`}>
      <AlertCircle className={`w-6 h-6 ${isCritical ? 'text-red-600' : 'text-amber-600'}`} />
      <div>
        <p className={`font-bold ${isCritical ? 'text-red-800' : 'text-amber-800'}`}>
          Temperature {isCritical ? 'Critical' : 'Warning'}
        </p>
        <p className={`text-sm ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
          Current: {currentTemp}°C | Optimal: {min}-{max}°C
        </p>
      </div>
    </div>
  );
};

// Steps Guide Component
const StepsGuide = () => {
  const [expanded, setExpanded] = useState(true);

  const steps = [
    {
      step: 1,
      title: "Receive Products",
      description: "Scan QR code when receiving from farmer",
      details: "System records: 'Received at Warehouse, 8°C, Handler: Maria'"
    },
    {
      step: 2,
      title: "Update During Transit",
      description: "Scan at each checkpoint (warehouse transfers, border crossings)",
      details: "Record temperature, location, time. Take photos if quality issues"
    },
    {
      step: 3,
      title: "Final Delivery",
      description: "Scan QR when delivering to retailer",
      details: "Retailer scans to confirm receipt"
    },
    {
      step: 4,
      title: "Real Example",
      description: "Maria scans tomatoes at warehouse",
      details: "Updates: 'In transit to Chicago, 6°C' → Retailer scans upon delivery"
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <h3 className="font-black text-gray-900 text-xl flex items-center">
          <MapPin className="w-6 h-6 text-blue-500 mr-3" />
          LOGISTICS STEPS GUIDE
        </h3>
        <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>
      
      {expanded && (
        <div className="mt-4 space-y-4">
          {steps.map((step) => (
            <div key={step.step} className="flex items-start space-x-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-200">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {step.step}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-lg">{step.title}</h4>
                <p className="text-gray-700 font-medium">{step.description}</p>
                <p className="text-gray-600 text-sm mt-1">{step.details}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Shipment Card Component
const ShipmentCard = React.memo(({ shipment, onUpdateLocation, onScanQR, user }) => {
  const [expanded, setExpanded] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [currentScanType, setCurrentScanType] = useState('checkpoint');

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      in_transit: "bg-blue-100 text-blue-700 border-blue-200",
      delivered: "bg-green-100 text-green-700 border-green-200",
      received: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[status] || colors.pending;
  };

  const latestTracking = shipment.logistics_tracking?.[0] || {
    location_name: "No tracking data",
    temperature: "N/A",
    battery_level: "N/A",
    speed_kmh: "N/A",
    created_at: new Date().toISOString(),
  };

  const handleScan = async (scanData) => {
    try {
      // Save QR scan to database
      const { data, error } = await supabase
        .from('logistics_qr_scans')
        .insert([{
          user_id: user.id,
          shipment_id: shipment.id,
          scan_type: currentScanType,
          product_data: scanData,
          location: latestTracking.location_name,
          temperature: scanData.temperature,
          handler_name: user.email?.split('@')[0] || 'Handler'
        }])
        .select();

      if (error) throw error;

      // Update shipment status based on scan type
      let newStatus = shipment.status;
      if (currentScanType === 'receive') newStatus = 'received';
      if (currentScanType === 'delivery') newStatus = 'delivered';

      if (newStatus !== shipment.status) {
        await supabase
          .from('logistics_shipments')
          .update({ status: newStatus })
          .eq('id', shipment.id);
      }

      onScanQR(scanData);
    } catch (error) {
      console.error('Error saving QR scan:', error);
    }
  };

  const openScanner = (scanType) => {
    setCurrentScanType(scanType);
    setShowScanner(true);
  };

  return (
    <>
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
        <div className="flex items-center justify-between p-6 cursor-pointer bg-gradient-to-r from-white to-gray-50/50 hover:to-blue-50/30 transition-all duration-300" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center space-x-5 flex-1">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center shadow-inner">
              <Package className="w-6 h-6 text-blue-600" />
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="font-bold text-gray-900 text-xl">{shipment.shipment_id}</h4>
                <span className={`px-4 py-2 text-base rounded-full font-bold border-2 ${getStatusColor(shipment.status)}`}>
                  {shipment.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <p className="text-lg text-gray-600 font-medium">{shipment.origin} → {shipment.destination}</p>
              {shipment.product_type && <p className="text-base text-gray-500 mt-1">🍅 {shipment.product_type} • {shipment.quantity}</p>}
              {latestTracking && <p className="text-base text-gray-500 mt-1">📍 {latestTracking.location_name} • 🕒 {new Date(latestTracking.created_at).toLocaleTimeString()}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={(e) => { e.stopPropagation(); openScanner('checkpoint'); }} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-3 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 shadow-md flex items-center space-x-2">
              <QrCode className="w-5 h-5" />
              <span>Scan QR</span>
            </button>

            <button onClick={(e) => { e.stopPropagation(); onUpdateLocation(shipment.id); }} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-3 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 shadow-md flex items-center space-x-2">
              <Navigation className="w-5 h-5" />
              <span>Update</span>
            </button>

            <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-colors">
              <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
            <div className="p-6 space-y-6">
              {latestTracking.temperature && <TemperatureAlert currentTemp={latestTracking.temperature} optimalRange={[2, 8]} />}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/80 rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3"><Thermometer className="w-6 h-6 text-blue-500" /><p className="text-gray-600 font-bold text-lg">Temperature</p></div>
                  <p className="text-3xl font-bold text-gray-900">{latestTracking.temperature || "N/A"}°C</p>
                </div>
                <div className="bg-white/80 rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3"><Battery className="w-6 h-6 text-green-500" /><p className="text-gray-600 font-bold text-lg">Battery</p></div>
                  <p className="text-3xl font-bold text-gray-900">{latestTracking.battery_level || "N/A"}%</p>
                </div>
                <div className="bg-white/80 rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3"><Navigation className="w-6 h-6 text-purple-500" /><p className="text-gray-600 font-bold text-lg">Speed</p></div>
                  <p className="text-3xl font-bold text-gray-900">{latestTracking.speed_kmh || "N/A"} km/h</p>
                </div>
                <div className="bg-white/80 rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3"><Clock className="w-6 h-6 text-amber-500" /><p className="text-gray-600 font-bold text-lg">Last Update</p></div>
                  <p className="text-xl font-bold text-gray-900">{new Date(latestTracking.created_at).toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button onClick={() => openScanner('receive')} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 shadow-md flex items-center justify-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>Receive</span>
                </button>
                <button onClick={() => openScanner('checkpoint')} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 shadow-md flex items-center justify-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>Checkpoint</span>
                </button>
                <button onClick={() => openScanner('delivery')} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 shadow-md flex items-center justify-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>Delivery</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <QRScannerModal 
        isOpen={showScanner} 
        onClose={() => setShowScanner(false)} 
        onScan={handleScan} 
        scanType={currentScanType}
        user={user}
      />
    </>
  );
});

// Header Component
const Header = React.memo(({ user, onRefresh, refreshing, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <header className="relative bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">LOGISTICS PRO</h1>
              <p className="text-base text-gray-600 font-medium">Supply Chain Management Platform</p>
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onKeyPress={handleSearch} 
                placeholder="Search shipments, vehicles, routes..." 
                className="w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm text-lg font-medium" 
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={onRefresh} disabled={refreshing} className="w-12 h-12 bg-white border border-gray-300 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">
              <RefreshCw className={`w-6 h-6 text-gray-600 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="font-bold text-gray-900 text-lg">{user?.email}</p>
                <p className="text-base text-gray-600 font-medium">Logistics Manager</p>
              </div>
              <button onClick={onLogout} className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-md">
                <LogOut className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

// Quick Actions Component
const QuickActions = React.memo(({ actions }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
    <h3 className="font-black text-gray-900 text-xl mb-6 flex items-center">
      <Zap className="w-6 h-6 text-yellow-500 mr-3" />
      QUICK ACTIONS
    </h3>
    <div className="space-y-3">
      {actions.map((action, index) => (
        <button 
          key={action.label} 
          onClick={action.onClick} 
          disabled={action.disabled}
          className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-200 border shadow-sm group ${
            action.disabled 
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' 
              : 'bg-gradient-to-r from-white to-gray-50/50 border-transparent hover:border-gray-200 hover:bg-white hover:shadow-md'
          }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform duration-300 ${
            action.disabled 
              ? 'bg-gray-200' 
              : `${action.bgColor} group-hover:scale-110`
          }`}>
            <action.icon className={`w-6 h-6 ${action.disabled ? 'text-gray-400' : action.textColor}`} />
          </div>
          <div className="flex-1 text-left">
            <span className={`font-bold text-lg block ${
              action.disabled ? 'text-gray-500' : 'text-gray-900'
            }`}>{action.label}</span>
            <span className={`text-base block ${
              action.disabled ? 'text-gray-400' : 'text-gray-600'
            }`}>{action.description}</span>
          </div>
          <ArrowRight className={`w-5 h-5 ${
            action.disabled ? 'text-gray-400' : 'text-gray-400 group-hover:text-gray-600'
          } transition-colors`} />
        </button>
      ))}
    </div>
  </div>
));

// Main LogisticsDashboard Component
const LogisticsDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activeShipments, setActiveShipments] = useState([]);
  const [stats, setStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateShipment, setShowCreateShipment] = useState(false);
  const [showVehicleManagement, setShowVehicleManagement] = useState(false);
  const [showRoutePlanning, setShowRoutePlanning] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [newShipment, setNewShipment] = useState({
    origin: '',
    destination: '',
    product_type: '',
    quantity: ''
  });
  const navigate = useNavigate();

  // Memoized data fetching function
  const fetchDashboardData = useCallback(async (userId) => {
    try {
      setRefreshing(true);

      // Fetch shipments with tracking data
      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from('logistics_shipments')
        .select(`
          *,
          logistics_tracking (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (shipmentsError) throw shipmentsError;
      
      setShipments(shipmentsData || []);
      setActiveShipments(shipmentsData?.filter(s => s.status === 'in_transit') || []);

      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('logistics_vehicles')
        .select('*')
        .eq('user_id', userId);

      if (vehiclesError) throw vehiclesError;
      setVehicles(vehiclesData || []);

      // Calculate stats
      const totalShipments = shipmentsData?.length || 0;
      const activeShipmentsCount = shipmentsData?.filter(s => s.status === 'in_transit').length || 0;
      const deliveredToday = shipmentsData?.filter(s => {
        const today = new Date().toDateString();
        const deliveredDate = new Date(s.updated_at).toDateString();
        return s.status === 'delivered' && deliveredDate === today;
      }).length || 0;

      setStats({
        totalShipments,
        activeShipments: activeShipmentsCount,
        deliveredToday,
        pending: totalShipments - activeShipmentsCount - deliveredToday,
        totalDistance: 1250
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { navigate("/login"); return; }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate("/login"); return; }

        setUser(user);
        await fetchDashboardData(user.id);
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [fetchDashboardData, navigate]);

  // Optimized real-time subscription - only subscribe once
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('tracking_updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'logistics_tracking',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New tracking update:', payload);
          // Only update specific shipment instead of refreshing all data
          setShipments(prev => prev.map(shipment => 
            shipment.id === payload.new.shipment_id 
              ? { 
                  ...shipment, 
                  logistics_tracking: [payload.new, ...(shipment.logistics_tracking || [])].slice(0, 5) 
                }
              : shipment
          ));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const simulateTrackingUpdate = async (shipmentId) => {
    try {
      const trackingData = {
        user_id: user.id,
        shipment_id: shipmentId,
        latitude: 34.0522 + (Math.random() - 0.5) * 2,
        longitude: -118.2437 + (Math.random() - 0.5) * 2,
        location_name: `Checkpoint ${Math.floor(Math.random() * 50) + 1}`,
        temperature: 4 + Math.random() * 4,
        humidity: 60 + Math.random() * 20,
        speed_kmh: 50 + Math.random() * 40,
        battery_level: 70 + Math.random() * 25,
        event_type: "location_update"
      };

      const { data, error } = await supabase
        .from('logistics_tracking')
        .insert([trackingData])
        .select();

      if (error) throw error;

      // Optimized update - only update the specific shipment
      setShipments(prev => prev.map(shipment => 
        shipment.id === shipmentId 
          ? { 
              ...shipment, 
              logistics_tracking: [data[0], ...(shipment.logistics_tracking || [])].slice(0, 5) 
            }
          : shipment
      ));

      setSuccessMessage("Location updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (error) {
      console.error('Error updating location:', error);
      setSuccessMessage("Error updating location");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleCreateShipment = async () => {
    try {
      const shipmentData = {
        user_id: user.id,
        shipment_id: `SHIP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        origin: newShipment.origin,
        destination: newShipment.destination,
        product_type: newShipment.product_type,
        quantity: newShipment.quantity,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('logistics_shipments')
        .insert([shipmentData])
        .select();

      if (error) throw error;

      setShowCreateShipment(false);
      setNewShipment({ origin: '', destination: '', product_type: '', quantity: '' });
      
      // Add new shipment to state instead of refetching all data
      const newShipmentData = data[0];
      setShipments(prev => [newShipmentData, ...prev]);
      setActiveShipments(prev => [newShipmentData, ...prev]);
      
      // Show success message
      setSuccessMessage("Shipment created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalShipments: prev.totalShipments + 1,
        pending: prev.pending + 1
      }));
      
    } catch (error) {
      console.error('Error creating shipment:', error);
      setSuccessMessage("Error creating shipment. Please try again.");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleQRScan = (scanData) => {
    setSuccessMessage(`QR Scan Successful! ${scanData.productName} recorded at ${scanData.temperature}°C`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Export data function
  const handleExport = () => {
    const dataToExport = activeShipments.map(shipment => ({
      'Shipment ID': shipment.shipment_id,
      'Origin': shipment.origin,
      'Destination': shipment.destination,
      'Product Type': shipment.product_type,
      'Quantity': shipment.quantity,
      'Status': shipment.status,
      'Last Location': shipment.logistics_tracking?.[0]?.location_name || 'N/A',
      'Temperature': shipment.logistics_tracking?.[0]?.temperature || 'N/A',
      'Last Update': shipment.logistics_tracking?.[0]?.created_at || 'N/A'
    }));

    // Convert to CSV
    const csvContent = [
      Object.keys(dataToExport[0] || {}).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipments-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSuccessMessage("Data exported successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Filter shipments function
  const handleFilter = () => {
    // Toggle between all shipments and active shipments
    if (activeShipments.length === shipments.filter(s => s.status === 'in_transit').length) {
      // Show all shipments
      setActiveShipments(shipments);
      setSuccessMessage("Showing all shipments");
    } else {
      // Show only active shipments
      setActiveShipments(shipments.filter(s => s.status === 'in_transit'));
      setSuccessMessage("Filtered to show active shipments only");
    }
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Quick actions handlers
  const handleScanQRAction = () => {
    setShowQRScanner(true);
  };

  const handleManageVehicles = () => {
    setShowVehicleManagement(true);
  };

  const handlePlanRoute = () => {
    setShowRoutePlanning(true);
  };

  const handleVehicleModalClose = (success, message) => {
    setShowVehicleManagement(false);
    if (message) {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
    if (success) {
      fetchDashboardData(user.id);
    }
  };

  const handleRouteModalClose = (success) => {
    setShowRoutePlanning(false);
    if (success) {
      setSuccessMessage("Route optimized successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleQuickActionQRScan = (scanData) => {
    setSuccessMessage(`QR Scan Successful! ${scanData.productName} recorded`);
    setTimeout(() => setSuccessMessage(""), 3000);
    setShowQRScanner(false);
  };

  // Memoized quick actions - ALL BUTTONS ENABLED AND FUNCTIONAL
  const quickActions = React.useMemo(() => [
    {
      icon: QrCode,
      label: "Scan QR Code",
      description: "Scan product QR for receiving",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      onClick: handleScanQRAction,
      disabled: false
    },
    {
      icon: Truck,
      label: "Manage Vehicles",
      description: "View and manage your vehicle fleet",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      onClick: handleManageVehicles,
      disabled: false
    },
    {
      icon: Route,
      label: "Plan Route",
      description: "Optimize delivery routes",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      onClick: handlePlanRoute,
      disabled: false
    },
    {
      icon: Plus,
      label: "New Shipment",
      description: "Create a new logistics shipment",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      onClick: () => setShowCreateShipment(true),
      disabled: false
    },
  ], []);

  // Memoized dashboard stats with functionality
  const dashboardStats = React.useMemo(() => [
    {
      label: "Total Shipments",
      value: stats.totalShipments || 0,
      icon: Package,
      change: "+12% this month",
      trend: "up",
      color: "blue",
      onClick: () => {
        setActiveShipments(shipments);
        setSuccessMessage("Showing all shipments");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    },
    {
      label: "Active Now",
      value: stats.activeShipments || 0,
      icon: Navigation,
      change: "In transit",
      trend: "up",
      color: "green",
      onClick: () => {
        setActiveShipments(shipments.filter(s => s.status === 'in_transit'));
        setSuccessMessage("Showing active shipments only");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    },
    {
      label: "Delivered Today",
      value: stats.deliveredToday || 0,
      icon: CheckCircle,
      change: "On schedule",
      trend: "up",
      color: "purple",
      onClick: () => {
        const today = new Date().toDateString();
        const deliveredToday = shipments.filter(s => {
          const deliveredDate = new Date(s.updated_at).toDateString();
          return s.status === 'delivered' && deliveredDate === today;
        });
        setActiveShipments(deliveredToday);
        setSuccessMessage("Showing deliveries from today");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    },
    {
      label: "Total Distance",
      value: `${stats.totalDistance || 0} km`,
      icon: MapPin,
      change: "This month",
      trend: "up",
      color: "amber",
      onClick: () => {
        setSuccessMessage("Total distance tracked: 1,250 km this month");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    },
  ], [stats, shipments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 flex items-center justify-center">
        <FloatingBackground />
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <p className="text-gray-700 font-bold text-2xl">Loading Logistics Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50">
      <FloatingBackground />
      
      {/* Success Message */}
      {successMessage && (
        <SuccessMessage 
          message={successMessage} 
          onClose={() => setSuccessMessage("")} 
        />
      )}
      
      <Header user={user} onRefresh={() => fetchDashboardData(user?.id)} refreshing={refreshing} onLogout={handleLogout} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4 space-y-6">
            <QuickActions actions={quickActions} />
            <StepsGuide />
            
            {/* Available Vehicles Section - FIXED VERSION */}
            <AvailableVehiclesSection vehicles={vehicles} user={user} />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 space-y-8">
            {/* Active Shipments Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                      <Navigation className="w-6 h-6 text-white" />
                    </div>
                    ACTIVE SHIPMENTS
                  </h2>
                  <p className="text-gray-600 mt-2 text-lg font-medium">Real-time tracking and monitoring</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={handleFilter}
                    className="bg-white border-2 border-gray-300 text-gray-700 px-5 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all duration-200 flex items-center space-x-3 shadow-sm"
                  >
                    <Filter className="w-5 h-5" />
                    <span>FILTER</span>
                  </button>
                  <button 
                    onClick={handleExport}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-3 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 flex items-center space-x-3 shadow-md"
                  >
                    <Download className="w-5 h-5" />
                    <span>EXPORT</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {activeShipments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">NO ACTIVE SHIPMENTS</h3>
                    <p className="text-gray-600 mb-6 text-lg">All shipments are currently delivered or pending</p>
                    <button 
                      onClick={() => setShowCreateShipment(true)} 
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-2xl font-black hover:shadow-lg transition-all duration-200 shadow-md text-lg"
                    >
                      CREATE NEW SHIPMENT
                    </button>
                  </div>
                ) : (
                  activeShipments.map((shipment) => (
                    <ShipmentCard 
                      key={shipment.id} 
                      shipment={shipment} 
                      onUpdateLocation={simulateTrackingUpdate} 
                      onScanQR={handleQRScan} 
                      user={user} 
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Shipment Modal */}
      {showCreateShipment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create New Shipment</h3>
              <button onClick={() => setShowCreateShipment(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
                <input type="text" value={newShipment.origin} onChange={(e) => setNewShipment({...newShipment, origin: e.target.value})} className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Farm A, California" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                <input type="text" value={newShipment.destination} onChange={(e) => setNewShipment({...newShipment, destination: e.target.value})} className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Market B, San Francisco" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                <input type="text" value={newShipment.product_type} onChange={(e) => setNewShipment({...newShipment, product_type: e.target.value})} className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Fresh Tomatoes" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input type="text" value={newShipment.quantity} onChange={(e) => setNewShipment({...newShipment, quantity: e.target.value})} className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 500 kg" />
              </div>
            </div>

            <button onClick={handleCreateShipment} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors mt-6">
              CREATE SHIPMENT
            </button>
          </div>
        </div>
      )}

      {/* Vehicle Management Modal */}
      <VehicleManagementModal 
        isOpen={showVehicleManagement}
        onClose={handleVehicleModalClose}
        vehicles={vehicles}
        user={user}
      />

      {/* Route Planning Modal */}
      <RoutePlanningModal 
        isOpen={showRoutePlanning}
        onClose={handleRouteModalClose}
        shipments={shipments}
      />

      {/* QR Scanner Modal for Quick Action */}
      <QRScannerModal 
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQuickActionQRScan}
        scanType="checkpoint"
        user={user}
      />
    </div>
  );
};

export default LogisticsDashboard;