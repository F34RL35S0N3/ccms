import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;

    const competition = await db.competition.findUnique({
      where: {
        id: resolvedParams.id
      },
      include: {
        stages: {
          orderBy: {
            order: 'asc'
          }
        },
        timeline: {
          orderBy: {
            date: 'asc'
          }
        },
        tasks: {
          include: {
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
            createdAt: 'desc'
          }
        },
        deadlines: {
          orderBy: {
            date: 'asc'
          }
        },
        documents: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                skills: true,
              }
            }
          }
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
      }
    });

    if (!competition) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(competition);
  } catch (error) {
    console.error("[COMPETITION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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
    
    // Check if user is part of the competition
    const isMember = await db.teamMember.findUnique({
      where: {
        competitionId_userId: {
          competitionId: resolvedParams.id,
          userId: session.user.id
        }
      }
    });

    if (!isMember && session.user.role !== 'ADMIN') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const {
      name,
      organizer,
      website,
      level,
      category,
      description,
      prizePool,
      certificate,
      funding,
      incubation,
      startDate,
      endDate,
      status
    } = body;

    const competition = await db.competition.update({
      where: {
        id: resolvedParams.id,
      },
      data: {
        name,
        organizer,
        website,
        level,
        category,
        description,
        prizePool,
        certificate,
        funding,
        incubation,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status
      },
      include: {
        stages: true,
        timeline: true,
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true, image: true } }
          }
        },
        deadlines: true,
        documents: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
        teamMembers: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true, skills: true } }
          }
        },
        activities: true,
      }
    });

    return NextResponse.json(competition);
  } catch (error) {
    console.error("[COMPETITION_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;

    // Only leader or admin can delete
    const membership = await db.teamMember.findUnique({
      where: {
        competitionId_userId: {
          competitionId: resolvedParams.id,
          userId: session.user.id
        }
      }
    });

    if (session.user.role !== 'ADMIN' && membership?.role !== 'LEADER') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await db.competition.delete({
      where: {
        id: resolvedParams.id
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[COMPETITION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
