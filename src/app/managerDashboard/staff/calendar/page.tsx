
"use client";
import React, { useEffect, useState } from "react";

interface Staff {
  _id: string;
  name: string;
  role: string;
}
interface Attendance {
  _id: string;
  staff: Staff | string;
  date: string;
  state: 'present' | 'absent';
}
function getMonthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}


export default function StaffAttendanceCalendar() {

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");
  // Responsive: mobile if window width < 768
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Month and year helpers
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);
  const daysInMonth = getMonthDays(year, month);

  // Extract unique roles from staff
  const roles = React.useMemo(() => {
    const set = new Set(staff.map((s) => s.role));
    return Array.from(set);
  }, [staff]);

  // Filter staff by role
  const filteredStaff = React.useMemo(() => {
    if (roleFilter === "all") return staff;
    return staff.filter((s) => s.role === roleFilter);
  }, [staff, roleFilter]);

  // Map attendance by staffId and date string
  const attendanceMap: Record<string, Record<string, 'present' | 'absent'>> = React.useMemo(() => {
    const map: Record<string, Record<string, 'present' | 'absent'>> = {};
    for (const a of attendance) {
      const staffId = typeof a.staff === "string" ? a.staff : a.staff._id;
      if (!map[staffId]) map[staffId] = {};
      
      // Normalize date to YYYY-MM-DD format consistently
      let dateKey = a.date;
      if (dateKey.includes('T')) {
        dateKey = dateKey.split('T')[0]; // Handle ISO dates
      } else if (dateKey.length > 10) {
        dateKey = dateKey.slice(0, 10); // Handle any other long formats
      }
      
      map[staffId][dateKey] = a.state;
      
      // Debug logging
      if (typeof window !== 'undefined') {
        console.log(`Mapping attendance: Staff ${staffId}, Date ${dateKey}, State ${a.state}`);
      }
    }
    return map;
  }, [attendance]);



  // Fetch staff and attendance data
  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      fetch("/api/staff").then((res) => res.json()),
      fetch(`/api/attendance?date=${year}-${String(month + 1).padStart(2, "0")}`).then((res) => res.json()),
    ])
      .then(([staffData, attendanceData]) => {
        setStaff(staffData.staff || []);
        setAttendance(attendanceData || []);
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, [year, month]);

  // Toggle attendance (optimistic, explicit state)
  const toggleAttendance = async (staff: Staff, day: number) => {
  setActionError(null);
  setActionLoading(`${staff._id}:${day}`);
  // Always use manual YYYY-MM-DD string to match calendar rendering
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const currentState = attendanceMap[staff._id]?.[dateStr] || 'absent';
  const newState = currentState === 'present' ? 'absent' : 'present';
  
  // Debug logging
  if (typeof window !== 'undefined') {
    console.log(`Toggle attendance: Staff ${staff._id}, Date ${dateStr}, Current: ${currentState}, New: ${newState}`);
    console.log('Current attendanceMap for staff:', attendanceMap[staff._id]);
  }
  
    setAttendance((prev) => {
      const match = (a: Attendance) => {
        const staffId = typeof a.staff === "string" ? a.staff : a.staff._id;
        let attendanceDate = a.date;
        if (attendanceDate.includes('T')) {
          attendanceDate = attendanceDate.split('T')[0];
        } else if (attendanceDate.length > 10) {
          attendanceDate = attendanceDate.slice(0, 10);
        }
        return staffId === staff._id && attendanceDate === dateStr;
      };
      const idx = prev.findIndex(match);
      if (idx !== -1) {
        // Update state
        return prev.map((a, i) => i === idx ? { ...a, state: newState } : a);
      } else {
        // Add new record
        return [...prev, { _id: "optimistic", staff, date: dateStr, state: newState }];
      }
    });
    try {
      const payload = { staff: staff._id, date: dateStr, state: newState };
      if (typeof window !== 'undefined') {
    console.log('POST /api/attendance', payload);
      }
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update attendance');
      }
      
      // Don't refresh from API since it's mock data - keep optimistic update
      if (typeof window !== 'undefined') {
        console.log('Attendance updated successfully, keeping optimistic state');
      }
    } catch (err) {
      // Revert optimistic update on error
      setAttendance((prev) => {
        const match = (a: Attendance) => {
          const staffId = typeof a.staff === "string" ? a.staff : a.staff._id;
          let attendanceDate = a.date;
          if (attendanceDate.includes('T')) {
            attendanceDate = attendanceDate.split('T')[0];
          } else if (attendanceDate.length > 10) {
            attendanceDate = attendanceDate.slice(0, 10);
          }
          return staffId === staff._id && attendanceDate === dateStr;
        };
        const idx = prev.findIndex(match);
        if (idx !== -1) {
          // Revert to previous state
          return prev.map((a, i) => i === idx ? { ...a, state: currentState } : a);
        } else {
          // Remove the optimistic record
          return prev.filter((a) => {
            const staffId = typeof a.staff === "string" ? a.staff : a.staff._id;
            let attendanceDate = a.date;
            if (attendanceDate.includes('T')) {
              attendanceDate = attendanceDate.split('T')[0];
            } else if (attendanceDate.length > 10) {
              attendanceDate = attendanceDate.slice(0, 10);
            }
            return !(staffId === staff._id && attendanceDate === dateStr);
          });
        }
      });
      
      setActionError("Failed to update attendance.");
      if (typeof window !== 'undefined') {
    console.error('Attendance POST error', err);
      }
    } finally {
      setActionLoading(null);
    }
  };


  if (loading) return <div className="p-8 text-center text-lg">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600 font-semibold">{error}</div>;

  // Mobile: day-by-day
  if (isMobile) {
    const dayDate = new Date(year, month, selectedDay);
    return (
      <div className="p-4 max-w-md mx-auto bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 min-h-screen">
        {/* Beautiful Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Attendance Calendar</h1>
              <p className="text-green-100 text-sm">Track daily attendance</p>
            </div>
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between bg-white/10 rounded-xl p-3">
            <button 
              className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors" 
              onClick={() => {
                if (month === 0) {
                  setMonth(11);
                  setYear(year - 1);
                } else {
                  setMonth(month - 1);
                }
                setSelectedDay(1);
              }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div className="text-center">
              <div className="font-bold text-lg">{monthNames[month]} {year}</div>
            </div>
            <button 
              className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors" 
              onClick={() => {
                if (month === 11) {
                  setMonth(0);
                  setYear(year + 1);
                } else {
                  setMonth(month + 1);
                }
                setSelectedDay(1);
              }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Day Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <button 
              className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))} 
              disabled={selectedDay === 1}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-green-800">{selectedDay}</div>
              <div className="text-sm text-gray-600">{dayDate.toLocaleDateString(undefined, { weekday: 'long' })}</div>
              <div className="text-xs text-gray-500">{dayDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</div>
            </div>
            
            <button 
              className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={() => setSelectedDay(Math.min(daysInMonth, selectedDay + 1))} 
              disabled={selectedDay === daysInMonth}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>

          {/* Mini Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="p-2 font-semibold text-gray-500">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const isSelected = day === selectedDay;
              const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`p-2 text-xs rounded-lg transition-all ${
                    isSelected 
                      ? 'bg-green-500 text-white font-bold shadow-md' 
                      : isToday 
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-green-50'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Role Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-green-200">
          <label className="block text-sm font-bold text-green-800 mb-2">Filter by Role</label>
          <select 
            className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 outline-none text-gray-900 bg-white" 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>{r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
            ))}
          </select>
        </div>

        {/* Staff List for Selected Day */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-800">Staff Attendance</h3>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
              {filteredStaff.length} member{filteredStaff.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {filteredStaff.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-green-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <p className="text-gray-600">No staff members found for this filter</p>
            </div>
          ) : (
            filteredStaff.map((s) => {
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
              const state = attendanceMap[s._id]?.[dateKey] || 'absent';
              const present = state === 'present';
              const isLoading = actionLoading === `${s._id}:${selectedDay}`;
              
              return (
                <div key={s._id} className="bg-white rounded-2xl shadow-lg border border-green-200 p-4 hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md mr-4">
                        {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{s.name}</div>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            s.role === 'helping_hand' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {s.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      className={`ml-4 px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center ${
                        present 
                          ? "bg-green-500 text-white shadow-lg hover:bg-green-600 hover:shadow-xl" 
                          : "bg-gray-200 text-gray-700 border-2 border-gray-300 hover:bg-gray-300"
                      }`}
                      onClick={() => toggleAttendance(s, selectedDay)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : present ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Present
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          Absent
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {actionError && (
          <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-red-800 font-semibold">{actionError}</span>
            </div>
          </div>
        )}

        {/* Back to Desktop Link */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsMobile(false)}
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            Switch to Desktop View
          </button>
        </div>
      </div>
    );
  }

  // Desktop: Beautiful full month grid
  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Beautiful Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl shadow-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Monthly Attendance Overview</h1>
              <p className="text-green-100 text-lg">Track and manage staff attendance across the entire month</p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-white font-semibold">Month:</label>
                <select 
                  className="px-4 py-2 bg-white/20 border-2 border-white/30 rounded-xl text-white font-semibold focus:bg-white/30 focus:border-white/50 outline-none backdrop-blur-sm"
                  value={month} 
                  onChange={e => setMonth(Number(e.target.value))}
                >
                  {monthNames.map((m, i) => <option key={m} value={i} className="text-gray-900">{m}</option>)}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-white font-semibold">Year:</label>
                <select 
                  className="px-4 py-2 bg-white/20 border-2 border-white/30 rounded-xl text-white font-semibold focus:bg-white/30 focus:border-white/50 outline-none backdrop-blur-sm"
                  value={year} 
                  onChange={e => setYear(Number(e.target.value))}
                >
                  {years.map(y => <option key={y} value={y} className="text-gray-900">{y}</option>)}
                </select>
              </div>
            </div>
            
            <button 
              onClick={() => setIsMobile(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 border border-white/30"
            >
              Switch to Mobile View
            </button>
          </div>
        </div>

        {/* Role Filter */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-white font-semibold">Filter by Role:</label>
            <select 
              className="px-4 py-2 bg-white/20 border-2 border-white/30 rounded-xl text-white font-semibold focus:bg-white/30 focus:border-white/50 outline-none backdrop-blur-sm"
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all" className="text-gray-900">All Roles</option>
              {roles.map((r) => (
                <option key={r} value={r} className="text-gray-900">{r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
            
            <div className="bg-white/20 px-4 py-2 rounded-xl">
              <span className="text-white font-semibold">{filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {filteredStaff.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-green-200">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Staff Found</h3>
          <p className="text-gray-600">No staff members match the current filter criteria</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-200">
          {/* Enhanced Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-green-500 to-emerald-600">
                  <th className="px-6 py-4 text-left text-white font-bold sticky left-0 z-20 bg-gradient-to-r from-green-500 to-emerald-600" style={{ minWidth: "200px" }}>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Staff Member
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-white font-bold">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                      </svg>
                      Role
                    </div>
                  </th>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
                    const dayName = new Date(year, month, day).toLocaleDateString(undefined, { weekday: 'short' });
                    return (
                      <th key={i} className={`px-2 py-4 text-center text-white font-bold min-w-[60px] ${isToday ? "bg-blue-500" : ""}`}>
                        <div className="text-lg font-bold">{day}</div>
                        <div className="text-xs text-green-100">{dayName}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((s, staffIndex) => (
                  <tr key={s._id} className={`border-b border-gray-100 hover:bg-green-50 transition-colors ${staffIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <td className="px-6 py-4 font-medium sticky left-0 z-10 bg-inherit border-r border-gray-200" style={{ minWidth: "200px" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{s.name}</div>
                          <div className="text-sm text-gray-500">Staff Member</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-3 py-2 rounded-full text-sm font-semibold ${
                        s.role === 'helping_hand' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {s.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const state = attendanceMap[s._id]?.[dateKey] || 'absent';
                      const present = state === 'present';
                      const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
                      const isLoading = actionLoading === `${s._id}:${day}`;
                      
                      return (
                        <td key={i} className={`px-2 py-4 text-center ${isToday ? "bg-blue-50" : ""}`}>
                          <button
                            className={`w-12 h-12 rounded-xl font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                              present 
                                ? "bg-green-500 text-white hover:bg-green-600" 
                                : "bg-gray-200 text-gray-600 hover:bg-gray-300 border-2 border-gray-300"
                            }`}
                            onClick={() => toggleAttendance(s, day)}
                            disabled={isLoading}
                            title={`${s.name} on ${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}: ${present ? "Present" : "Absent"}`}
                          >
                            {isLoading ? (
                              <div className="w-5 h-5 mx-auto border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : present ? (
                              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                
                {/* Enhanced Summary Row */}
                <tr className="bg-gradient-to-r from-green-100 to-emerald-100 border-t-2 border-green-300">
                  <td className="px-6 py-4 font-bold text-green-800 sticky left-0 z-10 bg-gradient-to-r from-green-100 to-emerald-100">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                      Daily Totals
                    </div>
                  </td>
                  <td className="px-4 py-4 text-green-800 font-semibold">Present Count</td>
                  {filteredStaff.length > 0 && Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const presentCount = filteredStaff.reduce((acc, s) => acc + (attendanceMap[s._id]?.[dateKey] === 'present' ? 1 : 0), 0);
                    const attendanceRate = filteredStaff.length > 0 ? (presentCount / filteredStaff.length) * 100 : 0;
                    return (
                      <td key={i} className="px-2 py-4 text-center">
                        <div className="bg-white rounded-xl p-2 shadow-md border border-green-200">
                          <div className="text-lg font-bold text-green-800">{presentCount}</div>
                          <div className="text-xs text-gray-600">{attendanceRate.toFixed(0)}%</div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {actionError && (
        <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-red-800 font-semibold">{actionError}</span>
          </div>
        </div>
      )}
    </div>
  );
}
