import Link from 'next/link';
import React, { type SVGProps, type ComponentProps } from 'react';

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
    
    // Merge with any additional classes passed via props
    const finalClasses = [variantClasses, props.className]
      .filter(Boolean)
      .join(' ')
      .trim()
      .replace(/\s+/g, ' '); 

    return finalClasses;
  };
}


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




// Button Component 
const buttonVariants = createVariants({
  base: 'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      primary: 'bg-slate-900 text-white hover:bg-slate-800',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      ghost: 'hover:bg-slate-100 hover:text-slate-900',
    },
    size: {
      default: 'h-10 px-4 py-2',
      lg: 'h-12 px-6',
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
  onClick?:()=>void;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className,onClick, variant, size, ...props }, ref) => {
  return <button onClick={onClick} className={buttonVariants({ variant, size, className })} ref={ref} {...props} />;
});
Button.displayName = 'Button';


//FeatureCard Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="flex flex-col items-start p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg text-slate-800 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);


// PAGE SECTIONS
// Header Section 
const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2 text-slate-900">
          <IconLogo className="h-7 w-7" />
          <span className="font-bold text-xl">Excalidraw</span>
        </a>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Community</a>
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

//Hero Section 
const HeroSection = () => (
  <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-slate-50">
     <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,230,255,0.3),rgba(255,255,255,0))]"></div>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tighter">
          Your Collaborative Whiteboard, Reimagined.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          Turn your ideas into visual stories with an intuitive, real-time digital whiteboard. Sketch freely, collaborate seamlessly, and bring your team's creativity to life.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg">Start Drawing Now</Button>
          <Button size="lg" variant="secondary">Watch Demo</Button>
        </div>
      </div>
      <div className="mt-16 max-w-5xl mx-auto">
        <div className="relative rounded-2xl border border-slate-200/50 shadow-2xl shadow-slate-200">
           <div className="absolute -top-px -left-px -right-px h-12 bg-gradient-to-b from-slate-100 to-transparent rounded-t-2xl"></div>
           <img
            src="https://placehold.co/1200x800/f1f5f9/1e293b?text=Excalidraw+Interface+Here"
            alt="Excalidraw application interface showing a collaborative drawing session"
            className="w-full h-auto rounded-2xl bg-slate-100"
            width={1200}
            height={800}
           />
        </div>
      </div>
    </div>
  </section>
);

//Features Section 
const FeaturesSection = () => (
  <section id="features" className="py-20 md:py-28 bg-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
          Everything You Need to Visualize Ideas
        </h2>
        <p className="mt-4 text-slate-600">
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
          description="Easily export your creations as PNG, SVG, or embeddable code. Share your work in presentations, documents, or websites with a single click."
        />
      </div>
    </div>
  </section>
);

//CTA Section 
const CTASection = () => (
  <section className="bg-slate-900 text-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 text-center">
      <h2 className="text-3xl md:text-4xl font-bold">
        Ready to Bring Your Ideas to Life?
      </h2>
      <p className="mt-4 max-w-2xl mx-auto text-slate-300">
        Start your first drawing for free. No credit card, no sign-up required.
      </p>
      <div className="mt-8">
        <Button size="lg" variant="secondary">
          Get Started for Free
        </Button>
      </div>
    </div>
  </section>
);

//Footer Section
const Footer = () => (
  <footer className="bg-white border-t border-slate-200">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
           <a href="#" className="flex items-center gap-2 text-slate-900">
             <IconLogo className="h-7 w-7" />
             <span className="font-bold text-xl">Excalidraw</span>
           </a>
           <p className="mt-4 text-sm text-slate-500">The open-source virtual whiteboard.</p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">Product</h4>
          <ul className="mt-4 space-y-2">
            <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900">Features</a></li>
            <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900">Pricing</a></li>
            <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900">Updates</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">Community</h4>
          <ul className="mt-4 space-y-2">
            <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900">GitHub</a></li>
            <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900">Discord</a></li>
            <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900">Twitter</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">Legal</h4>
          <ul className="mt-4 space-y-2">
            <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900">Privacy Policy</a></li>
            <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Excalidraw. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// MAIN LANDING PAGE COMPONENT
export default function LandingPage() {
  return (
    <div className="bg-white text-slate-800 antialiased">
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