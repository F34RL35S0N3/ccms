import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const resolvedParams = await params;

    const {
      title,
      description,
      status,
      priority,
      assigneeId,
      dueDate
    } = body;

    if (!title) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const task = await db.task.create({
      data: {
        competitionId: resolvedParams.id,
        title,
        description,
        status: status || "BACKLOG",
        priority: priority || "MEDIUM",
        assigneeId,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASK_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
