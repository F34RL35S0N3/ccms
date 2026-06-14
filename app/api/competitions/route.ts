import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const competitions = await db.competition.findMany({
      include: {
        stages: true,
        timeline: true,
        tasks: true,
        deadlines: true,
        documents: true,
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
        activities: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(competitions);
  } catch (error) {
    console.error("[COMPETITIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
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
      endDate
    } = body;

    if (!name || !organizer || !level || !category) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const competition = await db.competition.create({
      data: {
        name,
        organizer,
        website,
        level,
        category,
        description,
        prizePool,
        certificate: certificate || false,
        funding: funding || false,
        incubation: incubation || false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        teamMembers: {
          create: {
            userId: session.user.id,
            role: "LEADER"
          }
        }
      },
      include: {
        stages: true,
        timeline: true,
        tasks: true,
        deadlines: true,
        documents: true,
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
        activities: true,
      }
    });

    return NextResponse.json(competition);
  } catch (error) {
    console.error("[COMPETITIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
