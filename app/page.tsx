import Link from 'next/link';
import { ArrowRight, Shield, Lock, Mail, Users, Code, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AuthFlow
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
            <Zap className="h-4 w-4 mr-2" />
            Production-Ready Authentication
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Beautiful Authentication
            <br />
            Made Simple
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            A modern, secure, and customizable authentication boilerplate built with Next.js. 
            Everything you need to get started with user authentication in your applications.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Try Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signin">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In Demo
              </Button>
            </Link>
          </div>

          {/* Demo Preview */}
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 blur-3xl opacity-20 rounded-3xl"></div>
            <Card className="relative backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Lock className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Secure</h3>
                    <p className="text-sm text-gray-600 mt-1">Best practices</p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Social Auth</h3>
                    <p className="text-sm text-gray-600 mt-1">Multiple providers</p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Email Verify</h3>
                    <p className="text-sm text-gray-600 mt-1">Built-in flows</p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Code className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">TypeScript</h3>
                    <p className="text-sm text-gray-600 mt-1">Fully typed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A complete authentication system with modern UI components and secure backend integration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Secure by Default',
                description: 'Built with security best practices including password hashing, JWT tokens, and CSRF protection.',
                color: 'blue'
              },
              {
                icon: Mail,
                title: 'Email Verification',
                description: 'Complete email verification flow with customizable templates and secure token handling.',
                color: 'green'
              },
              {
                icon: Lock,
                title: 'Password Reset',
                description: 'Secure password reset functionality with time-limited tokens and email notifications.',
                color: 'purple'
              },
              {
                icon: Users,
                title: 'User Management',
                description: 'Complete user profile management with avatar uploads and account settings.',
                color: 'orange'
              },
              {
                icon: Code,
                title: 'Developer Ready',
                description: 'Built with TypeScript, proper error handling, and comprehensive documentation.',
                color: 'red'
              },
              {
                icon: Zap,
                title: 'Fast Setup',
                description: 'Get up and running in minutes with our easy setup guide and configuration.',
                color: 'yellow'
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className={`h-12 w-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Try our demo to see all authentication flows in action, or dive right into the code.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signin">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AuthFlow
            </span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <Link href="/signin" className="hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-blue-600 transition-colors">
              Sign Up
            </Link>
            <Link href="/forgot-password" className="hover:text-blue-600 transition-colors">
              Reset Password
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}