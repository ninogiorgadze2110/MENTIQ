export type CompanionType = 'bunny' | 'fox' | 'panda' | 'koala';

export interface CompanionDef {
  type: CompanionType;
  name: string;
  species: string;
}

export const KIDS_COMPANIONS: CompanionDef[] = [
  { type: 'bunny', name: 'ბუნი', species: 'კურდღელი' },
  { type: 'fox', name: 'მელო', species: 'მელა' },
  { type: 'panda', name: 'პანდი', species: 'პანდა' },
  { type: 'koala', name: 'კოა', species: 'კოალა' }
];
