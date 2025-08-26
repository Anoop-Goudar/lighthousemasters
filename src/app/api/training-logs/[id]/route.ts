import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { UpdateTrainingLogSchema } from "@/models/TrainingLog";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid training log ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    const trainingLog = await db.collection("trainingLogs").findOne({ _id: new ObjectId(id) });
    
    if (!trainingLog) {
      return NextResponse.json(
        { error: "Training log not found" },
        { status: 404 }
      );
    }
    
    const canAccess = session.user.role === "admin" || 
                     trainingLog.coachId === session.user.id || 
                     trainingLog.userId === session.user.id;
    
    if (!canAccess) {
      return NextResponse.json(
        { error: "Unauthorized - Cannot access this training log" },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ trainingLog });
  } catch (error) {
    console.error("Error fetching training log:", error);
    return NextResponse.json(
      { error: "Failed to fetch training log" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid training log ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    const existingLog = await db.collection("trainingLogs").findOne({ _id: new ObjectId(id) });
    
    if (!existingLog) {
      return NextResponse.json(
        { error: "Training log not found" },
        { status: 404 }
      );
    }
    
    const canUpdate = session.user.role === "admin" || 
                     existingLog.coachId === session.user.id;
    
    if (!canUpdate) {
      return NextResponse.json(
        { error: "Unauthorized - Cannot update this training log" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateTrainingLogSchema.parse(body);
    
    const updateData = {
      ...validatedData,
      updatedAt: new Date(),
    };
    
    await db.collection("trainingLogs").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return NextResponse.json({ message: "Training log updated successfully" });
  } catch (error) {
    console.error("Error updating training log:", error);
    return NextResponse.json(
      { error: "Failed to update training log" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid training log ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection("trainingLogs").deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Training log not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: "Training log deleted successfully" });
  } catch (error) {
    console.error("Error deleting training log:", error);
    return NextResponse.json(
      { error: "Failed to delete training log" },
      { status: 500 }
    );
  }
}
