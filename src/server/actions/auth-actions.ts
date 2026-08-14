"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data: signUpData, error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // With email confirmation enabled Supabase creates the user but does not
  // create a session yet. Do not try to provision the Prisma row or redirect
  // to a protected page until the confirmation link has been used.
  if (!signUpData.session) {
    return {
      message: "If this email is new, check your inbox to confirm the account. If you already registered, use Sign in instead.",
    };
  }

  if (signUpData.user) {
    // Prisma's User.id must mirror the Supabase auth uid; provision it here
    // so relations (progress, flashcards, etc.) have a row to attach to.
    try {
      await prisma.user.upsert({
        where: { id: signUpData.user.id },
        update: { email: signUpData.user.email ?? data.email },
        create: {
          id: signUpData.user.id,
          email: signUpData.user.email ?? data.email,
        },
      });
    } catch (provisionError) {
      console.error("Failed to provision the application user after signup", provisionError);
      if (
        provisionError &&
        typeof provisionError === "object" &&
        "code" in provisionError &&
        provisionError.code === "P2002"
      ) {
        return { error: "This email is already registered. Please use Sign in instead." };
      }
      return { error: "Your account was created, but setup is incomplete. Please try signing in again." };
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
