import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4 max-w-sm">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold">Authentication error</h2>
        <p className="text-muted-foreground text-sm">
          Something went wrong during authentication. Your link may have expired.
        </p>
        <Link href="/auth/login">
          <Button className="w-full">Back to sign in</Button>
        </Link>
      </div>
    </div>
  )
}
