import { getUsers } from "@/app/actions/user";
import TeamClient from "./team-client";
import { User } from "@prisma/client";
export default async function TeamPage() {
  const result = await getUsers();
  const initialUsers: User[] = result.success && result.data ? (result.data as User[]) : [];

  return <TeamClient initialUsers={initialUsers} />;
}
