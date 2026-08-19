export interface RegistrationCouncilSeed {
  code: string;
  name: string;
  country: string;
}

export const registrationCouncils: RegistrationCouncilSeed[] = [
  {
    code: 'NMC',
    name: 'National Medical Commission',
    country: 'India',
  },
  {
    code: 'DCI',
    name: 'Dental Council of India',
    country: 'India',
  },
  {
    code: 'NCISM',
    name: 'National Commission for Indian System of Medicine',
    country: 'India',
  },
  {
    code: 'NCH',
    name: 'National Commission for Homoeopathy',
    country: 'India',
  },
  {
    code: 'VCI',
    name: 'Veterinary Council of India',
    country: 'India',
  },
  {
    code: 'RCI',
    name: 'Rehabilitation Council of India',
    country: 'India',
  },
];
