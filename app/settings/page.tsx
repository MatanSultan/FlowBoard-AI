import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNavbar } from '@/components/app-navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Full name</p>
                <p className="text-sm font-medium text-foreground">
                  {user.user_metadata?.full_name ?? 'Not set'}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Email address</p>
                  <p className="text-sm font-medium text-foreground">{user.email}</p>
                </div>
                {user.email_confirmed_at && (
                  <Badge variant="secondary" className="text-xs text-primary">Verified</Badge>
                )}
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Member since</p>
                <p className="text-sm font-medium text-foreground">
                  {user.created_at
                    ? format(new Date(user.created_at), 'MMMM d, yyyy')
                    : 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
