// Mock data for Ghana Air Force Barracks Portal - loads instantly with no network delay
export const mockAnnouncements = [
  {
    id: '1',
    title: 'Annual Ghana Air Force Day Celebration - March 15th',
    content: 'The Ghana Air Force will celebrate its 63rd Anniversary on March 15th, 2026. All personnel and their families are invited to the parade and ceremony at the Air Force Base. Dress code: Service dress uniform for military personnel, formal attire for civilians. Report to assembly point by 0700 hours.',
    category: 'general',
    priority: 'high',
    createdAt: new Date('2026-03-01'),
    author: 'Wing Commander Mensah - Base Commander'
  },
  {
    id: '2', 
    title: 'Barracks Accommodation Allocation - Q2 2026',
    content: 'The Base Housing Office announces the allocation of married quarters for eligible personnel. Applications are now open for officers and senior NCOs. All applications must be submitted through the online portal by March 20th. Required documents include service record, marriage certificate, and family details. Priority will be given to personnel with longer service duration.',
    category: 'general',
    priority: 'medium',
    createdAt: new Date('2026-03-04'),
    author: 'Squadron Leader Addo - Housing Officer'
  },
  {
    id: '3',
    title: 'Medical Facility Upgrade Notice',
    content: 'The Ghana Air Force Medical Centre will undergo renovations from March 10-12, 2026. Emergency services will remain operational. For routine consultations during this period, personnel should visit the 37 Military Hospital. Ambulance services remain available 24/7. Call extension 2222 for emergencies.',
    category: 'maintenance',
    priority: 'high',
    createdAt: new Date('2026-03-03'),
    author: 'Major Dr. Asante - Chief Medical Officer'
  },
  {
    id: '4',
    title: 'Commissioning of New Airmen Mess Hall',
    content: 'The newly constructed Airmen Mess Hall will be commissioned on March 18th by the Chief of Air Staff. The facility features modern kitchen equipment, air-conditioned dining area with capacity for 500 personnel, and extended operating hours (0500-2200hrs). All airmen are encouraged to attend the commissioning ceremony at 1000hrs.',
    category: 'general',
    priority: 'medium',
    createdAt: new Date('2026-02-28'),
    author: 'Flight Lieutenant Boateng - Logistics Officer'
  },
  {
    id: '5',
    title: 'Education Scholarship Program 2026',
    content: 'The Ghana Air Force Dependants Scholarship Scheme is now accepting applications for the 2026/2027 academic year. Children of serving personnel from JHS to University level are eligible. Application deadline: March 31st. Forms available at the Base Education Office. Successful candidates will be notified by April 30th.',
    category: 'general',
    priority: 'medium',
    createdAt: new Date('2026-02-25'),
    author: 'Group Captain Owusu - Education & Welfare'
  },
  {
    id: '6',
    title: 'Quarterly Welfare Deduction Information',
    content: 'All personnel are reminded that Q1 2026 welfare deductions have been processed. Statements are available at the Finance Office. For queries regarding deductions, visit the Accounts Section between 0800-1400hrs, Monday to Friday. Bring your service number and recent pay slip.',
    category: 'general',
    priority: 'low',
    createdAt: new Date('2026-02-20'),
    author: 'Flight Lieutenant Darko - Finance Officer'
  },
  {
    id: '7',
    title: 'New Physical Training Schedule',
    content: 'Effective March 8th, mandatory PT sessions will be held Monday, Wednesday, and Friday at 0600hrs. All able-bodied personnel below 50 years must participate. Exemptions require Medical Officer certification. PT will include cardiovascular training, strength conditioning, and formation runs. Proper PT uniform mandatory.',
    category: 'training',
    priority: 'high',
    createdAt: new Date('2026-02-27'),
    author: 'Warrant Officer Class 1 Ampofo - PT Instructor'
  },
  {
    id: '8',
    title: 'Internet and WiFi Service Upgrade',
    content: 'Ghana Telecom will upgrade internet infrastructure in all barracks accommodations March 13-14. Expect brief service interruptions. Upon completion, bandwidth will increase from 10Mbps to 50Mbps shared. WiFi passwords will be reset - collect new credentials from the IT Help Desk at Base HQ.',
    category: 'maintenance',
    priority: 'medium',
    createdAt: new Date('2026-02-26'),
    author: 'Flying Officer Tetteh - IT Services'
  }
];

export const mockEvents = [
  {
    id: '1',
    title: 'Ghana Air Force 63rd Anniversary Parade',
    description: 'Join us for the grand celebration of the 63rd Anniversary of the Ghana Air Force. Programme includes: March past by various units, aerial display by our fighter jets, awards ceremony for distinguished service, cultural performances, and family fun fair. All personnel and families welcome. Light refreshments will be served.',
    date: new Date('2026-03-15'),
    location: 'Air Force Base Parade Ground, Accra',
    category: 'ceremony',
    createdAt: new Date('2026-02-15'),
    organizer: 'Base Command - Events Committee'
  },
  {
    id: '2',
    title: 'Combat Readiness Training Exercise',
    description: 'Mandatory field exercise for all combat units. Training will cover tactical operations, emergency response protocols, weapons handling, and teamwork under pressure. Personnel should report with full field gear, rations, and water. Medical team will be on standby. Duration: 5 days (overnight camp).',
    date: new Date('2026-03-20'),
    location: 'Bundase Military Training School',
    category: 'training',
    createdAt: new Date('2026-02-10'),
    organizer: 'Wing Commander Nkrumah - Training Officer'
  },
  {
    id: '3',
    title: 'Fire Safety & Emergency Response Drill',
    description: 'Quarterly fire safety drill for all barracks residents. Demonstration of fire extinguisher usage, evacuation procedures, first aid basics, and emergency assembly points. Participation is mandatory for at least one family member per household. Certificate of attendance will be issued.',
    date: new Date('2026-03-10'),
    location: 'Station Fire Service HQ',
    category: 'training',
    createdAt: new Date('2026-02-28'),
    organizer: 'Squadron Leader Appiah - Fire & Safety Officer'
  },
  {
    id: '4',
    title: 'Inter-Squadron Football Championship Finals',
    description: 'The much-anticipated finals between No. 1 Squadron and Air Defence Squadron. Gates open at 1400hrs, kick-off at 1500hrs. Free entry for all Ghana Air Force personnel and families. Trophy presentation by the Chief of Air Staff. Food and drinks on sale.',
    date: new Date('2026-03-16'),
    location: 'Air Force Sports Complex',
    category: 'sports',
    createdAt: new Date('2026-03-01'),
    organizer: 'Sports & Recreation Committee'
  },
  {
    id: '5',
    title: 'Families Day & Kids Carnival',
    description: 'Annual family bonding event with activities for all ages. Children activities include: bouncy castles, face painting, talent show, spelling bee competition. Adults: volleyball tournament, tug of war, sack race. Free food and drinks. Special appearances by Ghana Air Force aerobatic team. Theme: "Strong Families, Strong Air Force"',
    date: new Date('2026-03-22'),
    location: 'Officers Mess Gardens',
    category: 'social',
    createdAt: new Date('2026-02-18'),
    organizer: 'Families Welfare Association'
  },
  {
    id: '6',
    title: 'Aviation Maintenance Workshop',
    description: 'Professional development workshop for ground crew and technicians. Topics: Advanced aircraft systems, modern diagnostic tools, safety protocols, and emerging aviation technologies. Guest speaker: Chief Engineer from Ghana Civil Aviation Authority. CPD points available. Registration required.',
    date: new Date('2026-03-25'),
    location: 'Aircraft Maintenance Hangar 3',
    category: 'training',
    createdAt: new Date('2026-02-20'),
    organizer: 'Engineering Wing'
  },
  {
    id: '7',
    title: 'Medical Outreach - Free Health Screening',
    description: 'Comprehensive health screening for all barracks residents. Tests include: Blood pressure, blood sugar, BMI assessment, vision test, and general consultation. Results available same day. Bring your medical folder. Children screening: growth monitoring and immunization updates.',
    date: new Date('2026-03-12'),
    location: 'Air Force Medical Centre',
    category: 'health',
    createdAt: new Date('2026-02-25'),
    organizer: 'Ghana Air Force Medical Services'
  },
  {
    id: '8',
    title: 'Officers Mess Dinner Night',
    description: 'Monthly formal dinner for commissioned officers and their spouses. Dress code: Mess dress/Evening wear. Four-course dinner with live band entertainment. Guest of honour: Air Vice-Marshal Quartey (Rtd). RSVP by March 14th. Members: GHS 150, Guests: GHS 200.',
    date: new Date('2026-03-17'),
    location: 'Officers Mess Hall',
    category: 'social',
    createdAt: new Date('2026-03-02'),
    organizer: 'Officers Mess Committee'
  },
  {
    id: '9',
    title: 'Youth Leadership Camp',
    description: 'Leadership and mentorship program for teenagers (ages 13-18) of Air Force personnel. Activities include: Leadership workshops, team building exercises, career guidance, motivational talks, and camping skills. Limited to 50 participants. Application forms at Base Education Office.',
    date: new Date('2026-03-28'),
    location: 'Youth Camp, Burma Camp',
    category: 'youth',
    createdAt: new Date('2026-02-22'),
    organizer: 'Youth & Education Services'
  },
  {
    id: '10',
    title: 'Chapel Service - Combined Christian Worship',
    description: 'Monthly combined service for all Christian denominations. Theme: "Faith and Service to Nation". Special ministration by Rev. Major Adjei. All are welcome. Service includes Holy Communion. Children ministry runs concurrently.',
    date: new Date('2026-03-14'),
    location: 'Air Force Base Chapel',
    category: 'religious',
    createdAt: new Date('2026-03-03'),
    organizer: 'Base Chaplaincy Services'
  }
];

export const mockAlerts = [
  {
    id: '1',
    title: 'Security Alert - Heightened Base Security',
    message: 'Due to current national security advisories, all entry points will implement enhanced screening procedures. Personnel must present valid ID cards. Visitors require 48-hour advance clearance. Vehicle checks at all gates. Report suspicious activities to Base Security immediately on ext. 3333.',
    severity: 'high',
    status: 'active',
    createdAt: new Date('2026-03-05'),
    expiresAt: new Date('2026-03-20')
  },
  {
    id: '2',
    title: 'Water Supply Interruption - Scheduled Maintenance',
    message: 'Ghana Water Company will conduct pipeline maintenance affecting the entire barracks on March 8th from 0800hrs to 1600hrs. Water supply will be interrupted. All residents should store adequate water. Tanker services available for emergencies - contact Base Engineer on ext. 4444.',
    severity: 'warning',
    status: 'active',
    createdAt: new Date('2026-03-06'),
    expiresAt: new Date('2026-03-08')
  },
  {
    id: '3',
    title: 'Ordnance Safety Notice',
    message: 'Ammunition inspection and inventory in progress at the Base Armoury March 9-11. All firearms and ammunition must be accounted for. Unit armorers should coordinate with the Central Armoury. Live firing exercises suspended until further notice. Safety compliance mandatory.',
    severity: 'high',
    status: 'active',
    createdAt: new Date('2026-03-04'),
    expiresAt: new Date('2026-03-11')
  },
  {
    id: '4',
    title: 'Power Outage Alert',
    message: 'ECG has announced load shedding schedule for this week. Affected areas: Blocks A, C, and E - Monday & Wednesday (2000-2400hrs). Emergency generator will power essential services only. Residents advised to charge devices and plan accordingly.',
    severity: 'warning',
    status: 'active',
    createdAt: new Date('2026-03-05'),
    expiresAt: new Date('2026-03-12')
  },
  {
    id: '5',
    title: 'Medical Emergency Hotline Active',
    message: 'Air Force Medical Centre 24/7 emergency line now operational. For medical emergencies, dial 191 from any base phone or +233-30-777-2222 from mobile. Ambulance response time: 5-10 minutes. Keep this number saved. Non-emergency consultations: 0800-1700hrs weekdays.',
    severity: 'info',
    status: 'active',
    createdAt: new Date('2026-03-01'),
    expiresAt: new Date('2026-06-01')
  },
  {
    id: '6',
    title: 'Gate Access Hours Update',
    message: 'Gate C (South Gate) operating hours temporarily changed to 0600-1800hrs only due to construction work. Main Gate and Gate B remain 24hrs. After 1800hrs, use alternative gates. Gate C returns to normal schedule March 18th. Plan your movements accordingly.',
    severity: 'info',
    status: 'active',
    createdAt: new Date('2026-03-03'),
    expiresAt: new Date('2026-03-18')
  },
  {
    id: '7',
    title: 'COVID-19 Vaccination Booster Available',
    message: 'Ghana Health Service approved COVID-19 booster doses now available at the Medical Centre. Priority: personnel deploying overseas, high-risk individuals, and volunteers. Walk-ins accepted Monday-Friday 0900-1500hrs. Bring vaccination card and service ID.',
    severity: 'info',
    status: 'active',
    createdAt: new Date('2026-02-28'),
    expiresAt: new Date('2026-03-31')
  },
  {
    id: '8',
    title: 'Dangerous Animals Alert',
    message: 'Residents are advised that snakes have been sighted near the residential blocks due to ongoing bush clearing. Exercise caution, especially during early morning and evening hours. Do not attempt to kill or capture. Contact Base Fire Service (ext. 2222) for safe removal. Keep surroundings clean.',
    severity: 'warning',
    status: 'active',
    createdAt: new Date('2026-03-04'),
    expiresAt: new Date('2026-03-15')
  },
  {
    id: '9',
    title: 'Pay Day Advance Notice',
    message: 'March 2026 salaries will be paid on Thursday, March 11th. Controller & Accountant General has confirmed timely release of funds. Deductions include: SSNIT, Tax, Welfare, Loan repayments, and Mess bills. Check pay slips carefully and report discrepancies within 7 days to Finance Office.',
    severity: 'info',
    status: 'active',
    createdAt: new Date('2026-03-06'),
    expiresAt: new Date('2026-03-11')
  },
  {
    id: '10',
    title: 'Flight Operations Noise Warning',
    message: 'Increased flight training activities scheduled for next week. Expect higher noise levels from jet engines and helicopter operations between 0700-1700hrs. Training includes low-altitude maneuvers and night flying exercises. We apologize for any inconvenience. Essential for operational readiness.',
    severity: 'info',
    status: 'active',
    createdAt: new Date('2026-03-05'),
    expiresAt: new Date('2026-03-14')
  }
];

export const mockDashboardData = {
  stats: {
    totalAlerts: 10,
    activeAlerts: 10,
    totalAnnouncements: 8,
    totalEvents: 10
  },
  recentAlerts: mockAlerts.slice(0, 5),
  recentAnnouncements: mockAnnouncements.slice(0, 5),
  upcomingEvents: mockEvents.slice(0, 5)
};

const adminSeedUsers = [
  {
    id: 'u1',
    name: 'Sqn Ldr Michael Addo',
    email: 'michael.addo@airforce.mil.gh',
    role: 'admin',
    unit: 'Base Operations',
    status: 'active'
  },
  {
    id: 'u2',
    name: 'WO1 Samuel Tetteh',
    email: 'samuel.tetteh@airforce.mil.gh',
    role: 'moderator',
    unit: 'Security Wing',
    status: 'active'
  },
  {
    id: 'u3',
    name: 'Flt Lt Nana Boateng',
    email: 'nana.boateng@airforce.mil.gh',
    role: 'user',
    unit: 'Engineering Unit',
    status: 'active'
  },
  {
    id: 'u4',
    name: 'Sgt Kwame Ofori',
    email: 'kwame.ofori@airforce.mil.gh',
    role: 'user',
    unit: 'Technical Support',
    status: 'on-leave'
  },
  {
    id: 'u5',
    name: 'Cpl Linda Asante',
    email: 'linda.asante@airforce.mil.gh',
    role: 'user',
    unit: 'Medical Services',
    status: 'active'
  }
];

const rankRotation = ['AC', 'LAC', 'Cpl', 'Sgt', 'Flt Lt', 'Fg Off', 'WO2', 'WO1'];
const firstNameRotation = ['Kojo', 'Ama', 'Yaw', 'Akua', 'Kofi', 'Efua', 'Nii', 'Abena', 'Kwesi', 'Adwoa', 'Yawson', 'Mavis'];
const lastNameRotation = ['Mensah', 'Asiedu', 'Agyeman', 'Owusu', 'Boadu', 'Annan', 'Amoako', 'Sarpong', 'Donkor', 'Asare', 'Lamptey', 'Nartey'];
const unitRotation = [
  'Base Operations',
  'Security Wing',
  'Engineering Unit',
  'Air Traffic Control',
  'Signals and Communications',
  'Medical Services',
  'Logistics and Supply',
  'Technical Support',
  'Fire and Rescue',
  'Training Command'
];
const roleRotation = ['user', 'user', 'user', 'moderator', 'user'];
const statusRotation = ['active', 'active', 'on-duty', 'active', 'training', 'active', 'on-leave'];

const generatedManagedUsers = Array.from({ length: 55 }, (_, index) => {
  const firstName = firstNameRotation[index % firstNameRotation.length];
  const lastName = lastNameRotation[(index * 3) % lastNameRotation.length];
  const rank = rankRotation[index % rankRotation.length];
  const unit = unitRotation[index % unitRotation.length];
  const role = roleRotation[index % roleRotation.length];
  const status = statusRotation[index % statusRotation.length];

  return {
    id: `u${index + 6}`,
    name: `${rank} ${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index + 6}@airforce.mil.gh`,
    role,
    unit,
    status
  };
});

const allManagedUsers = [...adminSeedUsers, ...generatedManagedUsers];
const activeManagedUsersCount = allManagedUsers.filter(
  (user) => user.status === 'active' || user.status === 'on-duty'
).length;

const unitSummary = Object.values(
  allManagedUsers.reduce((acc, user) => {
    if (!acc[user.unit]) {
      acc[user.unit] = {
        unit: user.unit,
        personnel: 0,
        active: 0,
        training: 0,
        onLeave: 0
      };
    }

    acc[user.unit].personnel += 1;
    if (user.status === 'active' || user.status === 'on-duty') acc[user.unit].active += 1;
    if (user.status === 'training') acc[user.unit].training += 1;
    if (user.status === 'on-leave') acc[user.unit].onLeave += 1;
    return acc;
  }, {})
).sort((a, b) => b.personnel - a.personnel);

export const mockAdminData = {
  stats: {
    totalAlerts: mockAlerts.length,
    totalEvents: mockEvents.length,
    totalAnnouncements: mockAnnouncements.length,
    recentActivity: mockAlerts.length + mockEvents.length + mockAnnouncements.length,
    activeUsers: activeManagedUsersCount,
    totalPersonnel: allManagedUsers.length,
    pendingRequests: 12
  },
  recentAlerts: mockAlerts.slice(0, 5),
  recentEvents: mockEvents.slice(0, 5),
  recentAnnouncements: mockAnnouncements.slice(0, 5),
  managedUsers: allManagedUsers,
  unitSummary,
  settings: [
    {
      id: 's1',
      name: 'Alert Approval Workflow',
      value: 'Enabled',
      status: 'configured'
    },
    {
      id: 's2',
      name: 'Event Auto-Reminder',
      value: '24 hours before start',
      status: 'configured'
    },
    {
      id: 's3',
      name: 'Announcement Visibility',
      value: 'All authenticated users',
      status: 'configured'
    },
    {
      id: 's4',
      name: 'Data Retention Policy',
      value: '180 days',
      status: 'review'
    }
  ],
  auditLogs: [
    {
      id: 'a1',
      action: 'Alert published',
      actor: 'admin@demo.com',
      target: 'Security Alert - Heightened Base Security',
      createdAt: new Date('2026-03-06T08:15:00')
    },
    {
      id: 'a2',
      action: 'Event updated',
      actor: 'admin@demo.com',
      target: 'Combat Readiness Training Exercise',
      createdAt: new Date('2026-03-05T17:25:00')
    },
    {
      id: 'a3',
      action: 'Announcement created',
      actor: 'admin@demo.com',
      target: 'Education Scholarship Program 2026',
      createdAt: new Date('2026-03-04T11:45:00')
    },
    {
      id: 'a4',
      action: 'Role assignment',
      actor: 'system',
      target: 'WO1 Samuel Tetteh -> moderator',
      createdAt: new Date('2026-03-03T09:30:00')
    }
  ]
};
