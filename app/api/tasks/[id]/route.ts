import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PUT(
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

    const task = await db.task.update({
      where: {
        id: resolvedParams.id,
      },
      data: {
        title,
        description,
        status,
        priority,
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
    console.error("[TASK_GLOBAL_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
