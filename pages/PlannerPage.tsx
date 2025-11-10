
import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, Map as MapIcon, Calendar, DollarSign, User, Check, Plane, Hotel, Coffee, Info, ArrowRight, Sparkles, Train, Bus, CarFront } from 'lucide-react';
import { generateTripPlan, getMustVisitRecommendation } from '../services/geminiService';
import { TripItinerary, DayPlan, Activity, MustVisitPlace, TransportMode } from '../types';
import { Button, Input, Card } from '../components/UIComponents';
import ReactMarkdown from 'react-markdown';

// --- Components within the page for simplicity ---

const ItineraryDay = ({ day }: { day: DayPlan }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-l-2 border-brand-deep/10 ml-4 pl-8 pb-8 relative last:pb-0">
      <div 
        className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-olive border-2 border-[#FDFCF5] cursor-pointer hover:scale-110 transition-transform"
        onClick={() => setIsOpen(!isOpen)}
      ></div>
      
      <div className="mb-4">
        <h3 className="text-xl font-display font-bold text-brand-deep flex items-center gap-2">
          <span className="text-brand-moss">Day {day.day}</span>
          <span className="w-1 h-1 rounded-full bg-brand-deep/30"></span>
          <span>{day.theme}</span>
        </h3>
        <p className="text-sm text-brand-deep/60 font-sans mt-1">Est. Cost: ₹{day.dailyTotalEstimate.toLocaleString('en-IN')}</p>
      </div>

      {isOpen && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
          {day.activities.map((act, idx) => (
            <Card key={act.id || idx} className="p-4 hover:shadow-md transition-shadow border-brand-deep/5 bg-white">
              <div className="flex gap-4">
                <div className="flex flex-col items-center min-w-[60px]">
                  <span className="text-sm font-bold text-brand-deep">{act.time}</span>
                  <div className="h-full w-px bg-brand-deep/10 my-2"></div>
                  <span className="text-xs text-brand-deep/50">{act.duration}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-brand-deep">{act.title}</h4>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                      act.type === 'food' ? 'bg-orange-100 text-orange-700' :
                      act.type === 'nature' ? 'bg-green-100 text-green-700' :
                      'bg-brand-light text-brand-deep'
                    }`}>
                      {act.type}
                    </span>
                  </div>
                  <p className="text-sm text-brand-deep/70 mt-1">{act.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-brand-deep/50">
                    <span className="flex items-center gap-1"><MapIcon className="w-3 h-3" /> {act.location}</span>
                    {act.cost && <span>₹{act.cost.toLocaleString('en-IN')}</span>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const PlannerPage = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trip, setTrip] = useState<TripItinerary | null>(null);
  const [view, setView] = useState<'itinerary' | 'bookings' | 'map'>('itinerary');
  const [transportMode, setTransportMode] = useState<TransportMode | null>(null);
  
  // Must Visit Feature State
  const [mustVisit, setMustVisit] = useState<MustVisitPlace | null>(null);
  const [loadingGem, setLoadingGem] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || !transportMode) return;
    setIsLoading(true);
    setMustVisit(null); // Reset hidden gem when new trip is generated
    try {
      const data = await generateTripPlan(prompt, transportMode);
      setTrip(data);
    } catch (e) {
      alert("We hit a snag planning your trip. Please ensure your API Key is valid and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetGem = async () => {
    if (!trip) return;
    setLoadingGem(true);
    try {
      const gem = await getMustVisitRecommendation(trip.destination, trip.summary);
      setMustVisit(gem);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGem(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const transportOptions: { id: TransportMode; label: string; icon: any }[] = [
    { id: 'flight', label: 'Flight', icon: Plane },
    { id: 'train', label: 'Train', icon: Train },
    { id: 'bus', label: 'Bus', icon: Bus },
    { id: 'car', label: 'Car', icon: CarFront },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Input Section */}
      <div className={`transition-all duration-500 ease-in-out ${trip ? 'mb-8' : 'min-h-[60vh] flex flex-col justify-center items-center'}`}>
        {!trip && (
          <div className="text-center mb-10 max-w-2xl">
            <h1 className="text-4xl font-display font-bold text-brand-deep mb-4">Where to next?</h1>
            <p className="text-brand-deep/60 text-lg">
              Tell TripGenie what you're dreaming of. Be specific about budget, interests, and pace.
            </p>
          </div>
        )}
        
        <div className="w-full max-w-2xl relative">
          <div className="bg-white rounded-2xl shadow-xl shadow-brand-deep/5 border-2 border-brand-deep/10 overflow-hidden">
             <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                 if(e.key === 'Enter' && !e.shiftKey && transportMode) {
                   e.preventDefault();
                   handleGenerate();
                 }
              }}
              placeholder="E.g. I want a 3-day nature trip under ₹30,000 from Mumbai to Lonavala in June for 2 adults. Prefer hiking and rustic lodges."
              className="w-full min-h-[120px] p-6 text-lg focus:outline-none resize-none font-serif bg-transparent"
            />
            
            {/* Transport Selection */}
            <div className="px-6 pb-6">
               <p className="text-xs font-bold text-brand-deep/40 uppercase tracking-wider mb-3">Select Mode of Transport</p>
               <div className="grid grid-cols-4 gap-2">
                  {transportOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTransportMode(opt.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                        transportMode === opt.id 
                          ? 'border-brand-olive bg-brand-olive/10 text-brand-deep shadow-inner' 
                          : 'border-brand-deep/5 bg-white text-brand-deep/60 hover:border-brand-olive/50 hover:bg-brand-light/10'
                      }`}
                    >
                      <opt.icon className={`w-6 h-6 mb-1 ${transportMode === opt.id ? 'text-brand-olive' : ''}`} />
                      <span className="text-xs font-bold">{opt.label}</span>
                    </button>
                  ))}
               </div>
            </div>

            <div className="px-6 pb-6 flex justify-end bg-brand-deep/5 pt-4 border-t border-brand-deep/10">
              <div className="flex items-center gap-3 w-full justify-between">
                 {!transportMode ? (
                   <span className="text-xs text-red-500 font-bold animate-pulse ml-2">⚠ Please select a transport mode</span>
                 ) : <span></span>}
                 
                 <Button 
                  onClick={handleGenerate} 
                  disabled={isLoading || !prompt || !transportMode} 
                  className="rounded-xl px-8"
                >
                  {isLoading ? <span className="animate-spin">⏳ Planning...</span> : (
                    <>Generate Plan <ArrowRight className="ml-2 w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Suggestion Chips */}
          {!trip && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {[
                "Weekend in Goa under ₹20,000",
                "5 days in Kerala for foodies",
                "Relaxing beach trip to Pondicherry",
                "Hiking in Himachal for 1 week"
              ].map(s => (
                <button 
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="px-4 py-2 bg-white rounded-full text-sm text-brand-deep/70 border border-brand-deep/10 hover:border-brand-olive hover:bg-brand-light/20 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {trip && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-brand-deep/10 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <span className="px-3 py-1 bg-brand-olive/20 text-brand-deep rounded-full text-xs font-bold uppercase tracking-wider">
                   {trip.days.length} Days
                 </span>
                 <span className="px-3 py-1 bg-brand-deep/10 text-brand-deep rounded-full text-xs font-bold uppercase tracking-wider">
                   {trip.travelers} Travelers
                 </span>
                 <span className="px-3 py-1 bg-brand-deep/5 text-brand-deep rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                   {transportMode === 'flight' && <Plane className="w-3 h-3"/>}
                   {transportMode === 'train' && <Train className="w-3 h-3"/>}
                   {transportMode === 'bus' && <Bus className="w-3 h-3"/>}
                   {transportMode === 'car' && <CarFront className="w-3 h-3"/>}
                   By {transportMode}
                 </span>
              </div>
              <h2 className="text-4xl font-display font-bold text-brand-deep">{trip.destination}</h2>
              <p className="text-brand-deep/70 mt-1 max-w-xl">{trip.summary}</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0 no-print">
              <Button variant="outline" onClick={handlePrint} icon={Download}>Download PDF</Button>
              <div className="bg-brand-deep/5 rounded-xl p-1 flex">
                <button onClick={() => setView('itinerary')} className={`px-4 py-2 rounded-lg text-sm font-bold ${view === 'itinerary' ? 'bg-white shadow-sm text-brand-deep' : 'text-brand-deep/50'}`}>Plan</button>
                <button onClick={() => setView('bookings')} className={`px-4 py-2 rounded-lg text-sm font-bold ${view === 'bookings' ? 'bg-white shadow-sm text-brand-deep' : 'text-brand-deep/50'}`}>Bookings</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Main Itinerary */}
            <div className="lg:col-span-2 space-y-8">
              {view === 'itinerary' && (
                <>
                  <div className="space-y-0">
                    {trip.days.map((day) => (
                      <ItineraryDay key={day.day} day={day} />
                    ))}
                  </div>
                  
                  {/* Packing & Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-brand-deep/10">
                     <Card className="p-6 bg-[#F0E491]/10 border-none">
                       <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                         <Info className="w-4 h-4" /> Visa & Entry
                       </h3>
                       <p className="text-sm mb-3">{trip.visaGuidance.summary}</p>
                       <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${trip.visaGuidance.required ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {trip.visaGuidance.required ? 'Visa Required' : 'Visa Free / E-Visa'}
                          </span>
                       </div>
                       <p className="text-xs text-brand-deep/50 mt-4 italic">
                         *Always verify with official consulates.
                       </p>
                     </Card>

                     <Card className="p-6 bg-[#658C58]/10 border-none">
                       <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                         <Check className="w-4 h-4" /> Packing Essentials
                       </h3>
                       <ul className="text-sm space-y-2">
                         {trip.packingList.slice(0, 5).map(item => (
                           <li key={item} className="flex items-start gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-brand-moss mt-1.5"></div>
                             {item}
                           </li>
                         ))}
                       </ul>
                     </Card>
                  </div>
                </>
              )}

              {view === 'bookings' && (
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-2xl mb-4 capitalize">{transportMode} Options</h3>
                  {trip.flights.map(flight => (
                    <Card key={flight.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-brand-deep/5 rounded-full flex items-center justify-center">
                           {transportMode === 'flight' && <Plane className="w-6 h-6 text-brand-deep" />}
                           {transportMode === 'train' && <Train className="w-6 h-6 text-brand-deep" />}
                           {transportMode === 'bus' && <Bus className="w-6 h-6 text-brand-deep" />}
                           {transportMode === 'car' && <CarFront className="w-6 h-6 text-brand-deep" />}
                         </div>
                         <div>
                           <h4 className="font-bold text-lg">{flight.airline}</h4>
                           <p className="text-sm text-brand-deep/60">{flight.departureTime} - {flight.arrivalTime}</p>
                           <p className="text-xs text-brand-deep/40">{flight.duration} • {flight.stops === 0 ? 'Direct' : `${flight.stops} Stops`}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="text-2xl font-bold text-brand-deep">₹{flight.price.toLocaleString('en-IN')}</p>
                         <a href={flight.bookingLink} target="_blank" rel="noreferrer" className="text-sm text-brand-olive font-bold hover:underline">
                           Book Now &rarr;
                         </a>
                       </div>
                    </Card>
                  ))}

                  <h3 className="font-display font-bold text-2xl mb-4 mt-8">Stays</h3>
                  {trip.hotels.map(hotel => (
                    <Card key={hotel.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-brand-deep/5 rounded-full flex items-center justify-center">
                           <Hotel className="w-6 h-6 text-brand-deep" />
                         </div>
                         <div>
                           <h4 className="font-bold text-lg">{hotel.name}</h4>
                           <div className="flex text-yellow-500 text-xs">{'★'.repeat(hotel.stars)}</div>
                           <p className="text-sm text-brand-deep/60">{hotel.location}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="text-2xl font-bold text-brand-deep">₹{hotel.pricePerNight.toLocaleString('en-IN')}<span className="text-sm font-normal text-brand-deep/50">/night</span></p>
                         <p className="text-xs text-brand-deep/40 mb-2">Total: ₹{hotel.totalPrice.toLocaleString('en-IN')}</p>
                         <a href={hotel.bookingLink} target="_blank" rel="noreferrer" className="text-sm text-brand-olive font-bold hover:underline">
                           Check Availability &rarr;
                         </a>
                       </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-6">
              <Card className="p-6 bg-white sticky top-24">
                 <h3 className="font-display font-bold text-xl mb-4">Trip Budget</h3>
                 <div className="space-y-3 text-sm">
                   <div className="flex justify-between">
                     <span className="text-brand-deep/60 capitalize">{transportMode}</span>
                     <span className="font-bold">₹{trip.costs.flights.toLocaleString('en-IN')}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-brand-deep/60">Accommodation</span>
                     <span className="font-bold">₹{trip.costs.hotels.toLocaleString('en-IN')}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-brand-deep/60">Activities</span>
                     <span className="font-bold">₹{trip.costs.activities.toLocaleString('en-IN')}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-brand-deep/60">Food & Local</span>
                     <span className="font-bold">₹{trip.costs.food.toLocaleString('en-IN')}</span>
                   </div>
                   <div className="h-px bg-brand-deep/10 my-2"></div>
                   <div className="flex justify-between text-lg font-bold text-brand-deep">
                     <span>Total Est.</span>
                     <span>₹{trip.costs.total.toLocaleString('en-IN')}</span>
                   </div>
                 </div>
              </Card>
              
              {/* New Feature: Must-Visit Card */}
              <Card className="p-6 bg-gradient-to-br from-brand-light/20 to-brand-olive/10 border-brand-olive/20 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-display font-bold text-xl mb-2 flex items-center gap-2 text-brand-deep">
                    <Sparkles className="w-5 h-5 text-brand-olive" />
                    Gemini's Pick
                  </h3>
                  
                  {!mustVisit ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-brand-deep/70 mb-4">
                        Ask AI for the one unmissable experience in {trip.destination}.
                      </p>
                      <Button onClick={handleGetGem} disabled={loadingGem} variant="secondary" className="w-full">
                        {loadingGem ? 'Asking Gemini...' : 'Reveal Must-Visit'}
                      </Button>
                    </div>
                  ) : (
                    <div className="animate-in fade-in zoom-in duration-500">
                      <h4 className="font-bold text-lg text-brand-deep leading-tight mb-1">{mustVisit.name}</h4>
                      <p className="text-xs font-bold text-brand-olive uppercase tracking-wider mb-3">{mustVisit.bestTime}</p>
                      <p className="text-sm text-brand-deep/80 mb-3 italic">"{mustVisit.description}"</p>
                      
                      <div className="bg-white/60 rounded-lg p-3 text-xs space-y-2">
                        <p><span className="font-bold text-brand-deep">Why:</span> {mustVisit.reason}</p>
                        <p><span className="font-bold text-brand-deep">Pro Tip:</span> {mustVisit.tip}</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Background decoration */}
                <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-brand-olive/10 rotate-12" />
              </Card>

              {/* Map Placeholder */}
              <Card className="h-64 overflow-hidden relative group cursor-pointer bg-brand-deep/5">
                 <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/10 transition-colors">
                    <div className="text-center">
                      <MapIcon className="w-8 h-8 mx-auto text-brand-deep/50 mb-2" />
                      <span className="text-sm font-bold text-brand-deep/70">Interactive Map View</span>
                      <p className="text-xs text-brand-deep/50 px-4 mt-1">Add Google Maps Key to enable</p>
                    </div>
                 </div>
                 {/* Fake map background */}
                 <div className="w-full h-full opacity-20" style={{
                   backgroundImage: 'radial-gradient(#31694E 1px, transparent 1px)', 
                   backgroundSize: '10px 10px' 
                 }}></div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerPage;
