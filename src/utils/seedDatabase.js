/**
 * Database Seeder
 * Populates Firestore with realistic test data for development and testing
 *
 * USAGE:
 * 1. Import this file in your development environment
 * 2. Call seedDatabase() from a button or console
 * 3. WARNING: This will create real documents in Firestore
 */

import { Timestamp } from 'firebase/firestore';
import { createUnit } from '../services/unitsService';
import { createTurn } from '../services/turnsService';
import { createCalendarEvent } from '../services/calendarService';
import { createVendor } from '../services/vendorsService';
import { createUserProfile } from '../services/usersService';
import { logActivity } from '../services/activityService';

// ============================================================================
// SAMPLE DATA GENERATORS
// ============================================================================

/**
 * Generate sample units
 */
function generateUnits() {
  const units = [];

  // Generate 120 units across different configurations
  const unitConfigs = [
    { bedrooms: 0, bathrooms: 1, sqft: 450, count: 20 }, // Studios
    { bedrooms: 1, bathrooms: 1, sqft: 650, count: 40 }, // 1BR/1BA
    { bedrooms: 2, bathrooms: 1, sqft: 850, count: 25 }, // 2BR/1BA
    { bedrooms: 2, bathrooms: 2, sqft: 950, count: 25 }, // 2BR/2BA
    { bedrooms: 3, bathrooms: 2, sqft: 1150, count: 10 }, // 3BR/2BA
  ];

  let unitCounter = 101;

  unitConfigs.forEach(config => {
    for (let i = 0; i < config.count; i++) {
      const isVacant = Math.random() < 0.08; // 8% vacancy rate
      const vacantDays = isVacant ? Math.floor(Math.random() * 14) + 1 : 0;

      units.push({
        unitNumber: String(unitCounter),
        bedrooms: config.bedrooms,
        bathrooms: config.bathrooms,
        squareFootage: config.sqft + Math.floor(Math.random() * 100),
        floor: Math.floor(unitCounter / 100),
        building: 'Main',
        status: isVacant ? (Math.random() < 0.3 ? 'In Progress' : 'Ready') : 'Occupied',
        currentTurnId: null,
        lastTurnCompletedDate: isVacant ? null : Timestamp.fromDate(
          new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000)
        ),
        isVacant,
        vacantSince: isVacant ? Timestamp.fromDate(
          new Date(Date.now() - vacantDays * 24 * 60 * 60 * 1000)
        ) : null,
        daysVacant: vacantDays,
        notes: Math.random() < 0.2 ? 'Corner unit with great natural light' : '',
        amenities: config.sqft > 900 ? ['Balcony', 'Updated Kitchen'] : []
      });

      unitCounter++;
    }
  });

  return units;
}

/**
 * Generate sample vendors
 */
function generateVendors() {
  return [
    {
      vendorName: 'CleanPro Services',
      category: 'Carpet',
      contactName: 'Robert Johnson',
      phone: '(555) 123-4567',
      alternatePhone: '',
      email: 'robert@cleanpro.com',
      website: 'https://cleanproservices.com',
      address: {
        street: '123 Business Blvd',
        city: 'Austin',
        state: 'TX',
        zip: '78701'
      },
      servicesOffered: ['Carpet Cleaning', 'Upholstery', 'Tile Cleaning'],
      licensedInsured: true,
      preferredVendor: true,
      rating: 4.5,
      lastServiceDate: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
      totalJobsCompleted: 47,
      notes: 'Usually available within 48 hours',
      active: true
    },
    {
      vendorName: 'CoolAir HVAC',
      category: 'HVAC',
      contactName: 'Jennifer Martinez',
      phone: '(555) 234-5678',
      alternatePhone: '(555) 234-5679',
      email: 'service@coolair.com',
      website: 'https://coolairhvac.com',
      address: {
        street: '456 Industrial Park',
        city: 'Austin',
        state: 'TX',
        zip: '78702'
      },
      servicesOffered: ['AC Repair', 'Heating', 'Maintenance'],
      licensedInsured: true,
      preferredVendor: true,
      rating: 4.8,
      lastServiceDate: Timestamp.fromDate(new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)),
      totalJobsCompleted: 32,
      notes: 'Emergency service available',
      active: true
    },
    {
      vendorName: 'Perfect Paint Co',
      category: 'Paint',
      contactName: 'David Lee',
      phone: '(555) 345-6789',
      alternatePhone: '',
      email: 'david@perfectpaint.com',
      website: '',
      address: null,
      servicesOffered: ['Interior Painting', 'Touch-ups', 'Cabinet Refinishing'],
      licensedInsured: true,
      preferredVendor: false,
      rating: 4.2,
      lastServiceDate: Timestamp.fromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)),
      totalJobsCompleted: 18,
      notes: '',
      active: true
    },
    {
      vendorName: 'FlowRight Plumbing',
      category: 'Plumbing',
      contactName: 'Sarah Williams',
      phone: '(555) 456-7890',
      alternatePhone: '',
      email: 'sarah@flowright.com',
      website: 'https://flowrightplumbing.com',
      address: {
        street: '789 Trade Center',
        city: 'Austin',
        state: 'TX',
        zip: '78703'
      },
      servicesOffered: ['Plumbing Repair', 'Drain Cleaning', 'Fixture Installation'],
      licensedInsured: true,
      preferredVendor: true,
      rating: 4.6,
      lastServiceDate: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
      totalJobsCompleted: 55,
      notes: 'Same-day service for emergencies',
      active: true
    },
    {
      vendorName: 'Bright Spark Electric',
      category: 'Electrical',
      contactName: 'Michael Chen',
      phone: '(555) 567-8901',
      alternatePhone: '(555) 567-8902',
      email: 'mike@brightspark.com',
      website: 'https://brightsparkelectric.com',
      address: {
        street: '321 Commerce Dr',
        city: 'Austin',
        state: 'TX',
        zip: '78704'
      },
      servicesOffered: ['Electrical Repair', 'Lighting', 'Panel Upgrades'],
      licensedInsured: true,
      preferredVendor: true,
      rating: 4.7,
      lastServiceDate: Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)),
      totalJobsCompleted: 28,
      notes: 'Licensed master electrician',
      active: true
    },
    {
      vendorName: 'ApplianceFix Pro',
      category: 'Appliance',
      contactName: 'Tom Anderson',
      phone: '(555) 678-9012',
      alternatePhone: '',
      email: 'tom@appliancefix.com',
      website: '',
      address: null,
      servicesOffered: ['Appliance Repair', 'Installation', 'Maintenance'],
      licensedInsured: true,
      preferredVendor: false,
      rating: 4.0,
      lastServiceDate: Timestamp.fromDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)),
      totalJobsCompleted: 22,
      notes: 'Specializes in refrigerators and dishwashers',
      active: true
    }
  ];
}

/**
 * Generate sample technician users
 */
function generateTechnicians() {
  return [
    {
      uid: 'tech-john-123',
      email: 'john.doe@maintenance.com',
      displayName: 'John Doe',
      phoneNumber: '(555) 111-2222',
      role: 'Technician',
      permissions: ['turns.view', 'turns.edit', 'units.view', 'calendar.view'],
      active: true,
      emailVerified: true,
      photoURL: null,
      bio: 'Senior maintenance technician with 10 years experience',
      specialties: ['Plumbing', 'Electrical', 'HVAC'],
      certifications: ['EPA 608', 'Electrical License'],
      lastLoginAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
      totalTurnsCompleted: 143,
      avgTurnCompletionTime: 4.8,
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false
      }
    },
    {
      uid: 'tech-sarah-456',
      email: 'sarah.miller@maintenance.com',
      displayName: 'Sarah Miller',
      phoneNumber: '(555) 222-3333',
      role: 'Technician',
      permissions: ['turns.view', 'turns.edit', 'units.view', 'calendar.view'],
      active: true,
      emailVerified: true,
      photoURL: null,
      bio: 'Detail-oriented technician specializing in turn cleaning',
      specialties: ['Cleaning', 'Paint', 'Minor Repairs'],
      certifications: ['OSHA Safety'],
      lastLoginAt: Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 60 * 1000)),
      totalTurnsCompleted: 98,
      avgTurnCompletionTime: 5.2,
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: true
      }
    },
    {
      uid: 'tech-mike-789',
      email: 'mike.roberts@maintenance.com',
      displayName: 'Mike Roberts',
      phoneNumber: '(555) 333-4444',
      role: 'Technician',
      permissions: ['turns.view', 'turns.edit', 'units.view', 'calendar.view'],
      active: true,
      emailVerified: true,
      photoURL: null,
      bio: 'Experienced in HVAC and appliance repair',
      specialties: ['HVAC', 'Appliances', 'Carpentry'],
      certifications: ['EPA 608', 'HVAC Universal'],
      lastLoginAt: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
      totalTurnsCompleted: 67,
      avgTurnCompletionTime: 6.1,
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: false
      }
    }
  ];
}

/**
 * Generate sample turns for vacant units
 */
function generateTurns(units, technicians) {
  const turns = [];
  const techniciansList = technicians;

  // Get vacant units with In Progress status
  const vacantUnits = units.filter(u => u.isVacant && u.status === 'In Progress');

  vacantUnits.forEach((unit, index) => {
    const tech = techniciansList[index % techniciansList.length];
    const daysInProgress = Math.floor(Math.random() * 8) + 1;
    const targetDays = 5;

    // Standard checklist based on unit size
    const checklist = [
      {
        taskId: 'task-1',
        taskName: 'Initial Walkthrough',
        category: 'Inspection',
        required: true,
        order: 1,
        completed: true,
        completedBy: tech.uid,
        completedByName: tech.displayName,
        completedAt: Timestamp.fromDate(new Date(Date.now() - daysInProgress * 24 * 60 * 60 * 1000)),
        photos: [],
        notes: ''
      },
      {
        taskId: 'task-2',
        taskName: 'Deep Clean - Kitchen',
        category: 'Cleaning',
        required: true,
        order: 2,
        completed: daysInProgress > 2,
        completedBy: daysInProgress > 2 ? tech.uid : null,
        completedByName: daysInProgress > 2 ? tech.displayName : null,
        completedAt: daysInProgress > 2 ? Timestamp.fromDate(new Date(Date.now() - (daysInProgress - 2) * 24 * 60 * 60 * 1000)) : null,
        photos: [],
        notes: ''
      },
      {
        taskId: 'task-3',
        taskName: 'Deep Clean - Bathroom',
        category: 'Cleaning',
        required: true,
        order: 3,
        completed: daysInProgress > 2,
        completedBy: daysInProgress > 2 ? tech.uid : null,
        completedByName: daysInProgress > 2 ? tech.displayName : null,
        completedAt: daysInProgress > 2 ? Timestamp.fromDate(new Date(Date.now() - (daysInProgress - 2) * 24 * 60 * 60 * 1000)) : null,
        photos: [],
        notes: ''
      },
      {
        taskId: 'task-4',
        taskName: 'Deep Clean - Bedrooms',
        category: 'Cleaning',
        required: true,
        order: 4,
        completed: daysInProgress > 3,
        completedBy: daysInProgress > 3 ? tech.uid : null,
        completedByName: daysInProgress > 3 ? tech.displayName : null,
        completedAt: daysInProgress > 3 ? Timestamp.fromDate(new Date(Date.now() - (daysInProgress - 3) * 24 * 60 * 60 * 1000)) : null,
        photos: [],
        notes: ''
      },
      {
        taskId: 'task-5',
        taskName: 'Paint Touch-up',
        category: 'Maintenance',
        required: true,
        order: 5,
        completed: daysInProgress > 4,
        completedBy: daysInProgress > 4 ? tech.uid : null,
        completedByName: daysInProgress > 4 ? tech.displayName : null,
        completedAt: daysInProgress > 4 ? Timestamp.fromDate(new Date(Date.now() - (daysInProgress - 4) * 24 * 60 * 60 * 1000)) : null,
        photos: [],
        notes: ''
      },
      {
        taskId: 'task-6',
        taskName: 'Carpet Cleaning',
        category: 'Cleaning',
        required: true,
        order: 6,
        completed: false,
        completedBy: null,
        completedByName: null,
        completedAt: null,
        photos: [],
        notes: 'Vendor scheduled'
      },
      {
        taskId: 'task-7',
        taskName: 'HVAC Filter Replace',
        category: 'Maintenance',
        required: true,
        order: 7,
        completed: daysInProgress > 3,
        completedBy: daysInProgress > 3 ? tech.uid : null,
        completedByName: daysInProgress > 3 ? tech.displayName : null,
        completedAt: daysInProgress > 3 ? Timestamp.fromDate(new Date(Date.now() - (daysInProgress - 3) * 24 * 60 * 60 * 1000)) : null,
        photos: [],
        notes: ''
      },
      {
        taskId: 'task-8',
        taskName: 'Smoke Detector Test',
        category: 'Inspection',
        required: true,
        order: 8,
        completed: daysInProgress > 5,
        completedBy: daysInProgress > 5 ? tech.uid : null,
        completedByName: daysInProgress > 5 ? tech.displayName : null,
        completedAt: daysInProgress > 5 ? Timestamp.fromDate(new Date(Date.now() - (daysInProgress - 5) * 24 * 60 * 60 * 1000)) : null,
        photos: [],
        notes: ''
      },
      {
        taskId: 'task-9',
        taskName: 'Appliance Check',
        category: 'Inspection',
        required: true,
        order: 9,
        completed: daysInProgress > 5,
        completedBy: daysInProgress > 5 ? tech.uid : null,
        completedByName: daysInProgress > 5 ? tech.displayName : null,
        completedAt: daysInProgress > 5 ? Timestamp.fromDate(new Date(Date.now() - (daysInProgress - 5) * 24 * 60 * 60 * 1000)) : null,
        photos: [],
        notes: ''
      },
      {
        taskId: 'task-10',
        taskName: 'Keys & Access',
        category: 'Other',
        required: true,
        order: 10,
        completed: false,
        completedBy: null,
        completedByName: null,
        completedAt: null,
        photos: [],
        notes: ''
      },
      {
        taskId: 'task-11',
        taskName: 'Final Walkthrough',
        category: 'Inspection',
        required: true,
        order: 11,
        completed: false,
        completedBy: null,
        completedByName: null,
        completedAt: null,
        photos: [],
        notes: ''
      },
      {
        taskId: 'task-12',
        taskName: 'Photos & Documentation',
        category: 'Other',
        required: true,
        order: 12,
        completed: false,
        completedBy: null,
        completedByName: null,
        completedAt: null,
        photos: [],
        notes: ''
      }
    ];

    turns.push({
      unitId: `unit-${unit.unitNumber}`,
      unitNumber: unit.unitNumber,
      status: 'In Progress',
      startDate: Timestamp.fromDate(new Date(Date.now() - daysInProgress * 24 * 60 * 60 * 1000)),
      targetCompletionDate: Timestamp.fromDate(new Date(Date.now() + (targetDays - daysInProgress) * 24 * 60 * 60 * 1000)),
      actualCompletionDate: null,
      assignedTechnicianId: tech.uid,
      assignedTechnicianName: tech.displayName,
      checklist,
      notes: index === 0 ? 'Scheduled carpet cleaning for tomorrow' : '',
      blockageReason: null,
      priority: daysInProgress > 6 ? 'High' : 'Normal'
    });
  });

  return turns;
}

/**
 * Generate sample calendar events
 */
function generateCalendarEvents(units, vendors, technicians) {
  const events = [];
  const today = new Date();

  // Carpet cleaning event (today)
  events.push({
    title: 'Carpet Cleaning - Unit 204',
    description: 'Deep carpet cleaning for all rooms',
    eventType: 'Vendor Visit',
    startDateTime: Timestamp.fromDate(new Date(today.setHours(14, 0, 0, 0))),
    endDateTime: Timestamp.fromDate(new Date(today.setHours(16, 0, 0, 0))),
    allDay: false,
    unitId: 'unit-204',
    unitNumber: '204',
    turnId: null,
    vendorId: 'vendor-cleanpro',
    vendorName: 'CleanPro Services',
    assignedTo: technicians[2].uid,
    assignedToName: technicians[2].displayName,
    status: 'Scheduled',
    completedAt: null,
    cancelledReason: null,
    notes: 'Use eco-friendly products',
    reminderSent: false
  });

  // Final inspection (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  events.push({
    title: 'Final Inspection - Unit 105',
    description: 'Final walkthrough before ready status',
    eventType: 'Inspection',
    startDateTime: Timestamp.fromDate(new Date(tomorrow.setHours(10, 0, 0, 0))),
    endDateTime: Timestamp.fromDate(new Date(tomorrow.setHours(11, 0, 0, 0))),
    allDay: false,
    unitId: 'unit-105',
    unitNumber: '105',
    turnId: null,
    vendorId: null,
    vendorName: null,
    assignedTo: technicians[1].uid,
    assignedToName: technicians[1].displayName,
    status: 'Scheduled',
    completedAt: null,
    cancelledReason: null,
    notes: '',
    reminderSent: false
  });

  // Move-in (2 days out)
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  events.push({
    title: 'Move-in - Unit 204',
    description: 'New tenant move-in',
    eventType: 'Move-in',
    startDateTime: Timestamp.fromDate(new Date(dayAfterTomorrow.setHours(13, 0, 0, 0))),
    endDateTime: Timestamp.fromDate(new Date(dayAfterTomorrow.setHours(14, 0, 0, 0))),
    allDay: false,
    unitId: 'unit-204',
    unitNumber: '204',
    turnId: null,
    vendorId: null,
    vendorName: null,
    assignedTo: technicians[0].uid,
    assignedToName: technicians[0].displayName,
    status: 'Scheduled',
    completedAt: null,
    cancelledReason: null,
    notes: 'Keys ready in office',
    reminderSent: false
  });

  // HVAC service (3 days out)
  const threeDaysOut = new Date();
  threeDaysOut.setDate(threeDaysOut.getDate() + 3);
  events.push({
    title: 'HVAC Service - Unit 402',
    description: 'Quarterly HVAC maintenance',
    eventType: 'Vendor Visit',
    startDateTime: Timestamp.fromDate(new Date(threeDaysOut.setHours(9, 0, 0, 0))),
    endDateTime: Timestamp.fromDate(new Date(threeDaysOut.setHours(11, 0, 0, 0))),
    allDay: false,
    unitId: 'unit-402',
    unitNumber: '402',
    turnId: null,
    vendorId: 'vendor-coolair',
    vendorName: 'CoolAir HVAC',
    assignedTo: technicians[2].uid,
    assignedToName: technicians[2].displayName,
    status: 'Scheduled',
    completedAt: null,
    cancelledReason: null,
    notes: '',
    reminderSent: false
  });

  return events;
}

/**
 * Generate sample activity log entries
 */
function generateActivities(technicians) {
  const activities = [];
  const now = Date.now();

  const sampleActivities = [
    {
      userId: technicians[0].uid,
      userName: technicians[0].displayName.split(' ')[0] + ' ' + technicians[0].displayName.split(' ')[1].charAt(0) + '.',
      userRole: 'Technician',
      action: 'Cleaning completed in Unit 204',
      actionType: 'task.completed',
      entityType: 'turn',
      entityId: 'turn-204',
      entityName: 'Unit 204 Turn',
      timestamp: Timestamp.fromDate(new Date(now - 2 * 60 * 60 * 1000)),
      metadata: { taskName: 'Deep Clean', unitNumber: '204' }
    },
    {
      userId: technicians[1].uid,
      userName: technicians[1].displayName.split(' ')[0] + ' ' + technicians[1].displayName.split(' ')[1].charAt(0) + '.',
      userRole: 'Technician',
      action: 'Keys returned for Unit 105',
      actionType: 'task.completed',
      entityType: 'turn',
      entityId: 'turn-105',
      entityName: 'Unit 105 Turn',
      timestamp: Timestamp.fromDate(new Date(now - 5 * 60 * 60 * 1000)),
      metadata: { taskName: 'Keys & Access', unitNumber: '105' }
    },
    {
      userId: technicians[2].uid,
      userName: technicians[2].displayName.split(' ')[0] + ' ' + technicians[2].displayName.split(' ')[1].charAt(0) + '.',
      userRole: 'Technician',
      action: 'Vendor scheduled for Unit 301',
      actionType: 'vendor.scheduled',
      entityType: 'calendar',
      entityId: 'event-301',
      entityName: 'Carpet Cleaning - Unit 301',
      timestamp: Timestamp.fromDate(new Date(now - 6 * 60 * 60 * 1000)),
      metadata: { vendorName: 'CleanPro Services', unitNumber: '301' }
    },
    {
      userId: technicians[0].uid,
      userName: technicians[0].displayName.split(' ')[0] + ' ' + technicians[0].displayName.split(' ')[1].charAt(0) + '.',
      userRole: 'Technician',
      action: 'Paint touch-up completed in Unit 204',
      actionType: 'task.completed',
      entityType: 'turn',
      entityId: 'turn-204',
      entityName: 'Unit 204 Turn',
      timestamp: Timestamp.fromDate(new Date(now - 27 * 60 * 60 * 1000)),
      metadata: { taskName: 'Paint Touch-up', unitNumber: '204' }
    },
    {
      userId: 'manager-001',
      userName: 'Manager',
      userRole: 'Manager',
      action: 'Final walkthrough passed for Unit 105',
      actionType: 'task.completed',
      entityType: 'turn',
      entityId: 'turn-105',
      entityName: 'Unit 105 Turn',
      timestamp: Timestamp.fromDate(new Date(now - 38 * 60 * 60 * 1000)),
      metadata: { taskName: 'Final Walkthrough', unitNumber: '105' }
    }
  ];

  return sampleActivities;
}

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

/**
 * Seed all data
 * @param {Object} options - Seeding options
 * @returns {Promise<Object>} Seeding results
 */
export async function seedDatabase(options = {}) {
  const {
    includeUnits = true,
    includeVendors = true,
    includeTechnicians = true,
    includeTurns = true,
    includeCalendar = true,
    includeActivities = true
  } = options;

  console.log('🌱 Starting database seeding...');

  const results = {
    units: { created: 0, errors: 0 },
    vendors: { created: 0, errors: 0 },
    technicians: { created: 0, errors: 0 },
    turns: { created: 0, errors: 0 },
    calendar: { created: 0, errors: 0 },
    activities: { created: 0, errors: 0 }
  };

  try {
    // Seed Vendors first
    let vendors = [];
    if (includeVendors) {
      console.log('📦 Seeding vendors...');
      const vendorData = generateVendors();
      for (const vendor of vendorData) {
        const result = await createVendor(vendor);
        if (result.success) {
          vendors.push({ ...vendor, id: result.data.id });
          results.vendors.created++;
        } else {
          results.vendors.errors++;
          console.error('Error creating vendor:', result.error);
        }
      }
      console.log(`✓ Created ${results.vendors.created} vendors`);
    }

    // Seed Technicians
    let technicians = [];
    if (includeTechnicians) {
      console.log('👷 Seeding technicians...');
      const techData = generateTechnicians();
      for (const tech of techData) {
        const result = await createUserProfile(tech.uid, tech);
        if (result.success) {
          technicians.push(tech);
          results.technicians.created++;
        } else {
          results.technicians.errors++;
          console.error('Error creating technician:', result.error);
        }
      }
      console.log(`✓ Created ${results.technicians.created} technicians`);
    }

    // Seed Units
    let units = [];
    if (includeUnits) {
      console.log('🏠 Seeding units...');
      const unitData = generateUnits();
      for (const unit of unitData) {
        const result = await createUnit(unit);
        if (result.success) {
          units.push({ ...unit, id: result.data.id });
          results.units.created++;
        } else {
          results.units.errors++;
          console.error('Error creating unit:', result.error);
        }
      }
      console.log(`✓ Created ${results.units.created} units`);
    }

    // Seed Turns (requires units and technicians)
    if (includeTurns && units.length > 0 && technicians.length > 0) {
      console.log('🔄 Seeding turns...');
      const turnData = generateTurns(units, technicians);
      for (const turn of turnData) {
        const result = await createTurn(turn);
        if (result.success) {
          results.turns.created++;
        } else {
          results.turns.errors++;
          console.error('Error creating turn:', result.error);
        }
      }
      console.log(`✓ Created ${results.turns.created} turns`);
    }

    // Seed Calendar Events (requires units, vendors, and technicians)
    if (includeCalendar && units.length > 0 && vendors.length > 0 && technicians.length > 0) {
      console.log('📅 Seeding calendar events...');
      const eventData = generateCalendarEvents(units, vendors, technicians);
      for (const event of eventData) {
        const result = await createCalendarEvent(event, 'admin-seed');
        if (result.success) {
          results.calendar.created++;
        } else {
          results.calendar.errors++;
          console.error('Error creating calendar event:', result.error);
        }
      }
      console.log(`✓ Created ${results.calendar.created} calendar events`);
    }

    // Seed Activities (requires technicians)
    if (includeActivities && technicians.length > 0) {
      console.log('📊 Seeding activities...');
      const activityData = generateActivities(technicians);
      for (const activity of activityData) {
        const result = await logActivity(activity);
        if (result.success) {
          results.activities.created++;
        } else {
          results.activities.errors++;
          console.error('Error creating activity:', result.error);
        }
      }
      console.log(`✓ Created ${results.activities.created} activities`);
    }

    console.log('\n✅ Database seeding completed!');
    console.log('Summary:', results);

    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    return {
      success: false,
      error: error.message,
      results
    };
  }
}

/**
 * Quick seed function for common development scenario
 */
export async function quickSeed() {
  return seedDatabase({
    includeUnits: true,
    includeVendors: true,
    includeTechnicians: true,
    includeTurns: true,
    includeCalendar: true,
    includeActivities: true
  });
}

export default {
  seedDatabase,
  quickSeed,
  generateUnits,
  generateVendors,
  generateTechnicians,
  generateTurns,
  generateCalendarEvents,
  generateActivities
};
