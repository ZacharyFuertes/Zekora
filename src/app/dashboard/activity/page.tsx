import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getActivityEvents } from "@/lib/supabase/models"
import { ActivityList } from "@/components/dashboard/activity-list"

export default async function ActivityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return <ActivityList events={await getActivityEvents(user.id)} />
}
