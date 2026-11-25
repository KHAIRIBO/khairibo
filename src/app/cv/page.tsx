import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Digital CV",
  description:
    "Explore Khairi Bouzakher's education, skills, projects, activities, and languages.",
};

export default function CVPage() {
  redirect("/#cv");
}
