import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import FarmerDashboard from '../components/dashboard/FarmerDashboard';
import ManufacturerDashboard from '../components/dashboard/ManufacturerDashboard';
import DistributorDashboard from '../components/dashboard/DistributorDashboard';
import RetailerDashboard from '../components/dashboard/RetailerDashboard';
import ConsumerDashboard from '../components/dashboard/ConsumerDashboard';

const DASHBOARDS = {
  farmer: FarmerDashboard,
  manufacturer: ManufacturerDashboard,
  distributor: DistributorDashboard,
  retailer: RetailerDashboard,
  consumer: ConsumerDashboard,
};

const Dashboard = () => {
  const { user } = useAuth();
  const DashboardComponent = DASHBOARDS[user?.role];

  if (!DashboardComponent) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Unknown role: {user?.role}</p>
      </div>
    );
  }

  return <DashboardComponent />;
};

export default Dashboard;
