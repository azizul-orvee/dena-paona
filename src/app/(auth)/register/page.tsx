import { redirect } from "next/navigation";

/** Sign-up and sign-in are one passwordless flow now. Kept for old links. */
export default function RegisterPage() {
  redirect("/login");
}
