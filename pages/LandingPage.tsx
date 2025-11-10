
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, MapPin, Calendar } from 'lucide-react';
import { Button } from '../components/UIComponents';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative isolate overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 opacity-10" 
           style={{ 
             backgroundImage: 'radial-gradient(#658C58 2px, transparent 2px)', 
             backgroundSize: '32px 32px' 
           }}>
      </div>
      
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <span className="inline-flex items-center rounded-full bg-brand-olive/10 px-3 py-1 text-sm font-medium text-brand-deep ring-1 ring-inset ring-brand-deep/20 mb-6">
              <Sparkles className="mr-2 h-4 w-4 text-brand-olive" />
              Powered by Gemini 2.5
            </span>
          </div>
          <h1 className="mt-2 text-5xl font-display font-bold tracking-tight text-brand-deep sm:text-6xl leading-[1.1]">
            Wander smarter, <br/>
            <span className="text-brand-moss italic">not harder.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-brand-deep/80 font-sans">
            TripGenie transforms your travel dreams into detailed, bookable itineraries in seconds. 
            Experience the world with plans tailored to your budget, pace, and passions.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Button onClick={() => navigate('/planner')} className="h-14 text-lg px-8">
              Start Planning Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <a href="#how-it-works" className="text-sm font-semibold leading-6 text-brand-deep hover:text-brand-moss transition-colors">
              How it works <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        
        {/* Hero Visual */}
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="-m-2 rounded-xl bg-brand-deep/5 p-2 ring-1 ring-inset ring-brand-deep/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2021&q=80"
                alt="App screenshot"
                className="w-[40rem] rounded-md shadow-2xl ring-1 ring-brand-deep/10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
