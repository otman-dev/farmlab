
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
  const [isMobile] = useState(false);

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
      map[staffId][a.date.slice(0, 10)] = a.state;
    }
    return map;
  }, [attendance]);



  // Fetch staff and attendance data
  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      fetch("/api/dashboard/staff").then((res) => res.json()),
      fetch(`/api/dashboard/attendance?date=${year}-${String(month + 1).padStart(2, "0")}`).then((res) => res.json()),
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
    setAttendance((prev) => {
      const match = (a: Attendance) => {
        const staffId = typeof a.staff === "string" ? a.staff : a.staff._id;
        return staffId === staff._id && a.date.slice(0, 10) === dateStr;
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
    console.log('POST /api/dashboard/attendance', payload);
      }
      await fetch("/api/dashboard/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // Refresh attendance for the month
      fetch(`/api/dashboard/attendance?date=${year}-${String(month + 1).padStart(2, "0")}`)
        .then((res) => res.json())
        .then((data) => setAttendance(data))
        .catch(() => setError("Failed to load data"));
    } catch (err) {
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
      <div className="p-2 max-w-md mx-auto">
        {/* Month/year navigation */}
        <div className="flex items-center justify-between mb-2">
          <button className="text-xl px-2 py-1" onClick={() => setMonth((m) => (m === 0 ? 11 : m - 1))}>&#8592; Month</button>
          <span className="font-semibold">{monthNames[month]} {year}</span>
          <button className="text-xl px-2 py-1" onClick={() => setMonth((m) => (m === 11 ? 0 : m + 1))}>Month &#8594;</button>
        </div>
        <div className="flex items-center justify-between mb-4">
          <button className="text-2xl px-2 py-1" onClick={() => setSelectedDay((d) => Math.max(1, d - 1))} disabled={selectedDay === 1}>&#8592;</button>
          <div className="font-bold text-lg text-center flex-1">Attendance<br />{dayDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div>
          <button className="text-2xl px-2 py-1" onClick={() => setSelectedDay((d) => Math.min(daysInMonth, d + 1))} disabled={selectedDay === daysInMonth}>&#8594;</button>
        </div>
        {filteredStaff.length === 0 ? (
          <div className="text-center text-black py-8">No staff found.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredStaff.map((s) => {
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
              const state = attendanceMap[s._id]?.[dateKey] || 'absent';
              const present = state === 'present';
              return (
                <div key={s._id} className="flex items-center justify-between w-full px-4 py-3 rounded-lg shadow text-lg font-semibold border-2 bg-white border-gray-300">
                  <span className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 text-blue-800 font-bold text-base shadow-sm">
                      {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                    <span className="text-black">{s.name}</span>
                  </span>
                  <button
                    className={`ml-2 px-4 py-2 rounded font-bold flex items-center gap-2 ${present ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 border border-gray-400"}`}
                    onClick={() => toggleAttendance(s, selectedDay)}
                    disabled={actionLoading === `${s._id}:${selectedDay}`}
                  >
                    {actionLoading === `${s._id}:${selectedDay}` ? (
                      <span className="w-4 h-4 border-2 border-t-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                    ) : present ? "Mark Absent" : "Mark Present"}
                  </button>
                  {state === 'absent' && <span className="ml-2 text-xs text-black">Absent (default)</span>}
                </div>
              );
            })}
          </div>
        )}
        {actionError && <div className="text-red-600 font-semibold mt-2">{actionError}</div>}
      </div>
    );
  }

  // Desktop: full month grid
  return (
    <div className="max-w-full overflow-x-auto">
      <div className="mb-4 flex flex-wrap gap-2 items-center text-black">
        <span className="font-bold text-lg mr-4">Attendance Management</span>
        <label className="font-semibold">Filter by role:</label>
        <select className="border rounded px-2 py-1 text-black" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <span className="ml-4">Month:</span>
        <select className="border rounded px-2 py-1 text-black" value={month} onChange={e => setMonth(Number(e.target.value))}>
          {monthNames.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
        <span>Year:</span>
        <select className="border rounded px-2 py-1 text-black" value={year} onChange={e => setYear(Number(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {filteredStaff.length === 0 ? (
  <div className="text-center text-black py-8">No staff found.</div>
      ) : (
        <table className="min-w-max w-full border-collapse bg-white rounded-lg shadow overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-black">
              <th className="px-2 py-1 text-left sticky left-0 z-20 bg-gray-100 text-black" style={{ minWidth: "160px" }}>Staff</th>
              <th className="px-2 py-1 text-left text-black">Role</th>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const isToday = year === today.getFullYear() && month === today.getMonth() && i + 1 === today.getDate();
                return (
                  <th key={i} className={`px-1 py-1 text-center text-xs font-semibold text-black ${isToday ? "bg-blue-200 text-blue-900" : ""}`}>{i + 1}</th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((s) => (
              <tr key={s._id} className="border-b hover:bg-blue-50">
                <td className="px-2 py-1 font-medium sticky left-0 z-10 bg-white flex items-center gap-2" style={{ minWidth: "160px" }}>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 text-blue-800 font-bold text-base shadow-sm">
                    {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-black">{s.name}</span>
                </td>
                <td className="px-2 py-1">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${s.role === "Helping Hand" ? "bg-green-200 text-green-800" : s.role === "Cleaner" ? "bg-yellow-200 text-yellow-800" : "bg-blue-200 text-blue-800"}`}>
                    {s.role}
                  </span>
                </td>
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const state = attendanceMap[s._id]?.[dateKey] || 'absent';
                  const present = state === 'present';
                  const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
                  return (
                    <td key={i} className={`px-1 py-1 text-center ${isToday ? "bg-blue-100" : ""}`}>
                      <button
                        className={`w-full px-2 py-1 rounded font-bold text-xs flex items-center gap-1 ${present ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 border border-gray-400"}`}
                        onClick={() => toggleAttendance(s, day)}
                        disabled={actionLoading === `${s._id}:${day}`}
                        title={`${s.name} on ${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}: ${present ? "Present" : "Absent (default)"}`}
                      >
                        {actionLoading === `${s._id}:${day}` ? (
                          <span className="w-3 h-3 border-2 border-t-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                        ) : present ? "✔" : ""}
                      </button>
                      {state === 'absent' && <div className="text-[10px] text-black">-</div>}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Summary row */}
            <tr className="bg-blue-50 font-semibold">
              <td className="px-2 py-1 text-black">Total Present</td>
              <td className="px-2 py-1 text-black"></td>
              {filteredStaff.length > 0 && Array.from({ length: daysInMonth }, (_, i) => {
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
                const presentCount = filteredStaff.reduce((acc, s) => acc + (attendanceMap[s._id]?.[dateKey] === 'present' ? 1 : 0), 0);
                return (
                  <td key={i} className="px-2 py-1 text-center text-black font-bold bg-blue-100">{presentCount || ''}</td>
                );
              })}
            </tr>
          </tbody>
        </table>
      )}
      {actionError && <div className="text-red-600 font-semibold mt-2">{actionError}</div>}
    </div>
  );
}
