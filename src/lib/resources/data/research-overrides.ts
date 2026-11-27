/**
 * Human-reviewed corrections and research notes for imported listings.
 *
 * The findhelp import guessed `help_group` from keywords, which put Ryan White
 * HIV services, Medicaid and career training under "Gas". Each entry below was
 * checked against the provider's own page on 2026-11-27. Notes are plain text
 * and render in the directory's "Research notes" section.
 */
import type { Resource } from '../types';

export const RESEARCH_OVERRIDES: Record<string, Partial<Resource>> = {
  'cand-expand-001': {
    notes: 'What: free gun locks and safe-storage education from the League of Women Voters of Broward County.\nLimits: Broward County program; call or email to ask about availability.\nWorking link: https://www.lwvbroward.org/content.aspx?page_id=22&club_id=869563&module_id=780661',
  },
  'cand-expand-002': {
    group: 'health',
    notes: 'What: free soft, handmade breast prosthesis ("knitted knocker") for mastectomy or lumpectomy survivors, mailed at no cost.\nCost: always free; volunteer-made. Request at https://www.knittedknockers.org/request-a-knocker/\nNo published dollar limit. Not a Florida-specific program; shipping is available in the U.S.',
  },
  'cand-expand-003': {
    group: 'health',
    notes: 'What: charitable pantry of donated ostomy supplies, redistributed within the U.S.\nCost: supplies are free, but a $50 minimum payment is required for overhead (postage, storage, volunteer costs); barrier rings or tape are $10 extra per grouping.\nEach order covers about 10 basic changes. Orders are usually processed weekends and shipped Tuesdays.\nApply: https://ostomysupplies.ostomy211.org/',
  },
  'cand-expand-004': {
    group: 'health',
    notes: 'IMPORTANT: this is a for-profit online retailer, not a free assistance program.\nWhat: discounted diabetic test strips, glucose monitors and lancets; free shipping on orders $35+; 30-day returns on unopened boxes. Many items were sold out at review.\nPrices seen: One Touch Verio 100 ct $44.95, Freestyle Lite 50 ct $39.95, Accu-Chek Aviva Plus 200 ct $109.95.\nStore: https://affordablediabetic.org/',
  },
  'cand-expand-005': {
    group: 'work',
    notes: 'What: Better Together helps parents facing hardship with temporary host-family care for children, flexible job search support, resume and interview help, and mentoring.\n24/7 hotline: (239) 470-2733. Non-urgent form: https://bettertogetherus.org/forms/get-help/\nNo dollar grants published; services are support and referrals.',
  },
  'cand-expand-006': {
    group: 'health',
    state: 'GA',
    address: 'Georgia only (not a Florida resource)',
    notes: 'GEORGIA ONLY. Do not present as a Florida option.\nWhat: Enchanted Peach Children\'s Foundation brings toys, books, art, library resources and "Enchanted Escape" experiences to critically ill children in Georgia hospitals.\nEligibility: age 2-18, critically ill, Georgia resident and currently treated at a Georgia hospital.\nNo cost published. https://enchantedpeach.org/',
  },
  'cand-expand-007': {
    group: 'money',
    notes: 'What: Paralyzed Veterans of America, Florida Gulf Coast Chapter, offers peer support, disability advocacy and help applying for VA benefits.\nSite was blocked to automated checks (403); call the chapter or use the national PVA site to confirm current local services.\nWorking link: https://pva.org/',
  },
  'cand-expand-008': {
    notes: 'What: free volunteer-pilot medical flights for patients who must travel long distances for care.\nLimits: missions within 1,000 nautical miles total from the patient\'s home airport; longer flights require pilot handoffs. No flights outside the U.S.\nEligibility: medically stable, ambulatory, able to sit upright with a seat belt, with financial need or a reason public transportation cannot be used. Request from a doctor, social worker, nurse or immediate family; allow about 10 working days.\nCost: never any charge to the patient. https://angelflightse.org/faqs/',
  },
  'cand-expand-009': {
    group: 'work',
    notes: 'What: Second Harvest Food Bank of Central Florida workforce training in culinary arts and customer service.\nIncludes job-readiness coaching, resume and interview prep, job connections and one year of alumni support.\nEligibility: 18+, authorized to work, resident of Orange/Seminole/Osceola County, high school diploma or GED, financial instability in last 12 months, background check, commitment to full-time work; customer-service track needs 6 months experience.\nLocation: 411 Mercy Drive, Orlando. 34.87% funded by U.S. Department of Labor. Sessions and application deadlines published at https://feedhopenow.org/find-help/career-pathways/',
  },
  'cand-expand-010': {
    group: 'health',
    notes: 'What: Florida Medicaid coverage for pregnant women.\nApplies through MyACCESS; coverage and income rules are set by Florida DCF. No cash grant or dollar limit published.\nApply or renew: https://www.myflfamilies.com/medicaid and https://myaccess.myflfamilies.com/',
  },
  'cand-expand-011': {
    group: 'health',
    notes: 'What: Florida Medicaid coverage for people who are age 65+ or have a disability.\nApplies through MyACCESS; income and asset rules set by Florida DCF. No cash payment; this is health coverage.\nApply or renew: https://www.myflfamilies.com/medicaid and https://myaccess.myflfamilies.com/',
  },
  'cand-expand-012': {
    group: 'health',
    notes: 'What: Agency for Persons with Disabilities services for eligible Floridians with developmental disabilities. Services depend on need and coverage criteria; not everyone receives every service.\nExamples listed by APD: adult dental, behaviour analysis, life-skills development, supported employment, therapies, durable medical equipment, consumable supplies, personal supports, support coordination, transportation, nursing, residential habilitation, respite, in-home subsidies and emergency response systems.\nhttps://apd.myflorida.com/customers/services/',
  },
  'cand-expand-013': {
    group: 'money',
    notes: 'What: emergency short-term financial aid for Florida veterans, service members and qualifying military families.\nEligible costs: rent/mortgage, utilities (electric, water, gas), emergency transportation (not car payments), and critical medical expenses not covered by insurance.\nLimits: one-time emergency relief, not ongoing support; funding is limited and assistance is not guaranteed. Applicants must be honorably discharged veterans, active duty, Guard/Reserve, or eligible immediate family receiving military benefits. Not government funded.\nApply: https://projectvetrelief.org/financial-aid/',
  },
  'cand-expand-014': {
    group: 'health',
    category: 'Charity Free Services',
    website: 'https://www.hfuw.org/',
    serviceUrl: 'http://centralfloridahivpc.com/get-help/',
    sourceUrl: 'https://www.hfuw.org/get-help/health-assistance/',
    description: 'Ryan White HIV/AIDS Part B & General Revenue helps people living with HIV with medical care, insurance, medication and support services across Brevard, Lake, Orange, Osceola and Seminole counties.',
    notes: 'CORRECTED GROUP: this is HIV health support, not gas or transportation.\nWhat: Ryan White HIV/AIDS Part B & General Revenue provides medical care, health insurance assistance, mental health services, peer support and pharmaceutical assistance.\nWho: HIV patients in Brevard, Lake, Orange, Osceola and Seminole counties.\nCost: no dollar limit published on the HFUW page; the old findhelp listing said sliding scale.\nStart here: https://centralfloridahivpc.com/get-help/ (the "Get Help" link on the HFUW health page).\nSource: https://www.hfuw.org/get-help/health-assistance/',
  },
  'cand-expand-015': {
    group: 'health',
    notes: 'What: Blood Cancer United Patient Aid Program gives financial assistance to blood cancer patients.\nDollar amount and eligibility are set by the provider; verify on the application page before promising an award.\nhttps://bloodcancerunited.org/financial-assistance/patient-aid-program',
  },
  'cand-expand-016': {
    notes: 'What: free personal health-journal pages to communicate updates, capture a health journey and coordinate help with family and friends.\nCost: free to start a page (donor-supported nonprofit).\nNot a direct service provider or 24/7 crisis line. https://www.caringbridge.org/start',
  },
  'cand-expand-017': {
    notes: 'What: AdventHealth spiritual care / chaplain support. The old link went to a general contact page; ask for Spiritual Care when calling.\nNo published fee or dollar limits. Use https://www.adventhealth.com/contact-a-location to find the right contact.',
  },
  'cand-expand-018': {
    group: 'health',
    notes: 'What: Siloam Wellness offers poetry conversation groups alongside breathwork, tapping/EFT, trauma and anxiety support groups, home fitness, and food/clothing pantries.\nPoetry groups are therapeutic self-expression, not academic education. No cost published.\nhttps://www.wearesiloam.org/ourprograms',
  },
  'cand-expand-019': {
    group: 'health',
    serviceUrl: 'https://diabetes.org/tools-resources/diabetes-education-programs',
    notes: 'What: directory of American Diabetes Association-recognized diabetes education programs, searchable by ZIP and radius (5-250 miles) with filters for pediatric, DPP, Spanish, telemedicine and mental-health trained programs.\nAlso lists virtual programs. No direct grant; education programs set their own fees.\nWorking link: https://diabetes.org/tools-resources/diabetes-education-programs',
  },
  'cand-expand-020': {
    group: 'health',
    serviceUrl: 'https://www.autismspeaks.org/autism-response-team',
    notes: 'What: Autism Response Team gives personalized information and referrals by phone, text, email and web chat.\nPhone: 1-888-288-4762 (English), 1-888-772-9050 (Spanish), Mon-Fri. Email ayuda@autismspeaks.org for Spanish.\nLimits: information and referral only; not a direct service provider and does not make appointments or direct referrals. No cost published.\nhttps://www.autismspeaks.org/autism-response-team',
  },
  'cand-expand-021': {
    group: 'education',
    state: 'TX',
    address: 'Austin, TX (not a Florida resource)',
    notes: 'TEXAS PROGRAM. Read Now teaches adults to read with free, one-on-one tutoring by trained volunteers on a flexible schedule.\nNo published dollar limit. https://www.readnowatx.org/students/ — use only for someone who can access Austin or its online options; do not present as local Brevard help.',
  },
  'cand-expand-022': {
    notes: 'What: free, confidential peer career counseling by text or web chat.\nText FINDHELP to 510-674-1414 or use https://www.empowerwork.org/findhelp. Available 7 a.m. - 7 p.m. Pacific, Mon-Fri.\nLimits: not a job-placement agency or law firm; counselors help build an action plan and can connect to food, housing and transportation resources. No cost.',
  },
  'cand-expand-023': {
    group: 'education',
    notes: 'IMPORTANT: CogniTutor is a for-profit tutoring provider, not a free program.\nWhat: academic tutoring, test prep, study skills, group workshops and enrichment (coding, language, music/art) for students, schools, nonprofits and businesses. Small-group courses are used to lower costs for nonprofits.\nPrices not published; request a quote at https://cognitutor.com/get-a-tutor/',
  },
  'cand-expand-024': {
    group: 'money',
    notes: 'Southwest Washington-based provider; most useful online or for employers/faith communities with national reach.\nWhat: financial education, personalized coaching, emergency assistance and partnerships for individuals, employers, faith communities, schools and community organizations.\nNo fixed dollar amount published.\nhttps://www.savefirstfinancial.org/',
  },
  'cand-expand-025': {
    group: 'health',
    notes: 'What: UCF Center for Autism and Related Disabilities gives individualized, direct consultation to people with autism and related disabilities and their families in Central Florida.\nIncludes a provider resource guide vetted by families, education seminars and support groups. Free to register; no cash grant.\nContact: (800) 928-8476 / ucfcard@ucf.edu, 12424 Research Parkway Suite 365, Orlando.\nhttps://ucf-card.org/',
  },
  'cand-expand-026': {
    notes: 'What: employU provides individualized employment services and is an approved vendor for Florida Division of Vocational Rehabilitation (VR).\nContact: (407) 598-0202, info@employu.org; home office in Winter Springs, 9 a.m. - 5 p.m. Mon-Fri; regional offices by appointment.\nCARF accredited; Veteran Safe Place. No published fee; VR customers may qualify.\nhttps://employu.org/contact-us/',
  },
  'cand-expand-027': {
    notes: 'What: free Certified Recovery Peer Specialist (CRPS) training and mentorship with NAMI Central Florida, NAMI Florida and Central Florida Cares.\nIncludes 40 required classroom hours, help gaining on-the-job experience within 12 months, test prep and certification application support.\nCost: free to participate. Training dates TBD; apply at https://namicf.org/get-involved/crps/',
  },
  'cand-expand-028': {
    group: 'health',
    serviceUrl: 'https://www.alz.org/help-support/resources/helpline',
    notes: 'What: free 24/7 Alzheimer\'s & Dementia Helpline for people with dementia, caregivers, families and the public.\nPhone: 1-800-272-3900; online live chat usually Mon-Sat 7 a.m. - 7 p.m. Central. Dial 711 for relay service. Interpreter service in 200+ languages; all calls confidential.\nNo dollar limit; information, local resources, crisis help and emotional support.\nhttps://www.alz.org/help-support/resources/helpline',
  },
  'cand-expand-029': {
    group: 'health',
    notes: 'What: Care Guide Services acts as a health insurance advocate for Affordable Care Act plans, helping people choose plans that cover their doctors and medications and supporting them after enrollment.\nThis is a for-profit/agency service, not a government enrollment office. No dollar limit published. Verify Florida availability before relying on it.\nhttps://returning-citizens.careguideservices.com/other-states-english',
  },
  'cand-expand-030': {
    notes: 'What: Atticus is a private disability law firm with a 2-minute eligibility quiz for Social Security Disability benefits.\nAttorney advertising; not a free legal-aid office. Reviews cite back-pay awards ($3,000-$20,000+) but these are examples, not guarantees or program limits.\nhttps://www.atticus.com/disability-benefits/home',
  },
  'cand-expand-031': {
    group: 'health',
    notes: 'What: American Cancer Society support including 24/7 help, free lodging and rides to treatment, and other patient services.\nThe old URL was a general "What we do" page; it works but is not a helpline page. No fixed dollar amount published.\nStart at https://www.cancer.org/about-us/what-we-do/providing-support.html',
  },
  'cand-expand-032': {
    group: 'health',
    notes: 'What: Canine Companions places service dogs with people with disabilities. Cost: no charge to the recipient, subject to program eligibility.\nFind a Florida training center or volunteer chapter at https://canine.org/location/; availability and wait times vary.',
  },
  'cand-expand-033': {
    serviceUrl: 'https://bacemploy.com/careers/',
    notes: 'What: Brevard Achievement Center offers employment and training for people with disabilities, including business IT services, facilities management and direct care work.\nReinvests in employees through tuition assistance, training and upward-mobility options.\nCall (321) 632-8610. Apply: https://bacemploy.com/careers/',
  },
  'cand-expand-034': {
    notes: 'What: CareerSource Brevard Flagler Volusia Titusville Career Center offers free job search help, employment counseling, resume development, interview techniques, labor-market information, career planning, skills assessment and training assistance.\nLocation: 3880 S. Washington Ave., Ste. 214, Titusville 32780. Mon-Thu 9-6, Fri 8-5; walk-ins welcome. (321) 504-7600.\nNo charge. https://careersourcebfv.com/contact/career-centers/titusville-career-center/',
  },
  'cand-expand-035': {
    notes: 'What: Employ Florida is the state job board with job search, training, education and scholarship listings.\nFree to register; no cash benefit attached to the portal itself.\nhttps://www.employflorida.com/vosnet/Default.aspx',
  },
  'cand-expand-036': {
    notes: 'What: Military Family Employment Advocacy Program (MFEA) gives priority workforce services to eligible military family members.\nEligibility: spouses and dependents of active duty, Florida National Guard, or activated reservists. Services: employment counseling, job search, resume development, labor-market information and referrals.\nMeet at Patrick Space Force Base or a local library. Call (321) 504-7600. No charge.\nhttps://careersourcebfv.com/job-seekers/special-programs/military-family-employment-advocacy-program/',
  },
  'cand-expand-037': {
    notes: 'What: VA.gov is the official portal for veterans benefits, claims, health care, education/GI Bill, disability ratings and travel reimbursement.\nThis is a general portal, not an employment program by itself. Free to use; no dollar limit published here.\nEmployment-specific help: https://www.va.gov/careers-employment/',
  },
  'cand-expand-038': {
    notes: 'What: The Firehouse Talent Hub (CareerSource BFV at Family Promise of Brevard) offers free job search help, Employ Florida registration, referrals, resume and interview help, and computers to submit reemployment-assistance certifications and apply for public benefits.\nLocation: 114 1st Street, Cocoa 32922. Monday & Wednesday 9-12 and 1-5, Friday 1-5. Appointment only: (321) 504-7600.\nNo charge. https://careersourcebfv.com/contact/career-centers/firehouse/',
  },
  'cand-expand-039': {
    notes: 'What: Palm Bay Career Center offers free job search assistance, employment counseling, resume help, interview techniques, skills assessment, training assistance, and help with reemployment-assistance claims and public benefits.\nLocation: 5275 Babcock Street NE, Suite 8B, Palm Bay 32905. Mon-Thu 9-6, Fri 8-5; walk-ins welcome. (321) 504-7600.\nNo charge. https://careersourcebfv.com/contact/career-centers/palm-bay-career-center/',
  },
  'cand-expand-040': {
    notes: 'What: Eastern Florida State College Talent Hub (CareerSource BFV) offers free job search help, Employ Florida registration, referrals, resume and interview help, and computers for reemployment certifications and public-benefit applications.\nLocation: 1519 Clearlake Rd, Building 3 Room 274, Cocoa 32922. Mon-Thu 9-12 and 1-6; appointment only. (321) 504-7600.\nNo charge. https://careersourcebfv.com/contact/career-centers/efsc/',
  },
};

export const RESEARCH_ADDITIONS: Resource[] = [
  {
    id: 'hfuw-utility-assistance',
    name: 'Heart of Florida United Way — Emergency Utility Assistance',
    category: 'Charity Free Services',
    address: 'Orange, Osceola & Seminole Counties, FL (apply online)',
    lat: 28.6974,
    lng: -80.8663,
    phone: '211',
    website: 'https://www.hfuw.org/',
    serviceUrl: 'https://www.hfuw.org/get-help/financial-assistance/',
    sourceUrl: 'https://www.hfuw.org/get-help/financial-assistance/',
    description: 'Emergency help with past-due residential utility bills for qualifying OUC, Duke Energy, Winter Park and Winter Garden customers. 211 can refer for rent, mortgage and other utilities.',
    hoursText: 'Apply online; limited applications accepted each week',
    schedule: {},
    tags: ['utilities', 'electric', 'rent', 'mortgage', 'apply-online', '211'],
    partnerType: 'Heart of Florida United Way',
    capacityStatus: 'UNKNOWN',
    group: 'money',
    services: [],
    county: 'Orange',
    city: 'Orlando',
    state: 'FL',
    lastVerified: '2026-11-27',
    eligibility: 'Residential customer of a participating utility with a past-due balance; county and account rules vary by program.',
    documents: 'Account number, recent bill, photo ID, proof of hardship and proof of income as required by the specific utility program.',
    languages: ['English'],
    accessibility: 'Online application and 211 phone line',
    cost: 'Free emergency assistance; dollar limits vary by utility',
    coverage: 'Orange, Osceola and Seminole counties for the listed utility programs; 211 serves Central Florida.',
    provider: 'Heart of Florida United Way',
    contactMethod: 'Apply online',
    sourceType: 'our-org',
    mobileOnly: true,
    notes: 'WHAT THIS INCLUDES (from https://www.hfuw.org/get-help/financial-assistance/):\n• OUC Project CARE: one-time assistance up to $500 per household in a 12-month period; residential OUC customers in Orange or Osceola with a past-due balance; no deposits or current bills; Power Pass customers generally excluded unless debt-recovery balance.\n• Duke Energy: help limited to twice a year per household in a 12-month period; Orange, Osceola or Seminole residential customers; past-due balance required.\n• City of Winter Park Emergency Utility Assistance: up to $650 per household in a 12-month period; Winter Park Electric Utility customers.\n• City of Winter Garden Emergency Utility Assistance: up to $650 per household in a 12-month period; residential Winter Garden customers in Orange.\n• The online application portal also lists Lake Apopka Natural Gas District, so some gas help exists here; the main program is electric utility assistance, not a general gas program.\nDOCUMENTS typically required: account number, most recent past-due bill, photo ID with date of birth, last 4 SSN digits if available, proof of hardship dated within 90 days, complete bank statement from last 30 days, and proof of income dated within 30 days for everyone 18+.\nIMPORTANT: availability depends on funds and only limited applications are accepted each week; they close when capacity is reached.\nAPPLY: https://s76.esserver.com/AES057.HFUW_Web/ . FAQ: https://www.hfuw.org/wp-content/uploads/2026/10/Adsystech-FAQ-updated.pdf\nRENT/MORTGAGE/OTHER UTILITIES: call or text 211 (text ZIP to 898-211) for referral; HFUW does not promise direct rent or mortgage payment here.\nCORRECTION: the old findhelp-derived Ryan White listing was mis-filed as gas; that is a health program and has been corrected separately.',
  },
];
