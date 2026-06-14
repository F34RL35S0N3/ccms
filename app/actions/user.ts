"use server";

import { revalidatePath } from "next/cache";
import { db as prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: users };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return { success: false, error: "Gagal mengambil data pengguna." };
  }
}

export type CreateUserInput = {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  nim?: string;
  faculty?: string;
  skills: string[];
};

export async function createUser(data: CreateUserInput) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { success: false, error: "Email sudah digunakan." };
    }

    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null;

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        nim: data.nim || null,
        faculty: data.faculty || null,
        skills: data.skills,
      } as any,
    });

    revalidatePath("/team");
    return { success: true, data: newUser };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { success: false, error: "Gagal membuat pengguna baru." };
  }
}

export type UpdateUserInput = Partial<CreateUserInput>;

export async function updateUser(id: string, data: UpdateUserInput) {
  try {
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== id) {
        return { success: false, error: "Email sudah digunakan oleh pengguna lain." };
      }
    }

    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/team");
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { success: false, error: "Gagal memperbarui pengguna." };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/team");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { success: false, error: "Gagal menghapus pengguna." };
  }
}
