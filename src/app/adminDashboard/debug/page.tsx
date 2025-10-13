import RoleDebugger from "@/components/admin/RoleDebugger";

export default function AdminDebugPage() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Debug Tools</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">User Role Debugger</h2>
        <p className="mb-4">
          This tool helps diagnose and fix role inconsistencies between the session, JWT token, and database.
          It&apos;s especially useful for fixing OAuth user role issues.
        </p>
        
        <RoleDebugger />
      </div>
    </div>
  );
}