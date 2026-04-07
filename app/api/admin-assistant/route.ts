import { appendAttendanceRows } from "@/lib/googleSheets";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const body = await req.json();
  const message = body.message?.toLowerCase() || "";

  console.log("ADMIN ASSISTANT BODY:", body);
  console.log("ADMIN ASSISTANT MESSAGE:", message);

  if (message.includes("export attendance")) {
    const { data: attendance, error } = await supabase
      .from("attendance")
      .select("*");

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return Response.json({ reply: "Failed to fetch attendance" });
    }

    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .select("*");

    if (employeesError) {
      console.error("EMPLOYEES ERROR:", employeesError);
      return Response.json({ reply: "Failed to fetch employees" });
    }

    console.log("ATTENDANCE:", attendance);
    console.log("EMPLOYEES:", employees);

    const rows = (attendance || []).map((a: any) => {
      const emp = (employees || []).find((e: any) => e.id === a.employee_id);

      return [
        emp?.full_name || "Unknown",
        a.status,
        a.attendance_date,
      ];
    });

    console.log("ROWS SENT TO GOOGLE:", rows);

    await appendAttendanceRows(rows);

    return Response.json({
      reply: "✅ Attendance successfully exported to Google Sheets.",
    });
  }

  return Response.json({
    reply: "I can help with attendance, bookings, and more.",
  });
}