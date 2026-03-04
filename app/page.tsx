import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  LayoutGrid,
  Sparkles,
  Kanban,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  Zap,
  Users,
  Star,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  const features = [
    {
      icon: Kanban,
      title: 'Visual Kanban Board',
      description:
        'Drag and drop tasks across To Do, In Progress, and Done columns. See your workflow at a glance.',
    },
    {
      icon: Sparkles,
      title: 'AI Task Generation',
      description:
        'Describe your goals in plain English and let AI generate a complete, prioritized task list instantly.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure by Default',
      description:
        'Row-level security ensures every project and task is isolated to your account — always.',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description:
        'Changes persist instantly. Your board stays accurate whether you switch devices or browsers.',
    },
  ]

  const steps = [
    {
      step: '01',
      title: 'Create a project',
      description: 'Give your project a name and description to get started in seconds.',
    },
    {
      step: '02',
      title: 'Generate tasks with AI',
      description:
        'Describe what you want to accomplish and AI will suggest actionable tasks with priorities.',
    },
    {
      step: '03',
      title: 'Ship faster',
      description:
        'Drag tasks through columns as you work and track progress across your entire project.',
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Senior Engineer',
      quote:
        'The AI task generation cuts my planning time in half. I just describe a feature and get a full breakdown instantly.',
    },
    {
      name: 'Marcus Rivera',
      role: 'Product Manager',
      quote:
        "Finally a kanban tool that doesn't get in the way. Clean, fast, and the AI suggestions are surprisingly on-point.",
    },
    {
      name: 'Aiko Tanaka',
      role: 'Indie Developer',
      quote:
        'I use FlowBoard-AI for all my side projects. Being able to spin up a board with AI-generated tasks is a game changer.',
    },
  ]

  const highlights = [
    'No credit card required',
    'Unlimited projects',
    'AI task suggestions',
    'Priority & due dates',
  ]

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Nav */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
            <LayoutGrid className="w-5 h-5 text-primary" />
            <span>FlowBoard-AI
</span>
          </Link>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm">Get started free</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <Badge variant="secondary" className="mb-6 text-primary border-primary/20">
          <Sparkles className="w-3 h-3 mr-1" />
          Now with AI task generation
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance mb-6 leading-tight">
          Project management
          <br />
          <span className="text-primary">powered by AI</span>
        </h1>
        <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto mb-10 leading-relaxed">
          FlowBoard-AI
 combines a clean kanban board with AI-powered task generation so you spend
          less time planning and more time building.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/auth/sign-up">
            <Button size="lg" className="gap-2 px-8">
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="px-8">
              Sign in
            </Button>
          </Link>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8">
          {highlights.map((h) => (
            <li key={h} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              {h}
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-secondary/30">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-balance">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From idea to organized board in three steps — no setup required.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map(({ step, title, description }) => (
              <div key={step} className="flex flex-col items-start gap-3">
                <span className="text-4xl font-extrabold text-primary/20 leading-none">
                  {step}
                </span>
                <h3 className="font-semibold text-foreground text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-balance">
            Everything you need
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A focused set of tools designed to keep you moving — nothing you don&apos;t need.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-card border border-border rounded-xl p-5 space-y-3 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border bg-secondary/30">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-balance">
              Loved by builders
            </h2>
            <p className="text-muted-foreground">
              Join developers and PMs who use FlowBoard-AI
 to ship faster.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, quote }) => (
              <div
                key={name}
                className="bg-card border border-border rounded-xl p-6 space-y-4"
              >
                <p className="text-sm text-foreground leading-relaxed">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">
            Ready to get organized?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Create your account in seconds and start managing your projects with AI today.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="mt-2 gap-2">
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <LayoutGrid className="w-4 h-4 text-primary" />
            FlowBoard-AI

          </span>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/auth/sign-up" className="hover:text-foreground transition-colors">
              Sign up
            </Link>
            <Link href="/auth/login" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
            <span>Built with Next.js &amp; Supabase</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
