import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    const mockNotifications = [
      {
        userId: session.user.id,
        type: "booking_confirmation",
        title: "Booking Confirmed",
        message: "Your booking for Tennis Court 1 on Dec 15, 2024 at 2:00 PM has been confirmed.",
        status: "unread",
        actionUrl: "/bookings",
        metadata: {
          facilityName: "Tennis Court 1",
          bookingDate: "2024-12-15",
          bookingTime: "14:00"
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: session.user.id,
        type: "training_scheduled",
        title: "Training Session Scheduled",
        message: "Your swimming training session with Coach Sarah is scheduled for tomorrow at 10:00 AM.",
        status: "unread",
        actionUrl: "/training",
        metadata: {
          coachName: "Coach Sarah",
          activityType: "Swimming",
          sessionDate: "2024-12-16"
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        userId: session.user.id,
        type: "payment_due",
        title: "Payment Reminder",
        message: "Your monthly membership payment of $89 is due in 3 days.",
        status: "read",
        actionUrl: "/payments",
        metadata: {
          amount: 89,
          dueDate: "2024-12-18"
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        userId: session.user.id,
        type: "system_announcement",
        title: "System Maintenance",
        message: "Scheduled maintenance on Dec 20th from 2:00 AM to 4:00 AM. Some features may be unavailable.",
        status: "unread",
        metadata: {
          maintenanceStart: "2024-12-20T02:00:00Z",
          maintenanceEnd: "2024-12-20T04:00:00Z"
        },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      }
    ];

    await db.collection("notifications").insertMany(mockNotifications);
    
    return NextResponse.json({ 
      message: "Mock notifications created successfully",
      count: mockNotifications.length 
    });
  } catch (error) {
    console.error("Error creating mock notifications:", error);
    return NextResponse.json(
      { error: "Failed to create mock notifications" },
      { status: 500 }
    );
  }
}
