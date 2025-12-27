import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { memberService, attendanceService, alertService, gymService } from '../services/apiService';
import { Users, UserCheck, UserX, AlertCircle, TrendingUp, X, CheckCircle, XCircle, Building2, CheckCircle2, XCircle as XCircleIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const navigate = useNavigate();

  // Super Admin queries gyms
  const { data: gymsData } = useQuery({
    queryKey: ['gyms'],
    queryFn: gymService.getAll,
    enabled: user?.role === 'superadmin',
  });

  // Super Admin system analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['systemAnalytics'],
    queryFn: gymService.getSystemAnalytics,
    enabled: user?.role === 'superadmin',
  });

  // Gym-level queries (disabled for Super Admin)
  const { data: memberStats } = useQuery({
    queryKey: ['memberStats'],
    queryFn: memberService.getStats,
    enabled: user?.role !== 'superadmin',
  });

  // Fetch current gym details for gym-level users
  const { data: myGymData } = useQuery({
    queryKey: ['myGym'],
    queryFn: () => gymService.getMyGym(),
    enabled: user?.role !== 'superadmin',
  });

  const { data: todayStats } = useQuery({
    queryKey: ['todayStats'],
    queryFn: attendanceService.getTodayStats,
    enabled: user?.role !== 'superadmin',
  });

  const { data: alertsData, refetch: refetchAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertService.getAll({ limit: 10, isRead: false }),
    enabled: user?.role !== 'superadmin',
  });

  // Query denied attendance records for today's Access Denied modal
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { data: deniedRecordsData, isLoading: deniedLoading } = useQuery({
    queryKey: ['deniedToday'],
    queryFn: () => attendanceService.getAll({ accessGranted: false, startDate: todayStr, endDate: todayStr, limit: 10 }),
    enabled: showDetailsModal && selectedStat?.title === "Today's Access Denied",
  });
  // Query today's Access Denied alerts (for messages view)
  const { data: deniedAlertsData, isLoading: deniedAlertsLoading, refetch: refetchDeniedAlerts } = useQuery({
    queryKey: ['deniedAlertsToday'],
    queryFn: () => alertService.getAll({ title: 'Access Denied', startDate: todayStr, endDate: todayStr, limit: 20 }),
    enabled: showDetailsModal && selectedStat?.title === "Today's Access Denied",
  });

  useEffect(() => {
    if (alertsData?.data?.alerts) {
      setAlerts(alertsData.data.alerts);
    }
  }, [alertsData]);

  const stats = [
    {
      name: 'Total Members',
      value: memberStats?.data?.stats?.totalMembers || 0,
      icon: Users,
      color: 'bg-blue-500',
      clickable: true,
      action: () => navigate('/members'),
    },
    {
      name: 'Active Members',
      value: memberStats?.data?.stats?.activeMembers || 0,
      icon: UserCheck,
      color: 'bg-green-500',
      clickable: true,
      action: () => navigate('/members?status=active'),
    },
    {
      name: "Today's Check-ins",
      value: (todayStats?.data?.stats?.totalCheckIns || 0) + (todayStats?.data?.stats?.deniedAccess || 0),
      icon: TrendingUp,
      color: 'bg-purple-500',
      clickable: true,
      action: () => {
        const granted = todayStats?.data?.stats?.totalCheckIns || 0;
        const denied = todayStats?.data?.stats?.deniedAccess || 0;
        const total = granted + denied;
        
        setSelectedStat({
          title: "Today's Check-ins",
          total: total,
          granted: granted,
          denied: denied,
        });
        setShowDetailsModal(true);
      },
    },
    {
      name: "Today's Access Denied",
      value: todayStats?.data?.stats?.deniedAccess || 0,
      icon: UserX,
      color: 'bg-red-500',
      clickable: true,
      action: () => {
        const denied = todayStats?.data?.stats?.deniedAccess || 0;
        setSelectedStat({
          title: "Today's Access Denied",
          total: denied,
          denied: denied,
        });
        setShowDetailsModal(true);
      },
    },
  ];

  const handleMarkAsRead = async (alertId) => {
    try {
      await alertService.markAsRead(alertId);
      refetchAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  // Super Admin Dashboard - System-wide view
  if (user?.role === 'superadmin') {
    const gyms = gymsData?.data?.gyms || [];
    const analytics = analyticsData?.data?.stats || {};
    
    const totalGyms = analytics.gyms?.total || gyms.length;
    const activeGyms = analytics.gyms?.active || gyms.filter(g => g.isActive).length;
    const blockedGyms = analytics.gyms?.blocked || gyms.filter(g => !g.isActive).length;
    const totalMembers = analytics.members?.total || 0;
    const activeMembers = analytics.members?.active || 0;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">System Dashboard</h2>
          <p className="text-gray-600 mt-1">Super Admin - Multi-Gym Management System</p>
        </div>

        {/* System Stats Grid (mobile: 2 columns) */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card cursor-pointer hover:shadow-lg transition-shadow p-4 touch-pan-y" onClick={() => navigate('/gyms')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Clubs</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{totalGyms}</p>
                <p className="text-xs text-gray-500 mt-1">Click to manage</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="card cursor-pointer hover:shadow-lg transition-shadow p-4 touch-pan-y" onClick={() => navigate('/gyms?status=active')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Clubs</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{activeGyms}</p>
                <p className="text-xs text-gray-500 mt-1">Operating normally</p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="card cursor-pointer hover:shadow-lg transition-shadow p-4 touch-pan-y" onClick={() => navigate('/gyms?status=blocked')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Blocked Clubs</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{blockedGyms}</p>
                <p className="text-xs text-gray-500 mt-1">Suspended access</p>
              </div>
              <div className="bg-red-500 p-3 rounded-lg">
                <XCircleIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Members</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{totalMembers}</p>
                <p className="text-xs text-green-600 mt-1">{activeMembers} active</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity removed for Super Admin */}

        {/* Gyms List */}
          <div className="card p-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">All Clubs</h3>
          <div className="space-y-3">
            {gyms.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No clubs found</p>
            ) : (
              gyms.map((gym) => (
                <div
                  key={gym._id}
                  className={`rounded-lg border ${
                    !gym.isActive ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                  } hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => navigate('/gyms')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Building2 className={`w-6 h-6 ${!gym.isActive ? 'text-red-600' : 'text-blue-600'}`} />
                        <div>
                          <h4 className="font-semibold text-gray-800">{gym.name}</h4>
                          <p className="text-sm text-gray-600">{gym.address?.city || 'No location'}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center space-x-2"><Users className="w-4 h-4" /> <span>{gym.memberCount ?? 0} members</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          !gym.isActive
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {!gym.isActive ? 'Blocked' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Gym-level Dashboard (Gym Owner, Staff, Trainer)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600 mt-1">{myGymData?.data?.gym?.name ? `${myGymData.data.gym.name} — Welcome to your FitHub Management System` : 'Welcome to your FitHub Management System'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className={`card ${stat.clickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
              onClick={stat.action}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {stat.value}
                  </p>
                  {stat.clickable && (
                    <p className="text-xs text-gray-500 mt-1">Click for details</p>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Recent Alerts</h3>
            <button
              onClick={() => alertService.markAllAsRead().then(refetchAlerts)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Mark all as read
            </button>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert._id}
                className="flex items-start justify-between p-4 bg-red-50 rounded-lg border border-red-100"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-gray-800">{alert.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alert.priority === 'high' || alert.priority === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(alert.createdAt), 'PPp')}
                  </p>
                </div>
                <button
                  onClick={() => handleMarkAsRead(alert._id)}
                  className="text-sm text-primary-600 hover:text-primary-700 ml-4"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Today's Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Check-ins</span>
              <span className="font-semibold text-gray-800">
                {todayStats?.data?.stats?.totalCheckIns || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Access Denied</span>
              <span className="font-semibold text-red-600">
                {todayStats?.data?.stats?.deniedAccess || 0}
              </span>
            </div>
            {/* 'Currently in Club' removed for single-scan clubs */}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Membership Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Memberships</span>
              <span className="font-semibold text-green-600">
                {memberStats?.data?.stats?.activeMembers || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expired Memberships</span>
              <span className="font-semibold text-red-600">
                {memberStats?.data?.stats?.expiredMembers || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expiring Soon (7 days)</span>
              <span className="font-semibold text-yellow-600">
                {memberStats?.data?.stats?.expiringMembers || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedStat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">{selectedStat.title}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Total Scans</span>
                  <span className="text-2xl font-bold text-gray-800">{selectedStat.total}</span>
                </div>
              </div>

              {selectedStat.title !== "Today's Access Denied" && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-600">Access Granted</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{selectedStat.granted || 0}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedStat.total > 0 
                      ? `${Math.round(((selectedStat.granted || 0) / selectedStat.total) * 100)}%` 
                      : '0%'}
                  </div>
                </div>
              )}

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-gray-600">Access Denied</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{selectedStat.denied || 0}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {selectedStat.total > 0 
                    ? `${Math.round(((selectedStat.denied || 0) / selectedStat.total) * 100)}%` 
                    : '0%'}
                </div>
              </div>

              {/* If this modal is the Access Denied modal, show recent denied records */}
              {selectedStat.title === "Today's Access Denied" && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Today's Access Denied Messages</h4>
                  {deniedAlertsLoading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {(deniedAlertsData?.data?.alerts || []).length === 0 ? (
                        <div className="text-sm text-gray-500">No access denied messages for today</div>
                      ) : (
                        (deniedAlertsData.data.alerts || []).map((a) => (
                          <div key={a._id} className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <AlertCircle className="w-5 h-5 text-red-600" />
                                  <h4 className="font-semibold text-gray-800">{a.title}</h4>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    a.priority === 'high' || a.priority === 'critical'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>{a.priority}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">{a.message}</p>
                                <p className="text-xs text-gray-500 mt-2">{format(new Date(a.createdAt), 'PPp')}</p>
                              </div>
                              <div className="ml-4">
                                <button
                                  onClick={async () => { await alertService.markAsRead(a._id); refetchDeniedAlerts(); refetchAlerts(); }}
                                  className="text-sm text-primary-600 hover:text-primary-700"
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex space-x-3">
              {selectedStat.title === "Today's Access Denied" ? (
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-primary flex-1"
                >
                  Close
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      navigate('/attendance?accessGranted=true');
                    }}
                    className="btn-primary flex-1"
                  >
                    View Granted
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      navigate('/attendance?accessGranted=false');
                    }}
                    className="btn-secondary flex-1"
                  >
                    View Denied
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
