// PawPal Initial Sample Data
// Formatted matching SQLite schema: pets, feeding_schedule, health_records, care_logs

export const AVATAR_PRESETS = [
  {
    id: "avatar_dog_golden",
    label: "Golden Retriever / Happy Dog",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#FDE68A"/>
      <path d="M22 36C20 22 30 18 36 24C40 28 35 44 26 42C23 41 22 39 22 36Z" fill="#D97706"/>
      <path d="M78 36C80 22 70 18 64 24C60 28 65 44 74 42C77 41 78 39 78 36Z" fill="#D97706"/>
      <ellipse cx="50" cy="54" rx="30" ry="26" fill="#FBBF24"/>
      <ellipse cx="38" cy="46" rx="4" ry="5" fill="#1E293B"/>
      <ellipse cx="62" cy="46" rx="4" ry="5" fill="#1E293B"/>
      <circle cx="39" cy="44.5" r="1.5" fill="white"/>
      <circle cx="63" cy="44.5" r="1.5" fill="white"/>
      <ellipse cx="50" cy="58" rx="14" ry="10" fill="#FEF3C7"/>
      <path d="M46 54C47.5 52 52.5 52 54 54C55 55.5 53 58 50 58C47 58 45 55.5 46 54Z" fill="#1E293B"/>
      <path d="M47 58V62C47 64 53 64 53 62V58" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/>
      <path d="M48 62C48 66 52 66 52 62" fill="#F87171"/>
    </svg>`
  },
  {
    id: "avatar_cat_tabby",
    label: "Tabby Cat / Cute Kitten",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#E2E8F0"/>
      <path d="M26 42L22 20L42 30" fill="#CBD5E1" stroke="#94A3B8" stroke-width="3" stroke-linejoin="round"/>
      <path d="M74 42L78 20L58 30" fill="#CBD5E1" stroke="#94A3B8" stroke-width="3" stroke-linejoin="round"/>
      <path d="M28 38L26 25L38 31" fill="#F472B6"/>
      <path d="M72 38L74 25L62 31" fill="#F472B6"/>
      <ellipse cx="50" cy="56" rx="30" ry="24" fill="#E2E8F0"/>
      <path d="M50 34V42M44 36V42M56 36V42" stroke="#64748B" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="37" cy="52" rx="4.5" ry="6" fill="#10B981"/>
      <ellipse cx="63" cy="52" rx="4.5" ry="6" fill="#10B981"/>
      <ellipse cx="37" cy="52" rx="2" ry="5" fill="#064E3B"/>
      <ellipse cx="63" cy="52" rx="2" ry="5" fill="#064E3B"/>
      <circle cx="38" cy="50" r="1.5" fill="white"/>
      <circle cx="64" cy="50" r="1.5" fill="white"/>
      <polygon points="50,60 46,57 54,57" fill="#F472B6"/>
      <path d="M50 60C48 63 44 63 43 61M50 60C52 63 56 63 57 61" stroke="#475569" stroke-width="2" stroke-linecap="round"/>
      <path d="M26 56L36 57M24 62L35 60M74 56L64 57M76 62L65 60" stroke="#94A3B8" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "avatar_dog_beagle",
    label: "Beagle / Frenchie",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#FED7AA"/>
      <path d="M20 38C16 26 28 20 34 26C38 30 32 48 24 46C21 45 20 42 20 38Z" fill="#7C2D12"/>
      <path d="M80 38C84 26 72 20 66 26C62 30 68 48 76 46C79 45 80 42 80 38Z" fill="#7C2D12"/>
      <ellipse cx="50" cy="54" rx="29" ry="25" fill="#FFEDD5"/>
      <path d="M35 34C32 44 32 54 36 60C38 64 45 66 50 66C55 66 62 64 64 60C68 54 68 44 65 34C58 36 42 36 35 34Z" fill="#FFFFFF"/>
      <circle cx="39" cy="48" r="4.5" fill="#1E293B"/>
      <circle cx="61" cy="48" r="4.5" fill="#1E293B"/>
      <circle cx="40.5" cy="46.5" r="1.5" fill="white"/>
      <circle cx="62.5" cy="46.5" r="1.5" fill="white"/>
      <path d="M46 56C48 54 52 54 54 56C55 58 52 61 50 61C48 61 45 58 46 56Z" fill="#1E293B"/>
      <path d="M47 61V64C47 65.5 53 65.5 53 64V61" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "avatar_bird",
    label: "Cockatiel / Parakeet",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#E0F2FE"/>
      <path d="M46 16C50 12 55 18 53 28C57 20 62 25 58 34" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="50" cy="52" r="26" fill="#FEF08A"/>
      <circle cx="36" cy="58" r="7" fill="#F87171" opacity="0.8"/>
      <circle cx="64" cy="58" r="7" fill="#F87171" opacity="0.8"/>
      <circle cx="41" cy="48" r="3.5" fill="#1E293B"/>
      <circle cx="59" cy="48" r="3.5" fill="#1E293B"/>
      <polygon points="50,54 44,60 56,60" fill="#F59E0B"/>
    </svg>`
  },
  {
    id: "avatar_rabbit",
    label: "Bunny / Rabbit",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#FCE7F3"/>
      <ellipse cx="36" cy="24" rx="7" ry="18" fill="#FFFFFF"/>
      <ellipse cx="64" cy="24" rx="7" ry="18" fill="#FFFFFF"/>
      <ellipse cx="36" cy="24" rx="4" ry="13" fill="#F472B6"/>
      <ellipse cx="64" cy="24" rx="4" ry="13" fill="#F472B6"/>
      <ellipse cx="50" cy="56" rx="28" ry="24" fill="#FFFFFF"/>
      <circle cx="38" cy="52" r="4" fill="#3B82F6"/>
      <circle cx="62" cy="52" r="4" fill="#3B82F6"/>
      <circle cx="39" cy="50.5" r="1.5" fill="white"/>
      <circle cx="63" cy="50.5" r="1.5" fill="white"/>
      <polygon points="50,60 46,57 54,57" fill="#F472B6"/>
      <path d="M50 60C48 63 45 63 44 61M50 60C52 63 55 63 56 61" stroke="#64748B" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`
  }
];

export const INITIAL_PETS = [
  {
    id: "pet_1",
    name: "Luna",
    species: "Dog",
    breed: "Golden Retriever",
    age: "2 yrs 4 mos",
    weight: 28.5,
    photo_uri: "avatar_dog_golden",
    notes: "Friendly, gentle temperament. High energy in the mornings. Mild allergy to poultry."
  },
  {
    id: "pet_2",
    name: "Milo",
    species: "Cat",
    breed: "Domestic Shorthair Tabby",
    age: "3 yrs 1 mo",
    weight: 4.8,
    photo_uri: "avatar_cat_tabby",
    notes: "Affectionate indoor cat. Loves laser pointers and requires sensitive digestion dry food."
  },
  {
    id: "pet_3",
    name: "Kiwi",
    species: "Bird",
    breed: "Cockatiel",
    age: "1 yr 2 mos",
    weight: 0.09,
    photo_uri: "avatar_bird",
    notes: "Whistles melodic tunes every morning. Loves fresh broccoli florets and spray millet treats."
  }
];

export const INITIAL_FEEDING_SCHEDULE = [
  {
    id: "feed_1",
    pet_id: "pet_1",
    meal_name: "Breakfast Kibble",
    time: "08:00",
    instructions: "1.5 cups Salmon & Sweet Potato + 1 pump wild Alaskan salmon oil",
    enabled: true
  },
  {
    id: "feed_2",
    pet_id: "pet_1",
    meal_name: "Afternoon Dental Chew",
    time: "13:30",
    instructions: "1 medium enzymatic dental chew stick",
    enabled: true
  },
  {
    id: "feed_3",
    pet_id: "pet_1",
    meal_name: "Dinner & Broth",
    time: "19:00",
    instructions: "1.5 cups dry food + 1/4 cup warm organic bone broth",
    enabled: true
  },
  {
    id: "feed_4",
    pet_id: "pet_2",
    meal_name: "Morning Wet Paté",
    time: "07:30",
    instructions: "1 can turkey & giblets paté served at room temperature",
    enabled: true
  },
  {
    id: "feed_5",
    pet_id: "pet_2",
    meal_name: "Evening Indoor Crunch",
    time: "18:30",
    instructions: "1/2 cup digestive health dry formula in slow puzzle feeder",
    enabled: true
  },
  {
    id: "feed_6",
    pet_id: "pet_3",
    meal_name: "Morning Seed & Veggie Mix",
    time: "08:30",
    instructions: "2 tbsp pellet blend + fresh chop (kale, carrot, broccoli)",
    enabled: true
  }
];

export const INITIAL_HEALTH_RECORDS = [
  {
    id: "health_1",
    pet_id: "pet_1",
    type: "vaccination",
    title: "DHPP 3-Year Booster (Distemper, Parvo)",
    date: "2026-04-12",
    next_due_date: "2027-04-12",
    doctor_clinic: "Oakwood Companion Animal Clinic",
    notes: "Annual antibody titer confirmed excellent protection. Batch #DH-9082."
  },
  {
    id: "health_2",
    pet_id: "pet_1",
    type: "vaccination",
    title: "Rabies 3-Year Core Vaccine",
    date: "2025-06-20",
    next_due_date: "2028-06-20",
    doctor_clinic: "Oakwood Companion Animal Clinic",
    notes: "Tag #RB-44129. Official municipal certificate issued."
  },
  {
    id: "health_3",
    pet_id: "pet_1",
    type: "medication",
    title: "Simparica Trio (Flea/Tick/Heartworm)",
    date: "2026-10-01",
    next_due_date: "2026-11-01",
    doctor_clinic: "Dr. Sarah Jenkins",
    notes: "One flavored chewable tablet on the 1st of each month with food."
  },
  {
    id: "health_4",
    pet_id: "pet_1",
    type: "vet_visit",
    title: "Bi-Annual Wellness & Weight Check",
    date: "2026-10-28",
    next_due_date: "2026-10-28",
    doctor_clinic: "Oakwood Companion Animal Clinic",
    notes: "Routine coat exam, dental check and nail trim consultation."
  },
  {
    id: "health_5",
    pet_id: "pet_2",
    type: "vaccination",
    title: "FVRCP Core Feline Booster",
    date: "2026-02-14",
    next_due_date: "2027-02-14",
    doctor_clinic: "Sunrise Feline Specialty Clinic",
    notes: "Subcutaneous right shoulder. Tolerated well."
  },
  {
    id: "health_6",
    pet_id: "pet_2",
    type: "medication",
    title: "Revolution Plus Topical Solution",
    date: "2026-10-05",
    next_due_date: "2026-11-05",
    doctor_clinic: "Dr. Alex Rivera",
    notes: "Apply directly to back of neck between shoulder blades."
  }
];

export const INITIAL_CARE_LOGS = [
  {
    id: "log_1",
    pet_id: "pet_1",
    activity: "feeding",
    date_time: "2026-10-14 08:05",
    completed: true,
    notes: "Ate entire breakfast portion enthusiastically."
  },
  {
    id: "log_2",
    pet_id: "pet_1",
    activity: "walk",
    date_time: "2026-10-14 08:45",
    completed: true,
    notes: "35-minute brisk walk around Riverdale park."
  },
  {
    id: "log_3",
    pet_id: "pet_1",
    activity: "water",
    date_time: "2026-10-14 09:15",
    completed: true,
    notes: "Ceramic water bowl washed and refilled with chilled filtered water."
  },
  {
    id: "log_4",
    pet_id: "pet_1",
    activity: "grooming",
    date_time: "2026-10-13 17:30",
    completed: true,
    notes: "Undercoat de-shedding brushed and paw pads moisturized."
  },
  {
    id: "log_5",
    pet_id: "pet_2",
    activity: "feeding",
    date_time: "2026-10-14 07:35",
    completed: true,
    notes: "Wet food served and eaten completely."
  },
  {
    id: "log_6",
    pet_id: "pet_2",
    activity: "water",
    date_time: "2026-10-14 08:00",
    completed: true,
    notes: "Cat fountain filter checked and refilled."
  }
];

export const INITIAL_NEARBY_VETS = [
  {
    id: "vet_1",
    name: "Oakwood Companion Animal Clinic",
    rating: 4.9,
    reviewsCount: 184,
    distance: "0.8 miles away",
    address: "424 Elm Street, Riverdale Heights",
    phone: "+1 (555) 234-5678",
    hours: "Open Now • Closes 7:00 PM",
    isEmergency: false,
    services: ["Preventive Wellness", "Vaccinations", "Dental", "General Surgery"],
    website: "https://oakwoodvet.example.com"
  },
  {
    id: "vet_2",
    name: "Riverdale 24/7 Emergency Pet Hospital",
    rating: 4.8,
    reviewsCount: 342,
    distance: "1.4 miles away",
    address: "890 Central Avenue, Suite 100",
    phone: "+1 (555) 911-7387",
    hours: "Open 24 Hours • 7 Days a Week",
    isEmergency: true,
    services: ["24/7 Emergency", "Critical ICU", "Digital X-Ray & CT", "Poison Control"],
    website: "https://riverdale-emergency-vet.example.com"
  },
  {
    id: "vet_3",
    name: "Paws & Whiskers Holistic Pet Wellness",
    rating: 4.7,
    reviewsCount: 96,
    distance: "2.1 miles away",
    address: "115 Blossom Hill Road",
    phone: "+1 (555) 345-6789",
    hours: "Open Now • Closes 6:00 PM",
    isEmergency: false,
    services: ["Acupuncture", "Nutrition Counseling", "Senior Pet Mobility", "Laser Therapy"],
    website: "https://pawswhiskerholistic.example.com"
  },
  {
    id: "vet_4",
    name: "Sunrise Feline & Exotic Specialty Clinic",
    rating: 4.9,
    reviewsCount: 128,
    distance: "3.5 miles away",
    address: "67 Meadowbrook Parkway",
    phone: "+1 (555) 456-7890",
    hours: "Open Now • Closes 5:30 PM",
    isEmergency: false,
    services: ["Feline-Only Friendly", "Avian & Bird Medicine", "Rabbit & Small Mammal Care"],
    website: "https://sunrisecatandbird.example.com"
  }
];

export const INITIAL_SETTINGS = {
  theme: "light",
  notifications_enabled: true,
  lead_time_mins: 15,
  sound_enabled: true,
  emergency_vet_name: "Riverdale 24/7 Emergency Pet Hospital",
  emergency_vet_phone: "+1 (555) 911-7387",
  emergency_vet_address: "890 Central Avenue, Suite 100",
  active_pet_id: "pet_1"
};
