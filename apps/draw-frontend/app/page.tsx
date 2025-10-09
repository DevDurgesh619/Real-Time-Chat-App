import React, { type SVGProps, type ComponentProps } from 'react';
import Link from 'next/link';

// A utility function for creating variant classes, similar to CVA
// This helps in managing component styles in a structured way.
type VariantStyles = { [key: string]: string };
type Variants<T extends VariantStyles> = {
  base?: string;
  variants?: { [key: string]: T };
  defaultVariants?: { [key in keyof Variants<T>['variants']]?: keyof Variants<T>['variants'][key] };
};

function createVariants<T extends VariantStyles>(config: Variants<T>) {
  return (props: { [key in keyof typeof config.variants]?: keyof typeof config.variants[key] } & { className?: string }) => {
    const { base = '', variants = {}, defaultVariants = {} } = config;
    let variantClasses = base;

    for (const variantKey in variants) {
      const propValue = props[variantKey] || defaultVariants[variantKey];
      if (propValue && variants[variantKey][propValue as string]) {
        variantClasses += ` ${variants[variantKey][propValue as string]}`;
      }
    }
    
    // Merge with any additional classes passed via props and clean up whitespace
    const finalClasses = [variantClasses, props.className]
      .filter(Boolean)
      .join(' ')
      .trim()
      .replace(/\s+/g, ' '); 

    return finalClasses;
  };
}


// ICONS =================================================================
// Using SVG components for icons is efficient and scalable.

const IconCollaborate = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IconInfinite = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/></svg>
);
const IconExport = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);
const IconLogo = (props: SVGProps<SVGSVGElement>) => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M8 20.621C4.316 19.824 2 16.53 2 12.5A10.5 10.5 0 0112.5 2C17.583 2 22 6.417 22 11.5c0 4.03-2.316 7.324-6 8.121" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.5 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 5.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.5 10C10.833 10 10 10.833 10 12.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 17V12.5C15 10.833 14.167 10 12.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconGitHub = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 19c-4.3 1.4 -4.3-2.5 -6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>
);
const IconTwitter = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.4 3.3 4.4s-1.4 1.4-3.4 1.4h-2.8c-2.3 0-4.2-1.9-4.2-4.2v-2.8c0-2.3 1.9-4.2 4.2-4.2h2.8C20.6 2 22 4 22 4zM12 12H2m10 4H2m10-8H2"/></svg>
);


// UI COMPONENTS ==========================================================

// Button Component
const buttonVariants = createVariants({
  base: 'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      primary: 'bg-sky-500 text-white hover:bg-sky-600/90 shadow-[0_0_20px_theme(colors.sky.500)]',
      secondary: 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700',
      ghost: 'hover:bg-neutral-800 hover:text-neutral-200',
    },
    size: {
      default: 'h-10 px-4 py-2',
      lg: 'h-12 px-8 text-base',
      icon: 'h-10 w-10',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'default',
  },
});

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'lg' | 'icon';
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button className={buttonVariants({ variant, size, className })} ref={ref} {...props} />;
});
Button.displayName = 'Button';


// FeatureCard Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="relative flex flex-col items-start p-6 bg-neutral-900/80 rounded-xl border border-neutral-800 shadow-lg hover:border-sky-500/50 transition-colors duration-300 group">
    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10">
        <div className="flex items-center justify-center w-12 h-12 bg-sky-900/50 border border-sky-500/30 rounded-lg text-sky-400 mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-neutral-400 leading-relaxed">{description}</p>
    </div>
  </div>
);


// PAGE SECTIONS ==========================================================

const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm border-b border-neutral-800">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2 text-white">
          <IconLogo className="h-7 w-7" />
          <span className="font-bold text-xl">Excalidraw</span>
        </a>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Features</a>
          <a href="#" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Pricing</a>
          <a href="#" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Community</a>
        </nav>
        <div className="flex items-center gap-2">
            <Link href={"/signin"}>
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href={"/signup"}>
            <Button variant="primary">Sign Up</Button>
          </Link>
        </div>
      </div>
    </div>
  </header>
);

const HeroSection = () => (
  <section className="relative pt-32 pb-20 md:pt-48 md:pb-28 bg-black">
     <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_-20%,rgba(14,165,233,0.2),rgba(0,0,0,0))]"></div>
     <div className="absolute inset-0 bottom-0 bg-neutral-950/50 [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tighter bg-gradient-to-br from-white to-neutral-400 text-transparent bg-clip-text">
          Your Collaborative Whiteboard, Reimagined.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
          Turn your ideas into visual stories with an intuitive, real-time digital whiteboard. Sketch freely, collaborate seamlessly, and bring your team's creativity to life.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button size="lg">Start Drawing Now</Button>
          <Button size="lg" variant="secondary">Watch Demo</Button>
        </div>
      </div>
      <div className="mt-20 max-w-6xl mx-auto">
        <div className="relative rounded-2xl border border-neutral-800 p-2 bg-gradient-to-b from-neutral-900 to-black shadow-2xl shadow-sky-500/10">
           <div className="w-full h-auto rounded-lg overflow-hidden">
             {/* A visually appealing placeholder that looks more like an app */}
             <div className="aspect-[16/10] bg-neutral-950 p-4 flex flex-col rounded-lg">
                <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                </div>
                <div className="flex-1 rounded border-2 border-dashed border-neutral-700 flex items-center justify-center">
                    <svg className="w-3/4 h-3/4 text-neutral-600 opacity-50" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 50 C 20 10, 40 10, 50 30 S 70 50, 90 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <rect x="15" y="15" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="75" cy="45" r="8" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  </section>
);

const FeaturesSection = () => (
  <section id="features" className="py-20 md:py-28 bg-neutral-950">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Everything You Need to Visualize Ideas
        </h2>
        <p className="mt-4 text-neutral-400">
          From brainstorming sessions to complex diagrams, our toolkit is designed for clarity and speed.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard
          icon={<IconCollaborate />}
          title="Real-time Collaboration"
          description="Work with your team on the same canvas at the same time. See cursors move, ideas form, and projects come together instantly."
        />
        <FeatureCard
          icon={<IconInfinite />}
          title="Infinite Canvas"
          description="Never run out of space. Our infinite canvas lets your ideas grow without boundaries, perfect for large-scale projects and mind maps."
        />
        <FeatureCard
          icon={<IconExport />}
          title="Export Anywhere"
          description="Easily export your creations as PNG, SVG, or embeddable code. Share your work in presentations, documents, or websites."
        />
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="bg-black text-white relative">
    <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2338bdf8\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 text-center relative">
      <h2 className="text-3xl md:text-4xl font-bold">
        Ready to Bring Your Ideas to Life?
      </h2>
      <p className="mt-4 max-w-2xl mx-auto text-neutral-300">
        Start your first drawing for free. No credit card, no sign-up required.
      </p>
      <div className="mt-8">
        <Button size="lg" variant="primary">
          Get Started for Free
        </Button>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-black border-t border-neutral-800">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="flex-shrink-0">
           <a href="#" className="flex items-center gap-2 text-white">
             <IconLogo className="h-7 w-7" />
             <span className="font-bold text-xl">Excalidraw</span>
           </a>
           <p className="mt-4 text-sm text-neutral-500 max-w-xs">The open-source virtual whiteboard for creative minds.</p>
        </div>
        <div className="flex gap-8">
            <div>
              <h4 className="font-semibold text-white">Product</h4>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Updates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">Community</h4>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Twitter</a></li>
              </ul>
            </div>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center text-sm text-neutral-500">
        <p>&copy; {new Date().getFullYear()} Excalidraw. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <a href="#" className="hover:text-white transition-colors"><IconGitHub className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors"><IconTwitter className="w-5 h-5" /></a>
        </div>
      </div>
    </div>
  </footer>
);


// MAIN LANDING PAGE COMPONENT
export default function LandingPage() {
  return (
    <div className="bg-black text-neutral-300 antialiased selection:bg-sky-500 selection:text-white">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}