import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!["coach", "admin"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized - Coach or Admin access required" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    const users = await db.collection("users")
      .find({}, { projection: { _id: 1, name: 1, email: 1, role: 1 } })
      .toArray();
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
