import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-slate-900 dark:bg-tech-surface overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-hero-glow" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-400 text-sm font-mono mb-6">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              <span>ishub ~ v1.0.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-white">
              Learn.<span className="text-primary-400"> Build.</span> Innovate.
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl leading-relaxed">
              IS Hub Academy is the training platform for Haramaya University&apos;s
              Information System Hub. Build real skills in Cybersecurity, Development,
              Networking, and Creative Works.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="shadow-lg shadow-primary-500/25">
                  $ get-started
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="ghost" className="text-slate-300 border border-slate-700 hover:bg-slate-800 hover:border-slate-600">
                  $ login
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white text-center mb-4">
          Explore Our Categories
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-12 max-w-xl mx-auto">
          Choose a learning track that matches your interests and career goals.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Cybersecurity', desc: 'Network security, ethical hacking, cryptography, and security operations.', color: 'bg-red-500' },
            { title: 'Development', desc: 'Software engineering, web development, mobile apps, and DevOps.', color: 'bg-blue-500' },
            { title: 'Networking', desc: 'Network administration, routing, switching, and cloud infrastructure.', color: 'bg-green-500' },
            { title: 'Creative Works', desc: 'Graphic design, video editing, UI/UX, and digital content creation.', color: 'bg-purple-500' },
          ].map((cat) => (
            <div key={cat.title} className="card-tech rounded-tech p-6 group cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                <span className="font-mono text-xs text-slate-400 dark:text-slate-500">~/category/</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                {cat.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 dark:bg-tech-card/50 border-y border-slate-200 dark:border-tech-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white text-center mb-4 font-mono">
            <span className="text-primary-500">&gt;</span> How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Register', desc: 'Create an account with your university details and pick your preferred learning category.' },
              { step: '2', title: 'Get Approved', desc: 'Our admins review your registration and assign you to a category.' },
              { step: '3', title: 'Start Learning', desc: 'Access trainings, complete lessons, take quizzes, and track your progress.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Start Your Journey?
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Join IS Hub Academy and build skills that matter.
        </p>
        <Link to="/register">
          <Button size="lg">Register Now</Button>
        </Link>
      </section>
    </div>
  );
}
