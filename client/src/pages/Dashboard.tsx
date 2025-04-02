import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { 
  User, 
  Package, 
  ShoppingBag, 
  Heart, 
  Settings, 
  LogOut,
  Truck,
  AlertCircle,
  Calendar,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Order } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
        <h1 className="font-montserrat text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-gray-600 mb-6">Please login to access your dashboard.</p>
        <Button className="bg-primary hover:bg-primary/90">Login</Button>
      </div>
    );
  }

  const pendingOrders = orders?.filter(order => order.status === 'pending' || order.status === 'processing') || [];
  const completedOrders = orders?.filter(order => order.status === 'delivered') || [];
  
  // We'd fetch these from actual endpoints in a real app
  const savedPlants = [];
  const upcomingDeliveries = pendingOrders.filter(order => order.status === 'processing');
  
  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-400 text-white';
      case 'processing': return 'bg-blue-400 text-white';
      case 'shipped': return 'bg-indigo-400 text-white';
      case 'delivered': return 'bg-green-500 text-white';
      case 'canceled': return 'bg-red-400 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-center">
                <div className="flex items-center justify-center">
                  <div className="bg-primary bg-opacity-10 rounded-full h-16 w-16 flex items-center justify-center font-bold text-primary mb-2">
                    {user.fullName.charAt(0)}
                  </div>
                </div>
                <span className="font-montserrat text-lg font-semibold">{user.fullName}</span>
                <p className="text-sm text-gray-500 font-normal capitalize">{user.userType} Account</p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <Button 
                  variant={activeTab === "orders" ? "default" : "ghost"} 
                  className={`w-full justify-start ${activeTab === "orders" ? "bg-primary hover:bg-primary/90" : ""}`}
                  onClick={() => setActiveTab("orders")}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Orders
                </Button>
                <Button 
                  variant={activeTab === "deliveries" ? "default" : "ghost"} 
                  className={`w-full justify-start ${activeTab === "deliveries" ? "bg-primary hover:bg-primary/90" : ""}`}
                  onClick={() => setActiveTab("deliveries")}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Deliveries
                </Button>
                <Button 
                  variant={activeTab === "saved" ? "default" : "ghost"} 
                  className={`w-full justify-start ${activeTab === "saved" ? "bg-primary hover:bg-primary/90" : ""}`}
                  onClick={() => setActiveTab("saved")}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Saved Plants
                </Button>
                <Button 
                  variant={activeTab === "account" ? "default" : "ghost"} 
                  className={`w-full justify-start ${activeTab === "account" ? "bg-primary hover:bg-primary/90" : ""}`}
                  onClick={() => setActiveTab("account")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Account
                </Button>
                <Button 
                  variant={activeTab === "settings" ? "default" : "ghost"} 
                  className={`w-full justify-start ${activeTab === "settings" ? "bg-primary hover:bg-primary/90" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h1 className="font-montserrat text-2xl font-bold">My Orders</h1>
              
              <Tabs defaultValue="all" className="w-full">
                <TabsList>
                  <TabsTrigger value="all">All Orders</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="pt-4">
                  {isLoadingOrders ? (
                    <div className="h-64 flex items-center justify-center">
                      <p>Loading orders...</p>
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">#{order.id}</TableCell>
                              <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                              <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(order.status)}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">View</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-montserrat font-semibold text-lg mb-2">No Orders Yet</h3>
                      <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                      <Button className="bg-primary hover:bg-primary/90">Browse Plants</Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="active" className="pt-4">
                  {pendingOrders.length > 0 ? (
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">#{order.id}</TableCell>
                              <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                              <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(order.status)}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">View</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-montserrat font-semibold text-lg mb-2">No Active Orders</h3>
                      <p className="text-gray-500">You don't have any orders in progress.</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="completed" className="pt-4">
                  {completedOrders.length > 0 ? (
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completedOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">#{order.id}</TableCell>
                              <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                              <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(order.status)}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">View</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-montserrat font-semibold text-lg mb-2">No Completed Orders</h3>
                      <p className="text-gray-500">You don't have any completed orders yet.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeTab === "deliveries" && (
            <div className="space-y-6">
              <h1 className="font-montserrat text-2xl font-bold">Upcoming Deliveries</h1>
              
              {upcomingDeliveries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingDeliveries.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-montserrat font-semibold text-lg">Order #{order.id}</h3>
                            <p className="text-gray-500 text-sm">Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm">
                              {order.deliveryDate 
                                ? `Expected delivery: ${new Date(order.deliveryDate).toLocaleDateString()}`
                                : "Delivery date not scheduled yet"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm">
                              {order.status === 'processing' 
                                ? "Being prepared for shipment"
                                : "Awaiting processing"}
                            </span>
                          </div>
                          {order.trackingNumber && (
                            <div className="flex items-center">
                              <Truck className="h-4 w-4 text-primary mr-2" />
                              <span className="text-sm">Tracking #: {order.trackingNumber}</span>
                            </div>
                          )}
                        </div>
                        
                        <Button variant="outline" size="sm" className="w-full">
                          Track Order
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-montserrat font-semibold text-lg mb-2">No Upcoming Deliveries</h3>
                  <p className="text-gray-500 mb-4">You don't have any deliveries scheduled at the moment.</p>
                </div>
              )}
              
              <div className="bg-primary/5 rounded-lg p-6">
                <h3 className="font-montserrat font-semibold mb-2">Care Reminder</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Remember to prepare space for your new plants before they arrive. Make sure to check our care guides for specific plant needs.
                </p>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  View Care Guides
                </Button>
              </div>
            </div>
          )}

          {activeTab === "saved" && (
            <div className="space-y-6">
              <h1 className="font-montserrat text-2xl font-bold">Saved Plants</h1>
              
              {savedPlants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Saved plants would go here */}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-montserrat font-semibold text-lg mb-2">No Saved Plants</h3>
                  <p className="text-gray-500 mb-4">You haven't saved any plants to your wishlist yet.</p>
                  <Button className="bg-primary hover:bg-primary/90">Browse Plants</Button>
                </div>
              )}
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-6">
              <h1 className="font-montserrat text-2xl font-bold">Account Information</h1>
              
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-montserrat font-semibold mb-2">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p>{user.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email Address</p>
                          <p>{user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Username</p>
                          <p>{user.username}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Account Type</p>
                          <p className="capitalize">{user.userType}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-montserrat font-semibold mb-2">Company Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Company Name</p>
                          <p>{user.companyName || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p>{user.location || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p>{user.phoneNumber || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Member Since</p>
                          <p>{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button className="bg-primary hover:bg-primary/90 mr-4">
                        Edit Profile
                      </Button>
                      <Button variant="outline">
                        Change Password
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {user.userType === 'corporate' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">You don't have any payment methods saved.</p>
                      <Button variant="outline">Add Payment Method</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h1 className="font-montserrat text-2xl font-bold">Settings</h1>
              
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Order Updates</h3>
                        <p className="text-sm text-gray-500">Receive notifications about your order status</p>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="orderUpdates" className="mr-2" defaultChecked />
                        <label htmlFor="orderUpdates">Email</label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Care Reminders</h3>
                        <p className="text-sm text-gray-500">Get reminders about plant care schedules</p>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="careReminders" className="mr-2" defaultChecked />
                        <label htmlFor="careReminders">Email</label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Special Offers</h3>
                        <p className="text-sm text-gray-500">Be informed about promotions and discounts</p>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="specialOffers" className="mr-2" />
                        <label htmlFor="specialOffers">Email</label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justfy-start text-left" onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </Button>
                    <Button variant="destructive" className="w-full justfy-start text-left">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
