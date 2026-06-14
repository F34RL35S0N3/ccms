import { getUsers } from "@/app/actions/user";
import TeamClient from "./team-client";
import { User } from "@prisma/client";
import { mockUsers } from "@/lib/mock-data";

export default async function TeamPage() {
  const result = await getUsers();
  const initialUsers: User[] = result.success && result.data && (result.data as any[]).length > 0 
    ? (result.data as User[]) 
    : (mockUsers as any[]);

  return <TeamClient initialUsers={initialUsers} />;
}
