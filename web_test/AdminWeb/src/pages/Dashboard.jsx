import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Car, MapPin, DollarSign, Activity, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [stats, setStats] = useState({
    drivers: { total: 0, verified: 0, unverified: 0 },
    riders: 0,
    trips: { total: 0, completed: 0, cancelled: 0, inProgress: 0 },
    revenue: 0,
    recentTrips: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [driversRes, ridersRes, tripsRes] = await Promise.all([
        apiClient('/users', { params: { role: 'DRIVER' } }),
        apiClient('/users', { params: { role: 'RIDER' } }),
        apiClient('/trips')
      ]);

      const drivers = driversRes.data || [];
      const riders = ridersRes.data || [];
      const trips = tripsRes.data || [];

      // Process Drivers
      const verifiedDrivers = drivers.filter(d => d.isVerified).length;

      // Process Trips
      const completedTrips = trips.filter(t => t.status === 'COMPLETED').length;
      const cancelledTrips = trips.filter(t => t.status === 'CANCELLED').length;
      const progressTrips = trips.filter(t => ['IN_PROGRESS', 'CREATED', 'ACCEPTED', 'PICKED_UP'].includes(t.status)).length;

      const revenue = trips
        .filter(t => t.status === 'COMPLETED' && t.price)
        .reduce((sum, t) => sum + (Number(t.price) || 0), 0);

      // Recent Trips (Sort by created_at desc if available, else take last added)
      // Assuming trips have createdAt or similar. If not, just take first few for now as mock of "recent"
      // or assuming API returns in chronological order, reverse it.
      const sortedTrips = [...trips].reverse().slice(0, 5);

      setStats({
        drivers: {
          total: drivers.length,
          verified: verifiedDrivers,
          unverified: drivers.length - verifiedDrivers
        },
        riders: riders.length,
        trips: {
          total: trips.length,
          completed: completedTrips,
          cancelled: cancelledTrips,
          inProgress: progressTrips
        },
        revenue,
        recentTrips: sortedTrips
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
      <p className="text-slate-500 font-medium">Loading Dashboard Data...</p>
    </div>
  );

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drivers.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">{stats.drivers.verified} Verified</span> • {stats.drivers.unverified} Pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Riders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.riders}</div>
            <p className="text-xs text-muted-foreground mt-1">Active platform users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trip Status</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trips.total} <span className="text-sm font-normal text-muted-foreground">Total</span></div>
            <div className="flex gap-2 mt-2 text-xs">
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">{stats.trips.completed} Done</Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">{stats.trips.inProgress} Active</Badge>
              <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">{stats.trips.cancelled} Cancel</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue.toLocaleString()} VND</div>
            <p className="text-xs text-muted-foreground mt-1">From {stats.trips.completed} completed trips</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4 md:col-span-7">
          <CardHeader>
            <CardTitle>Recent Trips</CardTitle>
            <CardDescription>
              Latest {stats.recentTrips.length} trips on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trip ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentTrips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">No trips found.</TableCell>
                  </TableRow>
                ) : (
                  stats.recentTrips.map((trip, index) => (
                    <TableRow key={trip._id || index}>
                      <TableCell className="font-mono text-xs">{trip?._id?.substring ? trip._id.substring(0, 8) : 'N/A'}...</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            trip.status === 'COMPLETED' ? 'text-green-600 border-green-600' :
                              trip.status === 'CANCELLED' ? 'text-red-600 border-red-600' :
                                'text-blue-600 border-blue-600'
                          }
                        >
                          {trip.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={trip.pickup?.address || trip.pickup}>
                        {trip.pickup?.address || trip.pickup}
                      </TableCell>
                      <TableCell>{trip.price?.toLocaleString()} VND</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;