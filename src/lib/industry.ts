import { Industry } from './types';

export function classifyIndustry(name: string, category?: string, description?: string): Industry {
  const combined = `${name} ${category || ''} ${description || ''}`.toLowerCase();

  // 1. AI / ML
  if (
    combined.includes('ai') || 
    combined.includes('llm') || 
    combined.includes('gpt') || 
    combined.includes('machine learning') || 
    combined.includes('neural') ||
    combined.includes('computer vision') ||
    combined.includes('speech') ||
    combined.includes('deep learning') ||
    combined.includes('agent')
  ) {
    return 'AI / Machine Learning';
  }

  // 2. DevTools / B2B SaaS
  if (
    combined.includes('developer') || 
    combined.includes('api') || 
    combined.includes('infrastructure') || 
    combined.includes('database') || 
    combined.includes('cloud') || 
    combined.includes('saas') || 
    combined.includes('b2b') || 
    combined.includes('workflow') || 
    combined.includes('security') || 
    combined.includes('observability') || 
    combined.includes('devtools') ||
    combined.includes('platform') ||
    combined.includes('analytics')
  ) {
    return 'B2B SaaS / DevTools';
  }

  // 3. FinTech
  if (
    combined.includes('fintech') || 
    combined.includes('payment') || 
    combined.includes('bank') || 
    combined.includes('crypto') || 
    combined.includes('wallet') || 
    combined.includes('lending') || 
    combined.includes('credit') || 
    combined.includes('insurance') || 
    combined.includes('payroll') ||
    combined.includes('finance')
  ) {
    return 'FinTech / Payments';
  }

  // 4. Healthcare / Bio
  if (
    combined.includes('health') || 
    combined.includes('medical') || 
    combined.includes('bio') || 
    combined.includes('clinic') || 
    combined.includes('pharma') || 
    combined.includes('therapeutics') || 
    combined.includes('patient') || 
    combined.includes('care')
  ) {
    return 'Healthcare / Bio';
  }

  // 5. Hardware / Industrial / Robotics
  if (
    combined.includes('robot') || 
    combined.includes('hardware') || 
    combined.includes('sensor') || 
    combined.includes('drone') || 
    combined.includes('manufacturing') || 
    combined.includes('satellite') || 
    combined.includes('space') || 
    combined.includes('energy')
  ) {
    return 'Hardware / Industrial';
  }

  // 6. E-Commerce / Consumer
  if (
    combined.includes('shop') || 
    combined.includes('commerce') || 
    combined.includes('retail') || 
    combined.includes('marketplace') || 
    combined.includes('fashion') || 
    combined.includes('food') || 
    combined.includes('delivery') || 
    combined.includes('consumer') || 
    combined.includes('apparel')
  ) {
    return 'E-Commerce / Consumer';
  }

  return 'B2B SaaS / DevTools'; // Default fallback
}
