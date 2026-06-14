import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Default to only tasks for the current user unless specifically requesting all tasks (and is admin)
    const filterUserId = userId === 'all' && session.user.role === 'ADMIN' ? undefined : (userId || session.user.id);

    const tasks = await db.task.findMany({
      where: filterUserId ? {
        assigneeId: filterUserId
      } : undefined,
      include: {
        competition: {
          select: {
            id: true,
            name: true,
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("[TASKS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
