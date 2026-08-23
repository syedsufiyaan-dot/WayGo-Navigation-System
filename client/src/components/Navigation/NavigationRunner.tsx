import React, { useState } from 'react';
import {
  Navigation,
  ChevronRight,
  ChevronLeft,
  X,
  Clock,
  MapPin,
  IndianRupee,
  Bus,
  Train,
  Zap,
  Car,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { RouteOption } from '../../types/index.js';

interface NavigationRunnerProps {
  route: RouteOption;
  onClose: () => void;
}

export const NavigationRunner: React.FC<NavigationRunnerProps> = ({ route, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = route.steps;
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'METRO':
        return <Zap className="w-5 h-5 text-emerald-500" />;
      case 'TRAIN':
        return <Train className="w-5 h-5 text-purple-500" />;
      case 'BUS':
        return <Bus className="w-5 h-5 text-blue-500" />;
      case 'AUTO':
        return <Car className="w-5 h-5 text-amber-500" />;
      default:
        return <Navigation className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-navy-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Navigation mode banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Preview Navigation</h3>
                <span className="text-[10px] bg-blue-900/50 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full font-semibold">
                  Step-by-step Guide
                </span>
              </div>
              <p className="text-xs text-blue-100/80">
                {route.source} ➔ {route.destination}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="End Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Route Summary Metrics */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-navy-700 bg-slate-50 dark:bg-navy-900/60 border-b border-slate-100 dark:border-navy-700 text-center py-3">
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Total Time
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {route.totalTimeMins} mins
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> Total Distance
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {route.totalDistanceKm} km
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-500" /> Estimated Fare
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              ₹{route.totalFareInr}
            </span>
          </div>
        </div>

        {/* Active Step Highlight Card */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-500/40 shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md shrink-0">
                {currentStep.stepNumber}
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                    Current Direction
                  </span>
                  {currentStep.lineName && (
                    <span className="text-[11px] font-medium bg-white dark:bg-navy-800 px-2 py-0.5 rounded-md border border-blue-200 dark:border-navy-600 text-slate-700 dark:text-slate-300">
                      {currentStep.lineName}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {currentStep.instruction}
                </h4>
                {currentStep.distanceKm > 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Segment length: ~{currentStep.distanceKm} km · Est. time: ~{currentStep.durationMins} mins
                  </p>
                )}
              </div>
            </div>

            {/* Step Progress Dots */}
            <div className="flex items-center gap-1.5 mt-5 pt-4 border-t border-blue-100 dark:border-blue-900/50">
              {steps.map((s, idx) => (
                <div
                  key={s.stepNumber}
                  className={`h-1.5 rounded-full transition-all flex-1 ${
                    idx === currentStepIndex
                      ? 'bg-blue-600'
                      : idx < currentStepIndex
                      ? 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-navy-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* All Journey Steps Outline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              All Route Waypoints ({steps.length} Steps)
            </h4>
            <div className="space-y-2">
              {steps.map((step, idx) => {
                const isSelected = idx === currentStepIndex;
                const isCompleted = idx < currentStepIndex;
                return (
                  <div
                    key={step.stepNumber}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-white dark:bg-navy-700 border-blue-500 ring-1 ring-blue-500/30 shadow-sm'
                        : isCompleted
                        ? 'bg-slate-50/50 dark:bg-navy-900/30 border-slate-100 dark:border-navy-800 text-slate-400 line-through'
                        : 'bg-white dark:bg-navy-800/60 border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.stepNumber}
                    </span>
                    <span className="flex-1 font-medium truncate">{step.instruction}</span>
                    {getModeIcon(step.mode)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Academic Transparency Note */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-navy-900/50 rounded-xl text-[11px] text-slate-500 border border-slate-200/60 dark:border-navy-700">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Preview Navigation is a step-by-step itinerary simulation for academic planning. Continuous live GPS tracking is not simulated dishonestly.
            </span>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-slate-50 dark:bg-navy-900 border-t border-slate-100 dark:border-navy-700 flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={isFirstStep}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Step
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
          >
            End Navigation
          </button>

          <button
            onClick={() => {
              if (isLastStep) {
                onClose();
              } else {
                setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
              }
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition"
          >
            <span>{isLastStep ? 'Finish Journey' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
