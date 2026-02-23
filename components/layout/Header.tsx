import { auth } from "@/auth"
import { logoutUser } from "@/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckSquare, LogOut } from "lucide-react"
import Link from "next/link"

export async function Header() {
  const session = await auth()
  const user = session?.user

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0] ?? "U").toUpperCase()

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-background px-4 md:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <CheckSquare className="h-5 w-5 text-primary" />
        <span className="hidden sm:inline">TaskManager</span>
      </Link>

      <div className="ml-auto flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm md:inline">{user?.name ?? user?.email}</span>
        <form action={logoutUser}>
          <Button variant="ghost" size="icon" type="submit" title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  )
}
