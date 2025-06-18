const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Medication = require('../models/Medication');
const connectDB = require('../config/db');

dotenv.config();

// Common medications data
const medicationsData = [
  {
    name: 'Lisinopril',
    category: 'ACE Inhibitor',
    description: 'Used to treat high blood pressure and heart failure',
    commonDosages: ['5mg', '10mg', '20mg', '40mg'],
    sideEffects: ['Dry cough', 'Dizziness', 'Headache', 'Fatigue'],
    contraindications: ['Pregnancy', 'History of angioedema'],
    interactions: ['Potassium supplements', 'NSAIDs', 'Lithium'],
    requiresPrescription: true
  },
  {
    name: 'Metformin',
    category: 'Antidiabetic',
    description: 'First-line medication for the treatment of type 2 diabetes',
    commonDosages: ['500mg', '850mg', '1000mg'],
    sideEffects: ['Nausea', 'Diarrhea', 'Abdominal discomfort', 'Metallic taste'],
    contraindications: ['Kidney disease', 'Liver disease', 'Alcoholism'],
    interactions: ['Cimetidine', 'Furosemide', 'Nifedipine'],
    requiresPrescription: true
  },
  {
    name: 'Amoxicillin',
    category: 'Antibiotic',
    description: 'Penicillin antibiotic used to treat bacterial infections',
    commonDosages: ['250mg', '500mg', '875mg'],
    sideEffects: ['Diarrhea', 'Rash', 'Nausea', 'Vomiting'],
    contraindications: ['Penicillin allergy', 'Mononucleosis'],
    interactions: ['Probenecid', 'Allopurinol', 'Oral contraceptives'],
    requiresPrescription: true
  },
  {
    name: 'Hydrochlorothiazide',
    category: 'Diuretic',
    description: 'Thiazide diuretic used to treat high blood pressure and swelling',
    commonDosages: ['12.5mg', '25mg', '50mg'],
    sideEffects: ['Increased urination', 'Dizziness', 'Low potassium', 'Increased blood sugar'],
    contraindications: ['Sulfa allergy', 'Kidney disease', 'Gout'],
    interactions: ['Lithium', 'Digoxin', 'NSAIDs'],
    requiresPrescription: true
  },
  {
    name: 'Atorvastatin',
    category: 'Statin',
    description: 'HMG-CoA reductase inhibitor used to lower cholesterol',
    commonDosages: ['10mg', '20mg', '40mg', '80mg'],
    sideEffects: ['Muscle pain', 'Liver enzyme elevation', 'Headache', 'Joint pain'],
    contraindications: ['Liver disease', 'Pregnancy', 'Breastfeeding'],
    interactions: ['Grapefruit juice', 'Erythromycin', 'Clarithromycin'],
    requiresPrescription: true
  },
  {
    name: 'Omeprazole',
    category: 'Proton Pump Inhibitor',
    description: 'Reduces stomach acid production to treat GERD and ulcers',
    commonDosages: ['10mg', '20mg', '40mg'],
    sideEffects: ['Headache', 'Nausea', 'Diarrhea', 'Abdominal pain'],
    contraindications: ['Hypersensitivity to PPIs'],
    interactions: ['Clopidogrel', 'Diazepam', 'Phenytoin'],
    requiresPrescription: true
  },
  {
    name: 'Amlodipine',
    category: 'Calcium Channel Blocker',
    description: 'Used to treat high blood pressure and coronary artery disease',
    commonDosages: ['2.5mg', '5mg', '10mg'],
    sideEffects: ['Edema', 'Flushing', 'Headache', 'Dizziness'],
    contraindications: ['Severe hypotension', 'Heart block'],
    interactions: ['Simvastatin', 'Cyclosporine', 'Grapefruit juice'],
    requiresPrescription: true
  },
  {
    name: 'Sertraline',
    category: 'SSRI',
    description: 'Selective serotonin reuptake inhibitor used to treat depression and anxiety',
    commonDosages: ['25mg', '50mg', '100mg'],
    sideEffects: ['Nausea', 'Insomnia', 'Diarrhea', 'Sexual dysfunction'],
    contraindications: ['MAO inhibitor use', 'Pimozide use'],
    interactions: ['Warfarin', 'NSAIDs', 'Other antidepressants'],
    requiresPrescription: true
  },
  {
    name: 'Albuterol',
    category: 'Bronchodilator',
    description: 'Short-acting beta-agonist used to treat asthma and COPD',
    commonDosages: ['90mcg/puff'],
    sideEffects: ['Tremor', 'Nervousness', 'Headache', 'Tachycardia'],
    contraindications: ['Hypersensitivity to albuterol'],
    interactions: ['Beta-blockers', 'Diuretics', 'Digoxin'],
    requiresPrescription: true
  },
  {
    name: 'Levothyroxine',
    category: 'Thyroid Hormone',
    description: 'Synthetic thyroid hormone used to treat hypothyroidism',
    commonDosages: ['25mcg', '50mcg', '75mcg', '100mcg', '125mcg', '150mcg'],
    sideEffects: ['Weight loss', 'Nervousness', 'Insomnia', 'Tremor'],
    contraindications: ['Thyrotoxicosis', 'Acute myocardial infarction'],
    interactions: ['Calcium supplements', 'Iron supplements', 'Antacids'],
    requiresPrescription: true
  }
];

// Seed function
const seedMedications = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing medications
    await Medication.deleteMany({});
    console.log('Cleared existing medications');
    
    // Insert new medications
    const createdMedications = await Medication.insertMany(medicationsData);
    console.log(`Added ${createdMedications.length} medications to the database`);
    
    // Disconnect from database
    mongoose.disconnect();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding medications:', error);
    process.exit(1);
  }
};

// Run the seed function
seedMedications();